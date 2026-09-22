
import React, { useState, useEffect, useRef } from 'react';
import { useLang } from '../index';
import { motion } from 'motion/react';
import { 
    CheckCircle, Zap, Loader2, ArrowRight, Target, Calendar, Trophy, 
    AlertTriangle, Shield, TrendingUp, Crosshair, PlayCircle, BarChart, 
    Link as LinkIcon, Search, Layout, Lock, CheckSquare, Square, ChevronDown,
    Send, User, Bot, Trash2, Copy, Settings, Mail
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { saveToStorage, loadFromStorage, StorageKeys } from '../services/storageService';
import { useJobs } from '../contexts/JobContext';
import { extractId } from '../utils';
import { chatWithGemini } from '../services/geminiService';
import { logToolActivity } from '../services/firebase';
import { exportPlanToGoogleTasks } from '../services/tasksService';
import { sendEmail } from '../services/gmailService';
import Tooltip from './Tooltip';

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

const Planner: React.FC = () => {
  const { t, lang } = useLang();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Settings
  const [niche, setNiche] = useState('general');
  const [goal, setGoal] = useState('subscribers');
  const [style, setStyle] = useState('both');

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Restore Chat History
  useEffect(() => {
    const cached = loadFromStorage<ChatMessage[]>(StorageKeys.PLANNER_CHAT_HISTORY);
    if (cached) setMessages(cached);
    else {
        setMessages([{
            role: 'model',
            text: lang === 'ar' 
                ? 'مرحباً بك في مركز قيادة النمو. أنا مستشارك الاستراتيجي لتطوير قناتك. ضع رابط قناتك أو أخبرني عن تحدياتك لنبدأ برسم خطة الاكتساح.' 
                : 'Welcome to the Growth Command Center. I am your strategic consultant. Paste your channel link or tell me about your challenges to start mapping your dominance plan.'
        }]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
        saveToStorage(StorageKeys.PLANNER_CHAT_HISTORY, messages);
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
            ? `أنت "رئيس قسم النمو الاستراتيجي 2026". مهمتك هي بناء خطط نمو عسكرية مخصصة ومفصلة للغاية.
               يجب أن يكون أسلوبك حازماً، استراتيجياً، وعميقاً. لا تقدم نصائح عامة، بل حلولاً جذرية.
               الإعدادات الحالية: التخصص: ${niche}، الهدف: ${goal === 'subscribers' ? 'المشتركين' : goal === 'views' ? 'المشاهدات' : 'الأرباح'}، نمط المحتوى: ${style === 'shorts' ? 'فيديوهات قصيرة' : style === 'long' ? 'فيديوهات طويلة' : 'كلاهما'}.
               عندما يزودك المستخدم برابط قناة أو يصف مشكلته، قم بتحليلها وتقديم خطة من 7 أيام تتضمن:
               1. تشخيص العطل (Critical Failure Point).
               2. مقياس نجم الشمال (North Star Metric).
               3. جدول العمليات لـ 7 أيام (مهام محددة).
               4. تعليمات التطوير الذاتي (لماذا هذه الاستراتيجية؟).
               استخدم التنسيق الجمالي والرموز التعبيرية.`
            : `You are the "Chief Growth Officer 2026". Your mission is to build highly customized and detailed military-grade growth plans.
               Your style must be firm, strategic, and deep. Do not provide generic advice, but radical solutions.
               Current Settings: Niche: ${niche}, Goal: ${goal}, Content Style: ${style}.
               When the user provides a channel link or describes a problem, analyze it and provide a 7-day plan including:
               1. Critical Failure Point diagnosis.
               2. North Star Metric.
               3. 7-Day Operations Grid (specific tasks).
               4. Self-Development Protocol (the "why" behind the strategy).
               Use aesthetic formatting and emojis.`;

        const response = await chatWithGemini(
            messages.map(m => ({ role: m.role, text: m.text })),
            userMsg,
            lang,
            { fast: false, think: true, search: true }
        );

        setMessages(prev => [...prev, { role: 'model', text: response }]);
        
        await logToolActivity('planner', t.planner, 'created_plan', {
            input: userMsg,
            settings: { goal, style, niche }
        }, lang === 'ar' ? `إنشاء خطة نمو لـ: ${userMsg.substring(0, 30)}...` : `Created growth plan for: ${userMsg.substring(0, 30)}...`);
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
            ? 'تم تصفير البروتوكول. جاهز لمهمة جديدة.' 
            : 'Protocol reset. Ready for a new mission.'
    }]);
    saveToStorage(StorageKeys.PLANNER_CHAT_HISTORY, []);
  };

  const handleExportTasks = async (planText: string) => {
    const confirmed = window.confirm(
       lang === 'ar' 
        ? "هل توافق على إنشاء قائمة مهام جديدة في Google Tasks وتصدير هذه الخطة إليها؟" 
        : "Do you want to create a new task list in Google Tasks and export this plan?"
    );
    if (!confirmed) return;

    setIsExporting(true);
    try {
        await exportPlanToGoogleTasks(planText, lang === 'ar' ? 'خطة نمو يوتيوب (Studio)' : 'YT Growth Plan (Studio)');
        alert(lang === 'ar' ? 'تم التصدير بنجاح!' : 'Exported successfully!');
    } catch (e: any) {
        if (e.message.includes('Authentication')) {
            alert(lang === 'ar' ? 'يرجى تسجيل الدخول بحساب Google أولاً ليتم المزامنة.' : 'Please sign in with Google first to sync.');
        } else {
            console.error(e);
            alert(lang === 'ar' ? 'حدث خطأ أثناء التصدير.' : 'Failed to export.');
        }
    } finally {
        setIsExporting(false);
    }
  };

  const handleSendEmail = async (planText: string) => {
    const confirmed = window.confirm(
       lang === 'ar' 
        ? "هل توافق على إرسال هذه الخطة إلى بريدك الإلكتروني عبر Gmail؟" 
        : "Do you want to send this plan to your email via Gmail?"
    );
    if (!confirmed) return;

    setIsEmailing(true);
    try {
        await sendEmail(lang === 'ar' ? 'خطة نمو يوتيوب الخاصة بك (Studio)' : 'Your YT Growth Plan (Studio)', planText);
        alert(lang === 'ar' ? 'تم الإرسال بنجاح!' : 'Sent successfully!');
    } catch (e: any) {
        if (e.message.includes('Authentication')) {
            alert(lang === 'ar' ? 'يرجى تسجيل الدخول بحساب Google أولاً.' : 'Please sign in with Google first.');
        } else {
            console.error(e);
            alert(lang === 'ar' ? 'حدث خطأ أثناء الإرسال.' : 'Failed to send.');
        }
    } finally {
        setIsEmailing(false);
    }
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
      <div className="mb-16 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 mb-4"
          >
            <Calendar size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{t.planner}</span>
          </motion.div>
          <h2 className={`text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-sm ${isAr ? 'font-alex' : ''}`}>
            {t.planner}
          </h2>
          <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed font-normal">
            {isAr 
              ? 'تخطيط عسكري للنمو وهندسة بروتوكول نشر تكتيكي متكامل طوال أيام الأسبوع لزيادة المشاهدات والتفاعل.' 
              : 'Military-grade growth blueprint and tactical roadmap engineering designed to achieve exponential authority.'}
          </p>
        </div>

        {/* Toggle Settings Button for Mobile */}
        <div className="lg:hidden flex justify-center">
          <button 
              onClick={() => setShowSettings(!showSettings)}
              className="px-6 py-3 bg-white/5 border border-white/10 hover:border-emerald-500/30 text-emerald-400 font-bold rounded-xl text-xs flex items-center gap-2 transition-all"
          >
              <Settings size={14} /> {isAr ? 'إعدادات الخطة' : 'PLAN SETTINGS'}
          </button>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col lg:flex-row gap-6 px-2 md:px-0 min-h-0">
      
      {/* Sidebar Settings */}
      <div className={`lg:w-80 shrink-0 flex flex-col gap-4 ${showSettings ? 'flex' : 'hidden lg:flex'}`}>
          <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0a0c0b]/50 p-6">
              <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Settings size={14} /> {lang === 'ar' ? 'إعدادات النمو' : 'GROWTH SETTINGS'}
              </h3>
              
              <div className="space-y-6">
                  <div>
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 block">{t.planner_goal}</label>
                      <div className="grid grid-cols-1 gap-2">
                          {[
                              { id: 'subscribers', label: lang === 'ar' ? 'زيادة المشتركين' : 'Subscribers', icon: User },
                              { id: 'views', label: lang === 'ar' ? 'زيادة المشاهدات' : 'Views Peak', icon: TrendingUp },
                              { id: 'revenue', label: lang === 'ar' ? 'تعظيم الأرباح' : 'Max Revenue', icon: BarChart }
                          ].map(opt => (
                              <button
                                  key={opt.id}
                                  onClick={() => setGoal(opt.id)}
                                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-xs font-bold ${
                                      goal === opt.id 
                                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' 
                                      : 'bg-black/30 border-white/5 text-slate-400 hover:border-emerald-500/30'
                                  }`}
                              >
                                  <opt.icon size={14} className={goal === opt.id ? 'text-white' : 'text-emerald-500'} />
                                  {opt.label}
                              </button>
                          ))}
                      </div>
                  </div>

                  <div>
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 block">{t.planner_style}</label>
                      <select 
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs font-bold text-gray-300 focus:outline-none focus:border-emerald-500/50 transition-all"
                      >
                          <option value="both">{t.planner_style_mixed}</option>
                          <option value="shorts">{t.planner_style_shorts}</option>
                          <option value="long">{t.planner_style_long}</option>
                      </select>
                  </div>
              </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0a0c0b]/50 p-6">
              <div className="flex items-center gap-3 text-emerald-400 mb-2">
                  <Shield size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.weeklyProtocol}</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                  {lang === 'ar' 
                   ? 'يستخدم هذا النظام خوارزميات التنبؤ بالنمو لتحديد الثغرات في قناتك وبناء خطة هجومية متكاملة.' 
                   : 'This system uses growth prediction algorithms to identify gaps in your channel and build a complete offensive plan.'}
              </p>
          </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 shrink-0 px-2 md:px-0">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <Target className="text-emerald-400 animate-pulse" size={24} />
                </div>
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        {t.planner} <span className="text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded-full uppercase font-black">Growth AI</span>
                    </h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{lang === 'ar' ? 'رئيس قسم النمو 2026' : 'Chief Growth Officer 2026'}</p>
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
                                        onClick={() => handleSendEmail(msg.text)}
                                        disabled={isEmailing}
                                        className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-emerald-400 transition-all flex items-center gap-1 text-xs"
                                        title={lang === 'ar' ? 'إرسال إلى الإيميل (Gmail)' : 'Send to Email (Gmail)'}
                                    >
                                        {isEmailing ? <Loader2 size={14} className="animate-spin"/> : <Mail size={14} />}
                                    </button>
                                    <button 
                                        onClick={() => handleExportTasks(msg.text)}
                                        disabled={isExporting}
                                        className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-emerald-400 transition-all flex items-center gap-1 text-xs"
                                        title={lang === 'ar' ? 'تصدير إلى المهام' : 'Export to Google Tasks'}
                                    >
                                        {isExporting ? <Loader2 size={14} className="animate-spin"/> : <CheckSquare size={14} />}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(msg.text);
                                        }}
                                        className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-emerald-400 transition-all"
                                        title={lang === 'ar' ? 'نسخ الخطة' : 'Copy Plan'}
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
                            {lang === 'ar' ? 'جاري صياغة بروتوكول النمو...' : 'Formulating Growth Protocol...'}
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
                    placeholder={lang === 'ar' ? 'ضع رابط قناتك أو اسأل عن استراتيجية نمو...' : 'Paste channel link or ask for growth strategy...'}
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

      {/* Footer Info */}
      <div className="mt-4 flex justify-center gap-6">
          <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
              <Shield size={12} className="text-emerald-500/50" /> {t.planner_military_grade}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
              <TrendingUp size={12} className="text-emerald-500/50" /> {t.planner_exponential}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
              <Lock size={12} className="text-emerald-500/50" /> {t.planner_secure}
          </div>
      </div>
    </motion.div>
  );
};

export default Planner;
