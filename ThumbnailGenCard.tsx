import React, { useState } from 'react';
import { Image as ImageIcon, Download, Copy, Check, Maximize2, Sparkles } from 'lucide-react';

interface Props {
  data: {
    prompt: string;
    imageUrl: string;
    aspectRatio?: string;
  };
  isAr: boolean;
}

export const ThumbnailGenCard: React.FC<Props> = ({ data, isAr }) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  if (!data || !data.imageUrl) return null;

  const downloadImage = () => {
    const a = document.createElement('a');
    a.href = data.imageUrl;
    a.download = `pixelforge-thumbnail-${Date.now()}.png`;
    a.click();
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(data.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="w-full my-3 bg-[#0e070a] border border-white/10 rounded-xl p-4 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
            <ImageIcon size={16} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white line-clamp-1">
              "{data.prompt}"
            </h4>
            <div className="text-[11px] text-slate-400">
              {isAr ? 'صورة مصغرة مولدة بالذكاء الاصطناعي (16:9)' : 'AI Generated Thumbnail (16:9)'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={copyPrompt}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5 border border-white/10"
            title={isAr ? 'نسخ البرومبت' : 'Copy prompt'}
          >
            {copiedPrompt ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copiedPrompt ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ البرومبت' : 'Prompt')}</span>
          </button>
          <button
            onClick={downloadImage}
            className="px-4 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] flex items-center gap-1.5 active:scale-95"
          >
            <Download size={14} />
            <span>{isAr ? 'تحميل الصورة' : 'Download PNG'}</span>
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group bg-black shadow-2xl">
        <img 
          src={data.imageUrl} 
          alt="Generated Thumbnail" 
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" 
        />
        
        {/* Overlay hover actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button 
            onClick={() => setFullscreen(true)}
            className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
            title={isAr ? 'تكبير ملء الشاشة' : 'Fullscreen'}
          >
            <Maximize2 size={18} />
          </button>
          <button 
            onClick={downloadImage}
            className="p-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white shadow-lg backdrop-blur-md transition-colors"
            title={isAr ? 'تنزيل' : 'Download'}
          >
            <Download size={18} />
          </button>
        </div>

        <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-slate-300 border border-white/10 flex items-center gap-1.5">
          <Sparkles size={11} className="text-pink-400" />
          <span>16:9 YOUTUBE PRO READY</span>
        </div>
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div 
          className="fixed inset-0 z-[500] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setFullscreen(false)}
        >
          <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            <img src={data.imageUrl} alt="Thumbnail Full" className="w-full h-auto rounded-2xl shadow-2xl border border-white/20" />
            <button 
              onClick={() => setFullscreen(false)}
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
