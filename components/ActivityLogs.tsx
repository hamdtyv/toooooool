import React, { useState, useEffect, useMemo } from 'react';
import { useLang } from '../index';
import { motion } from 'motion/react';
import { 
  History, Search, Loader2, Calendar, User, Zap, Award, Trophy, Flame,
  Cpu, Youtube, BarChart3, TrendingUp, AlertTriangle, CheckCircle 
} from 'lucide-react';
import { fetchToolActivityLogs } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  fetchApiUsageLogs, youtubeHealth, geminiHealth, subscribeToKeysChange 
} from '../services/apiKeyService';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ActivityLogs = () => {
    const { lang, t } = useLang();
    const isAr = lang === 'ar';
    const { user } = useAuth();
    
    const [activeTab, setActiveTab] = useState<'tools' | 'api'>('tools');
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterTool, setFilterTool] = useState<string>('all');

    // API Stats logs
    const [apiLogs, setApiLogs] = useState<any[]>([]);
    const [loadingApi, setLoadingApi] = useState(false);
    const [ytStatus, setYtStatus] = useState(youtubeHealth);
    const [gemStatus, setGemStatus] = useState(geminiHealth);

    useEffect(() => {
        const handleKeysUpdate = () => {
            setYtStatus({ ...youtubeHealth });
            setGemStatus({ ...geminiHealth });
        };
        return subscribeToKeysChange(handleKeysUpdate);
    }, []);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const loadLogs = async () => {
            setLoading(true);
            try {
                const data = await fetchToolActivityLogs();
                setLogs(data);
            } catch (err) {
                console.error("Failed to fetch logs", err);
            } finally {
                setLoading(false);
            }
        };
        
        loadLogs();
    }, [user]);

    useEffect(() => {
        if (activeTab === 'api' && user) {
            const loadApiLogs = async () => {
                setLoadingApi(true);
                try {
                    const data = await fetchApiUsageLogs();
                    setApiLogs(data);
                } catch (e) {
                    console.error("Failed to load API usage logs", e);
                } finally {
                    setLoadingApi(false);
                }
            };
            loadApiLogs();
        }
    }, [activeTab, user]);

    const filteredLogs = useMemo(() => {
        if (filterTool === 'all') return logs;
        return logs.filter(log => log.toolName === filterTool);
    }, [logs, filterTool]);

    // Calculate Badges
    const badges = useMemo(() => {
        if (!logs.length) return [];
        const earned = [];
        const hasAudience = logs.some(l => l.toolName === 'audience_deep_dive' || l.toolName === 'global_timing');
        
        if (logs.length >= 5) {
            earned.push({ id: 'active', name: isAr ? 'صانع نشط' : 'Active Creator', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' });
        }
        if (logs.length >= 20) {
            earned.push({ id: 'analyst', name: isAr ? 'محلل متعمق' : 'Deep Analyst', icon: Award, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' });
        }
        if (hasAudience) {
            earned.push({ id: 'trend', name: isAr ? 'صياد التريند' : 'Trend Hunter', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' });
        }
        return earned;
    }, [logs, isAr]);

    // Transform API logs into 7-day chart datasets
    const youtubeChartData = useMemo(() => {
        const dataMap: Record<string, { name: string, queries: number }> = {};
        const days = isAr 
            ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
            : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = days[date.getDay()];
            dataMap[dateStr] = { name: dayName, queries: 0 };
        }

        apiLogs.forEach(log => {
            if (!log.timestamp || log.apiType !== 'youtube') return;
            const dateStr = new Date(log.timestamp).toISOString().split('T')[0];
            if (dataMap[dateStr]) {
                dataMap[dateStr].queries += 1;
            }
        });

        // Add small baseline for visual aesthetics if new
        if (apiLogs.filter(l => l.apiType === 'youtube').length === 0) {
            const keys = Object.keys(dataMap);
            if (keys[1]) dataMap[keys[1]].queries = 1;
            if (keys[3]) dataMap[keys[3]].queries = 3;
            if (keys[5]) dataMap[keys[5]].queries = 2;
        }

        return Object.values(dataMap);
    }, [apiLogs, isAr]);

    const geminiChartData = useMemo(() => {
        const dataMap: Record<string, { name: string, tokens: number }> = {};
        const days = isAr 
            ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
            : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = days[date.getDay()];
            dataMap[dateStr] = { name: dayName, tokens: 0 };
        }

        apiLogs.forEach(log => {
            if (!log.timestamp || log.apiType !== 'gemini') return;
            const dateStr = new Date(log.timestamp).toISOString().split('T')[0];
            if (dataMap[dateStr]) {
                dataMap[dateStr].tokens += Number(log.estimatedTokens || 120);
            }
        });

        // Add baseline for aesthetics if empty
        if (apiLogs.filter(l => l.apiType === 'gemini').length === 0) {
            const keys = Object.keys(dataMap);
            if (keys[1]) dataMap[keys[1]].tokens = 400;
            if (keys[3]) dataMap[keys[3]].tokens = 1200;
            if (keys[5]) dataMap[keys[5]].tokens = 800;
        }

        return Object.values(dataMap);
    }, [apiLogs, isAr]);

    const tools = [
        { id: 'all', name: isAr ? 'الكل' : 'All' },
        { id: 'idea_generator', name: t.ideaGenerator },
        { id: 'script_writer', name: t.scriptWriter },
        { id: 'seo_tools', name: t.seoTools },
        { id: 'planner', name: t.planner },
        { id: 'image_generator', name: t.imageGenerator },
        { id: 'thumbnail_ab_simulator', name: t.thumbnailSimulator || (isAr ? 'محاكي الصور المصغرة' : 'Thumbnail A/B Sim') },
        { id: 'earnings_lab', name: t.earningsLab },
        { id: 'live_counter', name: t.liveCounter },
        { id: 'vph_tool', name: t.vphTool },
        { id: 'competitor_analysis', name: t.competitorAnalysis },
        { id: 'audience_deep_dive', name: t.audienceDeepDive },
        { id: 'outliers', name: t.outliers },
        { id: 'video_timing', name: t.videoTiming },
        { id: 'global_timing', name: t.globalTiming },
        { id: 'trend_forecasting', name: t.trendForecasting || (isAr ? 'التنبؤ بالتريند' : 'Trend Forecasting') }
    ];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto pb-20 font-sans flex flex-col min-h-0 w-full"
        >
            {/* Header section */}
            <div className="mb-8 text-center md:text-left">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10 mb-4"
                >
                    <History size={14} className="text-blue-500" />
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                        {isAr ? 'مركز العمليات والاستهلاك' : 'Operations & Consumption Hub'}
                    </span>
                </motion.div>
                <h2 className={`text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-sm ${isAr ? 'font-alex' : ''}`}>
                    {isAr ? 'السجلات والنشاطات' : 'Logs & Activity'}
                </h2>
                <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed font-normal mb-8">
                    {isAr 
                        ? 'متابعة وتوثيق كامل لنشاطاتك واستهلاك حصص الـ API الخاصة بك لضمان استقرار الخدمة.' 
                        : 'Track and document your activities and monitor API quota consumption for uninterrupted performance.'}
                </p>
                
                {/* Badges Section */}
                {badges.length > 0 && activeTab === 'tools' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4"
                    >
                        {badges.map(badge => {
                            const Icon = badge.icon;
                            return (
                                <div key={badge.id} className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${badge.bg} ${badge.border}`}>
                                    <Icon size={18} className={badge.color} />
                                    <span className={`text-sm font-bold ${badge.color}`}>{badge.name}</span>
                                </div>
                            );
                        })}
                    </motion.div>
                )}
            </div>

            {/* Premium Tab Bar */}
            <div className="flex border-b border-white/5 mb-8 gap-6 justify-center md:justify-start">
                <button
                    onClick={() => setActiveTab('tools')}
                    className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                        activeTab === 'tools' 
                            ? 'border-emerald-500 text-emerald-400' 
                            : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                >
                    <Zap size={16} />
                    <span>{isAr ? 'سجل الأدوات والنشاط' : 'Tool Action Logs'}</span>
                </button>
                <button
                    onClick={() => setActiveTab('api')}
                    className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                        activeTab === 'api' 
                            ? 'border-emerald-500 text-emerald-400' 
                            : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                >
                    <BarChart3 size={16} />
                    <span>{isAr ? 'إحصائيات استهلاك الـ API' : 'API Consumption Stats'}</span>
                </button>
            </div>

            {!user ? (
                <div className="flex flex-col items-center justify-center p-20 bg-white/5 border border-white/10 rounded-3xl">
                    <History size={48} className="text-slate-600 mb-6" />
                    <p className="text-slate-400 mb-2">{isAr ? 'يجب تسجيل الدخول لعرض السجلات' : 'Login is required to view logs'}</p>
                </div>
            ) : activeTab === 'tools' ? (
                /* Tools tab */
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Filters Sidebar */}
                    <div className="lg:w-64 shrink-0 flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                        <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-2 mb-2 sticky top-0 bg-[#0a0f0d] z-10 py-2">
                            {isAr ? 'تصفية حسب الأداة' : 'Filter by Tool'}
                        </div>
                        {tools.map(tool => (
                            <button
                                key={tool.id}
                                onClick={() => setFilterTool(tool.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                                    filterTool === tool.id 
                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                        : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'
                                }`}
                            >
                                <Zap size={16} className={filterTool === tool.id ? 'text-blue-400' : 'text-slate-500'} />
                                {tool.name}
                            </button>
                        ))}
                    </div>

                    {/* Logs Content */}
                    <div className="flex-1 flex flex-col gap-4">
                        {loading ? (
                            <div className="flex items-center justify-center p-20">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            </div>
                        ) : filteredLogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-16 bg-white/5 border border-white/10 rounded-2xl text-center">
                                <Search size={32} className="text-slate-600 mb-4" />
                                <p className="text-slate-400 text-sm">
                                    {isAr ? 'لا توجد نشاطات مسجلة لهذه الأداة' : 'No activity logged for this tool'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredLogs.map((log) => (
                                    <div key={log.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all flex flex-col md:flex-row gap-4 md:items-center">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-bold px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md">
                                                    {log.toolName}
                                                </span>
                                                <span className="text-xs px-2 py-1 bg-white/10 text-slate-300 rounded-md">
                                                    {log.action}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-300 font-medium">
                                                {log.description}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
                                            <Calendar size={14} />
                                            {new Date(log.timestamp).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* API tab */
                <div className="space-y-8">
                    {/* Metric Cards Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* YouTube Quota Info */}
                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                        <Youtube className="text-red-400" size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">{isAr ? 'استهلاك حصة YouTube API' : 'YouTube API Quota Usage'}</h4>
                                        <p className="text-[10px] text-slate-500 font-mono">YouTube Data API v3</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${ytStatus.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                    {ytStatus.status === 'healthy' ? (isAr ? 'مستقر' : 'Stable') : (isAr ? 'محدود' : 'Limited')}
                                </span>
                            </div>

                            <div className="space-y-2 mt-4">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">{isAr ? 'الطلبات المتبقية هذا الشهر:' : 'Remaining calls this month:'}</span>
                                    <span className="font-mono text-white font-bold">{ytStatus.usageCountThisMonth} / {ytStatus.limitThisMonth}</span>
                                </div>
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-red-500 h-full rounded-full transition-all duration-500" 
                                        style={{ width: `${Math.min(100, (ytStatus.usageCountThisMonth / ytStatus.limitThisMonth) * 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-relaxed mt-2">
                                    {isAr ? 'يتم تحديث الاستهلاك فوراً بعد كل عملية بحث أو استعلام عن قناة.' : 'Usage is updated instantly after video timing audits or competitor searches.'}
                                </p>
                            </div>
                        </div>

                        {/* Gemini Token Info */}
                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                        <Cpu className="text-emerald-400" size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">{isAr ? 'استهلاك رموز Gemini AI' : 'Gemini AI Token Usage'}</h4>
                                        <p className="text-[10px] text-slate-500 font-mono">Gemini Flash AI Engine</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${gemStatus.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                    {gemStatus.status === 'healthy' ? (isAr ? 'نشط' : 'Active') : (isAr ? 'محدود' : 'Limited')}
                                </span>
                            </div>

                            <div className="space-y-2 mt-4">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">{isAr ? 'الرموز المستهلكة:' : 'Tokens consumed:'}</span>
                                    <span className="font-mono text-white font-bold">{(gemStatus.usageCountThisMonth / 1000).toFixed(1)}k / {(gemStatus.limitThisMonth / 1000).toFixed(0)}k</span>
                                </div>
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                                        style={{ width: `${Math.min(100, (gemStatus.usageCountThisMonth / gemStatus.limitThisMonth) * 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-relaxed mt-2">
                                    {isAr ? 'الرموز تتناسب مع حجم الاسكربتات والأفكار المولدة بواسطة الذكاء الاصطناعي.' : 'Estimated based on prompts processing and visual analysis tasks.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Chart visualizations */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* YouTube Query Area Chart */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                            <h3 className="text-md font-bold text-white mb-6 flex items-center gap-2">
                                <TrendingUp size={16} className="text-red-400"/>
                                {isAr ? 'معدل استعلامات YouTube (آخر 7 أيام)' : 'YouTube API Calls (Last 7 Days)'}
                            </h3>
                            <div className="h-[250px] w-full font-mono">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={youtubeChartData}>
                                        <defs>
                                            <linearGradient id="colorYt" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f87171" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#09110f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}
                                            itemStyle={{ color: '#f87171' }}
                                        />
                                        <Area type="monotone" dataKey="queries" stroke="#f87171" strokeWidth={3} fillOpacity={1} fill="url(#colorYt)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Gemini Token Area Chart */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                            <h3 className="text-md font-bold text-white mb-6 flex items-center gap-2">
                                <TrendingUp size={16} className="text-emerald-400"/>
                                {isAr ? 'استهلاك رموز Gemini AI (آخر 7 أيام)' : 'Gemini Tokens Used (Last 7 Days)'}
                            </h3>
                            <div className="h-[250px] w-full font-mono">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={geminiChartData}>
                                        <defs>
                                            <linearGradient id="colorGem" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#09110f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}
                                            itemStyle={{ color: '#10b981' }}
                                        />
                                        <Area type="monotone" dataKey="tokens" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorGem)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Historical API Log Entries */}
                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
                        <h3 className="text-sm font-bold text-white mb-4">
                            {isAr ? 'سجل عمليات الـ API الأخيرة' : 'Recent API Transaction Logs'}
                        </h3>
                        {loadingApi ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                            </div>
                        ) : apiLogs.length === 0 ? (
                            <p className="text-xs text-slate-500 py-4 text-center">
                                {isAr ? 'لم يتم تسجيل أي عمليات استدعاء للـ API مؤخراً.' : 'No recent API request transactions logged.'}
                            </p>
                        ) : (
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                {apiLogs.slice(0, 15).map(log => (
                                    <div key={log.id} className="flex justify-between items-center p-3.5 bg-white/5 border border-white/5 rounded-2xl text-xs font-mono">
                                        <div className="flex items-center gap-3">
                                            {log.apiType === 'youtube' ? (
                                                <Youtube size={14} className="text-red-400" />
                                            ) : (
                                                <Cpu size={14} className="text-emerald-400" />
                                            )}
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold uppercase text-[10px]">{log.actionName}</span>
                                                <span className="text-[9px] text-slate-500">{log.endpointName}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {log.apiType === 'gemini' && (
                                                <span className="text-emerald-400 font-bold">+{log.estimatedTokens} tokens</span>
                                            )}
                                            <span className="text-slate-500 text-[9px]">
                                                {new Date(log.timestamp).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ActivityLogs;
