
import React, { useState, useEffect } from 'react';
import { useLang } from '../index';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { saveToStorage, loadFromStorage, StorageKeys } from '../services/storageService';
import { useAppState } from '../contexts/AppStateContext';
import { 
  Activity, BarChart2, Search, Zap, 
  Users, TrendingUp, Lightbulb, Swords, 
  Gem, CheckCircle, DollarSign, Image as ImageIcon, Feather, Timer, Compass, Brain,
  Pin, Sparkles, Terminal, CheckCircle2
} from 'lucide-react';

const ALL_TOOLS = [
  { to: "/live", icon: Activity, title: 'liveCounter', descAr: "نمو القناة والتفاعل بالثانية والدقيقة.", descEn: "Precise sub-by-minute growth trajectory monitoring." },
  { to: "/atlas", icon: Compass, title: 'globalTiming', descAr: "خوارزمية رصد تدفق المشاهدين حول العالم.", descEn: "Global audience flow & resonance heat mapping." },
  { to: "/video", icon: Zap, title: 'videoAnalytics', descAr: "تحليل جيني للفيديو واكتشاف نقاط الضعف.", descEn: "Deep forensic analysis of content DNA performance." },
  { to: "/timing", icon: Timer, title: 'videoTiming', descAr: "محاكاة وقت النشر لاقتناص ذروة المشاهدة.", descEn: "Peak-efficiency publication timing simulator." },
  { to: "/seo", icon: Search, title: 'seoTools', descAr: "محرك زحف وتوليد كلمات مفتاحية ذكي.", descEn: "Smart crawler for meta-data optimization." },
  { to: "/ideas", icon: Lightbulb, title: 'ideaGenerator', descAr: "خوارزمية توليد مفاهيم المحتوى الفيرال.", descEn: "Viral concept generation algorithms." },
  { to: "/script-writer", icon: Feather, title: 'scriptWriter', descAr: "تحويل الأفكار إلى نصوص سينمائية بذكاء.", descEn: "Convert abstract data into cinematic scripts." },
  { to: "/planner", icon: CheckCircle, title: 'planner', descAr: "مهندس النشر التكتيكي للأسبوع القادم.", descEn: "Tactical publishing roadmap architect." },
  { to: "/images", icon: ImageIcon, title: 'imageGenerator', descAr: "توليد فن بصري يحفز نسبة النقر بالذكاء.", descEn: "Generate high-CTR synthetic visual assets." },
  { to: "/vph", icon: TrendingUp, title: 'vphTool', descAr: "توقعات سرعة الانتشار الفيرالي للفيديو.", descEn: "Predictive velocity & surge modeling." },
  { to: "/outliers", icon: Gem, title: 'outliers', descAr: "استخلاص أنماط النجاح من فيديوهات الشاذة.", descEn: "Extract success patterns from statistical anomalies." },
  { to: "/earnings", icon: DollarSign, title: 'earningsLab', descAr: "محرك العائد المادي واستراتيجيات الاستثمار.", descEn: "ROI architect & monetization strategy engine." },
  { to: "/channel", icon: BarChart2, title: 'channelAnalytics', descAr: "تقرير القيادة الشامل لنمو منصتك.", descEn: "Grand-scale macroeconomic channel reporting." },
  { to: "/audience-dna", icon: Users, title: 'audienceDeepDive', descAr: "فك شفرة سلوك واهتمامات المشاهدين.", descEn: "Decoding behavioral patterns of your viewing base." },
  { to: "/competitor", icon: Swords, title: 'competitorAnalysis', descAr: "فحص وتحليل نقاط قوة جيرانك في المجال.", descEn: "Intelligence gathering on neighboring entities." }
];

const Dashboard: React.FC = () => {
  const { t, lang } = useLang();
  const isAr = lang === 'ar';
  
  const { isDragonTheme } = useAppState();
  
  const [pinnedPaths, setPinnedPaths] = useState<string[]>(() => loadFromStorage<string[]>(StorageKeys.PINNED_TOOLS) || []);

  const togglePin = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newPins = pinnedPaths.includes(path) 
      ? pinnedPaths.filter(p => p !== path) 
      : [...pinnedPaths, path];
    setPinnedPaths(newPins);
    saveToStorage(StorageKeys.PINNED_TOOLS, newPins);
  };

  const FeatureCard = ({ icon: Icon, titleKey, desc, to }: any) => {
    const isPinned = pinnedPaths.includes(to);
    
    return (
      <div className="h-full flex flex-col transform-gpu">
        <Link to={to} className="group relative overflow-hidden h-full flex flex-col p-5 sm:p-7 rounded-[2rem] border border-white/5 transition-all duration-200 bg-[#0c0e0d] hover:bg-[#111413] hover:border-emerald-500/30 shadow-xl">
          {/* Static decoration instead of animated/heavy blur */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 rounded-xl bg-[#141816] flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-200 shadow-md border border-white/5 shrink-0">
                <Icon size={20} strokeWidth={1.5} />
              </div>
              <button 
                onClick={(e) => togglePin(e, to)}
                className={`p-2 rounded-lg border transition-all duration-200 ${isPinned ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/[0.03] border-white/5 text-white/20 hover:text-white hover:bg-white/10'}`}
              >
                <Pin size={12} fill={isPinned ? "currentColor" : "none"} />
              </button>
            </div>
            
            <h3 className={`text-base sm:text-lg font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors leading-tight ${isAr ? 'font-alex' : 'font-space'}`}>
              {t[titleKey] || titleKey}
            </h3>
            
            <p className={`text-slate-500 text-[11px] sm:text-xs leading-relaxed mb-4 flex-1 ${isAr ? 'font-almarai' : 'font-outfit'}`}>
              {desc}
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                <span className="text-[8px] font-space font-bold text-emerald-400 uppercase tracking-widest leading-none">
                  {isAr ? 'بدء' : 'INIT'}
                </span>
              </div>
              <TrendingUp size={10} className="text-emerald-500/20 group-hover:text-emerald-400" />
            </div>
          </div>
        </Link>
      </div>
    );
  };

  const BentoZone = ({ title, icon: Icon, subtitle, children, index }: any) => (
    <section className="mb-20 md:mb-32 lg:mb-40 px-1 md:px-0">
      <div className="mb-6 md:mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-1 md:px-4">
        <div className="max-w-3xl space-y-2 md:space-y-3">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-xl md:rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Icon size={20} className="md:w-6 md:h-6" strokeWidth={1.5} />
            </div>
            <h2 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white uppercase italic leading-tight ${isAr ? 'font-alex' : 'font-space'}`}>{title}</h2>
          </div>
          <p className="text-slate-500 text-[11px] sm:text-xs md:text-sm lg:text-base font-light leading-relaxed max-w-xl">{subtitle}</p>
        </div>
        <div className="hidden lg:flex items-center gap-3 text-[9px] font-space font-black text-emerald-500/10 tracking-[0.4em]">
          <span className="w-8 h-[1px] bg-emerald-500/5"></span>
          SEG_{index < 0 ? 'FAV' : `0${index + 1}`}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8 px-1 md:px-2 auto-rows-fr">
        {children}
      </div>
    </section>
  );

  const pinnedTools = ALL_TOOLS
    .filter(tool => pinnedPaths.includes(tool.to))
    .map(tool => ({
        ...tool,
        titleKey: tool.title,
        desc: isAr ? tool.descAr : tool.descEn
    }));

  const getToolsInRange = (start: number, end: number) => 
    ALL_TOOLS.slice(start, end).map(tool => ({
        ...tool,
        titleKey: tool.title,
        desc: isAr ? tool.descAr : tool.descEn
    }));

  return (
    <div className="max-w-[1550px] mx-auto pb-12 md:pb-24 overflow-visible w-full">
      <div className="mb-16 md:mb-24 lg:mb-32 text-center space-y-6 md:space-y-10 pt-16 md:pt-24 lg:pt-28 px-4 relative z-10">
        <div className="absolute inset-x-0 -top-20 pointer-events-none flex justify-center overflow-visible">
          <div className="w-full max-w-[800px] h-[300px] md:h-[600px] bg-emerald-500/10 blur-[60px] md:blur-[120px] rounded-full opacity-30 md:opacity-40"></div>
        </div>

        {/* Brand Hero Design Element */}
        <div className="flex flex-col items-center justify-center gap-6 relative z-10">
          <div className="text-center space-y-3">
            <div className={`p-1 rounded-full border mb-2 inline-block px-4 py-1 ${
              isDragonTheme ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-blue-500/10 border-blue-500/20'
            }`}>
                <span className={`text-[8px] md:text-[9px] font-space font-bold tracking-[0.40em] uppercase ${
                  isDragonTheme ? 'text-emerald-400' : 'text-blue-400'
                }`}>Advanced Intelligence v3.9.7</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-none font-space uppercase italic tracking-tighter">
              <span className="brand-shimmer py-2 pr-4 md:pr-8">{isAr ? 'مُثقّف' : 'MUTHAQAF'}</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-400 font-light max-w-xl mx-auto leading-relaxed">
              {isAr 
                ? 'نظام التحليلات الفيرالية المتكامل لقنوات يوتيوب وصياغة استراتيجيات الانتشار الكمي بالذكاء الاصطناعي.' 
                : 'Advanced video forensics & viral intelligence framework for modern cinematic YouTube publishers.'}
            </p>
          </div>


          <div className="w-full max-w-4xl mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
            {[
              { label: isAr ? "المقاطع المحللة بالشبكة" : "Network Scanned Modules", value: "84.2K", trend: "+12%" },
              { label: isAr ? "قوة الاتجاه العام (VPH)" : "Global VPH Velocity", value: "9.8x", trend: "+4.1" },
              { label: isAr ? "تردد الكلمات المفتاحية" : "Keyword Synapse Rate", value: "240Hz", trend: "Active" },
              { label: isAr ? "استقرار الخوارزمية" : "Algorithm Matrix Stability", value: "99.8%", trend: "Stable" },
            ].map((metric, i) => (
              <div key={i} className="glass-panel p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center text-center group hover:bg-white/[0.04] transition-colors shadow-lg">
                <span className="text-[10px] text-slate-500 font-mono mb-1">{metric.label}</span>
                <span className={`text-xl md:text-2xl font-black font-space transition-colors ${
                    isDragonTheme 
                        ? 'text-emerald-400 group-hover:text-emerald-300 drop-shadow-[0_0_5px_rgba(16,185,129,0.2)]' 
                        : 'text-blue-400 group-hover:text-blue-300 drop-shadow-[0_0_5px_rgba(59,130,246,0.2)]'
                }`}>
                    {metric.value}
                </span>
                <span className={`text-[9px] font-bold mt-1 ${isDragonTheme ? 'text-emerald-500/50' : 'text-blue-500/50'}`}>{metric.trend}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-20 md:space-y-32 lg:space-y-40">
        {/* Pinned Intelligence */}
        {pinnedTools.length > 0 && (
          <div key="pinned-intel">
            <BentoZone 
              index={-1}
              title={isAr ? "المهام المثبتة" : "Pinned Intel"} 
              icon={Pin}
              subtitle={isAr ? "اختصارات مخصصة لبروتوكولاتك الأكثر استخداماً." : "Customized shortcuts to your most utilized protocols."}
            >
              {pinnedTools.map((f, i) => <FeatureCard key={f.to} {...f} />)}
            </BentoZone>
          </div>
        )}

        {/* Zone 1: Intelligence Core */}
        <BentoZone 
          index={0}
          title={isAr ? "مركز التحليلات" : "Intelligence Core"} 
          icon={BarChart2}
          subtitle={isAr ? "رصد وتحليل البيانات الضخمة لمنصتك بدقة جراحية." : "High-fidelity monitoring and big data analysis with tactical precision."}
        >
          {getToolsInRange(0, 4).map((f) => <FeatureCard key={f.to} {...f} />)}
        </BentoZone>

        {/* Zone 2: Content Lab */}
        <BentoZone 
          index={1}
          title={isAr ? "مختبر الإنشاء" : "Content Synthesis"} 
          icon={Zap}
          subtitle={isAr ? "توليد محتوى فيرال باستخدام نماذج الذكاء الاصطناعي الأكثر تطوراً." : "Forge viral masterpieces using state-of-the-art AI synthesis models."}
        >
          {getToolsInRange(4, 12).map((f) => <FeatureCard key={f.to} {...f} />)}
        </BentoZone>

        {/* Zone 3: Strategic Ops */}
        <BentoZone 
          index={2}
          title={isAr ? "العمليات الاستراتيجية" : "Strategic Ops"} 
          icon={Brain}
          subtitle={isAr ? "تحليل الحمض النووي للجمهور ورصد تحركات المنافسين." : "Audience DNA sequencing & competitive theater monitoring."}
        >
          {getToolsInRange(12, 15).map((f) => <FeatureCard key={f.to} {...f} />)}
        </BentoZone>
      </div>

      {/* Hero Footnote - Improved visibility and performance */}
      <div className="mt-40 md:mt-56 lg:mt-64 text-center px-4 mb-20 relative z-20">
          <div className="inline-block p-10 md:p-20 lg:p-24 glass-panel border-white/5 relative group max-w-5xl mx-auto w-full shadow-2xl">
              {/* Floating Badge - Removed overflow-hidden from parent to fix clipping */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 md:w-20 md:h-20 bg-emerald-500 rounded-2xl md:rounded-3xl flex items-center justify-center text-black shadow-[0_0_50px_rgba(0,255,157,0.4)] rotate-45 group-hover:rotate-[225deg] transition-all duration-1000 z-50">
                <Gem size={28} className="md:w-8 md:h-8 -rotate-45 group-hover:-rotate-[225deg] transition-all duration-1000" />
              </div>
              
              <div className="absolute inset-0 bg-emerald-500/[0.02] pointer-events-none rounded-[2rem]"></div>
              
              <h2 className={`text-sm sm:text-lg md:text-2xl lg:text-3xl font-black text-emerald-400 mb-6 md:mb-8 italic leading-relaxed relative z-10 ${isAr ? 'font-alex' : 'font-space'}`}>
                {isAr ? '"قناتك هي حكايتك.. نحن هنا لنكتب فصول نجاحها بالأرقام والذكاء."' : '"Your channel is your story. We write its success with data and intelligence."'}
              </h2>
              <div className="flex items-center justify-center gap-4 md:gap-6 relative z-10">
                <div className="h-[1px] w-8 md:w-16 bg-emerald-500/20"></div>
                <p className="text-white/30 font-space tracking-[0.2em] md:tracking-[0.5em] font-bold text-[7px] md:text-[10px] uppercase leading-none">PROTOCOL_V3.9 // TERMINAL_STABLE</p>
                <div className="h-[1px] w-8 md:w-16 bg-emerald-500/20"></div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
