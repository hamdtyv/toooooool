import React, { useState, useEffect } from 'react';
import { Sparkles as SparklesIcon, Cpu, Youtube, AlertCircle, CheckCircle, Flame } from 'lucide-react';
import { useLang } from '../index';
import { useAppState } from '../contexts/AppStateContext';
import { youtubeHealth, geminiHealth, subscribeToKeysChange, getYouTubeApiKey, getGeminiApiKey } from '../services/apiKeyService';

const LiquidGlassHeader: React.FC = () => {
    const { lang } = useLang();
    const isAr = lang === 'ar';
    const { isAnalyzing, isDragonTheme } = useAppState();

    const [ytStatus, setYtStatus] = useState(youtubeHealth);
    const [gemStatus, setGemStatus] = useState(geminiHealth);
    const [showYtHover, setShowYtHover] = useState(false);
    const [showGemHover, setShowGemHover] = useState(false);

    useEffect(() => {
        const handleUpdate = () => {
            setYtStatus({ ...youtubeHealth });
            setGemStatus({ ...geminiHealth });
        };
        handleUpdate();
        return subscribeToKeysChange(handleUpdate);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'bg-emerald-500';
            case 'degraded': return 'bg-amber-500 animate-pulse';
            case 'rate-limited': return 'bg-red-500 animate-ping';
            default: return 'bg-slate-500';
        }
    };

    const getStatusText = (status: string) => {
        if (isAr) {
            switch (status) {
                case 'healthy': return 'نشط ومستقر';
                case 'degraded': return 'استهلاك مرتفع';
                case 'rate-limited': return 'محدود / متوقف';
                default: return 'غير معروف';
            }
        }
        switch (status) {
            case 'healthy': return 'Active & Stable';
            case 'degraded': return 'High Consumption';
            case 'rate-limited': return 'Rate Limited';
            default: return 'Unknown';
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-[100] h-20 backdrop-blur-[10px] backdrop-saturate-[150%] bg-[rgba(5,10,9,0.1)] border-b border-white/10 flex items-center justify-between px-6 transition-all duration-300">
            {/* Liquid Background Layer */}
            <div className="absolute inset-0 z-0 overflow-hidden rounded-b-3xl pointer-events-none">
                <svg className="absolute w-full h-full opacity-30" viewBox="0 0 1000 100" preserveAspectRatio="none">
                    <path
                        className={`animate-wave-1 ${isDragonTheme ? 'fill-emerald-500/40' : 'fill-blue-500/40'}`}
                        d="M0 100C300 0 700 200 1000 50V0H0Z"
                    />
                    <path
                        className={`animate-wave-2 ${isDragonTheme ? 'fill-emerald-500/30' : 'fill-blue-500/30'}`}
                        d="M0 100C300 150 700 50 1000 80V0H0Z"
                    />
                    <path
                        className={`animate-wave-3 ${isDragonTheme ? 'fill-emerald-500/20' : 'fill-blue-500/20'}`}
                        d="M0 100C300 200 700 100 1000 90V0H0Z"
                    />
                </svg>
            </div>

            {/* Logo Interface Layer */}
            <div className="relative z-10 flex items-center gap-3">
                <div className="relative w-10 h-10 flex items-center justify-center">
                    <div className={`absolute inset-0 border rounded-xl animate-[spin_10s_linear_infinite] ${isDragonTheme ? 'border-emerald-500/40' : 'border-blue-500/40'}`}></div>
                    
                    {/* Sparkles icon instead of Dragon image logo */}
                    <SparklesIcon 
                      size={18} 
                      className={`transition-all ${
                        isDragonTheme 
                          ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]' 
                          : 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                      }`}
                    />

                    {/* Glowing Green Flame Particles */}
                    {isAnalyzing && (
                      <div className="absolute inset-0 z-10 pointer-events-none">
                        <span className="absolute bottom-full left-1/4 w-2 h-2 bg-emerald-400 rounded-full blur-[1px] animate-flame-particle delay-75"></span>
                        <span className="absolute bottom-full left-1/2 w-3 h-3 bg-emerald-500 rounded-full blur-[1.5px] animate-flame-particle delay-150"></span>
                        <span className="absolute bottom-full left-3/4 w-2 h-2 bg-teal-400 rounded-full blur-[1px] animate-flame-particle delay-300"></span>
                        <div className="absolute inset-[-12px] rounded-full border border-emerald-500/40 animate-ping opacity-60"></div>
                        <div className="absolute inset-[-6px] rounded-full bg-emerald-400/20 blur-sm animate-pulse"></div>
                      </div>
                    )}
                </div>
                <h1 className="text-xl font-black font-space brand-shimmer leading-none uppercase italic text-[#F5F5F5] pr-2">
                    {isAr ? 'مُثقّف' : 'MUTHAQAF'}
                </h1>
            </div>

            {/* Real-time API Health and Quota Availability Widget */}
            <div className="relative z-10 flex items-center gap-4">
                {/* YouTube Quota Tracker */}
                <div 
                    className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-all cursor-help"
                    onMouseEnter={() => setShowYtHover(true)}
                    onMouseLeave={() => setShowYtHover(false)}
                >
                    <Youtube size={14} className="text-red-400" />
                    <span className="text-[11px] font-mono text-slate-300 font-bold hidden sm:inline">YouTube API</span>
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(ytStatus.status)}`}></span>
                    
                    {/* Hover Stats Card */}
                    {showYtHover && (
                        <div className={`absolute top-11 ${isAr ? 'left-0' : 'right-0'} w-64 p-4 rounded-2xl bg-[#09110f]/95 border border-white/10 shadow-2xl backdrop-blur-xl space-y-3 z-50 animate-entrance`}>
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <span className="text-xs font-bold text-slate-400">{isAr ? 'حالة مفتاح يوتيوب' : 'YouTube Key Status'}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold text-black ${getStatusColor(ytStatus.status)}`}>
                                    {getStatusText(ytStatus.status)}
                                </span>
                            </div>
                            <div className="space-y-1 text-slate-300">
                                <div className="flex justify-between text-xs">
                                    <span>{isAr ? 'الاستهلاك الشهري:' : 'Monthly Use:'}</span>
                                    <span className="font-mono text-emerald-400 font-bold">{ytStatus.usageCountThisMonth} / {ytStatus.limitThisMonth}</span>
                                </div>
                                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                                        style={{ width: `${Math.min(100, (ytStatus.usageCountThisMonth / ytStatus.limitThisMonth) * 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                                    {isAr ? 'الاستهلاك يعتمد على الطلبات النشطة لبيانات الفيديوهات والقنوات.' : 'Calculated based on active searches and profile queries.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Gemini Token Tracker */}
                <div 
                    className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-all cursor-help"
                    onMouseEnter={() => setShowGemHover(true)}
                    onMouseLeave={() => setShowGemHover(false)}
                >
                    <Cpu size={14} className="text-emerald-400" />
                    <span className="text-[11px] font-mono text-slate-300 font-bold hidden sm:inline">Gemini AI</span>
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(gemStatus.status)}`}></span>
                    
                    {/* Hover Stats Card */}
                    {showGemHover && (
                        <div className={`absolute top-11 ${isAr ? 'left-0' : 'right-0'} w-64 p-4 rounded-2xl bg-[#09110f]/95 border border-white/10 shadow-2xl backdrop-blur-xl space-y-3 z-50 animate-entrance`}>
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <span className="text-xs font-bold text-slate-400">{isAr ? 'حالة الذكاء الاصطناعي' : 'Gemini AI Status'}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold text-black ${getStatusColor(gemStatus.status)}`}>
                                    {getStatusText(gemStatus.status)}
                                </span>
                            </div>
                            <div className="space-y-1 text-slate-300">
                                <div className="flex justify-between text-xs">
                                    <span>{isAr ? 'استهلاك الرموز:' : 'Tokens Consumed:'}</span>
                                    <span className="font-mono text-emerald-400 font-bold">{(gemStatus.usageCountThisMonth / 1000).toFixed(1)}k / {(gemStatus.limitThisMonth / 1000).toFixed(0)}k</span>
                                </div>
                                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                                        style={{ width: `${Math.min(100, (gemStatus.usageCountThisMonth / gemStatus.limitThisMonth) * 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                                    {isAr ? 'يتتبع الكلمات المستهلكة في معالجة وكتابة الاسكربتات والتحليلات.' : 'Tracks estimated output and contextual input volume.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes flame-particle {
                    0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0.9; }
                    50% { transform: translateY(-12px) scale(1.2) rotate(180deg); opacity: 0.6; }
                    100% { transform: translateY(-24px) scale(0.6) rotate(360deg); opacity: 0; }
                }
                .animate-flame-particle {
                    animation: flame-particle 1s ease-out infinite;
                }
                @keyframes wave {
                    0% { transform: translateX(-10%); }
                    50% { transform: translateX(10%); }
                    100% { transform: translateX(-10%); }
                }
                .animate-wave-1 { animation: wave 10s cubic-bezier(0.445, 0.05, 0.55, 0.95) infinite; }
                .animate-wave-2 { animation: wave 15s cubic-bezier(0.445, 0.05, 0.55, 0.95) infinite; animation-delay: -1.5s; }
                .animate-wave-3 { animation: wave 20s cubic-bezier(0.445, 0.05, 0.55, 0.95) infinite; animation-delay: -3s; }
            `}</style>
        </header>
    );
};

export default LiquidGlassHeader;
