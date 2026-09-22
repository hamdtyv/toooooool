import React, { useState } from 'react';
import { Feather, Copy, Check, Clock, Film, Sparkles, Volume2, Video, ArrowRight } from 'lucide-react';

interface Props {
  data: {
    topic?: string;
    scriptText: string;
    duration?: string;
    tone?: string;
  };
  isAr: boolean;
  onGenerateThumbnail?: (title: string) => void;
  onGenerateSeo?: (title: string) => void;
}

export const ViralScriptCard: React.FC<Props> = ({ data, isAr, onGenerateThumbnail, onGenerateSeo }) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  if (!data || !data.scriptText) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(data.scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const wordCount = data.scriptText.split(/\s+/).filter(Boolean).length;
  const estimatedMin = Math.max(1, Math.round(wordCount / 130));

  return (
    <div className="w-full my-3 bg-[#070e0a] border border-white/10 rounded-xl p-4 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Feather size={16} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              {data.topic ? `"${data.topic}"` : (isAr ? 'اسكريبت الفيديو' : 'Video Script')}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>~{data.duration || `${estimatedMin} ${isAr ? 'دقائق' : 'mins'}`}</span>
              <span>•</span>
              <span>{wordCount} {isAr ? 'كلمة' : 'words'}</span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-colors"
          >
            <span>{isExpanded ? (isAr ? 'طي' : 'Collapse') : (isAr ? 'عرض' : 'Expand')}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ' : 'Copy')}</span>
          </button>
        </div>
      </div>

      {/* Script Content Viewer */}
      {isExpanded && (
        <div className="bg-[#030604] border border-white/5 rounded-lg p-3 text-xs md:text-sm leading-relaxed text-slate-200 max-h-[400px] overflow-y-auto custom-scrollbar whitespace-pre-wrap">
          {data.scriptText}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/5">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Sparkles size={14} className="text-emerald-400" />
          <span>{isAr ? 'تمت هندسة هذا الاسكريبت بروابط فضول ومحفزات احتفاظ لليوتيوب' : 'Engineered with open curiosity loops and retention spikes'}</span>
        </div>

        <div className="flex items-center gap-2">
          {onGenerateThumbnail && (
            <button
              onClick={() => onGenerateThumbnail(data.topic || '')}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-500/20 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span>{isAr ? 'توليد مصغرة لهذا الاسكريبت' : 'Generate Thumbnail'}</span>
              <ArrowRight size={13} />
            </button>
          )}
          {onGenerateSeo && (
            <button
              onClick={() => onGenerateSeo(data.topic || '')}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/20 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span>{isAr ? 'سيو وعناوين متصدرة' : 'SEO & Tags'}</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
