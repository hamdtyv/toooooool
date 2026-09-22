
import React, { useState, useMemo, useEffect } from 'react';
import { useLang } from '../index';
import { motion } from 'motion/react';
import { 
    Clock, 
    Globe, 
    Zap, 
    Search, 
    Info, 
    LayoutGrid, 
    List, 
    ArrowRight,
    ArrowLeft,
    TrendingUp,
    Compass,
    CheckCircle,
    Layers,
    Coffee,
    Moon,
    Sun,
    Loader2,
    Sparkles,
    Brain,
    Bot,
    MessageCircle
} from 'lucide-react';
import { useJobs } from '../contexts/JobContext';
import { loadFromStorage, StorageKeys, saveToStorage } from '../services/storageService';
import { logToolActivity } from '../services/firebase';

const GlobalBestTimes: React.FC = () => {
  const { t, lang, resultLang } = useLang();
  const isAr = lang === 'ar';
  const { jobs, startJob } = useJobs();

  const [searchTerm, setSearchTerm] = useState('');
  
  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Restore State on Load
  useEffect(() => {
      const lastSearch = loadFromStorage<string>(StorageKeys.LAST_VIEWED_ATLAS);
      if (lastSearch) {
          setSearchTerm(lastSearch);
          // Immediately trigger AI analysis for the restored search term
          handleAiAnalyze(lastSearch);
      }
  }, []);

  // Sync with AI Job
  useEffect(() => {
      const job = jobs.atlas_audit;
      
      if (job.status === 'loading' && job.currentId === searchTerm) {
          setIsAiLoading(true);
      } else {
          setIsAiLoading(false);
      }

      if (job.status === 'success' && job.currentId === searchTerm) {
          if (job.result) {
              setAiAnalysis(job.result);
              logToolActivity('global_timing', t.globalTiming, 'analyzed_global_timing', {
                  region: searchTerm
              }, lang === 'ar' ? `تحليل أطلس التوقيت العالمي لـ: ${searchTerm.substring(0, 30)}...` : `Analyzed global timing for: ${searchTerm.substring(0, 30)}...`);
          } 
      }
  }, [jobs.atlas_audit.status, jobs.atlas_audit.currentId, searchTerm]);

  const handleAiAnalyze = async (query?: string) => {
      const currentSearch = query || searchTerm;
      if (!currentSearch) return;
      
      saveToStorage(StorageKeys.LAST_VIEWED_ATLAS, currentSearch);
      setAiAnalysis(null); // Clear previous results
      
      await startJob('atlas_audit', currentSearch, lang, resultLang);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleAiAnalyze();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto px-4 py-12 font-sans"
    >
      
      {/* Header Section */}
       <div className="mb-16 text-center md:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 mb-4"
            >
              <Clock size={14} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{t.globalTiming}</span>
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-sm">
               {isAr ? 'أطلس توقيت النشر العالمي' : 'Global Posting Atlas'}
            </h2>
            <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed">
               {isAr 
                 ? 'دليلك الشامل لضبط ساعة النشر حسب عادات وتقاليد كل شعب. اعرف متى يكون جمهورك مستعداً ذهنياً لمشاهدتك.' 
                 : 'Your comprehensive guide to sync posting hours with local habits. Know when your audience is mentally ready to engage.'}
            </p>
       </div>

        <>
            {/* Standardized Search & Actions Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto mb-16">
                <div className="relative group z-20">
                    {/* Input Container */}
                    <div className="relative flex flex-col md:flex-row items-center bg-[#050a08]/40 border border-white/10 rounded-2xl p-1.5 transition-all duration-300 focus-within:border-emerald-500/50 focus-within:bg-[#050a08]/60">
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={isAr ? 'ابحث عن دولة أو منطقة...' : 'Search for a country or region...'}
                            className={`w-full md:flex-1 bg-transparent border-none py-3 md:py-4 px-4 md:px-6 text-white text-base md:text-lg focus:outline-none placeholder-gray-600 font-medium ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                        />
                         <button 
                            type="submit" 
                            disabled={isAiLoading}
                            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold text-base transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 mt-2 md:mt-0 md:mx-2"
                        >
                            {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                            {isAiLoading ? '' : t.analyze}
                        </button>
                    </div>
                </div>
            </form>

            {/* AI STRATEGIC REPORT SECTION */}
            <div className="mb-12 animate-slide-in">
                {isAiLoading ? (
                    <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] border border-purple-500/20 flex flex-col items-center justify-center text-center animate-pulse">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 border border-purple-500/30">
                            <Brain size={32} className="text-purple-500 animate-spin-slow" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-white mb-2">{isAr ? 'المساعد الاستراتيجي يحلل الثقافة...' : 'Strategic Bot Analyzing Culture...'}</h3>
                        <p className="text-gray-500 text-xs md:text-sm max-w-md">{isAr ? 'يتم الآن فحص العادات اليومية للجمهور في هذه المنطقة...' : 'Scanning daily habits and cultural peaks in this region...'}</p>
                    </div>
                ) : aiAnalysis ? (
                    <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0a0c0b]/50 p-6 md:p-10">
                        {/* Abstract glow ornament */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none"></div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                            {/* Card 1: Golden Hour Score & Demographics */}
                            <div className="p-8 rounded-3xl border border-white/5 bg-[#0a0c0b]/50 hover:border-emerald-500/30 transition-all duration-300 flex flex-col h-full relative overflow-hidden group">
                                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    {isAr ? 'الساعة الذهبية للتثبيت' : 'Golden Posting Time'}
                                </div>
                                <h3 className="text-3xl font-black text-white mb-2">{aiAnalysis.region_name}</h3>
                                <div className="text-xs text-slate-500 font-mono mb-6">Zone: {aiAnalysis.time_zone}</div>
                                
                                <div className="mt-auto space-y-4">
                                    <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-center">
                                        <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">{isAr ? 'أفضل ساعة للنشر' : 'Best Hour'}</span>
                                        <div className="text-2xl font-black text-white mt-1">{aiAnalysis.golden_hour}</div>
                                    </div>
                                    {aiAnalysis.traffic_intensity && (
                                        <div className="flex items-center justify-between text-xs px-2 pt-2 border-t border-white/5">
                                            <span className="text-slate-500 font-bold uppercase">{isAr ? 'كثافة الزوار' : 'Traffic Level'}</span>
                                            <span className={`font-black ${aiAnalysis.traffic_intensity === 'High' ? 'text-red-400 bg-red-500/10' : 'text-emerald-400 bg-emerald-500/10'} px-2.5 py-1 rounded-md`}>
                                                {aiAnalysis.traffic_intensity}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card 2: Psychological Context */}
                            <div className="p-8 rounded-3xl border border-white/5 bg-[#0a0c0b]/50 hover:border-emerald-500/30 transition-all duration-300 flex flex-col h-full">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">{isAr ? 'سيكولوجية الجمهور في الدولة' : 'Cultural Psyche'}</div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <p className="text-slate-300 text-sm md:text-base leading-relaxed italic pr-2 border-r-2 border-emerald-500/20">
                                        "{aiAnalysis.psychological_context}"
                                    </p>
                                </div>
                            </div>

                            {/* Card 3: Content Recommendation & Pro Tip */}
                            <div className="p-8 rounded-3xl border border-white/5 bg-emerald-500/[0.03] hover:border-emerald-500/30 transition-all duration-300 flex flex-col h-full relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Zap size={12}/> {isAr ? 'صيغة الانتشار والوصول' : 'Growth Catalyst'}
                                </div>
                                
                                <div className="space-y-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="text-[10px] text-emerald-500/60 uppercase font-bold tracking-widest mb-2">{isAr ? 'نوع المحتوى المتفوق' : 'Preferred Format'}</div>
                                        <p className="text-white text-base font-bold leading-tight drop-shadow-sm">{aiAnalysis.best_content_type}</p>
                                    </div>
                                    
                                    <div className="p-4 bg-black/40 rounded-xl border border-white/5 backdrop-blur-sm">
                                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">{isAr ? 'التكتيك الذهبي' : 'Strategic Verdict'}</div>
                                        <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">"{aiAnalysis.strategic_tip}"</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 md:py-40 opacity-30">
                        <Globe size={48} className="md:size-64 mx-auto mb-4 text-gray-500" />
                        <p className="text-lg md:text-xl font-bold">{isAr ? 'أدخل اسم دولة أو منطقة لبدء التحليل' : 'Enter a country or region to begin'}</p>
                        <p className="text-xs mt-2 text-gray-600">{isAr ? 'سيقوم الذكاء الاصطناعي بتحليل الأنماط الثقافية لتقديم أفضل وقت للنشر.' : 'The AI will analyze cultural patterns to provide the best posting time.'}</p>
                    </div>
                )}
            </div>
        </>

      {/* Floating Strategy Section */}
      <div className="mt-20 glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-white/5 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-600/5 to-teal-600/5 pointer-events-none"></div>
           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                <div>
                    <h2 className={`text-2xl md:text-3xl font-black text-white mb-6 ${isAr ? 'font-alex' : ''}`}>
                        {isAr ? 'سر التوقيت الذهبي' : 'The Golden Timing Secret'}
                    </h2>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10"><Coffee size={20} className="md:size-24 text-yellow-400"/></div>
                            <div>
                                <h4 className="font-bold text-white text-sm md:text-base mb-1">{isAr ? 'وقت "الفصلان"' : 'The Disconnect Phase'}</h4>
                                <p className="text-gray-400 text-xs md:text-sm">{isAr ? 'أفضل وقت للنشر هو لما الناس تكون خلصت شغل أو مجهود وبدأت تدور على ترفيه.' : 'The best posting time is when people finish their tasks and seek entertainment.'}</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10"><TrendingUp size={20} className="md:size-24 text-emerald-400"/></div>
                            <div>
                                <h4 className="font-bold text-white text-sm md:text-base mb-1">{isAr ? 'قاعدة الـ 3 ساعات' : 'The 3-Hour Rule'}</h4>
                                <p className="text-gray-400 text-xs md:text-sm">{isAr ? 'انشر قبل وقت الذروة بـ 3 ساعات عشان الخوارزمية تبدأ تجمع بيانات وتحضر الفيديو للانفجار.' : 'Post 3 hours before peak time to let the algorithm prep your video for the explosion.'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-black/40 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 text-center">
                    <h3 className="text-4xl md:text-6xl font-black text-emerald-500 mb-2">100%</h3>
                    <p className="text-gray-300 text-sm md:text-base font-bold uppercase tracking-widest">{isAr ? 'تحليل دقيق' : 'Accuracy Level'}</p>
                    <div className="mt-6 md:mt-8 flex justify-center gap-4">
                         <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-emerald-500 animate-ping"></div>
                         <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-tighter">Monitoring global traffic signals</span>
                    </div>
                </div>
           </div>
      </div>
    </motion.div>
  );
};

export default GlobalBestTimes;
