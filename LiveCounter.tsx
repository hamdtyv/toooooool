
import React, { useState, useEffect, useRef } from 'react';
import { useLang } from '../index';
import { motion } from 'motion/react';
import { fetchChannelData } from '../services/youtubeService';
import { extractId, formatNumber } from '../utils';
import { Search, Loader2, Activity, TrendingUp, Zap, Sparkles, Brain, Target, BarChart2, Radio, Video, Clock, Eye } from 'lucide-react';
import { ChannelData } from '../types';
import Tooltip from './Tooltip';
import { saveToStorage, loadFromStorage, StorageKeys } from '../services/storageService';
import { useLocation } from 'react-router-dom';
import { useJobs } from '../contexts/JobContext';
import { logToolActivity } from '../services/firebase';

const LiveCounter: React.FC = () => {
  const { t, lang, resultLang } = useLang();
  const location = useLocation();
  const { jobs, startJob } = useJobs();
  
  const [input, setInput] = useState('');
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Real-time metrics
  const [sessionStartSubs, setSessionStartSubs] = useState<number>(0);
  const [gained, setGained] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // AI States
  const [useAi, setUseAi] = useState(false);
  const [aiForecast, setAiForecast] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Live Milestone Altering Alert System
  const [milestones, setMilestones] = useState<number[]>([]);
  const [customMilestoneInput, setCustomMilestoneInput] = useState('');
  const [notifiedMilestones, setNotifiedMilestones] = useState<number[]>([]);
  const [activeAlert, setActiveAlert] = useState<{ milestone: number; channelTitle: string } | null>(null);

  const milestonesRef = useRef<number[]>([]);
  const notifiedRef = useRef<number[]>([]);

  useEffect(() => {
    milestonesRef.current = milestones;
  }, [milestones]);

  useEffect(() => {
    notifiedRef.current = notifiedMilestones;
  }, [notifiedMilestones]);

  const handleAddMilestone = (val: number) => {
    if (!channelData || isNaN(val) || val <= 0) return;
    const key = `tv_milestones_${channelData.id}`;
    const updated = [...milestones, val].sort((a, b) => a - b);
    setMilestones(updated);
    saveToStorage(key, updated);
  };

  const handleRemoveMilestone = (val: number) => {
    if (!channelData) return;
    const key = `tv_milestones_${channelData.id}`;
    const updated = milestones.filter(m => m !== val);
    setMilestones(updated);
    saveToStorage(key, updated);
  };

  // Restore logic
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    
    if (q) {
        setInput(q);
        const { id } = extractId(q);
        if(id) loadDataAndStartMonitoring(id);
    } 
    else {
        const lastId = loadFromStorage<string>(StorageKeys.LAST_VIEWED_LIVE);
        if (lastId) {
            setInput(lastId);
            loadDataAndStartMonitoring(lastId);
        }
    }
    
    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [location.search]);

  // Sync with AI Job (Background Processing)
  useEffect(() => {
      const job = jobs.live_audit;
      
      // If data is loaded and job ID matches, sync state
      if (channelData && job.currentId === channelData.id) {
          if (job.status === 'success' && job.result) {
              setAiForecast(job.result);
              setIsAiLoading(false);
              setUseAi(true); // Ensure UI reflects active state
          }
          if (job.status === 'loading') {
              setIsAiLoading(true);
              setUseAi(true);
          }
      }
  }, [jobs.live_audit.status, jobs.live_audit.currentId, channelData]);

  const loadDataAndStartMonitoring = async (id: string) => {
      setGained(0);
      setSessionStartSubs(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setLoading(true);
      
      const data = await fetchChannelData(id);
      if (data) {
          setChannelData(data);
          const startSubs = parseInt(data.statistics.subscriberCount);
          setSessionStartSubs(startSubs);
          
          await logToolActivity('live_counter', t.liveCounter, 'monitored_live_subs', {
              channelId: data.id,
              title: data.snippet.title,
              subs: data.statistics.subscriberCount
          }, lang === 'ar' ? `مراقبة المشتركين لقناة: ${data.snippet.title}` : `Monitoring live subscribers for: ${data.snippet.title}`);

          // Restore AI state if exists in storage
          const cachedAi = loadFromStorage<any>(StorageKeys.LIVE_AI(data.id));
          if (cachedAi) {
              setAiForecast(cachedAi);
              setUseAi(true);
          }

          // Load Milestones
          const savedMilestones = loadFromStorage<number[]>(`tv_milestones_${data.id}`) || [];
          setMilestones(savedMilestones);
          setNotifiedMilestones([]);

          // Start Polling (Every 2 seconds to be safe but feel live)
          intervalRef.current = setInterval(async () => {
             const newData = await fetchChannelData(data.id);
             if (newData) {
                 const newSubs = parseInt(newData.statistics.subscriberCount);
                 setChannelData(newData);
                 
                 // Update Metrics
                 const diff = newSubs - startSubs;
                 setGained(diff);

                 // Check milestones list
                 const currentMilestones = milestonesRef.current;
                 const currentNotified = notifiedRef.current;
                 currentMilestones.forEach(ms => {
                     if (newSubs >= ms && !currentNotified.includes(ms)) {
                         setActiveAlert({ milestone: ms, channelTitle: newData.snippet.title });
                         setNotifiedMilestones(prev => {
                             if (prev.includes(ms)) return prev;
                             return [...prev, ms];
                         });
                     }
                 });
             }
          }, 2000);
      }
      setLoading(false);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;
    
    const { id } = extractId(input);
    const targetId = id || input;
    
    saveToStorage(StorageKeys.LAST_VIEWED_LIVE, targetId);
    setAiForecast(null);
    setGained(0);
    setSessionStartSubs(0);
    if (intervalRef.current) clearInterval(intervalRef.current);

    // 1. Load Data
    setLoading(true);
    const data = await fetchChannelData(targetId);
    if(data) {
        const startSubs = parseInt(data.statistics.subscriberCount);
        setChannelData(data);
        setSessionStartSubs(startSubs);

        await logToolActivity('live_counter', t.liveCounter, 'monitored_live_subs', {
            channelId: data.id,
            title: data.snippet.title,
            subs: data.statistics.subscriberCount
        }, lang === 'ar' ? `مراقبة المشتركين لقناة: ${data.snippet.title}` : `Monitoring live subscribers for: ${data.snippet.title}`);

        // 2. Trigger AI automatically if enabled
        if (useAi) {
            triggerAiJob(data, 0); // Initial velocity is 0
        }

        // Load Milestones
        const savedMilestones = loadFromStorage<number[]>(`tv_milestones_${data.id}`) || [];
        setMilestones(savedMilestones);
        setNotifiedMilestones([]);

        // 3. Start Monitoring
        intervalRef.current = setInterval(async () => {
             try {
                const newData = await fetchChannelData(data.id);
                if (newData) {
                    const currentSubs = parseInt(channelData?.statistics.subscriberCount || '0');
                    const newSubs = parseInt(newData.statistics.subscriberCount);

                    if (newSubs !== currentSubs) {
                        setChannelData(newData);
                    }

                    const diff = newSubs - startSubs;
                    setGained(diff);

                    // Check milestones list
                    const currentMilestones = milestonesRef.current;
                    const currentNotified = notifiedRef.current;
                    currentMilestones.forEach(ms => {
                        if (newSubs >= ms && !currentNotified.includes(ms)) {
                            setActiveAlert({ milestone: ms, channelTitle: newData.snippet.title });
                            setNotifiedMilestones(prev => {
                                if (prev.includes(ms)) return prev;
                                return [...prev, ms];
                            });
                        }
                    });
                }
             } catch (error) {
                console.error("Error polling channel data:", error);
             }
        }, 2000);
    }
    setLoading(false);
  };

  const triggerAiJob = async (cData: ChannelData, velocity: number) => {
      setIsAiLoading(true);
      // Determine velocity if not provided (fallback to a small positive number to get interesting AI results)
      const effectiveVelocity = velocity > 0 ? velocity : 0.5;
      
      await startJob('live_audit', cData.id, lang, resultLang, {
          channelTitle: cData.snippet.title,
          currentSubs: cData.statistics.subscriberCount,
          velocity: effectiveVelocity
      });
  };

  const handleToggleAi = () => {
      const newState = !useAi;
      setUseAi(newState);
      
      // If toggling ON and we already have data, run the job immediately
      if (newState && channelData) {
          const currentVelocity = gained > 0 ? (gained / (Math.max(1, (Date.now() - lastUpdate) / 60000))) : 0;
          triggerAiJob(channelData, currentVelocity);
      }
  };

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
          <Activity size={14} className="text-emerald-500" />
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{t.liveCounter}</span>
        </motion.div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-sm">
           {isAr ? 'عداد المشتركين اللحظي والتحليل' : 'Live Real-time Subscriber Hub'}
        </h2>
        <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed font-normal">
           {isAr ? 'اتصال مباشر مشفر مع خوادم يوتيوب لمراقبة نمو قناتك بالثانية مع تحليل ذكي لسرعة التدفق والتنبؤ بحجم الجمهور.' : 'Direct encrypted connection to monitor live metrics, calculating subscriber growth speed and predictive analytics.'}
        </p>
      </div>

      {/* Standardized Input Section */}
      <div className="max-w-3xl mx-auto mb-20">
        <form onSubmit={handleAnalyze} className="relative z-20">
            {/* Input Container */}
            <div className="relative flex flex-col md:flex-row items-center bg-[#050a08]/40 border border-white/10 rounded-2xl p-1.5 transition-all duration-300 focus-within:border-emerald-500/50 focus-within:bg-[#050a08]/60">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className={`w-full md:flex-1 bg-transparent border-none py-4 px-6 text-white text-base focus:outline-none placeholder-gray-600 font-medium ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                />
                
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

      {channelData && (
        <div className="space-y-8 animate-slide-in">
            
            {/* MAIN HUD DISPLAY */}
            <div className="relative glass-panel p-6 md:p-10 rounded-3xl md:rounded-[3rem] border border-white/10 overflow-hidden bg-black/60 shadow-[0_0_100px_rgba(16,185,129,0.1)] mx-4 md:mx-0">
                {/* Background Grid Effect */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-600 to-transparent opacity-50 animate-pulse"></div>

                <div className="relative z-10 flex flex-col items-center">
                    
                    {/* Channel Identity */}
                    <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                        <img src={channelData.snippet.thumbnails.medium.url} className="w-16 h-16 rounded-full border-2 border-emerald-600 shadow-[0_0_20px_#10b981]" alt="Avatar"/>
                        <div className="text-center md:text-start">
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">{channelData.snippet.title}</h1>
                            <div className="flex items-center gap-2 justify-center md:justify-start text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Live Connection Active
                            </div>
                        </div>
                    </div>

                    {/* THE BIG COUNTER */}
                    <div className="mb-10 text-center">
                        <div className="text-[10px] md:text-[12px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-4">{t.subscribers}</div>
                        <div className="text-4xl sm:text-6xl md:text-8xl lg:text-[10rem] font-black text-white leading-none tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] font-mono transition-all duration-300">
                            {parseInt(channelData.statistics.subscriberCount).toLocaleString('en-US')}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl">
                        <div className="bg-white/5 p-4 md:p-6 rounded-2xl border border-white/5 text-center">
                            <div className="text-[10px] md:text-xs text-gray-500 font-bold uppercase mb-2 flex items-center justify-center gap-2"><Eye size={14} /> Total Views</div>
                            <div className="text-xl md:text-2xl font-bold text-white font-mono">{parseInt(channelData.statistics.viewCount).toLocaleString('en-US')}</div>
                        </div>
                        <div className="bg-white/5 p-4 md:p-6 rounded-2xl border border-white/5 text-center">
                            <div className="text-[10px] md:text-xs text-gray-500 font-bold uppercase mb-2 flex items-center justify-center gap-2"><TrendingUp size={14} className="text-green-500" /> Session Gained</div>
                            <div className={`text-xl md:text-2xl font-bold font-mono ${gained >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {gained > 0 ? '+' : ''}{gained}
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 md:p-6 rounded-2xl border border-white/5 text-center">
                            <div className="text-[10px] md:text-xs text-gray-500 font-bold uppercase mb-2 flex items-center justify-center gap-2"><Video size={14} /> Video Count</div>
                            <div className="text-xl md:text-2xl font-bold text-white font-mono">{parseInt(channelData.statistics.videoCount).toLocaleString('en-US')}</div>
                        </div>
                    </div>

                    {/* Milestone Alerts Sub-Panel */}
                    <div className="mt-8 pt-8 border-t border-white/5 w-full max-w-4xl">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Target size={16} className="text-amber-400" />
                                    {isAr ? 'منبهات أهداف المشتركين الذكية' : 'Smart Subscriber Milestone Alerts'}
                                </h3>
                                <p className="text-[11px] text-slate-550 mt-1">
                                    {isAr ? 'تتبع فوري لمعدل النمو اللحظي، ستحصل على تنبيه احتفالي بمجرد وصول القناة للمستهدف.' : 'Real-time velocity tracking. Triggers instant celebratory blast on-screen when milestone hits.'}
                                </p>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const val = parseInt(customMilestoneInput);
                                if (val > 0) {
                                    handleAddMilestone(val);
                                    setCustomMilestoneInput('');
                                }
                            }} className="flex items-center gap-2">
                                <input 
                                    type="number"
                                    value={customMilestoneInput}
                                    onChange={(e) => setCustomMilestoneInput(e.target.value)}
                                    placeholder={isAr ? "مثال: 100000" : "e.g. 500000"}
                                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 w-32"
                                />
                                <button
                                    type="submit"
                                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs px-3 py-1.5 rounded-xl transition-all"
                                >
                                    {isAr ? 'إضافة منبه' : 'Add Milestone'}
                                </button>
                            </form>
                        </div>

                        {milestones.length === 0 ? (
                            <div className="text-center py-4 bg-white/[0.02] border border-dashed border-white/5 rounded-2xl">
                                <span className="text-xs text-slate-600">{isAr ? 'لا توجد أهداف نشطة بعد. أضف هدفك الأول أعلاه لقناتك!' : 'No active milestones set for this channel. Add your first goal above!'}</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {milestones.map((ms) => {
                                    const currentSubs = parseInt(channelData.statistics.subscriberCount);
                                    const progressPercent = Math.min(100, Math.round((currentSubs / ms) * 100));
                                    const isReached = currentSubs >= ms;

                                    return (
                                        <div key={ms} className={`relative p-3 rounded-2xl border transition-all ${
                                            isReached 
                                                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                                                : 'bg-white/[0.02] border-white/5 text-slate-400'
                                        }`}>
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="text-[10px] font-mono font-bold tracking-tight text-emerald-400">
                                                    {isReached 
                                                        ? (isAr ? '✓ مكتمل الهدف' : '✓ Reached!') 
                                                        : `${progressPercent}%`
                                                    }
                                                </span>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleRemoveMilestone(ms)}
                                                    className="opacity-50 hover:opacity-100 text-slate-500 hover:text-red-400 transition-all text-xs px-1"
                                                    title={isAr ? "حذف" : "Remove"}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            <div className="text-sm font-black text-white font-mono break-all">{ms.toLocaleString()}</div>
                                            
                                            {/* Small visual goal bar */}
                                            <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ${isReached ? 'bg-emerald-400' : 'bg-amber-400'}`}
                                                    style={{ width: `${progressPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* AI STRATEGIC FORECAST */}
            {useAi && (
                <div className="max-w-4xl mx-auto px-4 md:px-0">
                    <div className="glass-panel p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-purple-500/30 bg-gradient-to-b from-purple-900/10 to-transparent relative overflow-hidden animate-slide-in">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-slide-in"></div>
                        
                        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                            <div className="p-2 bg-purple-500/20 rounded-lg"><Target size={20} className="text-purple-400" /></div>
                            <div>
                                <h3 className="font-bold text-white text-base md:text-lg">{lang === 'ar' ? 'تقرير التنبؤ المباشر' : 'Live Strategic Forecast'}</h3>
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest">{lang === 'ar' ? 'تحليل السرعة الحالية' : 'Analyzing Current Velocity'}</div>
                            </div>
                            {isAiLoading && <Loader2 size={20} className="animate-spin text-purple-500 ml-auto" />}
                        </div>

                        {aiForecast ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                <div className="space-y-4">
                                    <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                        <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">{lang === 'ar' ? 'المحطة القادمة' : 'Next Milestone'}</div>
                                        <div className="text-2xl md:text-3xl font-black text-white">{aiForecast.next_milestone}</div>
                                        <div className="text-xs md:text-sm text-purple-400 mt-1 flex items-center gap-2">
                                            <Clock size={14}/> {aiForecast.estimated_time}
                                        </div>
                                    </div>
                                    <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                        <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">{lang === 'ar' ? 'حالة النمو' : 'Growth Status'}</div>
                                        <div className="text-lg md:text-xl font-bold text-white">{aiForecast.growth_status}</div>
                                    </div>
                                    {aiForecast.viral_probability && (
                                        <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                                            <div className="text-[10px] text-emerald-500 font-bold uppercase mb-1">{lang === 'ar' ? 'احتمالية الانتشار' : 'Viral Probability'}</div>
                                            <div className="text-xl md:text-2xl font-black text-emerald-400">{aiForecast.viral_probability}%</div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex flex-col justify-center">
                                    <div className="text-[10px] text-yellow-500 font-bold uppercase mb-2 flex items-center gap-2"><Radio size={12}/> {lang === 'ar' ? 'رؤية استراتيجية ذكية' : 'Strategic AI Insight'}</div>
                                    <p className="text-white text-base md:text-lg font-medium leading-relaxed italic border-l-2 border-purple-500 pl-4">
                                        "{aiForecast.strategic_insight}"
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500 flex flex-col items-center gap-3">
                                <Loader2 size={32} className="animate-spin text-purple-500/50" />
                                <p className="text-sm">{lang === 'ar' ? 'جاري حساب المسار في الخلفية...' : 'Calculating Trajectory in background...'}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
      )}

       {/* Spectacular Milestone Celebration Overlay */}
       {activeAlert && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in p-6">
               <div className="relative max-w-md w-full glass-panel aspect-square flex flex-col items-center justify-center text-center p-8 border border-emerald-500/30 shadow-[0_0_100px_rgba(16,185,129,0.2)]">
                   {/* Decorative Sparkles */}
                   <div className="absolute inset-0 bg-radial-gradient from-emerald-500/10 via-transparent to-transparent pointer-events-none"></div>
                   
                   <div className="relative mb-6">
                       <div className="p-5 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full text-black shadow-lg shadow-emerald-500/20 animate-bounce">
                           <Sparkles size={40} />
                       </div>
                       <div className="absolute -top-1 -right-1 text-yellow-400 animate-ping"><Zap size={20} /></div>
                   </div>

                   <h3 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
                       {isAr ? 'مبروك! تهانينا الحارة 🎉' : 'Milestone Achieved! 🎉'}
                   </h3>
                   <p className="text-sm text-slate-400 mb-6 font-medium">
                       {isAr 
                           ? `قناتك "${activeAlert.channelTitle}" تجاوزت بنجاح حاجز الأهداف اللحظية!` 
                           : `Your channel "${activeAlert.channelTitle}" has successfully smashed your tracker target!`
                       }
                   </p>

                   <div className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl mb-8">
                       <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">{isAr ? 'الهدف المكتمل' : 'Target Achieved'}</div>
                       <div className="text-3xl md:text-4xl font-mono font-black text-white">{activeAlert.milestone.toLocaleString()}</div>
                       <div className="text-xs text-slate-500 mt-1">{isAr ? 'مشترك بالثواني الفعلية' : 'Real-time Subscribers'}</div>
                   </div>

                   <button
                       onClick={() => setActiveAlert(null)}
                       className="w-full bg-emerald-500 hover:bg-emerald-600 text-black py-4 rounded-xl font-bold tracking-tight transition-all text-sm uppercase shadow-lg shadow-emerald-500/10"
                   >
                       {isAr ? 'متابعة المراقبة اللحظية' : 'Continue Live Streaming'}
                   </button>
               </div>
           </div>
       )}
    </motion.div>
  );
};

export default LiveCounter;
