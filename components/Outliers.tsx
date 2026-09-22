
import React, { useState, useEffect } from 'react';
import { useLang } from '../index';
import { motion } from 'motion/react';
import { extractId, formatNumber } from '../utils';
import { Gem, ArrowUpRight, BarChart, Loader2, Brain, Zap, Target, Lock, Key, AlertTriangle, Shield, ChevronDown, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { saveToStorage, loadFromStorage, StorageKeys } from '../services/storageService';
import { useJobs } from '../contexts/JobContext';
import { logToolActivity } from '../services/firebase';
import Tooltip from './Tooltip';

const Outliers: React.FC = () => {
  const { t, lang, resultLang } = useLang();
  const location = useLocation();
  const { jobs, startJob } = useJobs();

  const [input, setInput] = useState('');
  const [outliers, setOutliers] = useState<any[]>([]);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Record<string, any>>({});
  const [showSelfDev, setShowSelfDev] = useState<Record<string, boolean>>({});

  const syncData = async (id: string) => {
      const cached = loadFromStorage<any[]>(StorageKeys.OUTLIERS(id));
      if (cached) {
          setOutliers(cached);
          setInput(id);
          
          await logToolActivity('outliers', t.outliers, 'scanned_outliers', {
              channelId: id,
              count: cached.length
          }, lang === 'ar' ? `كشف الفيديوهات الشاذة لـ: ${id.substring(0, 30)}...` : `Scanned breakout outliers for: ${id.substring(0, 30)}...`);
      }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      const { id } = extractId(q);
      setInput(q);
      saveToStorage(StorageKeys.LAST_VIEWED_OUTLIERS, id);
      syncData(id);
    } else {
      const lastId = loadFromStorage<string>(StorageKeys.LAST_VIEWED_OUTLIERS);
      if (lastId) {
          setInput(lastId);
          syncData(lastId);
      }
    }
  }, [location.search]);

  useEffect(() => {
      const job = jobs.outliers;
      if (job.status === 'success' && job.currentId) {
          syncData(job.currentId);
      }
  }, [jobs.outliers.status, jobs.outliers.currentId]);

  // Listen for individual analysis completion
  useEffect(() => {
      const job = jobs.outlier_analysis;
      if (job.status === 'success' && job.result && analyzingId) {
          setAnalysisResults(prev => ({ ...prev, [analyzingId]: job.result }));
          setAnalyzingId(null);
      }
  }, [jobs.outlier_analysis.status, jobs.outlier_analysis.result]);

  const handleAnalyze = async (e: React.FormEvent | null) => {
    if (e) e.preventDefault();
    if (!input) return;
    const { id } = extractId(input);
    saveToStorage(StorageKeys.LAST_VIEWED_OUTLIERS, id);
    setOutliers([]);
    setAnalysisResults({});
    await startJob('outliers', input, lang, resultLang);
  };

  const handleDeepAnalyze = async (video: any) => {
      setAnalyzingId(video.id);
      // Pass stats for context
      const avg = Math.floor(parseInt(video.statistics.viewCount) / parseFloat(video.performanceMultiple));
      await startJob('outlier_analysis', video.id, lang, resultLang, {
          title: video.snippet.title,
          views: video.statistics.viewCount,
          avg: avg.toString()
      });
  };

  const isGlobalLoading = jobs.outliers.status === 'loading';

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
          <Gem size={14} className="text-emerald-500" />
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{t.outliers}</span>
        </motion.div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-sm">
           {isAr ? 'الفيديوهات الاستثنائية الصاعدة' : 'Outliers and Viral Breakouts'}
        </h2>
        <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed font-normal">
           {t.outlierDesc}
        </p>
      </div>

      {/* Input container */}
      <div className="max-w-3xl mx-auto mb-20">
        <form onSubmit={handleAnalyze} className="relative z-20">
            <div className="relative flex flex-col md:flex-row items-center bg-[#050a08]/40 border border-white/10 rounded-2xl p-1.5 transition-all duration-300 focus-within:border-emerald-500/50 focus-within:bg-[#050a08]/60">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className={`w-full md:flex-1 bg-transparent border-none py-4 px-6 text-white text-base focus:outline-none placeholder-gray-600 font-medium ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                />
                
                <div className="hidden md:block px-3">
                    <Tooltip content={t.outlierDesc} />
                </div>

                <button 
                    type="submit" 
                    disabled={isGlobalLoading}
                    className="w-full md:w-auto bg-white text-black hover:bg-emerald-400 transition-all px-8 py-4 rounded-xl font-bold text-sm tracking-tight flex items-center justify-center gap-2 disabled:opacity-50 transition-colors duration-300"
                >
                    {isGlobalLoading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                    {isGlobalLoading ? (lang === 'ar' ? 'جاري التحليل' : 'Analyzing') : t.analyze}
                </button>
            </div>
        </form>
        
        {jobs.outliers.status === 'error' && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 animate-slide-in">
                <AlertTriangle size={20} />
                <p className="text-sm font-bold">{jobs.outliers.error}</p>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outliers.map((video, i) => (
              <div key={i} className="glass-panel p-0 rounded-2xl overflow-hidden border border-white/5 group hover:border-emerald-500/50 transition-all duration-300 shadow-lg flex flex-col bg-[#0a0a0a]">
                  <div className="relative aspect-video overflow-hidden">
                      <img src={video.snippet.thumbnails.medium.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="thumb" />
                      <div className={`absolute top-3 bg-emerald-600 text-white font-black px-3 py-1.5 rounded-full text-xs flex items-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10 ${lang === 'ar' ? 'left-3' : 'right-3'}`}>
                          <ArrowUpRight size={14} strokeWidth={3}/> {video.performanceMultiple}x
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                      <h3 className={`font-bold text-white line-clamp-2 mb-3 group-hover:text-emerald-400 transition-colors text-sm leading-relaxed ${lang === 'ar' ? 'text-right font-alex' : 'text-left'}`}>{video.snippet.title}</h3>
                      <div className="flex justify-between items-center mt-auto mb-4">
                          <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md"><BarChart size={12} className="text-emerald-500"/> {formatNumber(video.statistics.viewCount)}</span>
                          <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">Outlier Detected</span>
                      </div>
                      
                      {/* Analysis Result or Button */}
                      {analysisResults[video.id] ? (
                          <div className="mt-2 pt-4 border-t border-white/5 text-xs space-y-3 animate-slide-in bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/10">
                               {analysisResults[video.id].final_verdict && (
                                   <div className="bg-black/30 p-3 rounded-lg mb-4 border border-white/5">
                                       <p className="text-white text-center font-bold text-xs italic">"{analysisResults[video.id].final_verdict}"</p>
                                   </div>
                               )}
                               {/* Virality Scorecard */}
                               <div className="space-y-2">
                                   {Object.entries(analysisResults[video.id].virality_scorecard || {}).map(([key, value]: [string, any]) => (
                                       <div key={key} className="grid grid-cols-5 items-center gap-2">
                                           <div className="col-span-2 text-gray-400 text-[10px] font-bold uppercase truncate">{key.replace('_score', '')}</div>
                                           <div className="col-span-3 flex items-center gap-2">
                                               <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                                                   <div className="h-full bg-emerald-500" style={{ width: `${value.score}%` }}></div>
                                               </div>
                                               <div className="text-emerald-400 font-mono font-black text-xs">{value.score}</div>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                               {/* Replication Formula */}
                               <div className="mt-4 pt-3 border-t border-white/10">
                                    <div className="text-gray-300 leading-relaxed"><span className="text-yellow-400 font-black uppercase text-[10px] block mb-1">{lang === 'ar' ? 'صيغة التكرار' : 'Replication Formula'}</span> {analysisResults[video.id].replication_formula}</div>
                               </div>

                               {/* SELF DEVELOPMENT PROTOCOL */}
                               {analysisResults[video.id].self_development && (
                                   <div className="mt-4 border-t border-emerald-500/10 pt-4">
                                       <button 
                                           onClick={() => setShowSelfDev(prev => ({ ...prev, [video.id]: !prev[video.id] }))}
                                           className="w-full flex items-center justify-between text-emerald-400 hover:text-emerald-300 transition-colors"
                                       >
                                           <div className="flex items-center gap-2">
                                               <Shield size={12} />
                                               <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'ar' ? 'بروتوكول التطوير' : 'SELF-DEV PROTOCOL'}</span>
                                           </div>
                                           <ChevronDown size={14} className={`transition-transform duration-300 ${showSelfDev[video.id] ? 'rotate-180' : ''}`} />
                                       </button>
                                       {showSelfDev[video.id] && (
                                           <div className="mt-2 p-3 bg-black/40 rounded-lg border border-emerald-500/10 text-[10px] text-gray-400 italic leading-relaxed animate-slide-in">
                                               {analysisResults[video.id].self_development}
                                           </div>
                                       )}
                                   </div>
                               )}
                           </div>
                      ) : (
                          <button 
                            onClick={() => handleDeepAnalyze(video)}
                            disabled={analyzingId === video.id}
                            className={`w-full mt-2 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${analyzingId === video.id ? 'bg-white/5 text-gray-500' : 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white shadow-lg hover:shadow-emerald-600/20'}`}
                          >
                              {analyzingId === video.id ? <Loader2 size={14} className="animate-spin" /> : <Brain size={16} />}
                              {analyzingId === video.id ? (lang === 'ar' ? 'جاري الفحص...' : 'Scanning...') : (lang === 'ar' ? 'كشف سر النجاح (AI)' : 'Reveal Secret (AI)')}
                          </button>
                      )}
                  </div>
              </div>
          ))}
      </div>

      {outliers.length === 0 && !isGlobalLoading && input && (
          <div className="text-center py-24 opacity-20">
              <Gem size={80} className="mx-auto mb-6 text-emerald-500 animate-pulse" />
              <p className="text-2xl font-black tracking-tight text-white">{t.noOutliers}</p>
              <p className="text-sm text-gray-500 mt-2">Try another channel or wait for data sync.</p>
          </div>
       )}
    </motion.div>
  );
};

export default Outliers;
