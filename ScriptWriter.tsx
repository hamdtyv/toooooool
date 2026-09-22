
import React, { useEffect, useRef } from 'react';
import { useLang } from '../index';
import { useSectionState, useAppState } from '../contexts/AppStateContext';
import { motion } from 'motion/react';
import { 
    Video, Clock, Music, Zap, Brain, Copy, Loader2, Search, Smartphone, FileText, 
    Send, User, Bot, Trash2, Settings2
} from 'lucide-react';
import { saveToStorage, loadFromStorage, StorageKeys } from '../services/storageService';
import { chatWithGemini } from '../services/geminiService';
import { logToolActivity } from '../services/firebase';

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

const ScriptWriter: React.FC = () => {
    const { t, lang } = useLang();
    const { addToArchive } = useAppState();
    const [input, setInput] = React.useState('');
    const [messages, setMessages] = useSectionState<ChatMessage[]>('script_writer_chat', [{
        role: 'model',
        text: lang === 'ar' 
            ? 'أهلاً بك في ستوديو كتابة السكربتات الاحترافي. أنا كاتبك الخاص، سأقوم بصياغة محتوى يخطف الأنفاس. ما هو موضوع الفيديو الذي سنعمل عليه اليوم؟' 
            : 'Welcome to the Professional Script Studio. I am your personal writer, I will craft breathtaking content. What is the video topic we are working on today?'
    }]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showSettings, setShowSettings] = React.useState(false);

    // Settings with persistence
    const [duration, setDuration] = useSectionState('script_duration', '60s');
    const [tone, setTone] = useSectionState('script_tone', 'energetic');
    const [language, setLanguage] = useSectionState('script_lang', lang === 'ar' ? 'Arabic' : 'English');
    const [hookType, setHookType] = useSectionState('script_hook', 'question');
    const [platform, setPlatform] = useSectionState('script_platform_type', 'youtube');
    const [complexity, setComplexity] = useSectionState('script_complexity', 'balanced');
    const [seoFocus, setSeoFocus] = useSectionState('script_seo', 'high');
    const [mode, setMode] = useSectionState('script_mode', 'full');

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const systemInstruction = lang === 'ar'
                ? `أنت "كاتب سكربتات فيروسي محترف 2026". مهمتك هي كتابة سكربتات فيديوهات (YouTube, TikTok, Instagram) بأسلوب سينمائي، جذاب، ومحسن لمحركات البحث (SEO).
                   يجب أن يكون أسلوبك تفاعلياً، عميقاً، وملهماً.
                   الإعدادات الحالية: المدة: ${duration}، النبرة: ${tone}، المنصة: ${platform}، نوع الخطاف: ${hookType}، تركيز SEO: ${seoFocus}.
                   عند كتابة السكربت، ابدأ دائماً بـ (عنوان SEO، وصف SEO، كلمات مفتاحية) ثم السكربت مقسماً إلى (Hook, Intro, Body, Outro) مع ملاحظات للمخرج.`
                : `You are a "Professional Viral Scriptwriter 2026". Your mission is to write video scripts (YouTube, TikTok, Instagram) in a cinematic, engaging, and SEO-optimized style.
                   Your style must be interactive, deep, and inspiring.
                   Current Settings: Duration: ${duration}, Tone: ${tone}, Platform: ${platform}, Hook Type: ${hookType}, SEO Focus: ${seoFocus}.
                   When writing the script, always start with (SEO Title, SEO Description, Keywords) then the script divided into (Hook, Intro, Body, Outro) with Director Notes.`;

            const response = await chatWithGemini(
                messages.map(m => ({ role: m.role, text: m.text })),
                userMsg,
                lang,
                { fast: false, think: true, search: true }
            );

            setMessages(prev => [...prev, { role: 'model', text: response }]);
            
            // Save discrete copy to Strategic Archive
            addToArchive({
                type: 'script',
                title: userMsg.substring(0, 50) + (userMsg.length > 50 ? '...' : ''),
                payload: {
                    input: userMsg,
                    output: response,
                    settings: { duration, tone, platform, mode }
                }
            });
            
            await logToolActivity('script_writer', t.scriptWriter, 'generated_script', {
                input: userMsg,
                settings: { duration, tone, platform, hookType, seoFocus }
            }, lang === 'ar' ? `كتابة سيناريو عن: ${userMsg.substring(0, 30)}...` : `Generated script for: ${userMsg.substring(0, 30)}...`);
            
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: lang === 'ar' ? 'حدث خطأ في توليد السكربت.' : 'Error generating script.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([{
            role: 'model',
            text: lang === 'ar' ? 'تم تنظيف المسودة. أنا جاهز لموضوع جديد!' : 'Draft cleared. I am ready for a new topic!'
        }]);
        saveToStorage(StorageKeys.SCRIPTS_CHAT_HISTORY, []);
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
                <FileText size={14} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{t.scriptWriter}</span>
              </motion.div>
              <h2 className={`text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-sm ${isAr ? 'font-alex' : ''}`}>
                {t.scriptWriter}
              </h2>
              <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed font-normal">
                {isAr 
                  ? 'فك طلاسم الكتابة الفيروسية وصياغة سيناريوهات أفلام وفيديوهات عالية النقر والاحتفاظ الفيروسي بالجمهور.' 
                  : 'Break the blockages of video concepts with synthetic cinematic screenplay writing optimized for maximum audience retention.'}
              </p>
            </div>

            {/* Toggle Settings Button for Mobile */}
            <div className="lg:hidden flex justify-center">
              <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="px-6 py-3 bg-white/5 border border-white/10 hover:border-emerald-500/30 text-emerald-400 font-bold rounded-xl text-xs flex items-center gap-2 transition-all"
              >
                  <Settings2 size={14} /> {isAr ? 'إعدادات السكربت' : 'SCRIPT SETTINGS'}
              </button>
            </div>
          </div>

          <div className="flex-1 w-full flex flex-col lg:flex-row gap-6 px-2 md:px-0 min-h-0">
            
            {/* Sidebar Settings */}
            <div className={`lg:w-80 shrink-0 flex flex-col gap-4 ${showSettings ? 'flex' : 'hidden lg:flex'}`}>
                <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0a0c0b]/50 p-6 overflow-y-auto custom-scrollbar">
                    <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Settings2 size={14} /> {lang === 'ar' ? 'إعدادات السكربت' : 'SCRIPT SETTINGS'}
                    </h3>
                    
                    <div className="space-y-6">
                        {/* Duration */}
                        <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 block flex items-center gap-1">
                                <Clock size={12}/> {lang === 'ar' ? 'المدة' : 'Duration'}
                            </label>
                            <select 
                                value={duration} 
                                onChange={e => setDuration(e.target.value)} 
                                className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs font-bold text-gray-300 focus:outline-none focus:border-emerald-500 transition-all"
                            >
                                <option value="15s">{t.script_duration_15s}</option>
                                <option value="60s">{t.script_duration_60s}</option>
                                <option value="5m">{t.script_duration_5m}</option>
                                <option value="10m">{t.script_duration_10m}</option>
                            </select>
                        </div>

                        {/* Tone */}
                        <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 block flex items-center gap-1">
                                <Music size={12}/> {t.script_tone_label}
                            </label>
                            <select 
                                value={tone} 
                                onChange={e => setTone(e.target.value)} 
                                className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs font-bold text-gray-300 focus:outline-none focus:border-emerald-500 transition-all"
                            >
                                <option value="energetic">{t.script_tone_energetic}</option>
                                <option value="professional">{t.script_tone_professional_calm}</option>
                                <option value="storytelling">{t.script_tone_storytelling_emotional}</option>
                                <option value="educational">{t.script_tone_educational_clear}</option>
                            </select>
                        </div>

                        {/* Platform */}
                        <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 block flex items-center gap-1">
                                <Smartphone size={12}/> {t.script_platform || 'Platform'}
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {['youtube', 'tiktok', 'instagram', 'facebook'].map(p => (
                                    <button 
                                        key={p} 
                                        onClick={() => setPlatform(p)} 
                                        className={`py-2.5 rounded-xl text-[10px] font-bold border transition-all ${
                                            platform === p 
                                            ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                            : 'bg-black/30 border-white/5 text-slate-400 hover:border-emerald-500/30'
                                        }`}
                                    >
                                        {p === 'youtube' ? (lang === 'ar' ? 'يوتيوب' : 'YOUTUBE') : 
                                         p === 'tiktok' ? (lang === 'ar' ? 'تيك توك' : 'TIKTOK') : 
                                         p === 'instagram' ? (lang === 'ar' ? 'انستجرام' : 'INSTAGRAM') : 
                                         (lang === 'ar' ? 'فيسبوك' : 'FACEBOOK')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Hook Type */}
                        <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 block flex items-center gap-1">
                                <Zap size={12}/> {t.script_hook_label}
                            </label>
                            <select 
                                value={hookType} 
                                onChange={e => setHookType(e.target.value)} 
                                className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs font-bold text-gray-300 focus:outline-none focus:border-emerald-500 transition-all"
                            >
                                <option value="question">{t.script_hook_curiosity}</option>
                                <option value="shocking">{t.script_hook_shocking}</option>
                                <option value="result">{t.script_hook_result}</option>
                                <option value="story">{t.script_hook_story_media}</option>
                            </select>
                        </div>

                        {/* SEO Focus */}
                        <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 block flex items-center gap-1">
                                <Search size={12}/> {t.seo_focus}
                            </label>
                            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                                {['low', 'balanced', 'high'].map(s => (
                                    <button 
                                        key={s} 
                                        onClick={() => setSeoFocus(s)} 
                                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                                            seoFocus === s 
                                            ? 'bg-emerald-600 text-white shadow-md' 
                                            : 'text-slate-500 hover:text-white'
                                        }`}
                                    >
                                        {s === 'low' ? t.script_seo_low : s === 'balanced' ? t.script_seo_balanced : t.script_seo_high}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0a0c0b]/50 p-6">
                    <div className="flex items-center gap-3 text-emerald-400 mb-2">
                        <Brain size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t.script_neural_engine}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                        {lang === 'ar' 
                         ? 'يستخدم هذا النظام تقنيات علم النفس السلوكي لصياغة سكربتات تضمن أعلى معدلات الاحتفاظ بالمشاهدين.' 
                         : 'This system uses behavioral psychology techniques to craft scripts that ensure maximum viewer retention.'}
                    </p>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 shrink-0 px-2 md:px-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                            <FileText className="text-emerald-400 animate-pulse" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                                {t.scriptWriter} <span className="text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded-full uppercase font-black">V3 Neural</span>
                            </h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t.script_viral_2026}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setShowSettings(!showSettings)} 
                            className="lg:hidden p-2 rounded-xl bg-white/5 text-gray-400 border border-white/10 hover:bg-emerald-500/20 hover:text-emerald-400 transition-all"
                        >
                            <Settings2 size={20}/>
                        </button>
                        <button 
                            onClick={clearChat} 
                            className="p-2 rounded-xl bg-white/5 text-gray-400 border border-white/10 hover:bg-red-500/20 hover:text-red-400 transition-all"
                        >
                            <Trash2 size={20}/>
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div 
                    ref={scrollRef} 
                    className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#050a1a]/50 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 custom-scrollbar mb-4 shadow-inner mx-2 md:mx-0"
                >
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}>
                            <div className={`flex gap-3 max-w-[95%] md:max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-white/10 border-white/10 text-emerald-400'}`}>
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={`p-4 md:p-5 rounded-2xl text-sm leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-none'}`}>
                                    <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                                        {msg.text}
                                    </div>
                                    {msg.role === 'model' && i > 0 && (
                                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-end gap-2">
                                            <button 
                                                onClick={() => navigator.clipboard.writeText(msg.text)} 
                                                className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-emerald-400 transition-all"
                                                title="Copy Script"
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
                                    {lang === 'ar' ? 'جاري صياغة السكربت السينمائي...' : 'Drafting Cinematic Script...'}
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
                            placeholder={lang === 'ar' ? 'اكتب موضوع الفيديو أو اطلب تعديلاً على السكربت...' : 'Type video topic or ask for script edits...'}
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

export default ScriptWriter;
