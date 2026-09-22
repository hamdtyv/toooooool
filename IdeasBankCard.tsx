import React from 'react';
import { Lightbulb, Sparkles, ArrowRight, Video, Target, TrendingUp } from 'lucide-react';

interface IdeaItem {
  title: string;
  hook: string;
  thumbnail_concept: string;
  why_it_works?: string;
  viral_score?: number;
}

interface Props {
  data: {
    niche?: string;
    ideas: IdeaItem[];
  };
  isAr: boolean;
  onSelectIdeaForScript: (ideaTitle: string) => void;
  onSelectIdeaForThumbnail?: (ideaTitle: string) => void;
}

export const IdeasBankCard: React.FC<Props> = ({ data, isAr, onSelectIdeaForScript, onSelectIdeaForThumbnail }) => {
  if (!data || !data.ideas || data.ideas.length === 0) return null;

  return (
    <div className="w-full my-3 bg-[#0d0c07] border border-white/10 rounded-xl p-4 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
            <Lightbulb size={16} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              {data.niche ? (isAr ? `أفكار مقترحة: ${data.niche}` : `Ideas for: ${data.niche}`) : (isAr ? 'بنك أفكار الفيديوهات' : 'Video Ideas Lab')}
            </h4>
            <div className="text-[11px] text-slate-400">
              {data.ideas.length} {isAr ? 'أفكار مع الهوك ومفهوم المصغرة' : 'Ideas with hooks & thumbnail concepts'}
            </div>
          </div>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="space-y-4">
        {data.ideas.map((idea, idx) => (
          <div 
            key={idx}
            className="bg-[#020403] border border-white/10 hover:border-yellow-500/40 rounded-xl p-4 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-yellow-500/20 text-yellow-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  #{idx + 1}
                </span>
                <h5 className="text-sm md:text-base font-bold text-white group-hover:text-yellow-200 transition-colors">
                  {idea.title}
                </h5>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                <TrendingUp size={12} />
                <span>{idea.viral_score || 94}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3 text-xs">
              <div className="bg-white/[0.02] p-3 rounded-lg border border-white/5">
                <span className="text-[10px] uppercase tracking-wider text-yellow-400 font-bold block mb-1">
                  {isAr ? '⚡ زاوية الهوك والفضول (Hook Angle):' : '⚡ Psychological Hook:'}
                </span>
                <p className="text-slate-300 leading-relaxed">{idea.hook}</p>
              </div>

              <div className="bg-white/[0.02] p-3 rounded-lg border border-white/5">
                <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block mb-1">
                  {isAr ? '🖼️ مفهوم الصورة المصغرة (Thumbnail Angle):' : '🖼️ Thumbnail Concept:'}
                </span>
                <p className="text-slate-300 leading-relaxed">{idea.thumbnail_concept}</p>
              </div>
            </div>

            {idea.why_it_works && (
              <div className="text-[11px] text-slate-400 mb-3 px-1">
                <span className="text-slate-300 font-bold">{isAr ? 'لماذا سينتشر؟ ' : 'Why it goes viral: '}</span>
                {idea.why_it_works}
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
              <button
                onClick={() => onSelectIdeaForScript(idea.title)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>{isAr ? '✍️ اكتب اسكريبت كامل لهذه الفكرة' : 'Generate Full Script'}</span>
                <ArrowRight size={13} />
              </button>

              {onSelectIdeaForThumbnail && (
                <button
                  onClick={() => onSelectIdeaForThumbnail(idea.title)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-300 border border-white/10 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <span>{isAr ? '🖼️ ولد صورة مصغرة لها' : 'Generate Thumbnail'}</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
