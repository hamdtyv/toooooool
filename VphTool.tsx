
import React, { useState, useEffect } from 'react';
import { useLang } from '../index';
import { motion } from 'motion/react';
import { fetchVideoData } from '../services/youtubeService';
import { extractId, calculateVPH, formatNumber, parseISO8601Duration, formatDetailedDuration } from '../utils';
import { VideoData } from '../types';
import { VPH_TIPS_EXPANDED } from '../constants';
import { 
  TrendingUp, TrendingDown, Zap, Clock, Lightbulb, Rocket, Activity, Hourglass, Minus, BarChart3, Timer, AlertCircle, Brain, Target, ArrowRight, Loader2, Search, Sparkles, Gauge, ChevronDown, Shield
} from 'lucide-react';
import Tooltip from './Tooltip';
import { saveToStorage, loadFromStorage, StorageKeys } from '../services/storageService';
import { useJobs } from '../contexts/JobContext';
import { logToolActivity } from '../services/firebase';

const VphTool: React.FC = () => {
  const { t, lang, resultLang } = useLang();
  const { jobs, startJob } = useJobs();
  
  const [input, setInput] = useState('');
  const [data, setData] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [vph, setVph] = useState<number>(0);
  const [ageHours, setAgeHours] = useState<number>(0);
  
  // AI & Toggle States
  const [useAi, setUseAi] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [showSelfDev, setShowSelfDev] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 1. Restore State Logic
  useEffect(() => {
      const lastId = loadFromStorage<string>(StorageKeys.LAST_VIEWED_VPH);
      if (lastId) {
          setInput(lastId);
          const cachedData = loadFromStorage<VideoData>(StorageKeys.VPH(lastId));
          if (cachedData) {
              processData(cachedData);
              // Restore AI Result if exists
              const cachedResult = loadFromStorage<any>(`tv_vph_ai_${lastId}`); // Using temp key pattern or consistent logic
              // Note: JobContext usually handles result caching via `jobs` or we can use custom storage
              if (jobs.vph_analysis.result && jobs.vph_analysis.currentId === lastId) {
                  setAiAnalysis(jobs.vph_analysis.result);
                  setUseAi(true);
              }
          }
      }
  }, []);

  // 2. Sync with Background Job
  useEffect(() => {
      const job = jobs.vph_analysis;
      
      // Check consistency with current video
      if (data && job.currentId === data.id) {
          if (job.status === 'success' && job.result) {
              setAiAnalysis(job.result);
              setIsAiLoading(false);
              setUseAi(true);
          } else if (job.status === 'loading') {
              setIsAiLoading(true);
              setUseAi(true);
          }
      }
  }, [jobs.vph_analysis.status, jobs.vph_analysis.result, jobs.vph_analysis.currentId, data]);

  useEffect(() => {
    if (jobs.vph_analysis.status === 'loading') {
        const stepTimer = setInterval(() => {
            setLoadingStep(prev => (prev + 1) % 5);
        }, 2500);
        return () => clearInterval(stepTimer);
    } else {
        setLoadingStep(0);
    }
  }, [jobs.vph_analysis.status]);

  const handleAnalyze = async (e: React.FormEvent | null, overrideInput?: string) => {
    if (e) e.preventDefault();
    const val = overrideInput || input;
    if (!val) return;
    
    const { id } = extractId(val);
    saveToStorage(StorageKeys.LAST_VIEWED_VPH, id);
    
    setLoading(true);
    // Only reset if new search
    if (data?.id !== id) {
        setData(null);
        setAiAnalysis(null);
        setUseAi(false);
    }
    
    const res = await fetchVideoData(id);
    if (res) {
        saveToStorage(StorageKeys.VPH(id), res, 525600);
        processData(res);
        
        await logToolActivity('vph_tool', t.vphTool, 'calculated_vph', {
            videoId: res.id,
            title: res.snippet.title,
            views: res.statistics.viewCount
        }, lang === 'ar' ? `حساب سرعة المشاهدات لـ: ${res.snippet.title.substring(0, 30)}...` : `Calculated VPH velocity for: ${res.snippet.title.substring(0, 30)}...`);
        
        // Trigger AI if enabled
        if (useAi) {
            triggerAiJob(res);
        }
    }
    setLoading(false);
  };

  const processData = (res: VideoData) => {
      setData(res);
      const calculatedVph = calculateVPH(res.snippet.publishedAt, res.statistics.viewCount);
      setVph(calculatedVph);
      const now = new Date().getTime();
      const pub = new Date(res.snippet.publishedAt).getTime();
      setAgeHours((now - pub) / (1000 * 60 * 60));
  };

  const triggerAiJob = async (res: VideoData) => {
      setIsAiLoading(true);
      const v = calculateVPH(res.snippet.publishedAt, res.statistics.viewCount);
      const now = new Date().getTime();
      const pub = new Date(res.snippet.publishedAt).getTime();
      const age = (now - pub) / (1000 * 60 * 60);
      
      await startJob('vph_analysis', res.id, lang, resultLang, {
          title: res.snippet.title,
          vph: v,
          age: age
      });
  };

  const handleToggleAi = () => {
      const newState = !useAi;
      setUseAi(newState);
      
      if (newState && data && !aiAnalysis) {
          triggerAiJob(data);
      }
  };

  const getTrendInfo = () => {
      if (!data) return null;
      const durationSec = parseISO8601Duration(data.contentDetails.duration);
      const isShort = durationSec <= 60;
      const multiplier = isShort ? 5 : 1; 

      if (vph > (5000 * multiplier)) return { label: t.trend_viral, icon: Rocket, color: 'text-purple-400', border: 'border-purple-500', bg: 'bg-purple-500/10', tip: VPH_TIPS_EXPANDED.viral[lang] };
      if (vph > (500 * multiplier)) return { label: t.trend_rising, icon: TrendingUp, color: 'text-emerald-400', border: 'border-emerald-500', bg: 'bg-emerald-500/10', tip: VPH_TIPS_EXPANDED.rising[lang] };
      return { label: t.trend_stable, icon: Minus, color: 'text-blue-400', border: 'border-blue-500', bg: 'bg-blue-500/10', tip: VPH_TIPS_EXPANDED.stable[lang] };
  };

  const trend = getTrendInfo();

  const isAr = lang === 'ar';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto px-4 py-12 font-sans"
    >
      
      {/* Header */}
      <div className="mb-16 text-center md:text-left">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 mb-4"
        >
          <TrendingUp size={14} className="text-emerald-500" />
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{t.vphTool}</span>
        </motion.div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-sm">
           {isAr ? 'حساب سرعة انتشار الفيديو (VPH)' : 'Real-time Velocity (VPH)'}
        </h2>
        <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed">
           {isAr ? 'مقياس السرعة اللحظي للفيديو وحساب المشاهدات لكل ساعة للتنبؤ بفرص الصعود والانتشار العضوي.' : 'Predict viral opportunities with real-time video speed, calculating hourly views velocity dynamic analysis.'}
        </p>
      </div>

      {/* Standardized Search & AI Toggle */}
      <div className="max-w-3xl mx-auto mb-16">
        <form onSubmit={(e) => handleAnalyze(e)} className="relative group z-20">
            {/* Input Container */}
            <div className="relative flex flex-col md:flex-row items-center bg-[#050a08]/40 border border-white/10 rounded-2xl p-1.5 transition-all duration-300 focus-within:border-emerald-500/50 focus-within:bg-[#050a08]/60">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className={`w-full md:flex-1 bg-transparent border-none py-4 px-6 text-white text-base focus:outline-none placeholder-gray-600 font-medium ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                />
                
                <div className="hidden md:block px-3">
                    <Tooltip content={t.tooltip_vph} />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full md:w-auto bg-white text-black hover:bg-emerald-400 transition-all px-8 py-4 rounded-xl font-bold text-sm tracking-tight flex items-center justify-center gap-2 disabled:opacity-50 transition-colors duration-300"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                    {loading ? (lang === 'ar' ? 'جاري التحليل' : 'Analyzing') : t.analyze}
                </button>
            </div>

            {/* AI Toggle Switch (Below Search) */}
            <div className="flex items-center justify-between mt-4 px-2">
                <div />
                
                <label className="flex items-center gap-3 cursor-pointer group">
                    <span className={`text-[11px] font-bold tracking-tight transition-colors ${useAi ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {lang === 'ar' ? 'تحليل استراتيجي متقدم' : 'Advanced AI Audit'}
                    </span>
                    <div className="relative">
                        <input type="checkbox" className="sr-only" checked={useAi} onChange={handleToggleAi} />
                        <div className={`block w-10 h-6 rounded-full transition-colors duration-300 ${useAi ? 'bg-emerald-600' : 'bg-white/10'}`}></div>
                        <div className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-300 flex items-center justify-center shadow-sm ${useAi ? 'translate-x-4' : 'translate-x-0'}`}>
                            {useAi && <Sparkles size={10} className="text-emerald-600" />}
                        </div>
                    </div>
                </label>
            </div>
        </form>
      </div>

      {data && trend && (
        <div className="space-y-8 animate-slide-in px-4 md:px-0">
           {/* Video Info Card */}
           <div className="glass-panel p-4 md:p-6 rounded-3xl md:rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row gap-6 md:gap-8 items-center bg-gradient-to-br from-emerald-950/20 to-transparent">
              <div className="relative shrink-0 group w-full md:w-64">
                  <div className="absolute -inset-1 bg-emerald-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <img src={data.snippet.thumbnails.high?.url || data.snippet.thumbnails.medium.url} alt="Thumb" className="relative w-full rounded-2xl shadow-2xl aspect-video object-cover border border-white/10" />
                  <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-white border border-white/10">
                      {formatDetailedDuration(data.contentDetails.duration)}
                  </div>
              </div>
              <div className={`flex-1 text-center ${lang === 'ar' ? 'md:text-right' : 'md:text-left'}`}>
                 <h3 className="font-bold text-xl md:text-2xl text-white mb-4 leading-tight">{data.snippet.title}</h3>
                 <div className={`flex flex-wrap gap-3 md:gap-4 justify-center ${lang === 'ar' ? 'md:justify-end' : 'md:justify-start'}`}>
                    <div className="bg-white/5 px-4 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl border border-white/5 backdrop-blur-sm">
                        <div className="text-[8px] md:text-[10px] text-gray-500 uppercase font-black tracking-wider mb-1">{t.views}</div>
                        <div className="text-lg md:text-xl font-bold text-white">{formatNumber(data.statistics.viewCount)}</div>
                    </div>
                    <div className="bg-white/5 px-4 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl border border-white/5 backdrop-blur-sm">
                        <div className="text-[8px] md:text-[10px] text-gray-500 uppercase font-black tracking-wider mb-1">{t.ageLabel}</div>
                        <div className="text-lg md:text-xl font-bold text-white">{Math.floor(ageHours)} {lang === 'ar' ? 'ساعة' : 'Hrs'}</div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. VPH SPEEDOMETER */}
                <div className="glass-panel p-6 md:p-10 rounded-3xl md:rounded-[3rem] border border-white/5 text-center flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/5 pointer-events-none"></div>
                    
                    {/* Gauge Visual */}
                    <div className="relative w-48 h-24 md:w-64 md:h-32 mb-6 overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-full h-full bg-white/10 rounded-t-full"></div>
                        <div 
                            className="absolute bottom-0 left-0 w-full h-full bg-emerald-500 rounded-t-full origin-bottom transition-transform duration-1000 ease-out shadow-[0_0_50px_rgba(16,185,129,0.4)]"
                            style={{ 
                                transform: `rotate(${(Math.min(vph, 5000) / 5000) * 180 - 180}deg)`,
                                opacity: vph > 0 ? 1 : 0.3
                            }}
                        ></div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-20 md:w-56 md:h-28 bg-[#0a0a0a] rounded-t-full flex items-end justify-center pb-4">
                             <Gauge size={32} className="text-white/20 md:hidden" />
                             <Gauge size={48} className="text-white/20 hidden md:block" />
                        </div>
                    </div>

                    <div className="text-[8px] md:text-[10px] text-emerald-500 font-black uppercase tracking-[0.3em] mb-2">{t.currentVelocity}</div>
                    <div className="text-5xl md:text-8xl font-black text-white mb-2 tracking-tighter drop-shadow-2xl">{formatNumber(vph)}</div>
                    <div className="text-xs md:text-sm text-gray-400 font-bold uppercase tracking-widest">{t.vph}</div>
                </div>

                {/* 2. TREND & AI INSIGHTS */}
                <div className="flex flex-col gap-6">
                    
                    {/* Algorithmic Trend */}
                    <div className={`p-6 md:p-8 rounded-3xl md:rounded-[3rem] border ${trend.border} ${trend.bg} flex flex-col justify-center h-full transition-all`}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl bg-black/20 ${trend.color} shadow-lg`}>
                                <trend.icon size={24} className="md:hidden" />
                                <trend.icon size={32} className="hidden md:block" />
                            </div>
                            <div>
                                <div className="text-[8px] md:text-[10px] text-white/50 font-bold uppercase tracking-widest">{t.trendAnalysis}</div>
                                <h4 className={`text-xl md:text-2xl font-black ${trend.color}`}>{trend.label}</h4>
                            </div>
                        </div>
                        <p className="text-sm md:text-white/80 font-medium leading-relaxed border-l-2 border-white/20 pl-4">{trend.tip}</p>
                    </div>

                    {/* AI Deep Analysis */}
                    {useAi && (
                        <div className="glass-panel p-6 md:p-8 rounded-3xl md:rounded-[3rem] border border-purple-500/30 bg-[#0a0a0a] relative overflow-hidden flex-1">
                            {isAiLoading ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-2 border border-purple-500/30">
                                        <Brain size={32} className="text-purple-500 animate-spin-slow" />
                                    </div>
                                    <span className="text-[8px] md:text-[10px] text-gray-500 animate-pulse uppercase tracking-widest font-mono text-center">
                                        {lang === 'ar' ? [
                                            'قياس نبض الفيديو...',
                                            'مقارنة السرعة بالمجال...',
                                            'تحليل سيكولوجية الزخم...',
                                            'توقع الانفجار القادم...',
                                            'تشفير التقرير النهائي...'
                                        ][loadingStep] : [
                                            'Measuring Video Pulse...',
                                            'Comparing Velocity to Niche...',
                                            'Analyzing Momentum Psychology...',
                                            'Predicting Next Explosion...',
                                            'Encrypting Final Report...'
                                        ][loadingStep]}
                                    </span>
                                </div>
                            ) : aiAnalysis ? (
                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div className="absolute -top-4 -right-4 opacity-10"><Brain size={100} className="text-purple-500"/></div>
                                    
                                    {/* SELF DEVELOPMENT PROTOCOL */}
                                    {aiAnalysis.self_development && (
                                        <div className="overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/5 transition-all mb-4">
                                            <button 
                                                onClick={() => setShowSelfDev(!showSelfDev)}
                                                className="w-full flex items-center justify-between p-3 text-left hover:bg-emerald-500/10 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400">
                                                        <Shield size={14} />
                                                    </div>
                                                    <span className="text-[8px] md:text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                                        {lang === 'ar' ? 'بروتوكول التطوير' : 'DEVELOPMENT PROTOCOL'}
                                                    </span>
                                                </div>
                                                <ChevronDown size={16} className={`text-emerald-500 transition-transform duration-300 ${showSelfDev ? 'rotate-180' : ''}`} />
                                            </button>
                                            {showSelfDev && (
                                                <div className="p-4 pt-0 text-gray-300 text-[10px] md:text-[11px] leading-relaxed border-t border-emerald-500/10 animate-slide-in italic bg-black/40">
                                                    {aiAnalysis.self_development}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <div className="text-[8px] md:text-[10px] font-bold text-purple-400 uppercase flex items-center gap-2 mb-2 tracking-widest">
                                            <Brain size={14}/> {lang === 'ar' ? 'حكم الجمهور' : 'Audience Verdict'}
                                        </div>
                                        <p className="text-white text-base md:text-lg font-bold leading-tight">"{aiAnalysis.audience_verdict}"</p>
                                    </div>
                                    
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div className="text-[8px] md:text-[10px] font-bold text-green-400 uppercase flex items-center gap-2 mb-2 tracking-widest">
                                            <Target size={14}/> {lang === 'ar' ? 'الخطوة القادمة' : 'Action Step'}
                                        </div>
                                        <p className="text-gray-300 text-xs md:text-sm leading-relaxed flex gap-2">
                                            <ArrowRight size={16} className={`shrink-0 mt-0.5 text-green-500 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                                            {aiAnalysis.action_step}
                                        </p>
                                    </div>
                                    {aiAnalysis.viral_potential_score && (
                                        <div className="mt-4 flex items-center justify-between px-2">
                                            <div className="text-[8px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">{lang === 'ar' ? 'احتمالية الانفجار' : 'Viral Potential'}</div>
                                            <div className={`text-xs md:text-sm font-black ${aiAnalysis.viral_potential_score > 70 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                                {aiAnalysis.viral_potential_score}%
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
           </div>
        </div>
      )}
    </motion.div>
  );
};

export default VphTool;
