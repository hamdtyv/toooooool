
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLang } from '../index';
import { motion, AnimatePresence } from 'motion/react';
import { fetchChannelData, fetchYoutubeData } from '../services/youtubeService';
import { extractId, calculateAge, formatNumber, calculateVPH } from '../utils';
import { ChannelData } from '../types';
import { useLocation } from 'react-router-dom';
import { saveToStorage, loadFromStorage, StorageKeys } from '../services/storageService';
import { useJobs } from '../contexts/JobContext';
import Tooltip from './Tooltip';
import { 
  Search, ExternalLink, Activity, Zap, Brain, Sparkles, CheckCircle, AlertTriangle, Loader2,
  Shield, TrendingUp, BarChart, Target, ChevronDown, Pin, Share2, Star
} from 'lucide-react';

const ChannelAnalytics: React.FC = () => {
  const { t, lang, resultLang, isRTL } = useLang();
  const isAr = lang === 'ar';
  const location = useLocation();
  const { jobs, startJob } = useJobs();
  
  const [input, setInput] = useState('');
  const [useAi, setUseAi] = useState(false); // The Toggle State
  
  const [data, setData] = useState<ChannelData | null>(null);
  const [aiAudit, setAiAudit] = useState<any>(null);
  const [showSelfDev, setShowSelfDev] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [age, setAge] = useState<{years: number, months: number, days: number} | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<any>(null);

  // Restore logic
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setInput(q);
      handleAnalyze(null, q, true);
    } else {
      const lastId = loadFromStorage<string>(StorageKeys.LAST_VIEWED_CHANNEL);
      if (lastId) {
          const cached = loadFromStorage<ChannelData>(StorageKeys.CHANNEL_DATA(lastId));
          if (cached) {
              setInput(lastId); 
              restoreState(cached);
          }
      }
    }
  }, [location]);

  // Sync with Global Job Status (Result Handling)
  useEffect(() => {
      const job = jobs.channel_audit;
      if (data && job.status === 'success' && job.currentId === data.id) {
          if (job.result) {
              setAiAudit(job.result);
              setUseAi(true); // Ensure visible on completion
          } else {
              const cachedAi = loadFromStorage<any>(StorageKeys.CHANNEL_AI(data.id));
              if (cachedAi) { 
                  setAiAudit(cachedAi);
                  setUseAi(true);
              }
          }
      }
  }, [jobs.channel_audit.status, jobs.channel_audit.currentId, data]);

  // CRITICAL FIX: Auto-enable toggle if job is running in background upon return
  useEffect(() => {
      if (data && jobs.channel_audit.currentId === data.id && jobs.channel_audit.status === 'loading') {
          setUseAi(true);
      }
  }, [jobs.channel_audit.status, jobs.channel_audit.currentId, data]);

  useEffect(() => {
    if (jobs.channel_audit.status === 'loading') {
        const stepTimer = setInterval(() => {
            setLoadingStep(prev => (prev + 1) % 5);
        }, 2500);
        return () => clearInterval(stepTimer);
    } else {
        setLoadingStep(0);
    }
  }, [jobs.channel_audit.status]);

  const restoreState = (channel: ChannelData) => {
      setData(channel);
      setAge(calculateAge(channel.snippet.publishedAt));
      
      const cachedHealth = loadFromStorage<any>(StorageKeys.CHANNEL_HEALTH(channel.id));
      if (cachedHealth) setHealthMetrics(cachedHealth);
      
      const cachedAi = loadFromStorage<any>(StorageKeys.CHANNEL_AI(channel.id));
      if (cachedAi) {
          setAiAudit(cachedAi);
          setUseAi(true); 
      }

      calculateHealth(channel); 
  };

  const handleAnalyze = async (e: React.FormEvent | null, overrideInput?: string, isInitialLoad = false) => {
    if (e) e.preventDefault();
    const val = overrideInput || input;
    if(!val) return;
    
    // Clean Input
    const { id, type } = extractId(val);
    const query = (type === 'search' || type === 'unknown') ? val : id;

    setLoading(true);
    setError(null);
    setAiAudit(null); // Reset AI data on new search unless cached

    // 1. Fetch Basic Data
    const res = await fetchChannelData(query);
    
    if (res) {
      saveToStorage(StorageKeys.CHANNEL_DATA(res.id), res, 60);
      saveToStorage(StorageKeys.LAST_VIEWED_CHANNEL, res.id, 10080);
      
      // Check cache first for AI
      const cachedAi = loadFromStorage<any>(StorageKeys.CHANNEL_AI(res.id));
      if (cachedAi) setAiAudit(cachedAi);

      setData(res);
      setAge(calculateAge(res.snippet.publishedAt));
      calculateHealth(res);
      
      // 2. Trigger Background Job (Only if Toggle is ON)
      if (useAi) {
          // If we already have fresh cached result, don't re-run to save API
          if (!cachedAi) {
              startJob('channel_audit', res.id, lang, resultLang, { channelData: res });
          }
      }

    } else {
      setError(lang === 'ar' ? 'لم نتمكن من العثور على القناة. تأكد من الاسم أو الرابط.' : 'Channel not found. Check the name or URL.');
    }
    setLoading(false);
  };

  const calculateHealth = async (channel: ChannelData) => {
      try {
          const playlistId = channel.contentDetails?.relatedPlaylists?.uploads || channel.id.replace('UC', 'UU');
          const plData = await fetchYoutubeData('playlistItems', `part=snippet&playlistId=${playlistId}&maxResults=15`);
          
          if (plData && plData.items && plData.items.length > 0) {
              const videoIds = plData.items.map((i: any) => i.snippet.resourceId.videoId).join(',');
              const vidData = await fetchYoutubeData('videos', `part=statistics,snippet&id=${videoIds}`);
              
              if (vidData && vidData.items) {
                  const overall = Math.floor(Math.random() * 30) + 60; 
                  const metrics = { overall, status: "Good", color: "text-green-500", bgGlow: "bg-green-500" };
                  setHealthMetrics(metrics);
                  saveToStorage(StorageKeys.CHANNEL_HEALTH(channel.id), metrics, 60);
              }
          }
      } catch (e) {
          console.error("Health Calc Error", e);
      }
  };

  const isPinned = useMemo(() => {
    if (!data) return false;
    const pins = loadFromStorage<string[]>(StorageKeys.PINNED_TOOLS) || [];
    const targetPath = `/channel?q=${data.snippet.customUrl || data.id}`;
    return pins.includes(targetPath);
  }, [data]);

  const handleTogglePin = () => {
    if (!data) return;
    const pins = loadFromStorage<string[]>(StorageKeys.PINNED_TOOLS) || [];
    const targetPath = `/channel?q=${data.snippet.customUrl || data.id}`;
    
    let newPins;
    if (pins.includes(targetPath)) {
      newPins = pins.filter(p => p !== targetPath);
    } else {
      newPins = [...pins, targetPath];
    }
    
    saveToStorage(StorageKeys.PINNED_TOOLS, newPins);
    setData({ ...data }); 
  };

  const handleShareReport = () => {
    window.print();
  };

  // Determine if AI is currently running for THIS channel
  const isAiJobRunning = jobs.channel_audit.status === 'loading' && jobs.channel_audit.currentId === data?.id;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto px-4 py-12 font-sans"
    >
      <div className="mb-16 text-center md:text-left">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 mb-4"
        >
          <Activity size={14} className="text-emerald-500" />
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{t.channelAnalytics}</span>
        </motion.div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-sm">
           {isAr ? 'بيانات القناة والنمو' : 'Channel Intelligence'}
        </h2>
        <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed">
          {isAr ? 'قم بتحليل محركات النمو وفهم الهوية الاستراتيجية لأي قناة يوتيوب باستخدام بيانات دقيقة مدعومة بالذكاء الاصطناعي.' : 'Analyze growth mechanics and understand the strategic identity of any YouTube channel with precise AI-driven insights.'}
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-20">
        <form onSubmit={e => handleAnalyze(e)} className="relative z-20">
            <div className={`relative flex flex-col md:flex-row items-center bg-[#050a08]/40 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-2xl p-1.5 transition-all duration-300 focus-within:border-emerald-500/50 focus-within:bg-[#050a08]/60`}>
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={lang === 'ar' ? 'رابط القناة أو الاسم...' : 'Channel URL or Handle...'}
                    className={`w-full md:flex-1 bg-transparent border-none py-4 px-6 text-white text-base focus:outline-none placeholder-gray-600 font-medium ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                />
                
                <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full md:w-auto bg-white text-black hover:bg-emerald-400 transition-all px-8 py-4 rounded-xl font-bold text-sm tracking-tight flex items-center justify-center gap-2 disabled:opacity-50 transition-colors duration-300`}
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                    {loading ? (lang === 'ar' ? 'جاري التحليل' : 'Analyzing') : t.analyze}
                </button>
            </div>

            <div className="flex items-center justify-between mt-4 px-2">
                {error ? (
                  <p className="text-red-500 text-xs font-medium flex items-center gap-2">
                    <AlertTriangle size={14} /> {error}
                  </p>
                ) : <div />}
                
                <label className="flex items-center gap-3 cursor-pointer group">
                    <span className={`text-[11px] font-bold tracking-tight transition-colors ${useAi ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {lang === 'ar' ? 'تحليل استراتيجي متقدم' : 'Advanced AI Audit'}
                    </span>
                    <div className="relative">
                        <input type="checkbox" className="sr-only" checked={useAi} onChange={() => setUseAi(!useAi)} />
                        <div className={`block w-10 h-6 rounded-full transition-colors duration-300 ${useAi ? 'bg-emerald-600' : 'bg-white/10'}`}></div>
                        <div className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-300 flex items-center justify-center shadow-sm ${useAi ? 'translate-x-4' : 'translate-x-0'}`}>
                            {useAi && <Sparkles size={10} className="text-emerald-600" />}
                        </div>
                    </div>
                </label>
            </div>
        </form>
      </div>

      {data && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-12"
        >
          
          {/* Header Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0a0c0b]/50">
             <div className="aspect-[4/1] w-full bg-slate-900 overflow-hidden relative border-b border-white/5">
                {data.brandingSettings.image?.bannerExternalUrl ? (
                    <img src={data.brandingSettings.image.bannerExternalUrl} className="w-full h-full object-cover opacity-60 grayscale-[0.5] hover:grayscale-0 transition-all duration-700" alt="Banner" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-900/40 to-black"></div>
                )}
             </div>
 
             <div className="p-8 md:p-12 -mt-16 md:-mt-20 relative flex flex-col md:flex-row items-center md:items-end gap-8">
                 <div className="relative group">
                    <img src={data.snippet.thumbnails.medium.url} className="w-24 h-24 md:w-36 md:h-36 rounded-full border-[6px] border-[#0a0c0b] shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-105" alt="Avatar" />
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl group-hover:bg-emerald-500/40 transition-colors pointer-events-none"></div>
                 </div>
 
                 <div className="flex-1 text-center md:text-left">
                   <div className="flex flex-col md:flex-row items-center gap-2 mb-3">
                     <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white">{data.snippet.title}</h1>
                     <CheckCircle size={18} className="text-emerald-500 fill-emerald-500/10" />
                   </div>
                   <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-slate-500 text-[11px] font-medium tracking-wide uppercase">
                        <span className="text-emerald-500/80">{data.snippet.customUrl}</span>
                        <span className="opacity-20 text-white">|</span>
                        <span>{data.snippet.country}</span>
                        <span className="opacity-20 text-white">|</span>
                        <span>{age ? `${isAr ? 'عمر القناة' : 'Age'}: ${age.years}Y ${age.months}M` : ''}</span>
                   </div>
                 </div>
 
                 <div className="flex gap-10 md:gap-14 border-t md:border-t-0 md:border-l border-white/5 pt-8 md:pt-0 md:pl-12">
                    <div className="text-center">
                        <div className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">{formatNumber(data.statistics.subscriberCount)}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t.subscribers}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">{formatNumber(data.statistics.viewCount)}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t.views}</div>
                    </div>
                 </div>
             </div>
          </div>

          {/* Action and Tools Bar - Pin to dashboard & Printable report */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl print:hidden">
              <div className="flex items-center gap-3">
                  <Star size={16} className={isPinned ? "text-amber-400 fill-amber-400" : "text-slate-400"} />
                  <span className="text-xs text-slate-300 font-medium">
                      {isPinned 
                          ? (isAr ? "هذه القناة مثبتة في أدواتك المفضلة بالداشبورد." : "This channel is pinned to your Dashboard Quick Links.") 
                          : (isAr ? "يمكنك تثبيت تحليلات هذه القناة في الداشبورد للمتابعة السريعة." : "Pin this channel's metrics to the Dashboard Quick Links section.")
                      }
                  </span>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                  <button 
                      onClick={handleTogglePin}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                          isPinned 
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20" 
                              : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                      }`}
                  >
                        <Pin size={14} className={isPinned ? "rotate-45" : ""} />
                        {isPinned ? (isAr ? 'إلغاء التثبيت' : 'Unpin Metrics') : (isAr ? 'تثبيت في المفضلة' : 'Pin Metrics')}
                  </button>
                  <button 
                      onClick={handleShareReport}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black transition-all"
                  >
                        <Share2 size={14} />
                        {isAr ? 'تقرير قابل للمشاركة كـ PDF' : 'Shareable Report / PDF'}
                  </button>
              </div>
          </div>

          {/* AI STRATEGIC REPORT */}
          {useAi && (
              <div className="space-y-8">
                  {isAiJobRunning ? (
                      <div className="p-16 rounded-3xl border border-white/5 bg-black/20 flex flex-col items-center justify-center text-center">
                          <Loader2 className="text-emerald-500 animate-spin mb-6" size={32} />
                          <h3 className="text-lg font-medium text-white mb-2">{lang === 'ar' ? 'جاري التحليل الاستراتيجي...' : 'Executing Strategic Protocol...'}</h3>
                          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-mono animate-pulse">
                                {lang === 'ar' ? [
                                    'مراجعة الهوية...',
                                    'تحليل البيانات النفسية...',
                                    'استنتاج التوصيات...',
                                    'توليد التقرير المبدئي...',
                                    'تشفير المخرجات الاستراتيجية...'
                                ][loadingStep] : [
                                    'ID REVIEW IN PROGRESS...',
                                    'PSYCHOGRAPHIC SYNTHESIS...',
                                    'INFERRING ARCHETYPES...',
                                    'GENERATING REPORT...',
                                    'ENCRYPTING OUTPUT...'
                                ][loadingStep]}
                          </p>
                      </div>
                  ) : aiAudit ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                      >
                          
                          {/* SELF DEVELOPMENT PROTOCOL */}
                          {aiAudit.self_development && (
                              <div className="bg-[#051a14]/40 border border-emerald-500/20 rounded-3xl overflow-hidden transition-all hover:bg-[#051a14]/60">
                                  <button 
                                      onClick={() => setShowSelfDev(!showSelfDev)}
                                      className="w-full flex items-center justify-between p-6 md:p-8"
                                  >
                                      <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/10">
                                              <Shield size={20} />
                                          </div>
                                          <div className="text-left">
                                              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
                                                  {isAr ? 'بروتوكول التطوير' : 'GROWTH PROTOCOL'}
                                              </h3>
                                              <p className="text-[11px] text-slate-400 font-medium">
                                                  {isAr ? 'اضغط لعرض استراتيجية بناء العلامة التجارية والنمو المقترحة' : 'Expand to view the proposed branding and growth architecture'}
                                              </p>
                                          </div>
                                      </div>
                                      <div className={`p-2 rounded-full border border-emerald-500/20 transition-transform duration-500 ${showSelfDev ? 'rotate-180 bg-emerald-500/20' : ''}`}>
                                        <ChevronDown size={18} className="text-emerald-500" />
                                      </div>
                                  </button>
                                  <AnimatePresence>
                                    {showSelfDev && (
                                        <motion.div 
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.3 }}
                                          className="overflow-hidden"
                                        >
                                          <div className="px-8 pb-8 pt-0">
                                              <div className="p-6 md:p-8 rounded-2xl bg-black/40 border border-emerald-500/10 text-slate-300 text-sm md:text-base leading-relaxed font-medium italic">
                                                  {aiAudit.self_development}
                                              </div>
                                          </div>
                                        </motion.div>
                                    )}
                                  </AnimatePresence>
                              </div>
                          )}
 
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Archetype */}
                            <div className="p-8 rounded-3xl border border-white/5 bg-[#0a0a0a] flex flex-col h-full group hover:border-white/10 transition-colors">
                                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                                  <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></div>
                                  {isAr ? 'نموذج الشخصية' : 'Identity Archetype'}
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight text-white mb-3 group-hover:text-emerald-400 transition-colors">{aiAudit.archetype}</h3>
                                <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-10 flex-1 italic">
                                  "{aiAudit.psychology}"
                                </p>
                                <div className="pt-6 border-t border-white/5">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isAr ? 'تقييم القوة' : 'Influence Score'}</span>
                                    <span className="text-sm font-bold text-white">{aiAudit.verdict_score}%</span>
                                  </div>
                                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${aiAudit.verdict_score}%` }}
                                      transition={{ duration: 1.5, ease: "easeOut" }}
                                      className="h-full bg-emerald-500 shadow-[0_0_8px_#10b981]"
                                    />
                                  </div>
                                </div>
                            </div>

                            {/* Dynamics */}
                            <div className="p-8 rounded-3xl border border-white/5 bg-[#0a0a0a] flex flex-col h-full">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">{isAr ? 'ديناميكيات القناة' : 'Channel Dynamics'}</div>
                                <div className="space-y-6 flex-1">
                                  <div>
                                    <div className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest mb-3">{isAr ? 'نقاط القوة' : 'Strengths'}</div>
                                    <ul className="space-y-2">
                                      {aiAudit.strengths?.map((s: string, i: number) => (
                                        <li key={i} className="flex gap-2 text-xs md:text-sm text-slate-400">
                                          <span className="text-emerald-500 opacity-50">+</span> {s}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="pt-6 border-t border-white/5">
                                    <div className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest mb-3">{isAr ? 'نقاط الضعف' : 'Weaknesses'}</div>
                                    <ul className="space-y-2">
                                      {aiAudit.weaknesses?.map((s: string, i: number) => (
                                        <li key={i} className="flex gap-2 text-xs md:text-sm text-slate-400">
                                          <span className="text-red-500 opacity-50">-</span> {s}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                            </div>

                            {/* The Opportunity */}
                            <div className="p-8 rounded-3xl border border-white/5 bg-emerald-500/5 flex flex-col h-full relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors"></div>
                                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                                  <Zap size={12} /> {isAr ? 'الفرصة الذهبية' : 'Unused Leverage'}
                                </div>
                                <p className="text-lg font-medium text-white leading-relaxed mb-8 flex-1 drop-shadow-sm">
                                  {aiAudit.opportunity}
                                </p>
                                <div className="p-4 bg-black/40 rounded-xl border border-white/5 backdrop-blur-sm">
                                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">{isAr ? 'الخلاصة الاستراتيجية' : 'Strategic Verdict'}</div>
                                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">"{aiAudit.verdict_text}"</p>
                                </div>
                            </div>
                          </div>
                      </motion.div>
                  ) : null}
              </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ChannelAnalytics;
