import React, { useState } from 'react';
import { useLang } from '../index';
import { motion } from 'motion/react';
import { Search, Loader2, Image as ImageIcon, Zap, Target, TrendingUp, Trophy, CheckCircle, BarChart2 } from 'lucide-react';
import { generateThumbnailPrompts, generateBananaImage, analyzeThumbnailAb } from '../services/geminiService';
import { logToolActivity } from '../services/firebase';

const ThumbnailAbSimulator: React.FC = () => {
    const { t, lang, resultLang } = useLang();
    const isAr = lang === 'ar';
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0); // 0: input, 1: generating prompts, 2: generating images, 3: analyzing, 4: done
    
    const [imageA, setImageA] = useState<string | null>(null);
    const [imageB, setImageB] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<any>(null);

    const handleSimulate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        setStep(1);
        setImageA(null);
        setImageB(null);
        setAnalysis(null);

        try {
            // Step 1: Generate Prompts
            const promptsResult = await generateThumbnailPrompts(title, lang, resultLang);
            if (!promptsResult || !promptsResult.promptA || !promptsResult.promptB) {
                throw new Error("Failed to generate prompts");
            }
            
            setStep(2);
            
            // Step 2: Generate Images in parallel
            const [base64A, base64B] = await Promise.all([
                generateBananaImage(promptsResult.promptA, "thumbnail", "16:9", lang, resultLang),
                generateBananaImage(promptsResult.promptB, "thumbnail", "16:9", lang, resultLang)
            ]);

            if (!base64A || !base64B) {
                 throw new Error("Failed to generate images");
            }
            
            setImageA(base64A);
            setImageB(base64B);
            
            setStep(3);

            // Step 3: Analyze A vs B
            const analysisResult = await analyzeThumbnailAb(base64A, base64B, title, lang, resultLang);
            
            if (analysisResult) {
                setAnalysis(analysisResult);
                await logToolActivity('thumbnail_ab_simulator', t.thumbnailSimulator || (isAr ? 'محاكي الصور المصغرة' : 'Thumbnail Simulator'), 'ab_test', {
                    title
                }, isAr ? `تحليل صور مصغرة للفيديو: ${title.substring(0, 30)}` : `Analyzed thumbnails for video: ${title.substring(0, 30)}`);
            }
            
            setStep(4);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            if (step !== 4) setStep(0);
        }
    };

    const renderLoadingState = () => {
        const messages = isAr ? [
            'جاري التحضير...',
            'جاري تخيل المفاهيم البصرية للفكرة A و B...',
            'جاري توليد الصور باستخدام الذكاء الاصطناعي (قد يستغرق 10-20 ثانية)...',
            'جاري تحليل الألوان والانفعالات والتنبؤ بالـ CTR...'
        ] : [
            'Preparing...',
            'Imagining visual concepts for A and B...',
            'Generating images via AI (may take 10-20 seconds)...',
            'Analyzing colors, emotions, and predicting CTR...'
        ];

        return (
            <div className="flex flex-col items-center justify-center p-16 bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">{messages[step]}</h3>
                <div className="w-full max-w-md bg-white/10 h-2 rounded-full overflow-hidden mt-6">
                    <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
                </div>
            </div>
        );
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
                    <ImageIcon size={14} className="text-blue-500" />
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                        {t.thumbnailSimulator || (isAr ? 'محاكي الصور المصغرة' : 'Thumbnail A/B Simulator')}
                    </span>
                </motion.div>
                <h2 className={`text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-sm ${isAr ? 'font-alex' : ''}`}>
                    {t.thumbnailSimulator || (isAr ? 'محاكي الصور المصغرة A/B' : 'Thumbnail A/B Simulator')}
                </h2>
                <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed font-normal">
                    {isAr 
                        ? 'أدخل فكرة أو عنوان الفيديو، وسنقوم بتوليد نسختين مختلفتين تماماً للصورة المصغرة، ثم اختبارها ضد بعضها لتوقع الأفضل.' 
                        : 'Enter your video idea or title, and we will generate two distinct thumbnail concepts and test them against each other.'}
                </p>
            </div>

            {/* Input Section */}
            <form onSubmit={handleSimulate} className="relative max-w-3xl mb-12">
                <div className="relative group flex items-center">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className={`h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors ${isAr ? 'right-4 left-auto' : ''}`} />
                    </div>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`block w-full bg-[#0a0f0d] border border-white/10 rounded-2xl py-4 ${isAr ? 'pr-12 pl-40' : 'pl-12 pr-40'} text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-xl`}
                        placeholder={isAr ? 'أدخل فكرة أو عنوان الفيديو هنا...' : 'Enter video title or idea here...'}
                        dir={isAr ? 'rtl' : 'ltr'}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={!title.trim() || loading}
                        className={`absolute ${isAr ? 'left-2' : 'right-2'} top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                        <span className="hidden sm:inline">{isAr ? 'توليد واختبار' : 'Generate & Test'}</span>
                    </button>
                </div>
            </form>

            {loading && renderLoadingState()}

            {!loading && step === 4 && analysis && imageA && imageB && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    {/* Winner Banner */}
                    <div className={`p-6 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-6 ${analysis.winner === 'A' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${analysis.winner === 'A' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                <Trophy size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">
                                    {isAr ? `النسخة (${analysis.winner}) هي الفائزة` : `Concept (${analysis.winner}) is the Winner!`}
                                </h3>
                                <p className="text-sm text-slate-300 max-w-xl">{analysis.reasoning}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Concept A */}
                        <div className={`bg-[#050a09] rounded-3xl overflow-hidden border transition-all ${analysis.winner === 'A' ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'border-white/10 opacity-70'}`}>
                            <div className="relative">
                                <img src={imageA} alt="Concept A" className="w-full aspect-video object-cover" />
                                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                                    <span className="font-bold text-white">A</span>
                                    {analysis.winner === 'A' && <CheckCircle size={16} className="text-emerald-400" />}
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-white flex items-center gap-2">
                                        <Target size={18} className="text-purple-400" />
                                        {isAr ? 'التحليل العاطفي واللوني' : 'Color & Emotional Analysis'}
                                    </h4>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">{isAr ? 'الـ CTR المتوقع' : 'Predicted CTR'}</span>
                                        <span className="text-2xl font-black text-emerald-400 font-space">{analysis.analysisA.ctr_prediction}%</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase tracking-widest mb-1 block">{isAr ? 'نظرية الألوان' : 'Color Theory'}</span>
                                        <p className="text-sm text-slate-300">{analysis.analysisA.color_theory}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase tracking-widest mb-1 block">{isAr ? 'التأثير العاطفي' : 'Emotional Impact'}</span>
                                        <p className="text-sm text-slate-300">{analysis.analysisA.emotional_engagement}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase tracking-widest mb-2 block">{isAr ? 'نقاط القوة' : 'Strengths'}</span>
                                        <ul className="space-y-2">
                                            {analysis.analysisA.strengths.map((str: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                                    <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                                                    <span>{str}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Concept B */}
                        <div className={`bg-[#050a09] rounded-3xl overflow-hidden border transition-all ${analysis.winner === 'B' ? 'border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'border-white/10 opacity-70'}`}>
                            <div className="relative">
                                <img src={imageB} alt="Concept B" className="w-full aspect-video object-cover" />
                                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                                    <span className="font-bold text-white">B</span>
                                    {analysis.winner === 'B' && <CheckCircle size={16} className="text-blue-400" />}
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-white flex items-center gap-2">
                                        <Target size={18} className="text-purple-400" />
                                        {isAr ? 'التحليل العاطفي واللوني' : 'Color & Emotional Analysis'}
                                    </h4>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">{isAr ? 'الـ CTR المتوقع' : 'Predicted CTR'}</span>
                                        <span className="text-2xl font-black text-blue-400 font-space">{analysis.analysisB.ctr_prediction}%</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase tracking-widest mb-1 block">{isAr ? 'نظرية الألوان' : 'Color Theory'}</span>
                                        <p className="text-sm text-slate-300">{analysis.analysisB.color_theory}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase tracking-widest mb-1 block">{isAr ? 'التأثير العاطفي' : 'Emotional Impact'}</span>
                                        <p className="text-sm text-slate-300">{analysis.analysisB.emotional_engagement}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase tracking-widest mb-2 block">{isAr ? 'نقاط القوة' : 'Strengths'}</span>
                                        <ul className="space-y-2">
                                            {analysis.analysisB.strengths.map((str: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                                    <CheckCircle size={14} className="text-blue-500 mt-0.5 shrink-0" />
                                                    <span>{str}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default ThumbnailAbSimulator;
