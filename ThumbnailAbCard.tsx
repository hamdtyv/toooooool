import React, { useState } from 'react';
import { Trophy, Sparkles, TrendingUp, Download, Eye, Maximize2, ShieldCheck, Check } from 'lucide-react';

interface Props {
  data: {
    title?: string;
    imageA: string;
    imageB: string;
    analysis: {
      winner: 'A' | 'B';
      confidence_score: number;
      ctr_prediction_diff: string;
      breakdown_A: {
        strengths: string[];
        weaknesses: string[];
        color_theory: string;
        predicted_ctr_range: string;
      };
      breakdown_B: {
        strengths: string[];
        weaknesses: string[];
        color_theory: string;
        predicted_ctr_range: string;
      };
      final_verdict: string;
    };
  };
  isAr: boolean;
}

export const ThumbnailAbCard: React.FC<Props> = ({ data, isAr }) => {
  const [fullscreenImg, setFullscreenImg] = useState<string | null>(null);

  if (!data || !data.analysis) return null;
  const { winner, confidence_score, ctr_prediction_diff, breakdown_A, breakdown_B, final_verdict } = data.analysis;

  const downloadImage = (base64: string, label: string) => {
    const a = document.createElement('a');
    a.href = base64;
    a.download = `thumbnail-${label}-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="w-full my-3 bg-[#0d0d08] border border-white/10 rounded-xl p-4 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              {data.title ? `"${data.title}"` : (isAr ? 'مقارنة الصورتين المصغرتين A/B' : 'Thumbnail A/B Comparison')}
            </h4>
            <div className="text-[11px] text-slate-400">
              {isAr ? 'تحليل التباين، الفضول ومعدل النقر المتوقع' : 'Contrast, curiosity & CTR analysis'}
            </div>
          </div>
        </div>

        {/* Winner Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
          <Trophy size={14} className="text-amber-400" />
          <span className="text-xs font-bold font-mono">
            {isAr ? `الفائز المقترح: المفهوم ${winner}` : `WINNER: CONCEPT ${winner}`}
          </span>
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
            {ctr_prediction_diff}
          </span>
        </div>
      </div>

      {/* Dual Cards Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Concept A */}
        <div className={`relative rounded-2xl border p-4 transition-all duration-300 flex flex-col justify-between ${winner === 'A' ? 'bg-amber-950/20 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : 'bg-black/30 border-white/10 opacity-85'}`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-black text-sm flex items-center justify-center font-mono">A</span>
                <span className="text-sm font-bold text-white">{isAr ? 'المفهوم البصري (A)' : 'Visual Concept A'}</span>
              </div>
              {winner === 'A' && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  <Trophy size={12} /> {isAr ? 'الفائز الأعلى نقراً' : 'Top Performer'}
                </span>
              )}
            </div>

            {/* Image Preview */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group mb-3 bg-black">
              <img 
                src={data.imageA} 
                alt="Thumbnail A" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button 
                  onClick={() => setFullscreenImg(data.imageA)}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                  title={isAr ? 'تكبير' : 'Enlarge'}
                >
                  <Maximize2 size={16} />
                </button>
                <button 
                  onClick={() => downloadImage(data.imageA, 'A')}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                  title={isAr ? 'تنزيل الصورة' : 'Download'}
                >
                  <Download size={16} />
                </button>
              </div>
              <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
                16:9 YOUTUBE
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg">
                <span className="text-slate-400">{isAr ? 'معدل النقر المتوقع (CTR)' : 'Estimated CTR:'}</span>
                <span className="font-bold text-emerald-400 font-mono">{breakdown_A?.predicted_ctr_range || '8.2% - 11.5%'}</span>
              </div>
              <div className="text-slate-300 bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                <span className="text-[10px] uppercase tracking-wider text-amber-400 block font-bold mb-1">{isAr ? 'سيكولوجية الألوان والتكوين:' : 'Color & Composition:'}</span>
                <p className="leading-relaxed text-[11px]">{breakdown_A?.color_theory}</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => downloadImage(data.imageA, 'A')}
            className="mt-3 w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors border border-white/10 flex items-center justify-center gap-2"
          >
            <Download size={14} />
            <span>{isAr ? 'تحميل صورة المفهوم (A)' : 'Download Concept A'}</span>
          </button>
        </div>

        {/* Concept B */}
        <div className={`relative rounded-2xl border p-4 transition-all duration-300 flex flex-col justify-between ${winner === 'B' ? 'bg-amber-950/20 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : 'bg-black/30 border-white/10 opacity-85'}`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 font-black text-sm flex items-center justify-center font-mono">B</span>
                <span className="text-sm font-bold text-white">{isAr ? 'المفهوم البصري (B)' : 'Visual Concept B'}</span>
              </div>
              {winner === 'B' && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  <Trophy size={12} /> {isAr ? 'الفائز الأعلى نقراً' : 'Top Performer'}
                </span>
              )}
            </div>

            {/* Image Preview */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group mb-3 bg-black">
              <img 
                src={data.imageB} 
                alt="Thumbnail B" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button 
                  onClick={() => setFullscreenImg(data.imageB)}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                  title={isAr ? 'تكبير' : 'Enlarge'}
                >
                  <Maximize2 size={16} />
                </button>
                <button 
                  onClick={() => downloadImage(data.imageB, 'B')}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                  title={isAr ? 'تنزيل الصورة' : 'Download'}
                >
                  <Download size={16} />
                </button>
              </div>
              <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
                16:9 YOUTUBE
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg">
                <span className="text-slate-400">{isAr ? 'معدل النقر المتوقع (CTR)' : 'Estimated CTR:'}</span>
                <span className="font-bold text-emerald-400 font-mono">{breakdown_B?.predicted_ctr_range || '6.5% - 9.0%'}</span>
              </div>
              <div className="text-slate-300 bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                <span className="text-[10px] uppercase tracking-wider text-purple-400 block font-bold mb-1">{isAr ? 'سيكولوجية الألوان والتكوين:' : 'Color & Composition:'}</span>
                <p className="leading-relaxed text-[11px]">{breakdown_B?.color_theory}</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => downloadImage(data.imageB, 'B')}
            className="mt-3 w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors border border-white/10 flex items-center justify-center gap-2"
          >
            <Download size={14} />
            <span>{isAr ? 'تحميل صورة المفهوم (B)' : 'Download Concept B'}</span>
          </button>
        </div>
      </div>

      {/* Verdict Footer */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="text-amber-400 shrink-0 mt-0.5" size={18} />
        <div>
          <span className="text-xs font-bold text-amber-300 block mb-1">
            {isAr ? 'التوصية النهائية لزيادة النقرات (Final Verdict):' : 'Final CTR Recommendation:'}
          </span>
          <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-normal">
            {final_verdict}
          </p>
        </div>
      </div>

      {/* Fullscreen modal */}
      {fullscreenImg && (
        <div 
          className="fixed inset-0 z-[500] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setFullscreenImg(null)}
        >
          <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            <img src={fullscreenImg} alt="Preview" className="w-full h-auto rounded-2xl shadow-2xl border border-white/20" />
            <button 
              onClick={() => setFullscreenImg(null)}
              className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded-xl border border-white/20 text-sm font-bold"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
