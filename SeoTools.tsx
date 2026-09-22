
import React, { useState, useEffect, useRef } from 'react';
import { useLang } from '../index';
import { motion } from 'motion/react';
import { 
    Search, Zap, Loader2, Copy, CheckCircle, Globe, BarChart, 
    TrendingUp, Shield, Lock, Send, User, Bot, Trash2, Settings,
    ChevronDown, Eye, MessageSquare, Hash
} from 'lucide-react';
import { saveToStorage, loadFromStorage, StorageKeys } from '../services/storageService';
import { chatWithGemini } from '../services/geminiService';
import { logToolActivity } from '../services/firebase';

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

const SeoTools: React.FC = () => {
  const { t, lang } = useLang();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Settings
  const [seoFocus, setSeoFocus] = useState('ctr'); // ctr, search, viral
  const [targetRegion, setTargetRegion] = useState('global');

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Restore Chat History
  useEffect(() => {
    const cached = loadFromStorage<ChatMessage[]>(StorageKeys.SEO_CHAT_HISTORY);
    if (cached) setMessages(cached);
    else {
        setMessages([{
            role: 'model',
            text: lang === 'ar' 
                ? 'مرحباً بك في مختبر السيو المتقدم. أنا خبير تحسين محركات البحث الخاص بك. ضع رابط الفيديو أو الكلمات المفتاحية التي تستهدفها لنقوم بهندسة تصدرك للنتائج.' 
                : 'Welcome to the Advanced SEO Lab. I am your SEO architect. Paste a video link or your target keywords to engineer your search dominance.'
        }]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
        saveToStorage(StorageKeys.SEO_CHAT_HISTORY, messages);
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
        const systemInstruction = lang === 'ar'
            ? `أنت "مهندس السيو الفيروسي 2026". مهمتك هي تحويل أي فيديو إلى مغناطيس للمشاهدات.
               يجب أن تركز في تحليلك على:
               1. هندسة العناوين (CTR Engineering): عناوين تثير الفضول وتتصدر البحث.
               2. الكلمات المفتاحية العميقة (LSI Keywords): كلمات بحثية غير تقليدية.
               3. تحسين الوصف (Metadata Optimization): وصف يحبه خوارزمية جوجل ويوتيوب.
               4. بروتوكول التطوير الذاتي: لماذا اخترت هذه الكلمات تحديداً؟
               الإعدادات الحالية: التركيز على ${seoFocus === 'ctr' ? 'نسبة النقر' : seoFocus === 'search' ? 'البحث' : 'الانتشار الفيروسي'}، المنطقة: ${targetRegion}.
               أجب بتنسيق احترافي مع رموز تعبيرية.`
            : `You are the "Viral SEO Architect 2026". Your mission is to turn any video into a view magnet.
               Focus your analysis on:
               1. CTR Engineering: Titles that trigger curiosity and rank high.
               2. Deep LSI Keywords: Non-obvious search terms.
               3. Metadata Optimization: Descriptions loved by Google and YouTube algorithms.
               4. Self-Development Protocol: Why did you choose these specific keywords?
               Current Settings: Focus on ${seoFocus}, Region: ${targetRegion}.
               Respond with professional formatting and emojis.`;

        const response = await chatWithGemini(
            messages.map(m => ({ role: m.role, text: m.text })),
            userMsg,
            lang,
            { fast: false, think: true, search: true }
        );

        setMessages(prev => [...prev, { role: 'model', text: response }]);
        
        await logToolActivity('seo_tools', t.seoTools, 'analyzed_seo', {
            input: userMsg,
            settings: { seoFocus, targetRegion }
        }, lang === 'ar' ? `تحليل SEO لـ: ${userMsg.substring(0, 30)}...` : `Analyzed SEO for: ${userMsg.substring(0, 30)}...`);
        
    } catch (error) {
        setMessages(prev => [...prev, { role: 'model', text: lang === 'ar' ? 'عذراً، حدث خطأ في الاتصال.' : 'Sorry, a connection error occurred.' }]);
    } finally {
        setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
        role: 'model',
        text: lang === 'ar' 
            ? 'تم تصفير المختبر. جاهز لتحليل جديد.' 
            : 'Lab reset. Ready for new analysis.'
    }]);
    saveToStorage(StorageKeys.SEO_CHAT_HISTORY, []);
  };

  const isAr = lang === 'ar';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto pb-20 font-sans flex flex-col min-h-0 w-full"
    >
      {/* Header */}
      <div className="mb-16 text-center md:text-left">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 mb-4"
        >
          <Search size={14} className="text-emerald-500" />
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{t.seoTools}</span>
        </motion.div>
        <h2 className={`text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-sm ${isAr ? 'font-alex' : ''}`}>
          {t.seoTools}
        </h2>
        <p className={`text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed font-normal ${isAr ? 'font-almarai' : ''}`}>
          {isAr 
            ? 'هندسة الكلمات المفتاحية الذكية والوصف وتحفيز نسبة النقر على الظهور للسيطرة على خوارزميات محركات البحث.' 
            : 'Engineering smart keywords, description optimization, and CTR-boosting algorithms to dominate search engine results.'}
        </p>
      </div>

      <div className="flex-1 w-full flex flex-col lg:flex-row gap-6 px-2 md:px-0 min-h-0">
      
      {/* Sidebar Settings */}
      <div className={`lg:w-80 shrink-0 flex flex-col gap-4 ${showSettings ? 'flex' : 'hidden lg:flex'}`}>
          <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0a0c0b]/50 p-6">
              <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Settings size={14} /> {lang === 'ar' ? 'إعدادات الخوارزمية' : 'ALGO SETTINGS'}
              </h3>
              
              <div className="space-y-6">
                  <div>
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 block">{t.seo_focus}</label>
                      <div className="grid grid-cols-1 gap-2">
                          {[
                              { id: 'ctr', label: lang === 'ar' ? 'نسبة النقر (CTR)' : 'CTR Focus', icon: Eye },
                              { id: 'search', label: lang === 'ar' ? 'تصدر البحث' : 'Search Rank', icon: Globe },
                              { id: 'viral', label: lang === 'ar' ? 'الانتشار الفيروسي' : 'Viral Spread', icon: TrendingUp }
                          ].map(opt => (
                              <button
                                  key={opt.id}
                                  onClick={() => setSeoFocus(opt.id)}
                                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-xs font-bold ${
                                      seoFocus === opt.id 
                                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' 
                                      : 'bg-black/30 border-white/5 text-slate-400 hover:border-emerald-500/30'
                                  }`}
                              >
                                  <opt.icon size={14} className={seoFocus === opt.id ? 'text-white' : 'text-emerald-500'} />
                                  {opt.label}
                              </button>
                          ))}
                      </div>
                  </div>

                  <div>
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 block">{t.seo_region}</label>
                      <select 
                        value={targetRegion}
                        onChange={(e) => setTargetRegion(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs font-bold text-gray-300 focus:outline-none focus:border-emerald-500/50 transition-all"
                      >
                          <option value="global">{t.seo_region_global}</option>
                          <option value="mena">{t.seo_region_mena}</option>
                          <option value="us">{t.seo_region_us_eu}</option>
                          <option value="asia">{t.seo_region_asia}</option>
                      </select>
                  </div>
              </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0a0c0b]/50 p-6">
              <div className="flex items-center gap-3 text-emerald-400 mb-2">
                  <Shield size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.seo_engine}</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                  {lang === 'ar' 
                   ? 'يستخدم هذا النظام تحليل الكلمات المفتاحية العميقة (LSI) لضمان أقصى قدر من الظهور في محركات البحث.' 
                   : 'This system uses Deep LSI Keyword analysis to ensure maximum visibility in search engines.'}
              </p>
          </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 shrink-0 px-2 md:px-0">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <Search className="text-emerald-400 animate-pulse" size={24} />
                </div>
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        {t.seoTools} <span className="text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded-full uppercase font-black">V3 Neural</span>
                    </h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{lang === 'ar' ? 'مهندس السيو الفيروسي 2026' : 'Viral SEO Architect 2026'}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="lg:hidden p-2 rounded-xl bg-white/5 text-gray-400 border border-white/10 hover:bg-emerald-500/20 hover:text-emerald-400 transition-all"
                >
                    <Settings size={20} />
                </button>
                <button 
                    onClick={clearChat}
                    className="p-2 rounded-xl bg-white/5 text-gray-400 border border-white/10 hover:bg-red-500/20 hover:text-red-400 transition-all"
                >
                    <Trash2 size={20} />
                </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#05080a]/50 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 custom-scrollbar mb-4 shadow-inner mx-2 md:mx-0"
          >
            {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}>
                    <div className={`flex gap-3 max-w-[95%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-white/10 border-white/10 text-emerald-400'}`}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-none'}`}>
                            <div className="prose prose-invert prose-sm max-w-none">
                                {msg.text.split('\n').map((line, li) => (
                                    <p key={li} className="mb-2 last:mb-0">{line}</p>
                                ))}
                            </div>
                            {msg.role === 'model' && i > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/5 flex justify-end gap-2">
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(msg.text);
                                        }}
                                        className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-emerald-400 transition-all"
                                        title={lang === 'ar' ? 'نسخ بيانات السيو' : 'Copy SEO Data'}
                                    >
                                        <Copy size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start animate-pulse">
                    <div className="flex gap-3 max-w-[85%]">
                        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-emerald-400">
                            <Loader2 size={16} className="animate-spin" />
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 text-gray-500 border border-white/5 rounded-tl-none text-xs font-mono uppercase tracking-widest">
                            {lang === 'ar' ? 'جاري هندسة السيو الفيروسي...' : 'Engineering Viral SEO...'}
                        </div>
                    </div>
                </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="relative shrink-0 mx-2 md:mx-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-2xl blur opacity-25"></div>
              <div className="relative flex items-center bg-[#0a101a] border border-emerald-500/20 rounded-2xl p-1.5 md:p-2 shadow-2xl focus-within:border-emerald-500/50 transition-all">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={lang === 'ar' ? 'ضع رابط الفيديو أو كلماتك المفتاحية...' : 'Paste video link or your keywords...'}
                    className={`flex-1 bg-transparent border-none py-3 md:py-4 px-4 md:px-6 text-white text-sm md:text-base focus:outline-none placeholder-gray-500 ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                  />
                  <button 
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 md:p-4 rounded-xl transition-all shadow-lg disabled:opacity-50"
                  >
                    <Send size={20} />
                  </button>
              </div>
          </form>
      </div>
    </div>
  </motion.div>
  );
};

export default SeoTools;
