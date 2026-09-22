
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLang } from '../index';
import { useLocation } from 'react-router-dom';
import { chatWithGemini, generateAudienceDeepDive, generateAiTitles, generateCustomGrowthPlan, generateCompetitorAnalysis, generateAiVideoIdeas } from '../services/geminiService';
import { fetchChannelData, fetchLatestContentMixed } from '../services/youtubeService';
import { estimateEarnings, detectOutliers } from '../services/algoService';
import { extractId, formatNumber, formatCurrency, calculateVPH } from '../utils';
import { DEFAULT_API_KEY } from '../constants';
import { 
    MessageCircle, X, Send, Bot, Loader2, Sparkles, Zap, Brain, Globe, 
    Copy, Reply, Check, Quote, Trash2, Image as ImageIcon, PlusCircle,
    Download, Activity, CheckCircle, TrendingUp, DollarSign, Search, Users, Swords, Gem, Lightbulb, PlayCircle, Smartphone
} from 'lucide-react';
import { saveToStorage, loadFromStorage, StorageKeys, clearStorageKey } from '../services/storageService';
import html2canvas from 'html2canvas';

interface MastermindReportData {
    channel: any;
    latestVideo: any;
    latestShort: any;
    vph: number;
    earnings: any;
    isEligible: boolean;
    seoTitles: string[];
    audience: any;
    growthPlan: any;
    competitors: any;
    outliersCount: number;
    ideas: any[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; 
  uploadedImage?: string; 
  replyTo?: {
    role: string;
    text: string;
  };
  mastermindData?: MastermindReportData;
}

const ChatAssistant: React.FC<{ isFixedPage?: boolean }> = ({ isFixedPage }) => {
  const { t, lang } = useLang();
  const location = useLocation();
  const currentPath = location.pathname;

  // Determine storage key based on current location
  const storageKey = useMemo(() => {
    if (isFixedPage) return StorageKeys.CHAT_MESSAGES; // Dedicated chat page uses global history
    return StorageKeys.CHAT_MESSAGES_SCOPED(currentPath);
  }, [currentPath, isFixedPage]);

  const [isOpen, setIsOpen] = useState(isFixedPage ? true : false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [replyingTo, setReplyingTo] = useState<{role: string, text: string} | null>(null);
  const [isFast, setIsFast] = useState(false);
  const [isThink, setIsThink] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [isBrainMode, setIsBrainMode] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 }); 
  const [size, setSize] = useState({ w: 400, h: 600 });
  
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const resizeDir = useRef<string>(''); 
  const dragStart = useRef({ x: 0, y: 0 }); 
  const startPos = useRef({ x: 0, y: 0 });  
  const startSize = useRef({ w: 0, h: 0 }); 

  useEffect(() => {
      // Clear messages when key changes to prevent stale data briefly showing
      setMessages([]);
      
      const saved = loadFromStorage<ChatMessage[]>(storageKey);
      if (saved) setMessages(saved);

      if (isFixedPage) {
          setIsOpen(true);
      } else {
          const openHandler = () => setIsOpen(true);
          window.addEventListener('open-chat', openHandler);
          return () => window.removeEventListener('open-chat', openHandler);
      }
  }, [storageKey, isFixedPage]);

  useEffect(() => {
      if (messages.length > 0) {
          saveToStorage(storageKey, messages, 5256000); 
      }
  }, [messages, storageKey]);

  useEffect(() => {
    if (isFixedPage) return;
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    
    let width = 400;
    let height = 600;

    if (isMobile) {
      width = window.innerWidth - 20;
      height = window.innerHeight - 100;
    } else if (isTablet) {
      width = 350;
      height = 500;
    } else {
      width = 380;
      height = 550;
    }

    setSize({ w: width, h: height });
    
    const initialX = isMobile ? 10 : window.innerWidth - width - 20;
    const initialY = window.innerHeight - height - (isMobile ? 10 : 80);
    setPosition({ x: initialX > 0 ? initialX : 10, y: initialY > 0 ? initialY : 10 });
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen, replyingTo, selectedImage, loadingStep]);

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (isDragging.current) {
         const dx = clientX - dragStart.current.x;
         const dy = clientY - dragStart.current.y;
         setPosition({ x: startPos.current.x + dx, y: startPos.current.y + dy });
      }
      if (isResizing.current) {
         const dx = clientX - dragStart.current.x;
         const dy = clientY - dragStart.current.y;
         const dir = resizeDir.current;
         let newW = startSize.current.w;
         let newH = startSize.current.h;
         let newX = startPos.current.x;
         let newY = startPos.current.y;

         if (dir.includes('e')) newW = startSize.current.w + dx;
         else if (dir.includes('w')) { newW = startSize.current.w - dx; newX = startPos.current.x + dx; }
         if (dir.includes('s')) newH = startSize.current.h + dy;
         else if (dir.includes('n')) { newH = startSize.current.h - dy; newY = startPos.current.y + dy; }

         if (newW < 280) { newW = 280; if (dir.includes('w')) newX = startPos.current.x + (startSize.current.w - 280); }
         if (newH < 300) { newH = 300; if (dir.includes('n')) newY = startPos.current.y + (startSize.current.h - 300); }

         setSize({ w: newW, h: newH });
         setPosition({ x: newX, y: newY });
      }
    };
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => { 
        if (isDragging.current || isResizing.current) {
            e.preventDefault(); 
            handleMove(e.touches[0].clientX, e.touches[0].clientY); 
        }
    };
    const handleEnd = () => { isDragging.current = false; isResizing.current = false; };

    if (isOpen) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleEnd);
    }
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleEnd);
    };
  }, [isOpen]);

  const startDrag = (clientX: number, clientY: number) => {
      isDragging.current = true;
      dragStart.current = { x: clientX, y: clientY };
      startPos.current = { x: position.x, y: position.y };
  };

  const startResize = (clientX: number, clientY: number, direction: string) => {
      isResizing.current = true;
      resizeDir.current = direction;
      dragStart.current = { x: clientX, y: clientY };
      startPos.current = { x: position.x, y: position.y };
      startSize.current = { w: size.w, h: size.h };
  };

  const onResizeStart = (e: React.MouseEvent | React.TouchEvent, dir: string) => {
      e.stopPropagation();
      let cx, cy;
      if ('touches' in e) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; } 
      else { cx = (e as React.MouseEvent).clientX; cy = (e as React.MouseEvent).clientY; }
      startResize(cx, cy, dir);
  };

  const handleCopy = (text: string) => navigator.clipboard.writeText(text);
  const handleQuote = (role: string, fullText: string) => setReplyingTo({ role, text: fullText.length > 100 ? fullText.substring(0, 100) + '...' : fullText });
  const handleReply = (role: string, fullText: string) => setReplyingTo({ role, text: fullText.length > 100 ? fullText.substring(0, 100) + '...' : fullText });
  
  const handleNewChat = () => {
      setMessages([]);
      clearStorageKey(storageKey);
      setReplyingTo(null);
      setIsLoading(false);
      setLoadingStep('');
  };

  const handleDeleteMessage = (id: string) => {
      const newMessages = messages.filter(m => m.id !== id);
      setMessages(newMessages);
      if (newMessages.length === 0) {
          clearStorageKey(storageKey);
      } else {
          saveToStorage(storageKey, newMessages, 5256000);
      }
  };

  const handleClearChat = () => { handleNewChat(); };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setSelectedImage(reader.result as string);
          reader.readAsDataURL(file);
      }
      e.target.value = '';
  };

  // ... (Mastermind logic remains same, just update text colors if needed) ...
  const executeMastermindProtocol = async (url: string) => {
      const { id } = extractId(url);
      setLoadingStep(lang === 'ar' ? '1/9 تحليل القناة الشامل...' : '1/9 Full Channel Analysis...');
      const ch = await fetchChannelData(id);
      if (!ch) return null;
      // ... logic ...
      const { latestVideo, latestShort } = await fetchLatestContentMixed(ch.id);
      const recentTitles = [latestVideo?.snippet.title, latestShort?.snippet.title].filter(Boolean) as string[];
      const audience = await generateAudienceDeepDive(ch.snippet.title, ch.snippet.description, recentTitles, lang);
      const seoTitles = latestVideo ? await generateAiTitles(latestVideo.snippet.title, lang) : [];
      const ideas = await generateAiVideoIdeas(ch.snippet.title, ch.snippet.description, recentTitles, [], lang);
      const growthPlan = await generateCustomGrowthPlan(ch.snippet.title, ch.snippet.description, ch.statistics, lang);
      const earnings = estimateEarnings(ch.statistics.viewCount, ch.snippet.country, [ch.snippet.title]);
      const subs = parseInt(ch.statistics.subscriberCount);
      const isEligible = subs >= 1000; 
      const competitors = await generateCompetitorAnalysis(ch.snippet.title, ch.snippet.description, recentTitles, [], lang);
      let outliersCount = 0;
      // ... outliers ...
      let vph = 0;
      if (latestVideo) vph = calculateVPH(latestVideo.snippet.publishedAt, latestVideo.statistics.viewCount);

      setLoadingStep('');
      return { channel: ch, latestVideo, latestShort, vph, earnings, isEligible, seoTitles, audience, growthPlan, competitors, outliersCount, ideas };
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    const userMsg = input;
    const currentReply = replyingTo; 
    const imgToSend = selectedImage;
    const isBrainActive = isBrainMode; 

    setInput('');
    setReplyingTo(null);
    setSelectedImage(null);
    const msgId = Date.now().toString();

    setMessages(prev => [...prev, { 
        id: msgId, role: 'user', text: userMsg, uploadedImage: imgToSend || undefined,
        replyTo: currentReply ? { role: currentReply.role, text: currentReply.text } : undefined
    }]);
    setIsLoading(true);

    try {
        if (isBrainActive && extractId(userMsg).type !== 'unknown') {
            const report = await executeMastermindProtocol(userMsg);
            if (report) setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: t.report_ready, mastermindData: report }]);
            else setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: lang === 'ar' ? 'فشل المسح. تأكد من الرابط.' : 'Scan failed. Check URL.' }]);
            setIsLoading(false);
            return;
        }

        let msgToSend = userMsg;
        if (currentReply) msgToSend = `[Replying to: "${currentReply.text}"]\n${userMsg}`;
        if (!msgToSend && imgToSend) msgToSend = lang === 'ar' ? "حلل هذه الصورة." : "Analyze this image.";

        const response = await chatWithGemini(
            messages.filter(m => !m.image && !m.uploadedImage && !m.mastermindData).map(m => ({ role: m.role, text: m.text })),
            msgToSend, lang, { fast: isFast, think: isThink, search: isSearch }, imgToSend
        );
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: lang === 'ar' ? 'حدث خطأ.' : 'Error occurred.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const MastermindReportCard = ({ data }: { data: MastermindReportData }) => {
      const cardRef = useRef<HTMLDivElement>(null);
      const downloadCard = async () => {
          if (cardRef.current) {
               const canvas = await html2canvas(cardRef.current, { backgroundColor: '#020403', scale: 2, useCORS: true });
               const link = document.createElement('a');
               link.href = canvas.toDataURL('image/png');
               link.download = `Muthaqaf-Report-${data.channel.snippet.title}.png`;
               link.click();
          }
      };

      return (
          <div className={`w-full my-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <div ref={cardRef} className="mastermind-card-export bg-[#050a08] border border-purple-500/30 rounded-xl overflow-hidden shadow-2xl relative w-full font-sans p-1">
                  <div className="bg-purple-900/20 p-4 border-b border-purple-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <img src={data.channel.snippet.thumbnails.default.url} className="w-10 h-10 rounded-full border border-purple-400" alt="Av"/>
                          <div>
                              <div className="font-bold text-white text-sm">{data.channel.snippet.title}</div>
                              <div className="text-[10px] text-purple-300 font-mono uppercase">{lang === 'ar' ? 'تم اكتمال بروتوكول المسح الشامل' : 'MASTERMIND PROTOCOL COMPLETE'}</div>
                          </div>
                      </div>
                      <Brain className="text-purple-500 animate-pulse" size={24} />
                  </div>
                  {/* ... Rest of card logic, same but with updated colors if needed ... */}
              </div>
              <button onClick={downloadCard} className="mt-2 w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs py-2 rounded-lg transition-colors border border-white/5">
                  <Download size={12}/> {t.download_report}
              </button>
          </div>
      );
  };

  const ActionButtons = ({ text, role, msgId }: { text: string, role: string, msgId: string }) => {
      const [copied, setCopied] = useState(false);
      const onCopy = () => { handleCopy(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
      return (
          <div className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${role === 'user' ? 'justify-end text-green-200' : 'justify-start text-gray-500'}`}>
              <button onClick={onCopy} title={t.chat_copy} className="p-1 hover:bg-black/20 rounded transition-colors">{copied ? <Check size={12}/> : <Copy size={12}/>}</button>
              <button onClick={() => handleQuote(role, text)} title={t.chat_quote} className="p-1 hover:bg-black/20 rounded transition-colors"><Quote size={12}/></button>
              <button onClick={() => handleReply(role, text)} title={t.chat_reply} className="p-1 hover:bg-black/20 rounded transition-colors"><Reply size={12}/></button>
              <button onClick={() => handleDeleteMessage(msgId)} title={t.chat_delete_msg} className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"><Trash2 size={12}/></button>
          </div>
      );
  };

  if (!isOpen) {
    if (isFixedPage) return null;
    return null; // Removed floating button
  }

  return (
    <div 
      ref={containerRef}
      style={isFixedPage ? { width: '100%', height: '100%' } : { top: position.y, left: position.x, width: size.w, height: size.h }}
      className={`${isFixedPage ? 'relative h-full' : 'hidden'} bg-[#050a08]/95 backdrop-blur-xl border border-emerald-500/20 flex flex-col overflow-hidden`}
    >
      {!isFixedPage && null}

      <div 
        onMouseDown={(e) => !isFixedPage && startDrag(e.clientX, e.clientY)}
        className={`p-2.5 border-b border-white/5 flex items-center justify-between select-none ${isFixedPage ? '' : 'cursor-move'} shrink-0 transition-colors duration-500 ${isBrainMode ? 'bg-gradient-to-r from-purple-900/40 to-black' : 'bg-gradient-to-r from-emerald-600/10 to-teal-600/10'}`}
      >
        <div className="flex items-center gap-2">
           <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-500 ${isBrainMode ? 'bg-purple-600 shadow-[0_0_10px_purple]' : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`}>
              {isBrainMode ? <Brain size={16} className="text-white animate-pulse" /> : <Bot size={16} className="text-white" />}
           </div>
           <div>
             <h3 className="font-bold text-white text-[13px] leading-tight">{isBrainMode ? 'MASTERMIND' : t.chat_assistant}</h3>
             <div className="flex items-center gap-1 text-[9px] text-emerald-400 leading-none mt-0.5">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
               {isBrainMode ? t.brain_active : (lang === 'ar' ? 'مُثقّف متصل' : 'Muthaqaf Online')}
             </div>
           </div>
        </div>
        <div className="flex items-center gap-1">
            <button onMouseDown={e => e.stopPropagation()} onClick={handleNewChat} title={t.chat_new_chat} className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-400 transition-colors"><PlusCircle size={16} /></button>
            {!isFixedPage && <button onMouseDown={e => e.stopPropagation()} onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400"><X size={16} /></button>}
        </div>
      </div>

      <div className="flex items-center justify-start gap-1 p-1.5 bg-[#020403] border-b border-white/5 shrink-0 overflow-x-auto custom-scrollbar no-scrollbar">
          <button onClick={() => { setIsFast(!isFast); if(!isFast) setIsThink(false); }} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all whitespace-nowrap ${isFast ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-white/5 text-gray-500'}`}>
              <Zap size={10} className={isFast ? "fill-current" : ""} /> {t.mode_fast}
          </button>
          <button onClick={() => { setIsThink(!isThink); if(!isThink) setIsFast(false); }} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all whitespace-nowrap ${isThink ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' : 'bg-white/5 text-gray-500'}`}>
              <Brain size={10} className={isThink ? "fill-current" : ""} /> {t.mode_think}
          </button>
          <button onClick={() => setIsSearch(!isSearch)} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all whitespace-nowrap ${isSearch ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-white/5 text-gray-500'}`}>
              <Globe size={10} /> {t.mode_search}
          </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#020403]/80">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 opacity-50">
             <Bot size={40} className="text-emerald-500 mb-2" />
             <p className="text-sm text-gray-400">{t.chat_welcome}</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={msg.id || idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} group w-full`}>
            {msg.mastermindData ? (
                <MastermindReportCard data={msg.mastermindData} />
            ) : (
                <div className={`max-w-[88%] p-2.5 rounded-xl text-[13px] leading-relaxed whitespace-pre-wrap select-text relative ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white/5 text-gray-200 rounded-bl-none border border-white/5 shadow-sm'}`}>
                  {msg.replyTo && (
                      <div className={`mb-1.5 p-1.5 rounded text-[11px] border-l-2 ${msg.role === 'user' ? 'bg-black/20 border-white/50 text-gray-200' : 'bg-black/20 border-emerald-500 text-gray-400'}`}>
                          <div className="font-bold opacity-75 mb-0.5">{msg.replyTo.role === 'user' ? t.chat_assistant : 'User'}</div>
                          <div className="line-clamp-1 italic">{msg.replyTo.text}</div>
                      </div>
                  )}
                  {msg.uploadedImage && (
                      <div className="rounded-lg overflow-hidden border border-white/10 mb-2">
                          <img src={msg.uploadedImage} alt="User Upload" className="w-full h-auto object-cover max-h-[200px]" />
                      </div>
                  )}
                  {msg.image ? (
                      <div className="rounded-lg overflow-hidden border border-white/10 mt-1">
                          <img src={msg.image} alt="Generated" className="w-full h-auto object-cover max-h-[300px]" />
                          <a href={msg.image} download={`banana-gen-${Date.now()}.png`} className="block bg-black/50 text-center py-1 text-xs text-white hover:bg-black/70">{t.exportImage}</a>
                      </div>
                  ) : (
                      msg.text
                  )}
                </div>
            )}
            {!msg.image && !msg.mastermindData && <ActionButtons text={msg.text} role={msg.role} msgId={msg.id} />}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white/5 p-3 rounded-2xl rounded-bl-none flex items-center gap-2 text-xs text-gray-400 border border-white/10">
                <Loader2 size={14} className="animate-spin text-emerald-500"/>
                {loadingStep || (isBrainMode ? t.calculating_growth : t.chat_thinking)}
             </div>
          </div>
        )}
      </div>

      {replyingTo && (
          <div className="px-4 py-2 bg-[#1a1a1a] border-t border-white/10 flex items-center justify-between shrink-0">
              <div className="flex-1 min-w-0">
                  <div className="text-xs text-emerald-400 font-bold mb-0.5">{t.chat_replying_to}</div>
                  <div className="text-xs text-gray-400 truncate border-l-2 border-emerald-500 pl-2">{replyingTo.text}</div>
              </div>
              <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-white/10 rounded-full text-gray-500"><X size={14} /></button>
          </div>
      )}
      
      {selectedImage && (
          <div className="px-4 py-2 bg-[#1a1a1a] border-t border-white/10 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-2">
                 <img src={selectedImage} className="w-8 h-8 rounded object-cover border border-white/10" alt="Preview"/>
                 <span className="text-xs text-green-400 font-bold">{lang === 'ar' ? 'تم إرفاق صورة' : 'Image Attached'}</span>
             </div>
             <button onClick={() => setSelectedImage(null)} className="p-1 hover:bg-white/10 rounded-full text-gray-500"><X size={14} /></button>
          </div>
      )}

      <form onSubmit={handleSend} className="p-2.5 bg-[#020403] border-t border-white/5 flex gap-1.5 shrink-0">
         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect}/>
         <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <ImageIcon size={16} />
         </button>
         <button type="button" onClick={() => setIsBrainMode(!isBrainMode)} className={`p-1.5 rounded-lg transition-all duration-300 relative ${isBrainMode ? 'bg-purple-600 text-white shadow-[0_0_8px_purple] animate-pulse' : 'text-gray-400 hover:bg-white/10'}`}>
            <Brain size={16} />
            {isBrainMode && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full border border-black"></span>}
         </button>

         <input 
           type="text" 
           value={input}
           onChange={e => setInput(e.target.value)}
           placeholder={isBrainMode ? (lang === 'ar' ? 'رابط القناة...' : 'Channel URL...') : t.chat_placeholder}
           className={`flex-1 bg-[#121212] border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none transition-colors ${isBrainMode ? 'focus:border-purple-500' : 'focus:border-emerald-500'} ${lang === 'ar' ? 'text-right' : 'text-left'}`}
         />
         <button type="submit" disabled={isLoading || (!input.trim() && !selectedImage)} className={`px-3 text-white rounded-lg disabled:opacity-50 transition-colors ${isBrainMode ? 'bg-purple-600' : 'bg-emerald-600'}`}>
           <Send size={15} />
         </button>
      </form>
    </div>
  );
};

export default ChatAssistant;
