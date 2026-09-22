import React, { useState, useEffect } from 'react';
import { useLang } from '../index';
import { motion } from 'motion/react';
import { formatCurrency, extractId, formatNumber } from '../utils';
import { calculateComplexRevenue, detectNiche } from '../services/algoService';
import { fetchChannelData, fetchVideoData } from '../services/youtubeService';
import { DollarSign, Globe, TrendingUp, Search, Loader2, BarChart, Info, Wallet, ShoppingBag, Briefcase, Brain, Target, Sparkles, AlertTriangle, ShieldCheck, CheckCircle, PieChart, Coins } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Tooltip from './Tooltip';
import { saveToStorage, loadFromStorage, StorageKeys } from '../services/storageService';
import { useJobs } from '../contexts/JobContext';
import { logToolActivity } from '../services/firebase';

const EarningsCalculator: React.FC = () => {
  const { t, lang, resultLang } = useLang();
  const location = useLocation();
  const { jobs, startJob } = useJobs();
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  
  // Advanced States (The 2028 Upgrade)
  const [ecosystem, setEcosystem] = useState<any>(null);
  const [aiReport, setAiReport] = useState<any>(null);
  const [useAi, setUseAi] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Restore logic on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    
    if (q) {
        setInput(q);
        const { id } = extractId(q);
        const targetId = id || q;
        
        // Try restoring AI Report
        const cachedAi = loadFromStorage<any>(StorageKeys.EARNINGS_AI(targetId));
        if (cachedAi) {
            setAiReport(cachedAi);
            setUseAi(true);
        }
        
        // Trigger fast analysis immediately
        handleAnalyze(null, q, true);
    } else {
        const lastId = loadFromStorage<string>(StorageKeys.LAST_VIEWED_EARNINGS);
        if (lastId) {
            setInput(lastId);
            const cachedAi = loadFromStorage<any>(StorageKeys.EARNINGS_AI(lastId));
            if(cachedAi) { setAiReport(cachedAi); setUseAi(true); }
            handleAnalyze(null, lastId, true);
        }
    }
  }, [location.search]);

  // Sync with Background Job
  useEffect(() => {
      const job = jobs.earnings_audit;
      const { id } = extractId(input);
      const targetId = id || input;

      // If data is loaded and job ID matches
      if (data && job.currentId === targetId) {
          if (job.status === 'success' && job.result) {
              setAiReport(job.result);
              setIsAiLoading(false);
              setUseAi(true);
          } else if (job.status === 'loading') {
              setIsAiLoading(true);
              setUseAi(true);
          }
      }
  }, [jobs.earnings_audit.status, jobs.earnings_audit.currentId, data]);

  const handleAnalyze = async (e: React.FormEvent | null, overrideInput?: string, isInitialLoad = false) => {
    if (e) e.preventDefault();
    const val = overrideInput || input;
    if (!val) return;
    
    const { type, id } = extractId(val);
    const targetId = id || val;
    saveToStorage(StorageKeys.LAST_VIEWED_EARNINGS, targetId);

    // Reset UI if new search (not initial restore)
    if (!isInitialLoad) {
        setLoading(true);
        setError('');
        setAiReport(null); 
        setData(null);
    }

    try {
      let viewCount = '0';
      let subscriberCount = '0';
      let country = 'US';
      let keywords: string[] = [];
      let title = '';
      let desc = '';
      let thumb = '';
      let detectedType = '';
      let engagementRate = 3.5; // Default estimate

      if (type === 'video' || type === 'unknown') {
        const videoData = await fetchVideoData(targetId);
        if (videoData) {
            detectedType = t.videoType;
            viewCount = videoData.statistics.viewCount;
            title = videoData.snippet.title;
            desc = videoData.snippet.description;
            thumb = videoData.snippet.thumbnails.high?.url || videoData.snippet.thumbnails.medium.url;
            keywords = videoData.snippet.tags || [];
            
            const interactions = parseInt(videoData.statistics.likeCount || '0') + parseInt(videoData.statistics.commentCount || '0');
            const views = parseInt(viewCount) || 1;
            engagementRate = (interactions / views) * 100;
        }
      } else {
        const channelData = await fetchChannelData(targetId);
        if (channelData) {
            detectedType = t.channelType;
            viewCount = channelData.statistics.viewCount;
            subscriberCount = channelData.statistics.subscriberCount;
            title = channelData.snippet.title;
            desc = channelData.snippet.description;
            thumb = channelData.snippet.thumbnails.high?.url || channelData.snippet.thumbnails.medium.url;
            country = channelData.snippet.country || 'US';
            engagementRate = 3.5; 
        }
      }

      // 2. Advanced Ecosystem Calc (The 2028 Upgrade)
      const contextText = `${title} ${desc} ${keywords.join(' ')}`;
      const complexRev = calculateComplexRevenue(
          parseInt(viewCount), 
          engagementRate, 
          country, 
          contextText
      );
      setEcosystem(complexRev);

      const resultData = { type: detectedType, title, desc, thumb, viewCount, subscriberCount, country, isVideo: type === 'video' };
      setData(resultData);
      
      await logToolActivity('earnings_lab', t.earningsLab, 'analyzed_revenue', {
          targetId,
          title,
          type: detectedType
      }, lang === 'ar' ? `تحليل أرباح لـ: ${title.substring(0, 30)}...` : `Analyzed earnings for: ${title.substring(0, 30)}...`);
      
      // 3. Trigger AI Background Job if toggled
      const cachedAi = loadFromStorage<any>(StorageKeys.EARNINGS_AI(targetId));
      if (useAi && !cachedAi) {
          triggerAiJob(targetId, title, desc, viewCount, country);
      } else if (cachedAi) {
          setAiReport(cachedAi);
          setUseAi(true);
      }

      // SAVE TO HISTORY
    } catch (err) {
      setError(t.error);
      setIsAiLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const triggerAiJob = async (id: string, title: string, desc: string, viewCount: string, country: string) => {
      setIsAiLoading(true);
      await startJob('earnings_audit', id, lang, resultLang, {
          title, desc, viewCount, country
      });
  };

  const handleToggleAi = () => {
      const newState = !useAi;
      setUseAi(newState);
      if (newState && data && !aiReport) {
          triggerAiJob(input, data.title, data.desc, data.viewCount, data.country);
      }
  };

  const RevenueCard = ({ title, amount, icon: Icon, color, subtitle, badge }: any) => (
      <div className={`p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-black to-${color}-900/10 relative overflow-hidden group hover:border-${color}-500/50 transition-all duration-300`}>
          <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}><Icon size={64} className={`text-${color}-500`} /></div>
          <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                  <div className={`text-xs font-bold uppercase tracking-widest text-${color}-400 flex items-center gap-2`}>
                      <Icon size={14} /> {title}
                  </div>
                  {badge && <div className={`text-[10px] px-2 py-0.5 rounded bg-${color}-500/20 text-${color}-300 uppercase font-bold`}>{badge}</div>}
              </div>
              <div className="text-3xl font-black text-white mb-1 tracking-tight">{formatCurrency(amount)}</div>
              <div className="text-[10px] text-gray-500">{subtitle}</div>
          </div>
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
              <div className={`h-full bg-${color}-500`} style={{ width: '45%' }}></div> 
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
       
       {/* 1. Standardized Beautiful Header */}
       <div className="mb-16 text-center md:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 mb-4"
            >
              <Wallet size={14} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{t.earningsLab || 'Earnings Lab'}</span>
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-sm">
               {isAr ? 'حساب وتحليل الأرباح' : 'Earnings & Finance Lab'}
            </h2>
            <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed">
               {isAr 
                ? 'تحليل شامل وتقييم للإيرادات المالية من الإعلانات، عقود الرعايات، والتجارة الإلكترونية لبناء تقييم مالي متكامل.'
                : 'Calculate your integrated revenue ecosystem including ads, custom sponsorships, and commerce.'}
            </p>
       </div>

      {/* 2. Search & Controls */}
      <div className="max-w-3xl mx-auto mb-16 relative z-20">
        <form onSubmit={e => handleAnalyze(e)} className="relative group">
            
            <div className="relative flex flex-col md:flex-row items-center bg-[#050a08]/40 border border-white/10 rounded-2xl p-1.5 transition-all duration-300 focus-within:border-emerald-500/50 focus-within:bg-[#050a08]/60">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className={`w-full md:flex-1 bg-transparent border-none py-3 md:py-4 px-4 md:px-6 text-white text-base md:text-lg focus:outline-none placeholder-gray-500 font-medium ${lang === 'ar' ? 'text-right' : 'text-left'}`}
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

            {/* AI Toggle */}
            <div className="flex items-center justify-end mt-4 px-2 gap-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <span className={`text-sm font-bold transition-colors ${useAi ? 'text-purple-400' : 'text-gray-500'}`}>
                        {lang === 'ar' ? 'تفعيل المحلل المالي (الواقعي)' : 'Enable Realistic AI Auditor'}
                    </span>
                    <div className="relative">
                        <input type="checkbox" className="sr-only" checked={useAi} onChange={handleToggleAi} />
                        <div className={`block w-12 h-7 rounded-full transition-colors duration-300 ${useAi ? 'bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.5)]' : 'bg-gray-700'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 flex items-center justify-center ${useAi ? 'translate-x-5' : 'translate-x-0'}`}>
                            {useAi && <Brain size={12} className="text-purple-600" />}
                        </div>
                    </div>
                </label>
            </div>
        </form>
      </div>

      {data && ecosystem && (
          <div className="space-y-12 animate-slide-in">
              
              {/* 3. The "Big Number" (Total Potential) */}
              <div className="relative overflow-hidden rounded-3xl md:rounded-[2.5rem] border border-white/5 text-center p-6 md:p-12 bg-[#0a0c0b]/50">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_20px_#10b981]"></div>
                  
                  <div className="relative z-10 w-full h-full">
                      <div className="text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-4">
                          {lang === 'ar' ? 'إجمالي القيمة السوقية للمحتوى' : 'TOTAL CONTENT VALUATION'}
                      </div>
                      <div className="text-4xl md:text-8xl font-black text-white mb-6 tracking-tighter drop-shadow-2xl">
                          {formatCurrency(ecosystem.totalPotential)}
                      </div>
                      <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3">
                          <div className="bg-black/30 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/5 flex items-center gap-2">
                              <Target size={12} className="text-emerald-500" />
                              <span className="text-gray-300 text-[10px] md:text-xs font-mono uppercase font-bold">Niche: {ecosystem.metrics.niche}</span>
                          </div>
                          <div className="bg-black/30 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/5 flex items-center gap-2">
                              <Coins size={12} className="text-yellow-500" />
                              <span className="text-gray-300 text-[10px] md:text-xs font-mono uppercase font-bold">RPM: {ecosystem.metrics.rpm}</span>
                          </div>
                          <div className="bg-black/30 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/5 flex items-center gap-2">
                              <PieChart size={12} className="text-blue-500" />
                              <span className="text-gray-300 text-[10px] md:text-xs font-mono uppercase font-bold">Monetized Views: {formatNumber(ecosystem.metrics.monetizedViews)}</span>
                          </div>
                      </div>
                  </div>
              </div>

              {/* 4. The Revenue Ecosystem (4 Pillars) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <RevenueCard 
                      title={lang === 'ar' ? 'عائد الإعلانات' : 'Ad Revenue (Base)'} 
                      amount={ecosystem.adRevenue} 
                      icon={TrendingUp} 
                      color="blue" 
                      subtitle={lang === 'ar' ? 'بعد خصم AdBlock (صافي)' : 'Net after AdBlock deduction'}
                  />
                  <RevenueCard 
                      title={lang === 'ar' ? 'رعايات العلامات التجارية' : 'Sponsorship Deals'} 
                      amount={ecosystem.sponsorValue} 
                      icon={Briefcase} 
                      color="purple" 
                      subtitle={lang === 'ar' ? 'يعتمد على التفاعل + التخصص' : 'Engagement Weighted Valuation'}
                  />
                  <RevenueCard 
                      title={lang === 'ar' ? 'التسويق بالعمولة' : 'Affiliate Sales'} 
                      amount={ecosystem.affiliateRevenue} 
                      icon={DollarSign} 
                      color="emerald" 
                      subtitle={lang === 'ar' ? 'بناءً على نية الشراء' : 'Purchase Intent Probability'}
                  />
                  <RevenueCard 
                      title={lang === 'ar' ? 'المنتجات الرقمية' : 'Digital Products'} 
                      amount={ecosystem.productRevenue} 
                      icon={ShoppingBag} 
                      color="orange" 
                      badge={ecosystem.metrics.productType}
                      subtitle={lang === 'ar' ? 'مبيعات مباشرة (كورسات/ميرش)' : 'Direct Sales (Course/Merch)'}
                  />
              </div>

              {/* 5. AI Financial Analyst Report */}
              {useAi && (
                  <div className="relative overflow-hidden rounded-3xl md:rounded-[2.5rem] border border-purple-500/20 bg-[#0a0c0b]/50 p-6 md:p-10">
                      {isAiLoading ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                              <div className="relative">
                                  <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 animate-pulse"></div>
                                  <Brain size={48} className="text-purple-500 animate-bounce relative z-10" />
                              </div>
                              <h3 className="text-lg md:text-xl font-bold text-white mt-6 mb-2">{lang === 'ar' ? 'المدقق المالي يراجع الأرقام...' : 'Financial Auditor Crunching Numbers...'}</h3>
                              <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">{lang === 'ar' ? 'يتم حساب معدل القوة الشرائية واحتمالية حجب الإعلانات' : 'Calculating Purchasing Power & AdBlock Ratios'}</p>
                          </div>
                      ) : aiReport ? (
                          <div className="space-y-8 md:space-y-10">
                               {/* Investment Thesis & Final Verdict */}
                               <div className="text-center max-w-4xl mx-auto">
                                   <div className="text-purple-400 font-bold uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2 justify-center">
                                       <Brain size={16} /> {lang === 'ar' ? 'أطروحة الاستثمار' : 'Investment Thesis'}
                                   </div>
                                   <p className="text-gray-300 text-base md:text-lg leading-relaxed italic mb-6">
                                       "{aiReport.investment_thesis}"
                                   </p>
                                   <div className={`inline-flex items-center gap-2 font-black text-sm md:text-lg px-4 py-2 rounded-lg border ${aiReport.final_verdict?.includes('Investable') ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                       {aiReport.final_verdict?.includes('Investable') ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                                       {aiReport.final_verdict}
                                   </div>
                                </div>

                               {/* Growth Plays Section */}
                               <div className="space-y-6">
                                   <h4 className="text-center text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">{lang === 'ar' ? 'مسرحيات النمو المقترحة' : 'Proposed Growth Plays'}</h4>
                                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                       {aiReport.growth_plays?.map((play: any, i: number) => (
                                           <div key={i} className="relative overflow-hidden rounded-2xl border border-white/5 flex flex-col bg-[#0a0c0b]/50 p-5 md:p-6 hover:border-purple-500/30 transition-all">
                                               <div className="flex-1">
                                                   <div className="text-purple-400 font-bold uppercase tracking-widest text-[10px] mb-3">{lang === 'ar' ? `مسرحية النمو #${i + 1}` : `Growth Play #${i + 1}`}</div>
                                                   <h3 className="text-base md:text-lg font-black text-white mb-3">{play.play_name}</h3>
                                                   <p className="text-[11px] md:text-xs text-slate-400 leading-relaxed mb-4">{play.strategy}</p>
                                               </div>
                                               <div className="mt-auto pt-4 border-t border-white/5 space-y-3">
                                                   <div className="bg-red-950/30 p-2 rounded-lg border border-red-500/10 text-[10px] md:text-xs">
                                                       <span className="font-bold text-red-400">{lang === 'ar' ? 'خطر:' : 'Risk:'}</span> <span className="text-slate-300">{play.risk_reward_analysis.risk}</span>
                                                   </div>
                                                   <div className="bg-green-950/30 p-2 rounded-lg border border-green-500/10 text-[10px] md:text-xs">
                                                       <span className="font-bold text-green-400">{lang === 'ar' ? 'مكافأة:' : 'Reward:'}</span> <span className="text-slate-300">{play.risk_reward_analysis.reward}</span>
                                                   </div>
                                                   <div className="text-center bg-black/40 py-2 rounded-lg">
                                                       <div className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">{lang === 'ar' ? 'العائد المتوقع' : 'Est. ROI'}</div>
                                                       <div className="text-sm md:text-base font-black text-purple-400">{play.estimated_roi}</div>
                                                   </div>
                                               </div>
                                           </div>
                                       ))}
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

export default EarningsCalculator;
