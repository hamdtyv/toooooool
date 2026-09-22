
import React, { useEffect } from 'react';
import { useLang } from '../index';
import { motion } from 'motion/react';
import { useSectionState, useAppState } from '../contexts/AppStateContext';
import { fetchVideoData } from '../services/youtubeService';
import { extractId, calculateVPH, formatNumber, analyzeVideoSEO, parseISO8601Duration } from '../utils';
import { VideoData } from '../types';
import { VPH_TIPS_EXPANDED } from '../constants';
import { Hash, ThumbsUp, MessageCircle, TrendingUp, Copy, AlignLeft, Loader2, Rocket, Minus, TrendingDown, Clock, Smartphone, ExternalLink, Check, FileText, Tag, Type, Brain, Lightbulb, Sparkles, Video, Search, Shield, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Tooltip from './Tooltip';
import { saveToStorage, loadFromStorage, StorageKeys } from '../services/storageService';
import { useJobs } from '../contexts/JobContext';

const VideoAnalyzer: React.FC = () => {
  const { t, lang, resultLang } = useLang();
  const { addToArchive } = useAppState();
  const location = useLocation();
  const { jobs, startJob } = useJobs();

  const [input, setInput] = useSectionState('video_analyzer_input', '');
  const [data, setData] = useSectionState<VideoData | null>('video_analyzer_data', null);
  
  const [useAi, setUseAi] = useSectionState('video_analyzer_use_ai', false); // AI Toggle State
  const [aiAnalysis, setAiAnalysis] = useSectionState<any>('video_analyzer_ai_result', null); // AI Result State
  const [showSelfDev, setShowSelfDev] = React.useState(false);
  const [loadingStep, setLoadingStep] = React.useState(0);
  
  const [loading, setLoading] = React.useState(false);
  
  const [vph, setVph] = useSectionState<number>('video_analyzer_vph', 0);
  const [ageHours, setAgeHours] = useSectionState<number>('video_analyzer_age', 0);
  const [isShort, setIsShort] = useSectionState('video_analyzer_is_short', false);
  const [seoResult, setSeoResult] = useSectionState<any>('video_analyzer_seo', null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    
    if (q) {
      const { id } = extractId(q);
      setInput(q);
      const cachedVideo = loadFromStorage<VideoData>(StorageKeys.VIDEO_DATA(id));
      if (cachedVideo) {
          processData(cachedVideo);
          saveToStorage(StorageKeys.LAST_VIEWED_VIDEO, id);
      } else {
          handleAnalyze(null, q, true);
      }
    } else {
      const lastId = loadFromStorage<string>(StorageKeys.LAST_VIEWED_VIDEO);
      if (lastId) {
          setInput(lastId);
          const cachedVideo = loadFromStorage<VideoData>(StorageKeys.VIDEO_DATA(lastId));
          if (cachedVideo) {
              processData(cachedVideo);
          }
      }
    }
  }, [location]);

  // Sync with Global Job Status (Result Handling)
  useEffect(() => {
      const job = jobs.video_audit;
      if (data && job.status === 'success' && job.currentId === data.id) {
          if (job.result) {
              setAiAnalysis(job.result);
              setUseAi(true);
          } else {
              const cachedAi = loadFromStorage<any>(StorageKeys.VIDEO_AI(data.id));
              if (cachedAi) { 
                  setAiAnalysis(cachedAi);
                  setUseAi(true);
              }
          }
      }
  }, [jobs.video_audit.status, jobs.video_audit.currentId, data]);

  // Auto-enable toggle if job is running
  useEffect(() => {
      if (data && jobs.video_audit.currentId === data.id && jobs.video_audit.status === 'loading') {
          setUseAi(true);
      }
  }, [jobs.video_audit.status, jobs.video_audit.currentId, data]);

  useEffect(() => {
    if (jobs.video_audit.status === 'loading') {
        const stepTimer = setInterval(() => {
            setLoadingStep(prev => (prev + 1) % 5);
        }, 2500);
        return () => clearInterval(stepTimer);
    } else {
        setLoadingStep(0);
    }
  }, [jobs.video_audit.status]);

  const processData = (video: VideoData) => {
      setData(video);
      const calculatedVph = calculateVPH(video.snippet.publishedAt, video.statistics.viewCount);
      setVph(calculatedVph);
      const now = new Date().getTime();
      const pub = new Date(video.snippet.publishedAt).getTime();
      setAgeHours((now - pub) / (1000 * 60 * 60));
      setSeoResult(analyzeVideoSEO(video));
      if (video.contentDetails?.duration) {
          const durationSec = parseISO8601Duration(video.contentDetails.duration);
          setIsShort(durationSec <= 60);
      }

      // Check cache for AI result and enable toggle if found
      const cachedAi = loadFromStorage<any>(StorageKeys.VIDEO_AI(video.id));
      if (cachedAi) {
          setAiAnalysis(cachedAi);
          setUseAi(true);
      }
  };

  const handleAnalyze = async (e: React.FormEvent | null, overrideInput?: string, isInitialLoad = false) => {
    if (e) e.preventDefault();
    const val = overrideInput || input;
    if (!val) return;

    const { id } = extractId(val);
    saveToStorage(StorageKeys.LAST_VIEWED_VIDEO, id);
    
    if (!isInitialLoad && !e) {
        const cachedVideo = loadFromStorage<VideoData>(StorageKeys.VIDEO_DATA(id));
        if (cachedVideo) {
          processData(cachedVideo);
          return;
        }
    }

    setLoading(true);
    if(e) {
        setData(null); 
        setSeoResult(null);
        setAiAnalysis(null);
    }

    const res = await fetchVideoData(id);
    if (res) {
      processData(res);
      saveToStorage(StorageKeys.VIDEO_DATA(id), res, 525600);
      
      // Save discrete copy to Strategic Archive
      addToArchive({
          type: 'analysis',
          title: res.snippet.title,
          payload: {
              videoId: res.id,
              statistics: res.statistics,
              seo: analyzeVideoSEO(res)
          }
      });
      
      // Trigger Background AI Job only if enabled
      const cachedAi = loadFromStorage<any>(StorageKeys.VIDEO_AI(res.id));
      if (useAi && !cachedAi) {
          startJob('video_audit', res.id, lang, resultLang, { videoData: res });
      }
    }
    setLoading(false);
  };

  const trend = data ? getTrendInfo(vph, ageHours) : null;

  function getTrendInfo(v: number, age: number) {
    const multiplier = isShort ? 5 : 1; 
    if (v > (5000 * multiplier) || (age < 24 && v > (500 * multiplier))) {
        return { label: t.trend_viral, icon: <Rocket size={24} />, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/50', tips: VPH_TIPS_EXPANDED.viral[lang] };
    }
    if ((age < 168 && v > (100 * multiplier)) || (age < 48 && v > (50 * multiplier))) {
        return { label: t.trend_rising, icon: <TrendingUp size={24} />, color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/50', tips: VPH_TIPS_EXPANDED.rising[lang] };
    }
    return { label: t.trend_stable, icon: <Minus size={24} />, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/50', tips: VPH_TIPS_EXPANDED.stable[lang] };
  };

  const isAiJobRunning = jobs.video_audit.status === 'loading' && jobs.video_audit.currentId === data?.id;

  const isAr = lang === 'ar';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto px-4 py-12 font-sans"
    >
      
      {/* Title with Badge alignment */}
      <div className="mb-16 text-center md:text-left">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 mb-4"
        >
          <Video size={14} className="text-emerald-500" />
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{t.videoAnalytics}</span>
        </motion.div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-sm">
           {isAr ? 'التحليل الجيني للفيديو' : 'Video Genetic Intelligence'}
        </h2>
        <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed">
           {isAr 
            ? 'قم بتشريح أي كائن فيديو عبر الذكاء الاصطناعي لفهم التفاعل وسرعة الانتشار وتحديد الفجوات البصرية والنصية.'
            : 'Dissect the DNA profile of any YouTube video. Understand VPH, metadata metrics, and AI psychography.'}
        </p>
      </div>

      {/* Standardized Search Bar & AI Toggle */}
      <div className="max-w-3xl mx-auto mb-16">
        <form onSubmit={e => handleAnalyze(e)} className="relative group z-20">
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
                    <Tooltip content={t.tooltip_video_input} />
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

      {data && trend && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 md:px-0">
            {/* Result display */}
            <div className="lg:col-span-2 space-y-6">
                <div className="glass-panel p-4 md:p-6 rounded-3xl md:rounded-[2rem] border border-white/5 bg-gradient-to-br from-emerald-950/10 to-transparent">
                    <div className="aspect-video rounded-2xl md:rounded-3xl overflow-hidden mb-4 relative shadow-2xl border border-white/5">
                       <img src={data.snippet.thumbnails.maxres?.url || data.snippet.thumbnails.high.url} className="w-full h-full object-cover" alt="Thumbnail" />
                       <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 to-transparent">
                         <h1 className="text-lg md:text-2xl font-bold text-white drop-shadow-lg leading-tight text-start line-clamp-2">{data.snippet.title}</h1>
                       </div>
                    </div>
                    
                    {/* Basic Stats Grid - Emerald Theme */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6">
                        <div className="bg-emerald-500/5 p-3 md:p-4 rounded-xl md:rounded-2xl text-center border border-emerald-500/10">
                            <div className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase mb-1">{t.views}</div>
                            <div className="text-base md:text-lg font-bold text-white">{formatNumber(data.statistics.viewCount)}</div>
                        </div>
                        <div className="bg-emerald-500/5 p-3 md:p-4 rounded-xl md:rounded-2xl text-center border border-emerald-500/10">
                            <div className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase mb-1">{t.likes}</div>
                            <div className="text-base md:text-lg font-bold text-white">{formatNumber(data.statistics.likeCount)}</div>
                        </div>
                        <div className="bg-emerald-500/5 p-3 md:p-4 rounded-xl md:rounded-2xl text-center border border-emerald-500/10">
                            <div className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase mb-1">{t.comments}</div>
                            <div className="text-base md:text-lg font-bold text-white">{formatNumber(data.statistics.commentCount)}</div>
                        </div>
                        <div className="bg-emerald-500/5 p-3 md:p-4 rounded-xl md:rounded-2xl text-center border border-emerald-500/10">
                            <div className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase mb-1">{t.engagementRate}</div>
                            <div className="text-base md:text-lg font-bold text-emerald-400">
                                {((parseInt(data.statistics.likeCount) + parseInt(data.statistics.commentCount)) / parseInt(data.statistics.viewCount) * 100).toFixed(2)}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* VPH Section */}
                <div className={`p-6 rounded-3xl md:rounded-[2rem] border ${trend.border} ${trend.bg}`}>
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-full bg-black/30 ${trend.color}`}>{trend.icon}</div>
                        <div>
                            <h3 className={`text-lg md:text-xl font-bold ${trend.color}`}>{trend.label}</h3>
                            <p className="text-xs md:text-sm text-gray-400">{formatNumber(vph)} {t.vph}</p>
                        </div>
                    </div>
                    <p className="text-xs md:text-sm text-gray-300 italic bg-black/20 p-4 rounded-xl border border-white/5">
                        {trend.tips}
                    </p>
                </div>
            </div>

            {/* AI Deep Analysis Box */}
            <div className="lg:col-span-1">
                {useAi ? (
                    <div className="glass-panel p-6 rounded-3xl md:rounded-[2rem] border border-white/5 bg-[#0a0a0a] overflow-hidden relative h-full">
                        <div className="flex items-center gap-2 mb-4 text-emerald-400">
                            <Brain size={20} />
                            <h3 className="font-bold text-sm md:text-base">{lang === 'ar' ? 'تحليل المحتوى الذكي' : 'Smart Content Analysis'}</h3>
                        </div>

                        {isAiJobRunning ? (
                            <div className="flex flex-col items-center justify-center h-40">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                                    <Brain size={32} className="text-emerald-500 animate-spin-slow" />
                                </div>
                                <h4 className="text-[10px] md:text-xs text-white font-bold mb-1">{lang === 'ar' ? 'جاري التحليل العميق...' : 'Deep Analysis Running...'}</h4>
                                <span className="text-[8px] md:text-[10px] text-gray-500 animate-pulse font-mono uppercase tracking-tighter">
                                    {lang === 'ar' ? [
                                        'تحليل سيكولوجية العنوان...',
                                        'فحص جاذبية الصورة...',
                                        'مقارنة الخوارزميات...',
                                        'توليد البدائل الفيروسية...',
                                        'تشفير التقرير النهائي...'
                                    ][loadingStep] : [
                                        'Analyzing Title Psychology...',
                                        'Scanning Thumbnail Appeal...',
                                        'Comparing Algorithms...',
                                        'Generating Viral Alternatives...',
                                        'Encrypting Final Report...'
                                    ][loadingStep]}
                                </span>
                            </div>
                        ) : aiAnalysis ? (
                            <div className="space-y-4 text-sm animate-slide-in">
                                
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

                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">{lang === 'ar' ? 'تقييم العنوان' : 'Title Score'}</div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`text-2xl md:text-3xl font-black ${aiAnalysis.title_score > 70 ? 'text-green-400' : 'text-yellow-400'}`}>{aiAnalysis.title_score}/100</span>
                                        <FileText size={20} className="text-gray-600"/>
                                    </div>
                                    <p className="text-gray-400 text-[10px] md:text-xs italic leading-relaxed border-l-2 border-white/10 pl-2">"{aiAnalysis.title_critique}"</p>
                                </div>

                                <div>
                                    <div className="text-[10px] text-emerald-400 font-bold uppercase mb-2 flex items-center gap-1"><Lightbulb size={12}/> {lang === 'ar' ? 'بدائل مقترحة' : 'Better Alternatives'}</div>
                                    <ul className="space-y-2">
                                        {aiAnalysis.better_titles?.map((t: string, i: number) => (
                                            <li key={i} className="text-gray-300 text-[10px] md:text-xs bg-black/30 p-2.5 rounded-lg border border-white/5 hover:border-emerald-500/30 transition-colors cursor-default">{t}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
                                     <div className="text-[10px] text-purple-400 font-bold uppercase mb-2 flex items-center gap-2"><Sparkles size={12}/> Thumbnail Concept</div>
                                     <p className="text-gray-300 text-[10px] md:text-xs leading-relaxed">{aiAnalysis.thumbnail_idea}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-center opacity-50">
                                <Sparkles size={30} className="text-gray-600 mb-2"/>
                                <span className="text-[10px] text-gray-500">{lang === 'ar' ? 'بانتظار التحليل...' : 'Waiting for analysis...'}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Fallback when AI is OFF: Show basic SEO info */
                    <div className="glass-panel p-6 rounded-3xl md:rounded-[2rem] border border-white/5 bg-[#0a0a0a] h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-6 text-gray-400">
                            <Tag size={20} />
                            <h3 className="font-bold text-sm md:text-base">{t.keywords}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 content-start">
                            {data.snippet.tags ? (
                                data.snippet.tags.slice(0, 15).map((tag, i) => (
                                    <span key={i} className="bg-emerald-500/5 px-3 py-1 rounded-full text-[10px] md:text-xs text-emerald-400 border border-emerald-500/10">{tag}</span>
                                ))
                            ) : (
                                <span className="text-gray-600 text-xs md:text-sm italic">{lang === 'ar' ? 'لا توجد وسوم' : 'No tags found'}</span>
                            )}
                        </div>
                        <div className="mt-auto pt-6 border-t border-white/5">
                            <div className="text-center p-4 bg-white/5 rounded-xl">
                                <div className="text-[10px] md:text-sm font-bold text-gray-400 mb-1">SEO Score</div>
                                <div className="text-xl md:text-2xl font-black text-white">{seoResult?.totalScore}/100</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}
    </motion.div>
  );
};

export default VideoAnalyzer;
