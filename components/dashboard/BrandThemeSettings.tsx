import React from 'react';
import { Palette, Check, Flame, Star, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppState } from '../../contexts/AppStateContext';
import { useLang } from '../../index';

export default function BrandThemeSettings() {
    const { lang } = useLang();
    const isAr = lang === 'ar';
    const { isDragonTheme, setIsDragonTheme, isReadingMode, setIsReadingMode } = useAppState();

    return (
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center gap-2 mb-4">
                <Palette size={18} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                    {isAr ? 'مظهر الهوية الشخصية' : 'Brand Identity Theme'}
                </h3>
            </div>
            
            <p className="text-xs text-slate-400 mb-4 font-light leading-relaxed">
                {isAr 
                    ? 'اختر مظهر الألوان المفضلة لديك لتخصيص كامل واجهة تطبيق مُثقف باللون المفضل.' 
                    : 'Customize the overall interface color scheme and branding assets of Muthaqaf.'}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Dragon Theme Option */}
                <button
                    onClick={() => setIsDragonTheme(true)}
                    className={`relative p-3 rounded-2xl border text-left flex flex-col items-start gap-2 transition-all ${
                        isDragonTheme 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-md shadow-emerald-500/5' 
                            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/10 hover:bg-white/[0.04]'
                    }`}
                >
                    <div className="flex items-center justify-between w-full">
                        <span className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg">
                            <Flame size={14} className="animate-pulse" />
                        </span>
                        {isDragonTheme && (
                            <span className="p-0.5 bg-emerald-500 text-black rounded-full shrink-0">
                                <Check size={10} strokeWidth={3} />
                            </span>
                        )}
                    </div>
                    <div>
                        <div className="text-[11px] font-bold text-white leading-tight">
                            {isAr ? 'التنين الأخضر' : 'Dragon Emerald'}
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5">
                            {isAr ? 'أخضر وزمردي مشع' : 'Glowing Emeralds'}
                        </div>
                    </div>
                </button>

                {/* Classic Blue/Teal Theme Options */}
                <button
                    onClick={() => setIsDragonTheme(false)}
                    className={`relative p-3 rounded-2xl border text-left flex flex-col items-start gap-2 transition-all ${
                        !isDragonTheme 
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-300 shadow-md shadow-blue-500/5' 
                            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/10 hover:bg-white/[0.04]'
                    }`}
                >
                    <div className="flex items-center justify-between w-full">
                        <span className="p-1 bg-blue-500/20 text-blue-400 rounded-lg">
                            <Star size={14} />
                        </span>
                        {!isDragonTheme && (
                            <span className="p-0.5 bg-blue-500 text-white rounded-full shrink-0">
                                <Check size={10} strokeWidth={3} />
                            </span>
                        )}
                    </div>
                    <div>
                        <div className="text-[11px] font-bold text-white leading-tight">
                            {isAr ? 'النمط الكلاسيكي' : 'Classic Cyber'}
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5">
                            {isAr ? 'أزرق سيبراني فائق' : 'Cybernetic Blues'}
                        </div>
                    </div>
                </button>
            </div>

            {/* Reading Mode Option */}
            <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <BookOpen size={16} className={isDragonTheme ? "text-emerald-400" : "text-blue-400"} />
                        <h4 className="text-xs font-bold text-white">
                            {isAr ? 'وضع القراءة المريح' : 'Comfortable Reading Mode'}
                        </h4>
                    </div>
                    
                    <button 
                        onClick={() => setIsReadingMode(!isReadingMode)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${
                            isReadingMode 
                                ? (isDragonTheme ? 'bg-emerald-500' : 'bg-blue-500') 
                                : 'bg-slate-700'
                        }`}
                    >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                            isReadingMode 
                                ? (isAr ? 'left-0.5' : 'right-0.5') 
                                : (isAr ? 'right-0.5' : 'left-0.5')
                        }`}></span>
                    </button>
                </div>
                <p className="text-[10px] text-slate-400 font-light leading-relaxed">
                    {isAr 
                        ? 'تفعيل وضع القراءة يقوم بتغيير تباين النصوص وتكبير الخط في جميع التقارير التحليلية لراحة العين.'
                        : 'Enable reading mode to alter text contrast and enlarge fonts across all analytical reports for eye comfort.'}
                </p>
            </div>
        </div>
    );
}
