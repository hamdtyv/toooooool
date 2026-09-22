import React, { useState, useEffect } from 'react';
import { useLang } from '../index';
import { motion } from 'motion/react';
import { fetchChannelData, fetchYoutubeData } from '../services/youtubeService';
import { extractId, formatNumber } from '../utils';
import { calculateWinProbability } from '../services/algoService';
import { Swords, Target, Shield, Loader2, BarChart2, AlertCircle, TrendingUp, Skull, Crosshair, Users, Activity, Eye, Zap, Lock, Gem, Sparkles, Brain, CheckCircle, Search, TrendingDown, DollarSign, BarChart, Anchor, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { saveToStorage, loadFromStorage, StorageKeys } from '../services/storageService';
import { ChannelData } from '../types';
import { useJobs } from '../contexts/JobContext';
import { logToolActivity } from '../services/firebase';
import Tooltip from './Tooltip';

interface AdvancedStats {
    engagementRate: number;
    avgViews: number;
    frequency: string;
    velocityScore: number;
}

const CompetitorAnalysis: React.FC = () => {
  const { t, lang, resultLang } = useLang();
  const location = useLocation();
  const { jobs, startJob } = useJobs();
  
  const [competitorInput, setCompetitorInput] = useState('');
  const [competitorData, setCompetitorData] = useState<ChannelData | null>(null);
  const [competitorStats, setCompetitorStats] = useState<AdvancedStats | null>(null);
  
  // Use stored "My Channel" if available for comparison
  const [myData, setMyData] = useState<ChannelData | null>(null);
  const [myStats, setMyStats] = useState<AdvancedStats | null>(null);
  
  // AI & Job States
  const [useAi, setUseAi] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [showSelfDev, setShowSelfDev] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [winProb, setWinProb] = useState<number>(50);

  // 1. Load My Channel Context on Mount
  useEffect(() => {
      const cachedMyId = loadFromStorage<string>(StorageKeys.LAST_VIEWED_CHANNEL);
      if (cachedMyId) {
          const cachedCh = loadFromStorage<ChannelData>(StorageKeys.CHANNEL_DATA(cachedMyId));
          if (cachedCh) {
              setMyData(cachedCh);
              calculateAdvancedStats(cachedCh).then(setMyStats);
          }
      }
  }, []);

  // 2. Restore Competitor Data (Background Persistence)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    
    if (q) {
        setCompetitorInput(q);
        handleAnalyze(null, q, true);
    } else {
        const lastCompId = loadFromStorage<string>(StorageKeys.LAST_VIEWED_COMPETITOR);
        if (lastCompId) {
            setCompetitorInput(lastCompId);
            handleAnalyze(null, lastCompId, true);
        }
    }
  }, [location.search]);

  // 3. Sync with Background AI Job
  useEffect(() => {
      const job = jobs.competitor;
      
      if (competitorData && job.currentId === competitorData.id) {
          if (job.status === 'success') {
              const report = loadFromStorage<any>(StorageKeys.COMPETITOR(competitorData.id));
              if (report) {
                  setAiReport(report);
                  setIsAiLoading(false);
                  setUseAi(true);
              }
          } 
          else if (job.status === 'loading') {
              setIsAiLoading(true);
              setUseAi(true);
          }
      }
  }, [jobs.competitor.status, jobs.competitor.currentId, competitorData]);

  useEffect(() => {
    if (jobs.competitor.status === 'loading') {
        const stepTimer = setInterval(() => {
            setLoadingStep(prev => (prev + 1) % 5);
        }, 2500);
        return () => clearInterval(stepTimer);
    } else {
        setLoadingStep(0);
    }
  }, [jobs.competitor.status]);

  const calculateAdvancedStats = async (channel: ChannelData): Promise<AdvancedStats> => {
      try {
          const playlistId = channel.contentDetails?.relatedPlaylists?.uploads || channel.id.replace('UC', 'UU');
          const data = await fetchYoutubeData('playlistItems', `part=snippet&playlistId=${playlistId}&maxResults=15`);
          
          if (!data || !data.items) return { engagementRate: 0, avgViews: 0, frequency: 'Unknown', velocityScore: 0 };

          const videoIds = data.items.map((i: any) => i.snippet.resourceId.videoId).join(',');
          const statsData = await fetchYoutubeData('videos', `part=statistics&id=${videoIds}`);
          
          let totalEng = 0;
          let totalViews = 0;
          let count = 0;

          if (statsData && statsData.items) {
              statsData.items.forEach((v: any) => {
                  const views = parseInt(v.statistics.viewCount) || 0;
                  const likes = parseInt(v.statistics.likeCount) || 0;
                  const comments = parseInt(v.statistics.commentCount) || 0;
                  
                  if (views > 0) {
                      totalEng += ((likes + comments) / views);
                      totalViews += views;
                      count++;
                  }
              });
          }

          const subCount = parseInt(channel.statistics.subscriberCount);
          const velocityScore = count > 0 ? (totalViews / count) / Math.max(1, subCount) * 100 : 0;

          return {
              engagementRate: count > 0 ? (totalEng / count) * 100 : 0,
              avgViews: count > 0 ? Math.floor(totalViews / count) : 0,
              frequency: 'Weekly', 
              velocityScore
          };
      } catch (e) {
          return { engagementRate: 0, avgViews: 0, frequency: 'Unknown', velocityScore: 0 };
      }
  };

  const handleAnalyze = async (e: React.FormEvent | null, overrideInput?: string, isInitialLoad = false) => {
      if (e) e.preventDefault();
      const val = overrideInput || competitorInput;
      if (!val) return;

      if (!isInitialLoad) {
          setLoading(true);
          setAiReport(null);
      }
      
      const { id } = extractId(val);
      const targetId = id || val;
      
      const compData = await fetchChannelData(targetId);
      if (compData) {
          setCompetitorData(compData);
          saveToStorage(StorageKeys.LAST_VIEWED_COMPETITOR, compData.id);
          
          const stats = await calculateAdvancedStats(compData);
          setCompetitorStats(stats);

          await logToolActivity('competitor_analysis', t.competitorAnalysis, 'analyzed_competitors', {
              competitorId: compData.id,
              title: compData.snippet.title,
              subsCount: compData.statistics.subscriberCount
          }, lang === 'ar' ? `تحليل المنافس: ${compData.snippet.title.substring(0, 30)}...` : `Analyzed competitor: ${compData.snippet.title.substring(0, 30)}...`);

          if (myData && myStats) {
              const prob = calculateWinProbability(
                  { views: parseInt(myData.statistics.viewCount), subs: parseInt(myData.statistics.subscriberCount), videos: parseInt(myData.statistics.videoCount) },
                  { views: parseInt(compData.statistics.viewCount), subs: parseInt(compData.statistics.subscriberCount), videos: parseInt(compData.statistics.videoCount) }
              );
              setWinProb(prob);
          }

          const cachedReport = loadFromStorage<any>(StorageKeys.COMPETITOR(compData.id));
          if (cachedReport) {
              setAiReport(cachedReport);
              setUseAi(true);
          }
          else if (useAi) {
              triggerAiJob(compData);
          }
      } 
      setLoading(false);
  };

  const triggerAiJob = async (channel: ChannelData) => {
      setIsAiLoading(true);
      const niche = myData ? myData.snippet.title : "General"; 
      await startJob('competitor', channel.id, lang, resultLang, { myNiche: niche });
  };

  const handleToggleAi = () => {
      const newState = !useAi;
      setUseAi(newState);
      
      if (newState && competitorData && !aiReport) {
          triggerAiJob(competitorData);
      }
  };

  const StatBar = ({ label, value1, value2, color }: any) => {
      const total = value1 + value2;
      const p1 = total > 0 ? (value1 / total) * 100 : 50;
      const p2 = 100 - p1;
      
      return (
          <div className="mb-4">
              <div className="flex justify-between text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">
                  <span>{label}</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-black/50 border border-white/5">
                  <div className={`h-full transition-all duration-1000 ${color} shadow-[0_0_10px_currentColor]`} style={{ width: `${p1}%` }}></div>
                  <div className="h-full bg-gray-800 transition-all duration-1000" style={{ width: `${p2}%` }}></div>
              </div>
              <div className="flex justify-between text-xs font-mono mt-1 text-white">
                  <span>{formatNumber(value1)}</span>
                  <span>{formatNumber(value2)}</span>
              </div>
          </div>
      );
  };

  const isAr = lang === 'ar';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto px-4 py-12 font-sans"
    >
       
       {/* 1. BRANDED HEADER (Emerald Identity) */}
       <div className="mb-16 text-center md:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 mb-4"
            >
              <Swords size={14} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{t.competitorAnalysis}</span>
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-sm">
               {isAr ? 'فحص وتحليل المنافسين' : 'Competitor Tactical Analysis'}
            </h2>
            <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed">
               {isAr 
                ? 'فحص استخباراتي لنقاط القوة والضعف للمنافسين ومقارنتها بقناتك لبناء أفضل خريطة استيلاء على الكلمات والمشاهدات.'
                : 'Dismantle competitor structures, analyze strategy gaps, and identify execution tactics compared with your channel.'}
            </p>
       </div>

       {/* 2. TARGET ACQUISITION (Standardized Emerald Input) */}
       <div className="max-w-3xl mx-auto mb-16 relative z-20">
         <form onSubmit={e => handleAnalyze(e)} className="relative group">
             <div className="relative flex flex-col md:flex-row items-center bg-[#050a08]/40 border border-white/10 rounded-2xl p-1.5 transition-all duration-300 focus-within:border-emerald-500/50 focus-within:bg-[#050a08]/60">
                 <input 
                     type="text" 
                     value={competitorInput}
                     onChange={(e) => setCompetitorInput(e.target.value)}
                     placeholder={lang === 'ar' ? "رابط قناة المنافس (الهدف)..." : "Target Competitor URL..."}
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

             {/* AI Toggle Switch */}
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

      {competitorData && competitorStats && (
          <div className="animate-slide-in space-y-12 px-4 md:px-0">
              
              {/* 3. HEAD-TO-HEAD DISPLAY */}
              <div className="grid grid-cols-1 md:grid-cols-7 gap-6 items-center">
                  
                  {/* LEFT: MY BASE */}
                  <div className="md:col-span-3 glass-panel p-5 md:p-6 rounded-3xl md:rounded-[2.5rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-900/10 to-transparent flex flex-col items-center text-center relative overflow-hidden">
                      {myData ? (
                          <>
                              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-emerald-500 shadow-[0_0_20px_#10b981] mb-4 overflow-hidden">
                                  <img src={myData.snippet.thumbnails.medium.url} className="w-full h-full object-cover"/>
                              </div>
                              <h3 className="text-lg md:text-xl font-black text-white">{myData.snippet.title}</h3>
                              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1">{lang === 'ar' ? 'قناتك' : 'Your Channel'}</div>
                          </>
                      ) : (
                          <div className="flex flex-col items-center opacity-50">
                              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10"><Users size={32}/></div>
                              <div className="text-xs text-gray-400">{lang === 'ar' ? 'بياناتك غير محملة' : 'Your Data Missing'}</div>
                              <div className="text-[8px] text-gray-600">Run Channel Audit first</div>
                          </div>
                      )}
                  </div>

                  {/* CENTER: VS & PROBABILITY */}
                  <div className="md:col-span-1 flex flex-col items-center justify-center relative py-4 md:py-0">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-[0_0_30px_#10b981] z-10 border-4 border-[#020403]">VS</div>
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/30 to-red-500/30 -z-0 hidden md:block"></div>
                      
                      {/* Win Probability Badge */}
                      {myData && (
                          <div className="mt-4 md:mt-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-center">
                              <div className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase">{lang === 'ar' ? 'احتمالية الفوز' : 'Win Chance'}</div>
                              <div className={`text-xl md:text-2xl font-black ${winProb > 50 ? 'text-green-400' : 'text-red-400'}`}>{winProb}%</div>
                          </div>
                      )}
                  </div>

                  {/* RIGHT: ENEMY BASE */}
                  <div className="md:col-span-3 glass-panel p-5 md:p-6 rounded-3xl md:rounded-[2.5rem] border border-red-500/20 bg-gradient-to-br from-red-900/10 to-transparent flex flex-col items-center text-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10"><Target size={80} className="text-red-500"/></div>
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-red-500 shadow-[0_0_20px_red] mb-4 overflow-hidden">
                          <img src={competitorData.snippet.thumbnails.medium.url} className="w-full h-full object-cover"/>
                      </div>
                      <h3 className="text-lg md:text-xl font-black text-white">{competitorData.snippet.title}</h3>
                      <div className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-1">{lang === 'ar' ? 'المنافس' : 'Competitor'}</div>
                  </div>
              </div>

              {/* 4. TACTICAL METRICS */}
              {myData && myStats && (
                  <div className="glass-panel p-5 md:p-8 rounded-3xl md:rounded-[2rem] border border-white/5 bg-[#0a0a0a]">
                      <h4 className="text-center text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-[0.1em] md:tracking-[0.2em] mb-6 md:mb-8">{lang === 'ar' ? 'مصفوفة المقارنة المباشرة' : 'DIRECT COMPARISON MATRIX'}</h4>
                      <div className="max-w-3xl mx-auto space-y-6">
                          <StatBar label={lang === 'ar' ? 'المشتركين (الجيش)' : 'Subscribers (Army Size)'} value1={parseInt(myData.statistics.subscriberCount)} value2={parseInt(competitorData.statistics.subscriberCount)} color="bg-emerald-500" />
                          <StatBar label={lang === 'ar' ? 'متوسط المشاهدات (القوة النارية)' : 'Avg Views (Firepower)'} value1={myStats.avgViews} value2={competitorStats.avgViews} color="bg-blue-500" />
                          <StatBar label={lang === 'ar' ? 'معدل التفاعل (الولاء)' : 'Engagement Rate (Loyalty)'} value1={myStats.engagementRate} value2={competitorStats.engagementRate} color="bg-purple-500" />
                          <StatBar label={lang === 'ar' ? 'إجمالي الفيديوهات (الخبرة)' : 'Total Videos (XP)'} value1={parseInt(myData.statistics.videoCount)} value2={parseInt(competitorData.statistics.videoCount)} color="bg-yellow-500" />
                      </div>
                  </div>
              )}

              {/* 5. AI SPY REPORT */}
              {useAi && (
                  <div className="relative animate-slide-in">
                      {isAiLoading ? (
                          <div className="glass-panel p-8 md:p-12 rounded-3xl md:rounded-[2.5rem] border border-purple-500/20 flex flex-col items-center justify-center text-center animate-pulse">
                              <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 border border-purple-500/30">
                                  <Brain size={32} className="text-purple-500 animate-spin-slow" />
                              </div>
                              <h3 className="text-lg md:text-xl font-bold text-white mb-2">{lang === 'ar' ? 'جاري اختراق البيانات وتحليل الاستراتيجية...' : 'Infiltrating Data & Analyzing Strategy...'}</h3>
                              <p className="text-gray-500 text-[10px] md:text-sm max-w-md uppercase tracking-widest font-mono">
                                    {lang === 'ar' ? [
                                        'اختراق البصمة الرقمية...',
                                        'تحليل نقاط الضعف...',
                                        'تفكيك ركائز المحتوى...',
                                        'استنتاج استراتيجية الدخل...',
                                        'تحديد ناقل الهجوم...'
                                    ][loadingStep] : [
                                        'Infiltrating Digital Footprint...',
                                        'Analyzing Weaknesses...',
                                        'Dismantling Content Pillars...',
                                        'Inferring Revenue Strategy...',
                                        'Identifying Attack Vector...'
                                    ][loadingStep]}
                              </p>
                          </div>
                      ) : aiReport ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                              
                               {/* SELF DEVELOPMENT PROTOCOL */}
                               {aiReport.self_development && (
                                   <div className="lg:col-span-4 glass-panel overflow-hidden rounded-3xl md:rounded-[2rem] border border-emerald-500/20 bg-emerald-500/5">
                                       <button 
                                           onClick={() => setShowSelfDev(!showSelfDev)}
                                           className="w-full flex items-center justify-between p-4 md:p-6 text-left hover:bg-emerald-500/10 transition-colors"
                                       >
                                           <div className="flex items-center gap-3 md:gap-4">
                                               <div className="p-2 md:p-3 bg-emerald-500/20 rounded-xl md:rounded-2xl text-emerald-400">
                                                   <Shield size={20} />
                                               </div>
                                               <div>
                                                   <h3 className="text-[10px] md:text-sm font-black text-emerald-400 uppercase tracking-[0.1em] md:tracking-[0.2em]">
                                                       {lang === 'ar' ? 'بروتوكول التطوير الذاتي (استخبارات تنافسية)' : 'SELF-DEVELOPMENT PROTOCOL (COMPETITIVE INTEL)'}
                                                   </h3>
                                                   <p className="text-[8px] md:text-[10px] text-emerald-500/60 font-bold uppercase mt-1">
                                                       {lang === 'ar' ? 'فهم استراتيجية تحليل السوق العميقة' : 'UNDERSTAND DEEP MARKET ANALYSIS STRATEGY'}
                                                   </p>
                                               </div>
                                           </div>
                                           <ChevronDown size={20} className={`text-emerald-500 transition-transform duration-500 ${showSelfDev ? 'rotate-180' : ''}`} />
                                       </button>
                                       {showSelfDev && (
                                           <div className="p-4 md:p-8 pt-0 text-gray-300 text-sm md:text-lg leading-relaxed border-t border-emerald-500/10 animate-slide-in font-medium">
                                               <div className="bg-black/40 p-4 md:p-6 rounded-2xl border border-emerald-500/10 italic">
                                                   {aiReport.self_development}
                                               </div>
                                           </div>
                                       )}
                                   </div>
                               )}

                               {/* SWOT Analysis Section */}
                               <div className="lg:col-span-4 glass-panel p-5 md:p-8 rounded-3xl md:rounded-[2rem] border border-white/5 bg-[#0a0a0a]">
                                   <h4 className="text-center text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-[0.1em] md:tracking-[0.2em] mb-6 md:mb-8">{lang === 'ar' ? 'تحليل SWOT الاستخباراتي' : 'Intelligence SWOT Analysis'}</h4>
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                       <div className="bg-green-500/5 p-4 rounded-xl border border-green-500/20">
                                           <div className="text-green-400 font-bold uppercase text-[10px] mb-2 flex items-center gap-2 tracking-widest"><TrendingUp size={14}/> {lang === 'ar' ? 'نقاط القوة' : 'Strengths'}</div>
                                           <ul className="list-disc list-inside text-xs md:text-sm text-gray-300 space-y-1 pl-2">
                                               {aiReport.swot_analysis?.strengths?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                                           </ul>
                                       </div>
                                       <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/20">
                                           <div className="text-red-400 font-bold uppercase text-[10px] mb-2 flex items-center gap-2 tracking-widest"><TrendingDown size={14}/> {lang === 'ar' ? 'نقاط الضعف' : 'Weaknesses'}</div>
                                           <ul className="list-disc list-inside text-xs md:text-sm text-gray-300 space-y-1 pl-2">
                                               {aiReport.swot_analysis?.weaknesses?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                                           </ul>
                                       </div>
                                       <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/20">
                                           <div className="text-blue-400 font-bold uppercase text-[10px] mb-2 flex items-center gap-2 tracking-widest"><Zap size={14}/> {lang === 'ar' ? 'الفرص' : 'Opportunities'}</div>
                                           <ul className="list-disc list-inside text-xs md:text-sm text-gray-300 space-y-1 pl-2">
                                               {aiReport.swot_analysis?.opportunities?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                                           </ul>
                                       </div>
                                       <div className="bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/20">
                                           <div className="text-yellow-400 font-bold uppercase text-[10px] mb-2 flex items-center gap-2 tracking-widest"><AlertCircle size={14}/> {lang === 'ar' ? 'التهديدات' : 'Threats'}</div>
                                           <ul className="list-disc list-inside text-xs md:text-sm text-gray-300 space-y-1 pl-2">
                                               {aiReport.swot_analysis?.threats?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                                           </ul>
                                       </div>
                                   </div>
                               </div>

                               {/* Content Pillars */}
                               <div className="lg:col-span-2 glass-panel p-5 md:p-6 rounded-3xl md:rounded-[2rem] border border-gray-500/20">
                                   <div className="text-gray-400 font-bold uppercase text-[10px] mb-3 flex items-center gap-2 tracking-widest"><Anchor size={14}/> {lang === 'ar' ? 'ركائز المحتوى' : 'Content Pillars'}</div>
                                   <div className="flex flex-wrap gap-2">
                                       {aiReport.content_pillars?.map((pillar: string, i: number) => (
                                           <div key={i} className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-[10px] md:text-xs text-gray-300 font-medium">
                                               {pillar}
                                           </div>
                                       ))}
                                   </div>
                               </div>

                               {/* Brand Positioning */}
                               <div className="lg:col-span-2 glass-panel p-5 md:p-6 rounded-3xl md:rounded-[2rem] border border-gray-500/20">
                                   <div className="text-gray-400 font-bold uppercase text-[10px] mb-3 flex items-center gap-2 tracking-widest"><Crosshair size={14}/> {lang === 'ar' ? 'موقع العلامة التجارية' : 'Brand Positioning'}</div>
                                   <p className="text-white font-semibold text-xs md:text-sm italic">"{aiReport.brand_positioning}"</p>
                               </div>

                               {/* Audience Sentiment */}
                               <div className="lg:col-span-4 glass-panel p-5 md:p-6 rounded-3xl md:rounded-[2rem] border border-gray-500/20">
                                   <div className="text-gray-400 font-bold uppercase text-[10px] mb-4 flex items-center gap-2 tracking-widest"><Users size={14}/> {lang === 'ar' ? 'معنويات الجمهور' : 'Audience Sentiment'}</div>
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                                       <div className="bg-green-500/5 p-4 rounded-xl border border-green-500/10">
                                           <p className="text-gray-300"><span className="font-bold text-green-400">Positive:</span> {aiReport.audience_sentiment?.positive}</p>
                                       </div>
                                       <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                                           <p className="text-gray-300"><span className="font-bold text-red-400">Negative:</span> {aiReport.audience_sentiment?.negative}</p>
                                       </div>
                                   </div>
                               </div>

                               {/* Monetization & Attack Vector */}
                               <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <div className="glass-panel p-5 md:p-6 rounded-3xl md:rounded-[2rem] border border-yellow-500/20">
                                       <div className="text-yellow-400 font-bold uppercase text-[10px] mb-3 flex items-center gap-2 tracking-widest"><DollarSign size={14}/> {lang === 'ar' ? 'استراتيجية تحقيق الدخل' : 'Monetization Strategy'}</div>
                                       <p className="text-white font-semibold text-xs md:text-sm">{aiReport.monetization_strategy}</p>
                                   </div>
                                   <div className="glass-panel p-5 md:p-6 rounded-3xl md:rounded-[2rem] border border-purple-500/20 bg-gradient-to-br from-purple-900/20">
                                       <div className="text-purple-400 font-bold uppercase text-[10px] mb-3 flex items-center gap-2 tracking-widest"><Swords size={14}/> {lang === 'ar' ? 'ناقل الهجوم' : 'Attack Vector'}</div>
                                       <p className="text-white font-bold text-xs md:text-sm">{aiReport.attack_vector}</p>
                                   </div>
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

export default CompetitorAnalysis;
