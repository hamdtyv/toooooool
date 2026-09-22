
import React, { useState, useEffect, useMemo } from 'react';
import { useLang } from '../index';
import { motion } from 'motion/react';
import { fetchVideoData, fetchChannelData } from '../services/youtubeService';
import { extractId } from '../utils';
import { VideoData } from '../types';
import { COUNTRY_TIMEZONES } from '../constants';
import { 
    Clock, 
    Calendar, 
    Timer, 
    Loader2, 
    Globe,
    MapPin,
    Hash,
    Search,
    Languages,
    Sparkles,
    Brain,
    CheckCircle,
    AlertTriangle,
    Target
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useJobs } from '../contexts/JobContext';
import { loadFromStorage, StorageKeys, saveToStorage } from '../services/storageService';
import { logToolActivity } from '../services/firebase';
import Tooltip from './Tooltip';

const VideoTimingInsight: React.FC = () => {
  const { t, lang, resultLang } = useLang();
  const location = useLocation();
  const { jobs, startJob } = useJobs();

  const [input, setInput] = useState('');
  const [data, setProjectedData] = useState<VideoData | null>(null);
  const [originCountry, setOriginCountry] = useState<{code: string, name: string, tz: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [timingStats, setTimingStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // AI States
  const [useAi, setUseAi] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  // Generate localized country list based on current site language
  const worldCountries = useMemo(() => {
    const regionNames = new Intl.DisplayNames([lang === 'ar' ? 'ar' : 'en'], { type: 'region' });
    return Object.entries(COUNTRY_TIMEZONES).map(([code, tz]) => {
      try {
        return {
          code,
          name: regionNames.of(code) || code,
          tz
        };
      } catch (e) {
        return { code, name: code, tz };
      }
    }).sort((a, b) => a.name.localeCompare(b.name, lang === 'ar' ? 'ar' : 'en'));
  }, [lang]);

  // Restore State on Load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    
    if (q) {
      const { id } = extractId(q);
      setInput(q);
      // Try to load cached data first to render immediately
      const cachedVideo = loadFromStorage<VideoData>(StorageKeys.VIDEO_DATA(id));
      if (cachedVideo) {
          saveToStorage(StorageKeys.LAST_VIEWED_TIMING, id);
          restoreState(cachedVideo);
      } else {
          handleAnalyze(null, q, true);
      }
    } else {
      // Restore from last session if no specific query param
      const lastId = loadFromStorage<string>(StorageKeys.LAST_VIEWED_TIMING);
      if (lastId) {
          setInput(lastId);
          const cachedVideo = loadFromStorage<VideoData>(StorageKeys.VIDEO_DATA(lastId));
          if (cachedVideo) {
              restoreState(cachedVideo);
          }
      }
    }
  }, [location.search]);

  // Sync with Global Job Status & Auto-Restore AI UI
  useEffect(() => {
      const job = jobs.timing_audit;
      
      // 1. If Job Success for current video -> Update UI
      if (data && job.status === 'success' && job.currentId === data.id) {
          if (job.result) {
              setAiAnalysis(job.result);
              setUseAi(true);
          } else {
              const cachedAi = loadFromStorage<any>(StorageKeys.TIMING_AI(data.id));
              if (cachedAi) {
                  setAiAnalysis(cachedAi);
                  setUseAi(true);
              }
          }
      }

      // 2. If Job Running for current video -> Force Toggle ON to show loading state
      if (data && job.status === 'loading' && job.currentId === data.id) {
          setUseAi(true);
      }
  }, [jobs.timing_audit.status, jobs.timing_audit.currentId, data]);

  const restoreState = async (video: VideoData) => {
      setProjectedData(video);
      
      // We need channel data for country context
      let channel = loadFromStorage<any>(StorageKeys.CHANNEL_DATA(video.snippet.channelId));
      if (!channel) {
          // If not cached, fetch silently (or we could show loading, but better to just show video data first)
          channel = await fetchChannelData(video.snippet.channelId);
          if (channel) saveToStorage(StorageKeys.CHANNEL_DATA(channel.id), channel);
      }

      if (channel) {
          const countryCode = channel.snippet.country || 'US';
          const timezone = COUNTRY_TIMEZONES[countryCode] || 'UTC';
          
          const regionNames = new Intl.DisplayNames([lang === 'ar' ? 'ar' : 'en'], { type: 'region' });
          const countryName = regionNames.of(countryCode) || countryCode;

          setOriginCountry({ code: countryCode, name: countryName, tz: timezone });
          processChronologicalData(video, timezone);
      }

      // Restore AI State
      const cachedAi = loadFromStorage<any>(StorageKeys.TIMING_AI(video.id));
      if (cachedAi) {
          setAiAnalysis(cachedAi);
          setUseAi(true);
      }
      
      // Check active job status for auto-enabling toggle
      if (jobs.timing_audit.currentId === video.id && jobs.timing_audit.status === 'loading') {
          setUseAi(true);
      }
  };

  const handleAnalyze = async (e: React.FormEvent | null, overrideInput?: string, isInitialLoad = false) => {
    if (e) e.preventDefault();
    const val = overrideInput || input;
    if (!val) return;

    const { id } = extractId(val);
    saveToStorage(StorageKeys.LAST_VIEWED_TIMING, id);
    
    // If loading from cache in handleAnalyze (e.g. user typed same ID again)
    if (!isInitialLoad && !e) {
         const cachedVideo = loadFromStorage<VideoData>(StorageKeys.VIDEO_DATA(id));
         if (cachedVideo) {
             restoreState(cachedVideo);
             return;
         }
    }

    setLoading(true);
    // Only reset if it's a new analysis
    if (e || !isInitialLoad) {
        setProjectedData(null);
        setOriginCountry(null);
        setAiAnalysis(null);
    }

    const res = await fetchVideoData(id);
    if (res) {
      saveToStorage(StorageKeys.VIDEO_DATA(id), res); // Cache Video Data
      setProjectedData(res);
      
      const channelRes = await fetchChannelData(res.snippet.channelId);
      if (channelRes) saveToStorage(StorageKeys.CHANNEL_DATA(channelRes.id), channelRes); // Cache Channel Data

      const countryCode = channelRes?.snippet.country || 'US';
      const timezone = COUNTRY_TIMEZONES[countryCode] || 'UTC';
      
      const regionNames = new Intl.DisplayNames([lang === 'ar' ? 'ar' : 'en'], { type: 'region' });
      const countryName = regionNames.of(countryCode) || countryCode;

      setOriginCountry({ code: countryCode, name: countryName, tz: timezone });
      processChronologicalData(res, timezone);

      await logToolActivity('video_timing', t.videoTiming, 'analyzed_video_timing', {
          videoId: res.id,
          title: res.snippet.title,
          timezone
      }, lang === 'ar' ? `تحليل توقيت نشر فيديو لـ: ${res.snippet.title.substring(0, 30)}...` : `Analyzed video timing for: ${res.snippet.title.substring(0, 30)}...`);

      // Check cache for AI result and enable toggle if found
      const cachedAi = loadFromStorage<any>(StorageKeys.TIMING_AI(res.id));
      if (cachedAi) {
          setAiAnalysis(cachedAi);
          setUseAi(true);
      }

      // Trigger AI if enabled or if we want to auto-analyze
      if (useAi && !cachedAi) {
          startJob('timing_audit', res.id, lang, resultLang, { videoData: res, countryCode });
      }
    }
    setLoading(false);
  };

  // Re-trigger AI when toggle is switched ON manually
  const handleToggleAi = async () => {
      const newState = !useAi;
      setUseAi(newState);
      if (newState && data && !aiAnalysis && originCountry) {
          const cachedAi = loadFromStorage<any>(StorageKeys.TIMING_AI(data.id));
          if (cachedAi) {
              setAiAnalysis(cachedAi);
          } else {
              startJob('timing_audit', data.id, lang, resultLang, { videoData: data, countryCode: originCountry.code });
          }
      }
  };

  const processChronologicalData = (video: VideoData, timezone: string) => {
      const pubDate = new Date(video.snippet.publishedAt);
      const formatPart = (options: Intl.DateTimeFormatOptions) => 
          pubDate.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { ...options, timeZone: timezone });

      setTimingStats({
          dayName: formatPart({ weekday: 'long' }),
          dayNum: formatPart({ day: 'numeric' }),
          month: formatPart({ month: 'long' }),
          year: formatPart({ year: 'numeric' }),
          timeStr: formatPart({ hour: '2-digit', minute: '2-digit', hour12: true }),
          rawUtc: video.snippet.publishedAt
      });
  };

  const getComparisonTime = (tz: string) => {
      if (!data) return '';
      return new Date(data.snippet.publishedAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', {
          timeZone: tz,
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
      });
  };

  const filteredCountries = worldCountries.filter(country => 
      country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const TimingBlock = ({ label, value, icon: Icon, color }: any) => (
      <div className="bg-[#0a0c0b]/50 border border-white/5 p-6 rounded-3xl flex flex-col items-center justify-center text-center group hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Icon size={22} />
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 font-mono">{label}</div>
          <div className="text-xl md:text-2xl font-black text-white tracking-tight">{value}</div>
      </div>
  );

  const isAiJobRunning = jobs.timing_audit.status === 'loading' && jobs.timing_audit.currentId === data?.id;

  const isAr = lang === 'ar';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto pb-20 px-4 md:px-0 font-sans"
    >
        {/* Header */}
        <div className="mb-16 text-center md:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 mb-4"
            >
              <Timer size={14} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{t.videoTiming}</span>
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-sm flex items-center justify-center md:justify-start gap-3">
                <Timer size={32} className="text-emerald-400 animate-pulse" />
                {t.videoTiming}
            </h2>
            <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed font-normal">
                {isAr ? 'تحليل مواعيد النشر المثالية وتأثير فارق التوقيت الدولي لزيادة المشاهدات التراكمية.' : 'Analyze publishing timing performance and absolute international time offset impact.'}
            </p>
        </div>

        {/* Standardized Search Bar & AI Toggle */}
        <div className="max-w-4xl mx-auto mb-16">
            <form onSubmit={e => handleAnalyze(e)} className="relative group z-20">
                {/* Input Container */}
                <div className="relative flex flex-col md:flex-row items-center bg-[#050a08]/40 border border-white/10 rounded-2xl p-1.5 transition-all duration-300 focus-within:border-emerald-500/50 focus-within:bg-[#050a08]/60">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className={`w-full md:flex-1 bg-transparent border-none py-3 md:py-4 px-4 md:px-6 text-white text-base md:text-lg focus:outline-none placeholder-gray-500 font-medium ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    />
                    
                    <div className="hidden md:block px-3">
                        <Tooltip content={t.vt_exact_pub_desc} />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold text-base transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 mt-2 md:mt-0 md:mx-2"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        {loading ? '' : t.analyze}
                    </button>
                </div>

                {/* AI Toggle Switch (Below Search) */}
                <div className="flex items-center justify-end mt-4 px-2 gap-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <span className={`text-sm font-bold transition-colors ${useAi ? 'text-purple-400' : 'text-gray-500'}`}>
                            {lang === 'ar' ? 'تفعيل المحلل الاستراتيجي (AI)' : 'Enable Strategic AI'}
                        </span>
                        <div className="relative">
                            <input type="checkbox" className="sr-only" checked={useAi} onChange={handleToggleAi} />
                            <div className={`block w-12 h-7 rounded-full transition-colors duration-300 ${useAi ? 'bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.5)]' : 'bg-gray-700'}`}></div>
                            <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 flex items-center justify-center ${useAi ? 'translate-x-5' : 'translate-x-0'}`}>
                                {useAi && <Sparkles size={12} className="text-purple-600" />}
                            </div>
                        </div>
                    </label>
                </div>
            </form>
        </div>

        {data && timingStats && originCountry && (
            <div className="space-y-8 animate-slide-in pb-20">
                
                {/* Master Info: The ORIGIN context (Engineered for Overlapping Overlay) */}
                <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0a0c0b]/50">
                    {/* Backdrop Banner */}
                    <div className="aspect-[4/1] w-full bg-slate-900 overflow-hidden relative border-b border-white/5">
                        <div className="w-full h-full bg-gradient-to-br from-emerald-900/40 via-emerald-950/20 to-black relative">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent"></div>
                        </div>
                    </div>

                    <div className="p-6 md:p-10 -mt-16 md:-mt-20 relative z-10">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 mb-8">
                            <div className="relative group shrink-0">
                                <img src={data.snippet.thumbnails.medium.url} className="w-24 h-24 md:w-36 md:h-36 rounded-2xl border-[6px] border-[#0a0c0b] shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-105" alt="Video"/>
                                <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 blur-xl group-hover:bg-emerald-500/40 transition-colors pointer-events-none"></div>
                            </div>

                            <div className="flex-1 text-center md:text-left pt-4 md:pt-0">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                                    <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-full tracking-widest">ORIGIN_TIME_SYNC</span>
                                    <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-300 text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
                                        <Globe size={11} className="text-emerald-400" /> {originCountry.name}
                                    </span>
                                </div>
                                <h1 className="text-xl md:text-3xl font-black text-white mb-2 leading-tight drop-shadow-md">{data.snippet.title}</h1>
                                <p className="text-slate-500 font-mono text-[10px] md:text-xs">
                                    <span className="text-emerald-400 font-bold">{data.snippet.channelTitle}</span> • TZ: {originCountry.tz}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 border-t border-white/5 pt-8">
                            <TimingBlock 
                                label={lang === 'ar' ? "ساعة النشر هناك" : "Local Publish Time"} 
                                value={timingStats.timeStr} 
                                icon={Clock} 
                                color="bg-emerald-500" 
                            />
                            <TimingBlock 
                                label={lang === 'ar' ? "يوم النشر" : "Day"} 
                                value={timingStats.dayName} 
                                icon={Calendar} 
                                color="bg-teal-500" 
                            />
                            <TimingBlock 
                                label={lang === 'ar' ? "تاريخ اليوم" : "Date"} 
                                value={timingStats.dayNum} 
                                icon={Hash} 
                                color="bg-green-500" 
                            />
                            <TimingBlock 
                                label={lang === 'ar' ? "الشهر" : "Month"} 
                                value={timingStats.month} 
                                icon={MapPin} 
                                color="bg-emerald-600" 
                            />
                            <TimingBlock 
                                label={lang === 'ar' ? "السنة" : "Year"} 
                                value={timingStats.year} 
                                icon={Calendar} 
                                color="bg-teal-600" 
                            />
                        </div>
                    </div>
                </div>

                {/* AI STRATEGIC REPORT */}
                {useAi && (
                    <div className="relative animate-slide-in">
                        {isAiJobRunning ? (
                            <div className="relative overflow-hidden p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] border border-purple-500/20 flex flex-col items-center justify-center text-center animate-pulse bg-[#0a0c0b]/50">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 border border-purple-500/30">
                                    <Brain size={32} className="text-purple-500 animate-spin-slow" />
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-white mb-2">{lang === 'ar' ? 'جاري تحليل سلوك الجمهور...' : 'Analyzing Audience Behavior...'}</h3>
                                <p className="text-slate-500 text-xs md:text-sm max-w-md">{lang === 'ar' ? 'نحن نقارن وقت النشر بأنماط حياة الجمهور في الدولة المستهدفة.' : 'Comparing publish time against lifestyle patterns in the target region.'}</p>
                            </div>
                        ) : aiAnalysis ? (
                            <div className="relative overflow-hidden p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-purple-500/30 bg-[#0a0c0b]/50">
                                <div className="absolute top-0 right-0 p-6 opacity-20"><Brain size={64} className="text-purple-500"/></div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                                    {/* Score */}
                                    <div className="flex flex-col justify-center items-center text-center border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-6">
                                        <div className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Sparkles size={14}/> {lang === 'ar' ? 'درجة التوقيت' : 'Timing Score'}
                                        </div>
                                        <div className="text-4xl md:text-6xl font-black text-white mb-2">{aiAnalysis.timing_score}/100</div>
                                        <div className={`px-4 py-1 rounded-full text-[10px] md:text-xs font-bold ${aiAnalysis.timing_score > 70 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {aiAnalysis.verdict}
                                        </div>
                                    </div>

                                    {/* Psychology */}
                                    <div className="flex flex-col justify-center gap-4">
                                        <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                            <Brain size={14}/> {lang === 'ar' ? 'الحالة النفسية للجمهور' : 'Audience Psychology'}
                                        </div>
                                        <p className="text-white text-base md:text-lg font-medium leading-relaxed">
                                            "{aiAnalysis.audience_psychology}"
                                        </p>
                                    </div>

                                    {/* Action */}
                                    <div className="bg-[#0a0c0b]/80 p-5 md:p-6 rounded-2xl border border-white/5 flex flex-col justify-center">
                                        <div className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Target size={14}/> {lang === 'ar' ? 'التوصية الذهبية' : 'Golden Recommendation'}
                                        </div>
                                        <p className="text-slate-300 text-xs md:text-sm italic leading-relaxed">
                                            {aiAnalysis.better_time_suggestion}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}

                {/* World Comparison Table Section */}
                <div className="relative overflow-hidden p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 bg-[#0a0c0b]/50">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div className="flex items-center gap-3">
                            <Languages className="text-emerald-500" size={24} md:size={28} />
                            <h3 className="text-lg md:text-xl font-black text-white">{lang === 'ar' ? 'مقارنة التوقيت العالمي (بالدولة)' : 'World Time Comparison (by Country)'}</h3>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className={`${lang === 'ar' ? 'right-3' : 'left-3'} absolute top-1/2 -translate-y-1/2 text-slate-500`} size={16} />
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={lang === 'ar' ? 'ابحث عن دولة (مثلاً: مصر، العراق)...' : 'Search country (e.g., USA, UK)...'}
                                className={`w-full bg-white/5 border border-white/10 rounded-xl py-2 ${lang === 'ar' ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} text-sm text-white focus:outline-none focus:border-emerald-500 transition-all`}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                        {filteredCountries.map((country) => (
                            <div key={country.code} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                                <div className={`min-w-0 ${lang === 'ar' ? 'text-right order-2' : 'text-left'}`}>
                                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-tighter mb-0.5">{country.code}</div>
                                    <div className="text-white font-bold text-sm truncate">{country.name}</div>
                                </div>
                                <div className={`shrink-0 ${lang === 'ar' ? 'order-1 text-left' : 'text-right'}`}>
                                    <div className="text-emerald-400 font-mono text-xs font-bold">{getComparisonTime(country.tz)}</div>
                                </div>
                            </div>
                        ))}
                        {filteredCountries.length === 0 && (
                            <div className="col-span-full py-10 text-center text-gray-600">
                                <Globe size={40} className="mx-auto mb-2 opacity-20" />
                                <p>{lang === 'ar' ? 'لم يتم العثور على نتائج للدولة المطلوبة' : 'No results found for that country'}</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        )}
    </motion.div>
  );
};

export default VideoTimingInsight;
