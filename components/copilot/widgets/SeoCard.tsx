import React, { useState } from 'react';
import { Search, Copy, Check, Hash, Tag, Type, CheckCircle2 } from 'lucide-react';

interface Props {
  data: {
    query?: string;
    titles?: string[];
    description?: string;
    tags?: string[];
    hashtags?: string[];
    seoScore?: number;
  };
  isAr: boolean;
}

export const SeoCard: React.FC<Props> = ({ data, isAr }) => {
  const [copiedTags, setCopiedTags] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [copiedTitleIndex, setCopiedTitleIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  if (!data) return null;

  const copyTags = () => {
    if (data.tags && data.tags.length > 0) {
      navigator.clipboard.writeText(data.tags.join(', '));
      setCopiedTags(true);
      setTimeout(() => setCopiedTags(false), 2000);
    }
  };

  const copyDesc = () => {
    if (data.description) {
      navigator.clipboard.writeText(data.description);
      setCopiedDesc(true);
      setTimeout(() => setCopiedDesc(false), 2000);
    }
  };

  const copyTitle = (title: string, index: number) => {
    navigator.clipboard.writeText(title);
    setCopiedTitleIndex(index);
    setTimeout(() => setCopiedTitleIndex(null), 2000);
  };

  return (
    <div className="w-full my-3 bg-[#060c0f] border border-white/10 rounded-xl p-4 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Search size={16} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              {data.query ? `"${data.query}"` : (isAr ? 'بيانات السيو والعناوين' : 'SEO & Metadata')}
            </h4>
            <div className="text-[11px] text-slate-400">
              {isAr ? 'عناوين مقترحة، كلمات مفتاحية ووصف' : 'Titles, keywords, description'}
            </div>
          </div>
        </div>

        {/* Score & Toggle */}
        <div className="flex items-center gap-1.5">
          <div className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-xs font-mono">
            {data.seoScore || 96}%
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-colors"
          >
            <span>{isExpanded ? (isAr ? 'طي' : 'Collapse') : (isAr ? 'عرض' : 'Expand')}</span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="animate-fade-in">
      {data.titles && data.titles.length > 0 && (
        <div className="mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Type size={14} className="text-cyan-400" />
            <span>{isAr ? 'عناوين عالية النقر (High CTR Variations)' : 'High CTR Title Variations'}</span>
          </div>

          <div className="space-y-2">
            {data.titles.map((title, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center font-mono">
                    #{idx + 1}
                  </span>
                  <span className="text-sm font-medium text-white group-hover:text-cyan-200 transition-colors">
                    {title}
                  </span>
                </div>
                <button
                  onClick={() => copyTitle(title, idx)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title={isAr ? 'نسخ العنوان' : 'Copy title'}
                >
                  {copiedTitleIndex === idx ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags Cloud Section */}
      {data.tags && data.tags.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Tag size={14} className="text-cyan-400" />
              <span>{isAr ? `الكلمات الدلالية الموصى بها (${data.tags.length} تاجز)` : `Ranked Search Tags (${data.tags.length})`}</span>
            </div>
            <button
              onClick={copyTags}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all"
            >
              {copiedTags ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedTags ? (isAr ? 'تم نسخ كل التاجز!' : 'All Tags Copied!') : (isAr ? 'نسخ جميع التاجز' : 'Copy All Tags')}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar p-3 rounded-xl bg-[#020506] border border-white/5">
            {data.tags.map((tag, idx) => (
              <span 
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-300 font-mono"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description Section */}
      {data.description && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isAr ? 'الوصف المحسن لمحركات البحث (SEO Description)' : 'Optimized Video Description'}
            </span>
            <button
              onClick={copyDesc}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
            >
              {copiedDesc ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedDesc ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الوصف' : 'Copy Description')}</span>
            </button>
          </div>
          <div className="p-4 rounded-xl bg-[#020506] border border-white/5 text-xs text-slate-300 leading-relaxed max-h-36 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
            {data.description}
          </div>
        </div>
      )}
      </div>
    )}
  </div>
);
};
