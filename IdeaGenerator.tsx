
import React, { useState, useEffect, useRef } from 'react';
import { useLang } from '../index';
import { motion } from 'motion/react';
import { Lightbulb, TrendingUp, Loader2, Sparkles, Check, Flame, Zap, Target, Brain, Copy, ArrowRight, Shield, ChevronDown, Send, User, Bot, Search, Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { saveToStorage, loadFromStorage, StorageKeys } from '../services/storageService';
import { useJobs } from '../contexts/JobContext';
import { chatWithGemini } from '../services/geminiService';
import { logToolActivity } from '../services/firebase';
import Tooltip from './Tooltip';

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    type?: 'idea' | 'text';
    data?: any;
}

const IdeaGenerator: React.FC = () => {
  const { t, lang, resultLang } = useLang();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Advanced Settings
  const [creativityLevel, setCreativityLevel] = useState('balanced');
  const [targetAudience, setTargetAudience] = useState('general');
  const [videoFormat, setVideoFormat] = useState('any');
  const [showSettings, setShowSettings] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Restore Chat History
  useEffect(() => {
    const cached = loadFromStorage<ChatMessage[]>(StorageKeys.IDEAS_CHAT_HISTORY);
    if (cached) setMessages(cached);
    else {
        // Initial Welcome Message
        setMessages([{
            role: 'model',
            text: lang === 'ar' 
                ? 'أهلاً بك في ستوديو ابتكار الأفكار المتقدم. أنا هنا لأغوص معك في أعماق المحتوى والـ SEO. ما هو المجال أو القناة التي تريد تفجير إبداعها اليوم؟' 
                : 'Welcome to the Advanced Idea Studio. I am here to dive deep into content and SEO with you. What niche or channel do you want to explode with creativity today?'
        }]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
        saveToStorage(StorageKeys.IDEAS_CHAT_HISTORY, messages);
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
            ? `أنت "العقل المدبر الاستراتيجي للأفكار 2026". مهمتك هي توليد أفكار فيديوهات فيروسية ومبتكرة للغاية مع تحليل SEO دقيق.
               يجب أن يكون أسلوبك عميقاً، تحليلياً، وغير بارد. تحدث كخبير استراتيجي يرى ما لا يراه الآخرون.
               
               المعايير الحالية:
               - مستوى الإبداع: ${creativityLevel}
               - الجمهور المستهدف: ${targetAudience}
               - صيغة الفيديو: ${videoFormat}
               
               عندما يطلب المستخدم أفكاراً، قدم له 3-5 أفكار مذهلة مع شرح "لماذا ستنجح" (Why it works) وتحليل SEO (كلمات مفتاحية، استراتيجية تصدر).
               استخدم التنسيق الجمالي في الرد.`
            : `You are the "Mastermind Strategist 2026". Your mission is to generate viral, highly innovative video ideas with precise SEO analysis.
               Your style must be deep, analytical, and engaging (not cold). Speak like a strategist who sees what others miss.
               
               Current Criteria:
               - Creativity Level: ${creativityLevel}
               - Target Audience: ${targetAudience}
               - Video Format: ${videoFormat}
               
               When the user asks for ideas, provide 3-5 amazing ideas with a "Why it works" explanation and SEO analysis (keywords, ranking strategy).
               Use aesthetic formatting in your response.`;

        const response = await chatWithGemini(
            messages.map(m => ({ role: m.role, text: m.text })),
            userMsg,
            lang,
            { fast: false, think: true, search: true }
        );

        setMessages(prev => [...prev, { role: 'model', text: response }]);
        
        await logToolActivity('idea_generator', t.ideaGenerator, 'generated_idea', {
            input: userMsg,
            creativityLevel,
            targetAudience,
            videoFormat
        }, lang === 'ar' ? `إنشاء فكرة حول: ${userMsg.substring(0, 30)}...` : `Generated idea for: ${userMsg.substring(0, 30)}...`);
        
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
            ? 'تم تصفير المحرك. أنا جاهز لأفكار جديدة!' 
            : 'Engine reset. I am ready for new ideas!'
    }]);
    saveToStorage(StorageKeys.IDEAS_CHAT_HISTORY, []);
  };

  const isAr = lang === 'ar';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto pb-20 font-sans flex flex-col min-h-0 w-full"
    >
      {/* Header with Tools */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 mb-4"
          >
            <Brain size={14} className="text-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{t.ideaGenerator}</span>
          </motion.div>
          <h2 className={`text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-sm ${isAr ? 'font-alex' : ''}`}>
            {t.ideaGenerator}
          </h2>
          <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed font-normal">
            {isAr 
              ? 'توليد أفكار فيديوهات مبتكرة للغاية وتحليل فجوات المحتوى والـ SEO لتفجير نسب النقر والمشاهدات.' 
              : 'Forge highly viral, creative video concepts integrated with deep LSI keywords and algorithmic audience hooks.'}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center justify-center md:justify-end gap-2 shrink-0">
          <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-3 rounded-xl border transition-all ${showSettings ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
              title={lang === 'ar' ? 'إعدادات الخوارزمية' : 'Algorithm Settings'}
          >
              <Zap size={20} />
          </button>
          <button 
              onClick={clearChat}
              className="p-3 rounded-xl bg-white/5 text-gray-400 border border-white/10 hover:bg-red-500/20 hover:text-red-400 transition-all"
              title={lang === 'ar' ? 'مسح المحادثة' : 'Clear Chat'}
          >
              <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Settings Overlay */}
      {showSettings && (
          <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0a0c0b]/50 p-4 md:p-6 mb-4 animate-slide-in shadow-2xl mx-2 md:mx-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 relative z-10">
                    <div>
                        <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 block">{lang === 'ar' ? 'مستوى الإبداع' : 'Creativity'}</label>
                        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                            {['safe', 'balanced', 'insane'].map(lvl => (
                                <button key={lvl} onClick={() => setCreativityLevel(lvl)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${creativityLevel === lvl ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-white'}`}>
                                    {lvl === 'safe' ? (lang === 'ar' ? 'آمن' : 'SAFE') : 
                                     lvl === 'balanced' ? (lang === 'ar' ? 'متوازن' : 'BALANCED') : 
                                     (lang === 'ar' ? 'جنوني' : 'INSANE')}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 block">{lang === 'ar' ? 'الجمهور المستهدف' : 'Target Audience'}</label>
                        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                            {['beginners', 'general', 'experts'].map(aud => (
                                <button key={aud} onClick={() => setTargetAudience(aud)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${targetAudience === aud ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-white'}`}>
                                    {aud === 'beginners' ? (lang === 'ar' ? 'مبتدئين' : 'BEGINNERS') : 
                                     aud === 'general' ? (lang === 'ar' ? 'عام' : 'GENERAL') : 
                                     (lang === 'ar' ? 'خبراء' : 'EXPERTS')}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 block">{lang === 'ar' ? 'صيغة الفيديو' : 'Video Format'}</label>
                        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                            {['any', 'shorts', 'long'].map(fmt => (
                                <button key={fmt} onClick={() => setVideoFormat(fmt)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${videoFormat === fmt ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-white'}`}>
                                    {fmt === 'any' ? (lang === 'ar' ? 'أي نوع' : 'ANY') : 
                                     fmt === 'shorts' ? (lang === 'ar' ? 'شورتس' : 'SHORTS') : 
                                     (lang === 'ar' ? 'طويل' : 'LONG')}
                                </button>
                            ))}
                        </div>
                    </div>
              </div>
          </div>
      )}

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#050a08]/50 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 custom-scrollbar mb-4 shadow-inner mx-2 md:mx-0"
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
                                            // toast logic
                                        }}
                                        className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-emerald-400 transition-all"
                                        title={lang === 'ar' ? 'نسخ التحليل' : 'Copy Analysis'}
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
                        {lang === 'ar' ? 'جاري تحليل الفجوات والـ SEO...' : 'Analyzing Gaps & SEO...'}
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="relative shrink-0 mx-2 md:mx-0">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-2xl blur opacity-25"></div>
          <div className="relative flex items-center bg-[#0a1a12] border border-emerald-500/20 rounded-2xl p-1.5 md:p-2 shadow-2xl focus-within:border-emerald-500/50 transition-all">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={lang === 'ar' ? 'اكتب مجالك أو اسأل عن أفكار لتريند معين...' : 'Type your niche or ask for trend ideas...'}
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


      {/* Footer Info */}
      <div className="mt-4 flex justify-center gap-6">
          <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
              <Search size={12} className="text-emerald-500/50" /> {t.idea_seo_integrated}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
              <TrendingUp size={12} className="text-emerald-500/50" /> {t.idea_viral_triggers}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
              <Shield size={12} className="text-emerald-500/50" /> {t.idea_deep_analysis}
          </div>
      </div>
    </motion.div>
  );
};

export default IdeaGenerator;
