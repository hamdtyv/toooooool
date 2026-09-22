import React, { useState, useEffect } from 'react';
import { Target, Users, Eye, Edit2, Check, Sparkles, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLang } from '../../index';

export default function GoalSetting() {
    const { lang } = useLang();
    const isAr = lang === 'ar';

    const [isEditing, setIsEditing] = useState(false);
    
    const [subTarget, setSubTarget] = useState(10000);
    const [subCurrent, setSubCurrent] = useState(0);
    
    const [viewTarget, setViewTarget] = useState(100000);
    const [viewCurrent, setViewCurrent] = useState(0);

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'congrats' } | null>(null);

    const triggerToast = (message: string, type: 'success' | 'congrats') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4500);
    };

    useEffect(() => {
        const savedSubTarget = localStorage.getItem('goal_sub_target');
        const savedSubCurrent = localStorage.getItem('goal_sub_current');
        const savedViewTarget = localStorage.getItem('goal_view_target');
        const savedViewCurrent = localStorage.getItem('goal_view_current');

        if (savedSubTarget) setSubTarget(parseInt(savedSubTarget, 10));
        if (savedSubCurrent) setSubCurrent(parseInt(savedSubCurrent, 10));
        if (savedViewTarget) setViewTarget(parseInt(savedViewTarget, 10));
        if (savedViewCurrent) setViewCurrent(parseInt(savedViewCurrent, 10));
    }, []);

    const saveGoals = () => {
        localStorage.setItem('goal_sub_target', subTarget.toString());
        localStorage.setItem('goal_sub_current', subCurrent.toString());
        localStorage.setItem('goal_view_target', viewTarget.toString());
        localStorage.setItem('goal_view_current', viewCurrent.toString());
        setIsEditing(false);

        const subProgressRatio = subTarget > 0 ? subCurrent / subTarget : 0;
        const viewProgressRatio = viewTarget > 0 ? viewCurrent / viewTarget : 0;

        if (subProgressRatio >= 1 || viewProgressRatio >= 1) {
            triggerToast(
                isAr 
                    ? 'تهانينا الحارة! لقد حققت أحد أهدافك الشهرية بنجاح 🌟🏆' 
                    : 'Congratulations! You have successfully smashed one of your monthly targets! 🌟🏆',
                'congrats'
            );
        } else {
            triggerToast(
                isAr 
                    ? 'تم تحديث أهدافك الشهرية بنجاح! طموحك رائع 📈' 
                    : 'Monthly goals updated successfully! Keep growing! 📈',
                'success'
            );
        }
    };

    const subProgress = subTarget > 0 ? Math.min(100, Math.round((subCurrent / subTarget) * 100)) : 0;
    const viewProgress = viewTarget > 0 ? Math.min(100, Math.round((viewCurrent / viewTarget) * 100)) : 0;

    return (
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl relative overflow-hidden backdrop-blur-sm mt-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Target size={20} className="text-rose-500 animate-pulse"/>
                    {isAr ? 'أهداف الشهر' : 'Monthly Goals'}
                </h3>
                {isEditing ? (
                    <button onClick={saveGoals} className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-emerald-500/30 transition-colors">
                        <Check size={14} /> {isAr ? 'حفظ' : 'Save'}
                    </button>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="text-xs bg-white/10 text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-white/20 transition-colors">
                        <Edit2 size={14} /> {isAr ? 'تعديل الأهداف' : 'Edit Goals'}
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {/* Subscribers Goal */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Users size={16} className="text-blue-400" />
                            <span className="text-sm font-medium text-slate-300">{isAr ? 'المشتركين الجدد' : 'New Subscribers'}</span>
                        </div>
                        {isEditing ? (
                            <div className="flex items-center gap-2 text-xs">
                                <input type="number" value={subCurrent} onChange={e => setSubCurrent(Number(e.target.value))} className="w-20 bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-center" />
                                <span className="text-slate-500">/</span>
                                <input type="number" value={subTarget} onChange={e => setSubTarget(Number(e.target.value))} className="w-20 bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-center" />
                            </div>
                        ) : (
                            <span className="text-sm font-bold text-white">
                                {subCurrent.toLocaleString()} <span className="text-slate-500 text-xs font-normal">/ {subTarget.toLocaleString()}</span>
                            </span>
                        )}
                    </div>
                    <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${subProgress}%` }}
                           transition={{ duration: 1.2, ease: "easeOut" }}
                           className="h-full bg-blue-500 rounded-full relative"
                        >
                           <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </motion.div>
                    </div>
                    <p className="text-right text-[10px] text-slate-500 mt-1">{subProgress}% {isAr ? 'مكتمل' : 'Completed'}</p>
                </div>

                {/* Views Goal */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Eye size={16} className="text-rose-400" />
                            <span className="text-sm font-medium text-slate-300">{isAr ? 'المشاهدات الكلية' : 'Total Views'}</span>
                        </div>
                        {isEditing ? (
                            <div className="flex items-center gap-2 text-xs">
                                <input type="number" value={viewCurrent} onChange={e => setViewCurrent(Number(e.target.value))} className="w-24 bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-center" />
                                <span className="text-slate-500">/</span>
                                <input type="number" value={viewTarget} onChange={e => setViewTarget(Number(e.target.value))} className="w-24 bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-center" />
                            </div>
                        ) : (
                            <span className="text-sm font-bold text-white">
                                {viewCurrent.toLocaleString()} <span className="text-slate-500 text-xs font-normal">/ {viewTarget.toLocaleString()}</span>
                            </span>
                        )}
                    </div>
                    <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${viewProgress}%` }}
                           transition={{ duration: 1.2, ease: "easeOut" }}
                           className="h-full bg-rose-500 rounded-full relative"
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </motion.div>
                    </div>
                    <p className="text-right text-[10px] text-slate-500 mt-1">{viewProgress}% {isAr ? 'مكتمل' : 'Completed'}</p>
                </div>
            </div>

            {/* Congratulatory / Action update local Toast alert */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className={`absolute inset-x-4 bottom-4 z-50 p-4 rounded-2xl border backdrop-blur-md flex items-center gap-3 shadow-lg ${
                            toast.type === 'congrats' 
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' 
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                        }`}
                    >
                        {toast.type === 'congrats' ? (
                            <Award className="text-amber-400 shrink-0 animate-bounce" size={24} />
                        ) : (
                            <Sparkles className="text-emerald-400 shrink-0 animate-pulse" size={24} />
                        )}
                        <span className="text-xs md:text-sm font-bold leading-tight">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
