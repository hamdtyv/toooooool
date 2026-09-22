import React, { useState, useEffect } from 'react';
import { Trophy, Target, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { loadFromStorage, StorageKeys } from '../../services/storageService';
import { useLang } from '../../index';

interface MilestoneProgress {
    channelId: string;
    channelTitle: string;
    target: number;
    current: number;
    percentage: number;
    isReached: boolean;
}

export default function MilestonesWidget() {
    const { lang } = useLang();
    const isAr = lang === 'ar';
    const [milestones, setMilestones] = useState<MilestoneProgress[]>([]);

    useEffect(() => {
        const loadMilestonesData = () => {
            const list: MilestoneProgress[] = [];
            try {
                // Loop over local storage keys
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('tv_milestones_')) {
                        // Extract channel ID
                        const channelId = key.substring('tv_milestones_'.length);
                        
                        // Load milestones list
                        const savedMilestones = loadFromStorage<number[]>(key);
                        if (!savedMilestones || savedMilestones.length === 0) continue;

                        // Load respective channel data to get title & subscriber statistics
                        const channelDataKey = `tv_data_${channelId}`;
                        const channelData = loadFromStorage<any>(channelDataKey);
                        
                        const channelTitle = channelData?.snippet?.title || `Channel / القناة (${channelId.substring(0,6)})`;
                        const currentSubs = channelData?.statistics?.subscriberCount 
                            ? parseInt(channelData.statistics.subscriberCount, 10) 
                            : 0;

                        savedMilestones.forEach(target => {
                            const percentage = target > 0 ? Math.min(100, Math.round((currentSubs / target) * 100)) : 0;
                            list.push({
                                channelId,
                                channelTitle,
                                target,
                                current: currentSubs,
                                percentage,
                                isReached: currentSubs >= target
                            });
                        });
                    }
                }
                // Sort by ratio of completion, or reached first
                list.sort((a, b) => b.percentage - a.percentage);
                setMilestones(list);
            } catch (err) {
                console.error("Error reading milestones in widget:", err);
            }
        };

        loadMilestonesData();
        // Set an interval to refresh if needed, or update on load
        const interval = setInterval(loadMilestonesData, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Trophy size={18} className="text-amber-400" />
                    {isAr ? 'أهداف المشتركين اللحظية' : 'Subscriber Live Milestones'}
                </h3>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                    {milestones.length} {isAr ? 'أهداف' : 'Goals'}
                </span>
            </div>

            {milestones.length === 0 ? (
                <div className="text-center py-6 bg-white/[0.02] border border-dashed border-white/5 rounded-2xl">
                    <p className="text-xs text-slate-500 mb-3 px-4">
                        {isAr 
                            ? 'لم تقم بإضافة أهداف لمشتركي قناتك بعد في لوحة المراقبة اللحظية.' 
                            : 'No live subscriber milestones configured yet. Add one in the Live Counter!'}
                    </p>
                    <a 
                      href="?tool=live" 
                      className="inline-block text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                        {isAr ? 'انتقل للمراقبة اللحظية وآلة الأهداف ←' : 'Go to Live Subscriber Tracker & Milestones →'}
                    </a>
                </div>
            ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {milestones.map((ms, index) => (
                        <div key={`${ms.channelId}_${ms.target}_${index}`} className="group p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-2xl transition-all">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="text-xs text-slate-300 font-bold truncate max-w-[150px]" title={ms.channelTitle}>
                                    {ms.channelTitle}
                                </span>
                                <div className="flex items-center gap-1 shrink-0">
                                    {ms.isReached ? (
                                        <span className="text-[9px] font-bold text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                            <CheckCircle2 size={10} />
                                            {isAr ? 'مكتمل' : 'REACHED'}
                                        </span>
                                    ) : (
                                        <span className="text-[9px] font-bold text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                            <TrendingUp size={10} />
                                            {ms.percentage}%
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-baseline justify-between mb-1 font-mono">
                                <span className="text-[10px] text-slate-500">
                                    {ms.current.toLocaleString()}
                                </span>
                                <span className="text-xs font-black text-white">
                                    / {ms.target.toLocaleString()}
                                </span>
                            </div>

                            {/* Simulated Smooth loading progress bar */}
                            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden relative">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${ms.percentage}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className={`h-full rounded-full relative ${
                                        ms.isReached 
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                                            : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                                    }`}
                                >
                                    {ms.isReached && (
                                        <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
