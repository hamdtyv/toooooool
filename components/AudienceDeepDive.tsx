
import React, { useState, useEffect } from 'react';
import { useLang } from '../index';
import { motion } from 'motion/react';
import { 
    Users, UserPlus, Heart, PlayCircle, Youtube, Zap, Radio, 
    Monitor, Smartphone, Tv, Globe, Clock, Search, Loader2, 
    MapPin, Brain, Sparkles, Fingerprint, ScanFace, Target, ArrowRight, AlertCircle, ChevronDown
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { saveToStorage, loadFromStorage, StorageKeys } from '../services/storageService';
import { fetchChannelData } from '../services/youtubeService';
import { useAppState } from '../contexts/AppStateContext';
import { useJobs } from '../contexts/JobContext';
import { extractId, formatNumber } from '../utils';
import Tooltip from './Tooltip';
import { ChannelData } from '../types';
import { logToolActivity } from '../services/firebase';

const AudienceDeepDive: React.FC = () => {
  const { t, lang, resultLang } = useLang();
  const { addToArchive } = useAppState();
  const location = useLocation();
  const { jobs, startJob } = useJobs();
  
  const [input, setInput] = useState('');
  
  // Data States
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [persona, setPersona] = useState<any>(null);
  const [showSelfDev, setShowSelfDev] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [useAi, setUseAi] = useState(false); // Toggle
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 1. Load Data Strategy (Cache -> URL -> Fresh)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    
    if (q) {
      const { id } = extractId(q);
      setInput(q);
      
      // Load Cached Channel
      const cachedChannel = loadFromStorage<ChannelData>(StorageKeys.CHANNEL_DATA(id));
      if (cachedChannel) {
          setChannelData(cachedChannel);
          saveToStorage(StorageKeys.LAST_VIEWED_AUDIENCE, id);
          
          // Restore AI state if exists
          const cachedPersona = loadFromStorage<any>(StorageKeys.AUDIENCE(id));
          if (cachedPersona) {
              setPersona(cachedPersona);
              setUseAi(true);
          }
      } else {
          // If no cache, trigger fetch
          handleAnalyze(null, q, true);
      }
    } else {
      const lastId = loadFromStorage<string>(StorageKeys.LAST_VIEWED_AUDIENCE);
      if (lastId) {
          setInput(lastId);
          const cachedChannel = loadFromStorage<ChannelData>(StorageKeys.CHANNEL_DATA(lastId));
          if (cachedChannel) {
              setChannelData(cachedChannel);
              const cachedPersona = loadFromStorage<any>(StorageKeys.AUDIENCE(lastId));
              if (cachedPersona) {
                  setPersona(cachedPersona);
                  setUseAi(true);
              }
          }
      }
    }
  }, [location.search]);

  // 2. Sync with Background Job (AI Persistence)
  useEffect(() => {
      const job = jobs.audience;
      
      // Check if job matches current channel
      if (channelData && job.currentId === channelData.id) {
          // Success Case
          if (job.status === 'success') {
              if (job.result) {
                  setPersona(job.result);
                  setIsAiLoading(false);
                  setUseAi(true); // Ensure UI reflects success
                  
                  // Save discrete snapshot to Strategic Archive
                  addToArchive({
                      type: 'audience',
                      title: channelData.snippet.title,
                      payload: {
                          channelId: channelData.id,
                          persona: job.result
                      }
                  });
              } else {
                  // Fallback to storage if job cleared but data exists
                  const cachedPersona = loadFromStorage<any>(StorageKeys.AUDIENCE(channelData.id));
                  if (cachedPersona) {
                      setPersona(cachedPersona);
                      setUseAi(true);
                      setIsAiLoading(false);
                  }
              }
          }
          // Loading Case
          else if (job.status === 'loading') {
              setIsAiLoading(true);
              setUseAi(true);
          }
      } 
  }, [jobs.audience.status, jobs.audience.currentId, channelData]);

  useEffect(() => {
    if (jobs.audience.status === 'loading') {
        const stepTimer = setInterval(() => {
            setLoadingStep(prev => (prev + 1) % 5);
        }, 2500);
        return () => clearInterval(stepTimer);
    } else {
        setLoadingStep(0);
    }
  }, [jobs.audience.status]);

  // 3. Main Analysis Handler
  const handleAnalyze = async (e: React.FormEvent | null, overrideInput?: string, isInitialLoad = false) => {
    if (e) e.preventDefault();
    const val = overrideInput || input;
    if (!val) return;
    
    // Reset States for new search
    if (!isInitialLoad) {
        setPersona(null);
        setChannelData(null);
        setIsAiLoading(false);
    }

    setLoading(true);
    
    try {
        const { id } = extractId(val);
        const targetId = id || val;
        
        // A. Fetch Channel Data (API)
        const channel = await fetchChannelData(targetId);
        
        if (channel) {
            setChannelData(channel);
            saveToStorage(StorageKeys.CHANNEL_DATA(channel.id), channel);
            saveToStorage(StorageKeys.LAST_VIEWED_AUDIENCE, channel.id);

            await logToolActivity('audience_deep_dive', t.audienceDeepDive, 'analyzed_audience', {
                channelId: channel.id,
                title: channel.snippet.title,
                subsCount: channel.statistics.subscriberCount
            }, lang === 'ar' ? `تحليل عميق لجمهور قناة: ${channel.snippet.title.substring(0, 30)}...` : `Deep audience analysis for: ${channel.snippet.title.substring(0, 30)}...`);

            // B. Check for existing AI Cache
            const cachedPersona = loadFromStorage<any>(StorageKeys.AUDIENCE(channel.id));
            if (cachedPersona) {
                setPersona(cachedPersona);
                setUseAi(true);
            } 
            // C. Trigger AI if Toggle is ON
            else if (useAi) {
                triggerAiJob(channel.id);
            }
        }
    } catch (e) {
        console.error("Analysis Failed", e);
    } finally {
        setLoading(false);
    }
  };

  const triggerAiJob = async (id: string) => {
      setIsAiLoading(true);
      await startJob('audience', id, lang, resultLang);
  };

  const handleToggleAi = () => {
      const newState = !useAi;
      setUseAi(newState);
      
      // If toggling ON and we already have channel data but no persona, start job
      if (newState && channelData && !persona) {
          triggerAiJob(channelData.id);
      }
  };

  const SegmentBar = ({ label, value, color, icon: Icon }: any) => (
      <div className="mb-4 group">
          <div className="flex justify-between items-center mb-1 text-sm">
              <div className="flex items-center gap-2 text-gray-300 group-hover:text-white transition-colors">
                  <Icon size={14} className={color.replace('bg-', 'text-')} />
                  {label}
              </div>
              <span className="font-bold text-white font-mono">{value}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
              <div className={`h-full ${color} shadow-[0_0_10px_currentColor] transition-all duration-1000 ease-out`} style={{ width: `${value}%` }}></div>
          </div>
      </div>
  );

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
              <Users size={14} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{t.audienceDeepDive}</span>
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-sm">
               {isAr ? 'تحليل ومحاكاة جمهور القناة (DNA)' : 'Audience DNA Deep Dive'}
            </h2>
            <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed">
               {t.aud_desc}
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
                        className={`w-full md:flex-1 bg-transparent border-none py-3 md:py-4 px-4 md:px-6 text-white text-base md:text-lg focus:outline-none placeholder-gray-600 font-medium ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    />
                    
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
                            {lang === 'ar' ? 'تفعيل الذكاء الاصطناعي' : 'Enable AI Analysis'}
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

        {/* Results Area */}
        {channelData && (
            <div className="animate-slide-in space-y-12">
                
                {/* 1. Channel Identity Header - Rebounded to ChannelAnalytics overlapping structure */}
                <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0a0c0b]/50">
                    <div className="aspect-[4/1] w-full bg-slate-900 overflow-hidden relative border-b border-white/5">
                        <div className="w-full h-full bg-gradient-to-br from-emerald-900/40 via-emerald-950/20 to-black relative">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent"></div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 -mt-16 md:-mt-20 relative flex flex-col md:flex-row items-center md:items-end gap-8">
                        <div className="relative group shrink-0">
                            <img src={channelData.snippet.thumbnails.medium.url} className="w-24 h-24 md:w-36 md:h-36 rounded-full border-[6px] border-[#0a0c0b] shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-105" alt="Avatar"/>
                            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl group-hover:bg-emerald-500/40 transition-colors pointer-events-none"></div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center gap-2 mb-3 justify-center md:justify-start">
                                <h1 className="text-2xl md:text-4xl font-black text-white leading-tight drop-shadow-md">{channelData.snippet.title}</h1>
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase rounded-full border border-emerald-500/20">DNA_SYNC</span>
                            </div>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-slate-500 text-[11px] font-medium tracking-wide uppercase">
                                <span className="text-emerald-400 font-bold">{channelData.snippet.customUrl || 'Channel handle'}</span>
                                <span className="opacity-20 text-white">|</span>
                                <span>{channelData.snippet.country || 'Global'}</span>
                            </div>
                        </div>

                        <div className="flex gap-10 md:gap-14 border-t md:border-t-0 md:border-l border-white/5 pt-8 md:pt-0 md:pl-12 w-full md:w-auto justify-center">
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl font-black tracking-tight text-white mb-1">{formatNumber(channelData.statistics.subscriberCount)}</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t.subscribers}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl font-black tracking-tight text-white mb-1">{formatNumber(channelData.statistics.videoCount)}</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t.views}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. AI PSYCHOGRAPHIC REPORT */}
                {useAi && (
                    <div className="relative">
                        {isAiLoading ? (
                            <div className="glass-panel p-8 md:p-12 rounded-2xl md:rounded-[2.5rem] border border-emerald-500/20 flex flex-col items-center justify-center text-center animate-pulse bg-emerald-500/5">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                                    <ScanFace size={32} className="text-emerald-500 animate-spin-slow" />
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-white mb-2">{lang === 'ar' ? 'جاري استنساخ شخصية المشاهد...' : 'Synthesizing Audience Persona...'}</h3>
                                <p className="text-gray-500 text-[10px] md:text-sm max-w-md uppercase tracking-widest font-mono">
                                    {lang === 'ar' ? [
                                        'تحليل الأنماط السلوكية...',
                                        'استخراج البيانات النفسية...',
                                        'محاكاة الاهتمامات...',
                                        'تحديد الفجوات الثقافية...',
                                        'بناء ملف الـ DNA...'
                                    ][loadingStep] : [
                                        'Analyzing Behavioral Patterns...',
                                        'Extracting Psychographics...',
                                        'Simulating Interests...',
                                        'Identifying Cultural Gaps...',
                                        'Constructing DNA Profile...'
                                    ][loadingStep]}
                                </p>
                            </div>
                        ) : persona ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                                
                                {/* A. THE AVATAR CARD */}
                                <div className="glass-panel p-0 rounded-2xl md:rounded-[2.5rem] border border-emerald-500/30 bg-[#0d0d15] overflow-hidden relative flex flex-col shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                                    <div className="h-24 md:h-32 bg-gradient-to-br from-emerald-600 to-green-700 relative">
                                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 p-1 bg-[#0d0d15] rounded-full">
                                            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-800 rounded-full flex items-center justify-center border-4 border-emerald-500 shadow-xl">
                                                <ScanFace size={32} className="text-emerald-300 md:hidden" />
                                                <ScanFace size={40} className="text-emerald-300 hidden md:block" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-12 pb-8 px-6 text-center flex-1">
                                        <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-2 border border-emerald-500/20">
                                            {t.predictedAudience}
                                        </div>
                                        <h3 className="text-lg md:text-2xl font-black text-white mb-4">
                                            {persona.demographics?.age ? Object.keys(persona.demographics.age)[0] : '25-34'} • {persona.demographics?.gender?.male > persona.demographics?.gender?.female ? t.male : t.female}
                                        </h3>
                                        
                                        <div className="space-y-3 text-start mt-6">
                                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                                <div className="flex items-center gap-2 text-[10px] text-yellow-500 font-bold uppercase mb-2">
                                                    <Zap size={14}/> {lang === 'ar' ? 'الدافع (Motivation)' : 'Motivation'}
                                                </div>
                                                <p className="text-gray-300 text-[11px] md:text-sm leading-relaxed">{persona.growthDrivers?.[0]}</p>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                                <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold uppercase mb-2">
                                                    <Target size={14}/> {lang === 'ar' ? 'الاهتمام (Interest)' : 'Core Interest'}
                                                </div>
                                                <p className="text-gray-300 text-[11px] md:text-sm leading-relaxed">{persona.contentPreferences?.loyal?.[0]}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SELF DEVELOPMENT PROTOCOL */}
                                {persona.self_development && (
                                    <div className="glass-panel overflow-hidden rounded-2xl md:rounded-[2rem] border border-purple-500/20 bg-purple-500/5 lg:col-span-2">
                                        <button 
                                            onClick={() => setShowSelfDev(!showSelfDev)}
                                            className="w-full flex items-center justify-between p-4 md:p-6 text-left hover:bg-purple-500/10 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div className="p-2 md:p-3 bg-purple-500/20 rounded-xl md:rounded-2xl text-purple-400">
                                                    <Brain size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-[10px] md:text-sm font-black text-purple-400 uppercase tracking-[0.1em] md:tracking-[0.2em]">
                                                        {lang === 'ar' ? 'بروتوكول التطوير الذاتي (مستوى الخبراء)' : 'SELF-DEVELOPMENT PROTOCOL (EXPERT LEVEL)'}
                                                    </h3>
                                                    <p className="text-[8px] md:text-[10px] text-purple-500/60 font-bold uppercase mt-1">
                                                        {lang === 'ar' ? 'تحليل سيكولوجية الجماهير المتقدم' : 'ADVANCED AUDIENCE PSYCHOLOGY ANALYSIS'}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronDown size={20} className={`text-purple-500 transition-transform duration-500 ${showSelfDev ? 'rotate-180' : ''}`} />
                                        </button>
                                        {showSelfDev && (
                                            <div className="p-4 md:p-8 pt-0 text-gray-300 text-sm md:text-lg leading-relaxed border-t border-purple-500/10 animate-slide-in font-medium">
                                                <div className="bg-black/40 p-4 md:p-6 rounded-2xl border border-purple-500/10 italic text-xs md:text-base">
                                                    {persona.self_development}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* B. DATA GRIDS */}
                                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Segments */}
                                    <div className="glass-panel p-5 md:p-6 rounded-2xl md:rounded-[2rem] border border-white/5 bg-white/5">
                                        <h3 className="text-sm md:text-lg font-bold mb-6 flex items-center gap-2 text-white">
                                            <Fingerprint className="text-blue-500"/> {t.aud_segments}
                                        </h3>
                                        <div className="space-y-4">
                                            <SegmentBar label={t.aud_new} value={persona.segments?.new || 0} color="bg-blue-500" icon={UserPlus} />
                                            <SegmentBar label={t.aud_casual} value={persona.segments?.casual || 0} color="bg-gray-500" icon={Users} />
                                            <SegmentBar label={t.aud_loyal} value={persona.segments?.loyal || 0} color="bg-purple-500" icon={Heart} />
                                        </div>
                                    </div>

                                    {/* Formats & Devices */}
                                    <div className="glass-panel p-5 md:p-6 rounded-2xl md:rounded-[2rem] border border-white/5 bg-white/5 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-sm md:text-lg font-bold mb-4 flex items-center gap-2 text-white">
                                                <PlayCircle className="text-red-500"/> {t.aud_formats}
                                            </h3>
                                            <div className="flex gap-2 mb-6">
                                                <div className="flex-1 bg-red-500/10 p-2 rounded-xl text-center border border-red-500/20">
                                                    <div className="text-[10px] text-red-400 font-bold">Videos</div>
                                                    <div className="text-sm md:text-lg font-black text-white">{persona.formats?.videos}%</div>
                                                </div>
                                                <div className="flex-1 bg-red-500/10 p-2 rounded-xl text-center border border-red-500/20">
                                                    <div className="text-[10px] text-red-400 font-bold">Shorts</div>
                                                    <div className="text-sm md:text-lg font-black text-white">{persona.formats?.shorts}%</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-sm md:text-lg font-bold mb-4 flex items-center gap-2 text-white">
                                                <Monitor className="text-green-500"/> {t.aud_devices}
                                            </h3>
                                            <div className="flex justify-around items-end h-20 gap-2">
                                                {persona.devices && Object.entries(persona.devices).map(([dev, val]: any) => (
                                                    <div key={dev} className="flex flex-col items-center gap-1 w-1/3 group">
                                                        <div className="text-[8px] md:text-[10px] font-bold text-white mb-1 group-hover:-translate-y-1 transition-transform">{val}%</div>
                                                        <div className="w-full bg-white/10 rounded-t-md relative overflow-hidden h-full flex items-end">
                                                            <div className="w-full bg-green-500 opacity-80 group-hover:opacity-100 transition-opacity" style={{height: `${val}%`}}></div>
                                                        </div>
                                                        <div className="text-[8px] md:text-[10px] text-gray-500 uppercase">{dev}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Geography */}
                                    <div className="glass-panel p-5 md:p-6 rounded-2xl md:rounded-[2rem] border border-white/5 bg-white/5 md:col-span-2">
                                        <h3 className="text-sm md:text-lg font-bold mb-4 flex items-center gap-2 text-white">
                                            <Globe className="text-blue-400"/> {t.aud_geo}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 md:gap-3">
                                            {persona.geography?.map((geo: any, i: number) => (
                                                <div key={i} className="flex items-center gap-2 bg-black/40 px-3 md:px-4 py-2 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors">
                                                    <MapPin size={14} className="text-blue-500"/>
                                                    <span className="text-[10px] md:text-sm font-bold text-white">{geo.country}</span>
                                                    <span className="text-[9px] md:text-xs text-gray-500 font-mono ml-2 border-l border-white/10 pl-2">{geo.percent}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                     {/* Habits & Watch */}
                                    <div className="glass-panel p-5 md:p-6 rounded-2xl md:rounded-[2rem] border border-white/5 bg-white/5 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-[10px] md:text-sm font-bold mb-3 flex items-center gap-2 text-yellow-500 uppercase tracking-wider">
                                                <Clock size={16}/> {t.aud_online}
                                            </h3>
                                            <p className="text-[11px] md:text-sm text-gray-300 leading-relaxed bg-yellow-500/5 p-3 rounded-xl border border-yellow-500/10">
                                                {persona.onlineActivity}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="text-[10px] md:text-sm font-bold mb-3 flex items-center gap-2 text-purple-500 uppercase tracking-wider">
                                                <Search size={16}/> {t.aud_also_watch}
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {persona.otherChannels?.map((c: string, i: number) => (
                                                    <span key={i} className="bg-purple-500/10 text-purple-300 px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-1 border border-purple-500/20">
                                                        <Youtube size={10}/> {c}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* NEW: Psychographic & Pain Points */}
                                    {persona.psychographic_profile && (
                                        <div className="glass-panel p-5 md:p-6 rounded-2xl md:rounded-[2rem] border border-emerald-500/10 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 bg-emerald-950/5">
                                            <div className="md:col-span-2">
                                                <h3 className="text-[10px] md:text-sm font-bold mb-3 flex items-center gap-2 text-emerald-400 uppercase tracking-wider">
                                                    <Brain size={16}/> {lang === 'ar' ? 'الملف النفسي العميق' : 'Deep Psychographic Profile'}
                                                </h3>
                                                <p className="text-[11px] md:text-sm text-gray-300 leading-relaxed">
                                                    {persona.psychographic_profile}
                                                </p>
                                            </div>
                                            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                                <h3 className="text-[10px] font-bold mb-3 text-red-400 uppercase tracking-widest flex items-center gap-2">
                                                    <AlertCircle size={14}/> {lang === 'ar' ? 'نقاط الألم' : 'Pain Points'}
                                                </h3>
                                                <ul className="space-y-2">
                                                    {persona.pain_points?.map((point: string, i: number) => (
                                                        <li key={i} className="text-[10px] md:text-xs text-gray-400 flex items-start gap-2">
                                                            <span className="w-1 h-1 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                                                            {point}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="mt-4 pt-4 border-t border-white/5">
                                                    <div className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase mb-1">{lang === 'ar' ? 'نية الشراء' : 'Buying Intent'}</div>
                                                    <div className={`text-xs md:text-sm font-black ${persona.buying_intent === 'High' || persona.buying_intent === 'عالية' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                                        {persona.buying_intent}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        )}
    </motion.div>
  );
};

export default AudienceDeepDive;
