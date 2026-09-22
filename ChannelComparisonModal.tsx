import React, { useState } from 'react';
import { useChannel } from '../../contexts/ChannelContext';
import { useLang } from '../../index';
import {
  X,
  Scale,
  Youtube,
  BarChart3,
  Award,
  Users,
  Search,
  DollarSign,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export const ChannelComparisonModal: React.FC = () => {
  const { linkedChannels, isComparisonOpen, setIsComparisonOpen, setAuditChannel } = useChannel();
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    return linkedChannels.slice(0, 3).map(c => c.id);
  });

  if (!isComparisonOpen) return null;

  const toggleSelectChannel = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter(x => x !== id));
      }
    } else {
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const comparedChannels = linkedChannels.filter(c => selectedIds.includes(c.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-[#0b0f19] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800/80 bg-[#080f14]/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Scale size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{isAr ? 'مقارنة القنوات الاستراتيجية (Benchmarking Hub)' : 'Side-by-Side Channel Benchmark'}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'قارن بين قنواتك وقنوات المنافسين جنباً إلى جنب في المشتركين، السيو، الجمهور، ونقاط القوة والضعف.'
                  : 'Compare your channels and competitors across metrics, SEO, audience, and SWOT.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsComparisonOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Channel Selector Chips */}
        <div className="px-5 sm:px-6 py-3 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto text-xs custom-scrollbar">
          <span className="text-slate-400 shrink-0">{isAr ? 'اختر القنوات للمقارنة:' : 'Select channels:'}</span>
          {linkedChannels.map(ch => {
            const isSelected = selectedIds.includes(ch.id);
            return (
              <button
                key={ch.id}
                onClick={() => toggleSelectChannel(ch.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <img
                  src={ch.avatar}
                  alt={ch.title}
                  className="w-4 h-4 rounded-full object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <span className="truncate max-w-[120px]">{ch.title}</span>
              </button>
            );
          })}
        </div>

        {/* Comparison Grid */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
          <div className={`grid gap-4 min-w-[700px]`} style={{ gridTemplateColumns: `repeat(${comparedChannels.length}, minmax(280px, 1fr))` }}>
            {comparedChannels.map(ch => (
              <div
                key={ch.id}
                className="flex flex-col rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden"
              >
                {/* Channel Header */}
                <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center gap-3">
                  <img
                    src={ch.avatar}
                    alt={ch.title}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow"
                    referrerPolicy="no-referrer"
                  />
                  <div className="overflow-hidden">
                    <h3 className="text-sm font-bold text-white truncate">{ch.title}</h3>
                    <div className="text-xs text-cyan-400 font-mono">{ch.handle}</div>
                    <div className="text-[11px] text-emerald-400 font-medium mt-0.5">{ch.analysis?.nicheCategory}</div>
                  </div>
                </div>

                <div className="p-4 space-y-4 flex-1 text-xs">
                  {/* Grade & Score */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                    <span className="text-slate-400">{isAr ? 'التقييم الشامل' : 'Overall Grade'}</span>
                    <span className="font-bold text-amber-400 font-mono text-sm">
                      {ch.analysis?.overallGrade || 'A'} ({ch.analysis?.verdictScore || 85}/100)
                    </span>
                  </div>

                  {/* Core Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80">
                      <div className="text-[10px] text-slate-500">{isAr ? 'المشتركون' : 'Subscribers'}</div>
                      <div className="font-bold text-white mt-0.5">{ch.subscriberCount}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80">
                      <div className="text-[10px] text-slate-500">{isAr ? 'الفيديوهات' : 'Videos'}</div>
                      <div className="font-bold text-white mt-0.5">{ch.videoCount}</div>
                    </div>
                  </div>

                  {/* SEO Score */}
                  <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-slate-300 font-medium">{isAr ? 'قوة السيو (SEO)' : 'SEO Strength'}</span>
                      <span className="text-indigo-400 font-mono font-bold">{ch.analysis?.seoAnalysis?.score || 80}/100</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{ width: `${ch.analysis?.seoAnalysis?.score || 80}%` }}
                      />
                    </div>
                  </div>

                  {/* Audience Age & Tone */}
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1.5">
                    <div className="text-slate-400 text-[11px] font-semibold">{isAr ? 'الجمهور والنبرة:' : 'Audience & Tone:'}</div>
                    <div className="text-slate-300">{ch.analysis?.targetAudience?.ageGroup}</div>
                    <div className="text-amber-400 text-[11px] font-medium">{ch.analysis?.contentTone}</div>
                  </div>

                  {/* Revenue & RPM */}
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                    <div className="text-[11px] text-emerald-400 font-semibold">{isAr ? 'الأرباح التقديرية:' : 'Est. Revenue:'}</div>
                    <div className="text-white font-bold">{ch.analysis?.contentStrategy?.estimatedMonthlyRevenue}</div>
                    <div className="text-[11px] text-slate-400 font-mono">RPM: {ch.analysis?.contentStrategy?.estimatedRPM}</div>
                  </div>

                  {/* Top Strength */}
                  <div className="p-3 rounded-xl bg-emerald-950/10 border border-emerald-500/20">
                    <div className="text-[11px] font-bold text-emerald-400 mb-1 flex items-center gap-1">
                      <ShieldCheck size={13} />
                      <span>{isAr ? 'أبرز نقطة قوة' : 'Key Strength'}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] line-clamp-3">
                      {ch.analysis?.swot?.strengths?.[0] || 'محتوى متميز وتفاعل جيد.'}
                    </p>
                  </div>

                  {/* Top Weakness */}
                  <div className="p-3 rounded-xl bg-rose-950/10 border border-rose-500/20">
                    <div className="text-[11px] font-bold text-rose-400 mb-1 flex items-center gap-1">
                      <AlertTriangle size={13} />
                      <span>{isAr ? 'أبرز عائق للنمو' : 'Growth Bottleneck'}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] line-clamp-3">
                      {ch.analysis?.swot?.weaknesses?.[0] || 'بحاجة لزيادة وتيرة النشر وتحسين الهوكات.'}
                    </p>
                  </div>
                </div>

                {/* View Full Audit Button */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/40">
                  <button
                    type="button"
                    onClick={() => {
                      setIsComparisonOpen(false);
                      setAuditChannel(ch);
                    }}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <BarChart3 size={14} />
                    <span>{isAr ? 'فتح التقرير الكامل' : 'Full 360° Audit'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800 bg-slate-900/60">
          <button
            onClick={() => setIsComparisonOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
