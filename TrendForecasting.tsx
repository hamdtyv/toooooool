import React, { useState, useEffect } from 'react';
import { useLang } from '../index';
import { motion } from 'motion/react';
import { Radar, Search, Loader2, Target, Zap, Shield, Flame, Activity, Brain } from 'lucide-react';
import { generateTrendForecast } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import Tooltip from './Tooltip';
import { logToolActivity } from '../services/firebase';

const TrendForecasting: React.FC = () => {
    const { t, lang, resultLang } = useLang();
    const isAr = lang === 'ar';
    const [niche, setNiche] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    const handleForecast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!niche.trim()) return;

        setLoading(true);
        setData(null);

        try {
            const result = await generateTrendForecast(niche, lang, resultLang);
            if (result) {
                setData(result);
                await logToolActivity('trend_forecasting', t.trendForecasting, 'generated_forecast', {
                    niche
                }, isAr ? `توليد تنبؤات لمجال: ${niche.substring(0, 30)}` : `Generated forecast for niche: ${niche.substring(0, 30)}`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto pb-20 font-sans flex flex-col min-h-0 w-full"
        >
            <div className="mb-12 text-center md:text-left">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10 mb-4"
                >
                    <Radar size={14} className="text-blue-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{t.trendForecasting}</span>
                </motion.div>
                <h2 className={`text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-sm ${isAr ? 'font-alex' : ''}`}>
                    {t.trendForecasting}
                </h2>
                <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed font-normal">
                    {isAr 
                        ? 'محرك تنبؤ متقدم يعتمد على الذكاء الاصطناعي لتحليل سرعة البحث وتوجهات الجمهور للتنبؤ بالمواضيع الفيروسية القادمة بقوة.' 
                        : 'An advanced AI engine that analyzes search velocity and sentiment shifts to predict upcoming viral topics.'}
                </p>
            </div>

            {/* Input Section */}
            <form onSubmit={handleForecast} className="relative max-w-2xl mb-12">
                <div className="relative group flex items-center">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className={`h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors ${isAr ? 'right-4 left-auto' : ''}`} />
                    </div>
                    <input
                        type="text"
                        value={niche}
                        onChange={(e) => setNiche(e.target.value)}
                        className={`block w-full bg-[#0a0f0d] border border-white/10 rounded-2xl py-4 ${isAr ? 'pr-12 pl-32' : 'pl-12 pr-32'} text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-xl`}
                        placeholder={isAr ? 'أدخل مجالك (مثال: الذكاء الاصطناعي، العملات الرقمية، الألعاب)...' : 'Enter your niche (e.g. AI, Crypto, Gaming)...'}
                        dir={isAr ? 'rtl' : 'ltr'}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={!niche.trim() || loading}
                        className={`absolute ${isAr ? 'left-2' : 'right-2'} top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Radar size={16} />}
                        <span className="hidden sm:inline">{isAr ? 'تنبؤ' : 'Forecast'}</span>
                    </button>
                </div>
            </form>

            {loading && (
                <div className="flex flex-col items-center justify-center p-20 bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
                    <Radar className="w-12 h-12 text-blue-500 animate-spin mb-6" />
                    <h3 className="text-xl font-bold text-white mb-2">{isAr ? 'جاري محاكاة البيانات...' : 'Simulating Data...'}</h3>
                    <p className="text-slate-400 text-sm max-w-md text-center">
                        {isAr ? 'نقوم بتحليل توجهات الجمهور وسرعات البحث السابقة.' : 'Analyzing audience sentiment and historical search velocities.'}
                    </p>
                </div>
            )}

            {!loading && data && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    {/* Header Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                    <Brain className="text-purple-400" size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">{isAr ? 'التحليل العاطفي' : 'Sentiment Shift'}</h3>
                                </div>
                            </div>
                            <p className="text-lg font-medium text-slate-300 leading-relaxed">
                                {data.overall_sentiment}
                            </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl relative overflow-hidden flex flex-col justify-center items-center">
                            <div className="flex items-center gap-3 mb-4">
                                <Flame className="text-orange-500" size={24} />
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest">{isAr ? 'مؤشر الزخم العام' : 'Overall Momentum'}</h3>
                            </div>
                            <div className="text-6xl font-black font-space text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-red-600">
                                {data.momentum_score}
                            </div>
                        </div>
                    </div>

                    {/* Topics Grid */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white px-2">{isAr ? 'المواضيع الفيروسية المتوقعة' : 'Forecasted Viral Topics'}</h3>
                        {data.forecasted_topics?.map((topic: any, idx: number) => (
                            <div key={idx} className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-1 space-y-4">
                                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold font-space text-sm">
                                        #{idx + 1}
                                    </div>
                                    <h4 className="text-2xl font-bold text-white">{topic.topic_name}</h4>
                                    
                                    <div className="space-y-3 mt-6">
                                        <div>
                                            <span className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">{isAr ? 'سرعة البحث' : 'Search Velocity'}</span>
                                            <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                                                <Activity size={16} />
                                                {topic.search_velocity}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">{isAr ? 'تحول المشاعر' : 'Sentiment Shift'}</span>
                                            <div className="text-sm text-slate-300 font-medium">{topic.sentiment_shift}</div>
                                        </div>
                                        <div className="pt-4 border-t border-white/5">
                                            <span className="block text-[10px] uppercase tracking-widest text-purple-400 mb-2">{isAr ? 'خطة العمل (Action Plan)' : 'Action Plan'}</span>
                                            <p className="text-sm text-slate-400 leading-relaxed">{topic.action_plan}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-2 bg-[#050a09] rounded-2xl border border-white/5 p-4 flex flex-col justify-end min-h-[300px]">
                                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4 pl-2">
                                        {isAr ? 'محاكاة حجم البحث (7 أيام)' : 'Search Volume Simulation (7 Days)'}
                                    </div>
                                    <div className="flex-1 w-full font-mono">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={topic.chart_data}>
                                                <defs>
                                                    <linearGradient id={`colorVol${idx}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} width={30} />
                                                <RechartsTooltip 
                                                    contentStyle={{ backgroundColor: '#09110f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px' }}
                                                    itemStyle={{ color: '#60a5fa' }}
                                                />
                                                <Area type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill={`url(#colorVol${idx})`} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default TrendForecasting;
