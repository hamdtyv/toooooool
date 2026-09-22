import React from 'react';
import { BarChart2, ShieldAlert, CheckCircle2, TrendingUp, Users, Eye, Target, Sparkles, Download } from 'lucide-react';

interface Props {
  data: {
    channelTitle?: string;
    subscriberCount?: string;
    viewCount?: string;
    country?: string;
    avatarUrl?: string;
    grade?: string;
    strengths?: string[];
    bottlenecks?: string[];
    growthRoadmap?: string[];
    rpmEstimate?: string;
  };
  isAr: boolean;
}

export const ChannelAuditCard: React.FC<Props> = ({ data, isAr }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  if (!data) return null;

  return (
    <div className="w-full my-3 bg-[#0d0714] border border-white/10 rounded-xl p-4 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          {data.avatarUrl ? (
            <img src={data.avatarUrl} alt="Channel Avatar" className="w-8 h-8 rounded-full border border-purple-400/50" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <BarChart2 size={16} />
            </div>
          )}
          <div>
            <h4 className="text-sm font-bold text-white">
              {data.channelTitle || (isAr ? 'تشخيص أداء القناة' : 'Channel Audit')}
            </h4>
            <div className="text-[11px] text-slate-400">
              {isAr ? 'نقاط القوة، فرص التحسين وخريطة النمو' : 'Strengths, bottlenecks & growth roadmap'}
            </div>
          </div>
        </div>

        {/* Channel Health Grade & Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded text-xs">
            <span className="text-[10px] text-slate-400 font-mono">{isAr ? 'التقييم:' : 'GRADE:'}</span>
            <span className="font-bold font-mono text-purple-400">{data.grade || 'A+'}</span>
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

      {/* Metrics Row */}
      {(data.subscriberCount || data.viewCount) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">{isAr ? 'المشتركون' : 'Subscribers'}</span>
            <span className="text-sm md:text-base font-bold text-white font-mono">{data.subscriberCount}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">{isAr ? 'المشاهدات' : 'Total Views'}</span>
            <span className="text-sm md:text-base font-bold text-white font-mono">{data.viewCount}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">{isAr ? 'البلد الأساسي' : 'Country'}</span>
            <span className="text-sm md:text-base font-bold text-white font-mono">{data.country || 'Global'}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">{isAr ? 'RPM المقدر' : 'Est. RPM'}</span>
            <span className="text-sm md:text-base font-bold text-emerald-400 font-mono">{data.rpmEstimate || '$2.80 - $6.50'}</span>
          </div>
        </div>
      )}

      {/* Strengths & Bottlenecks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Strengths */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
            <CheckCircle2 size={15} />
            <span>{isAr ? 'نقاط القوة والمزايا التنافسية' : 'Competitive Strengths'}</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {data.strengths?.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>{str}</span>
              </li>
            )) || (
              <>
                <li className="flex items-start gap-2"><span>• نيتش متخصص بجمهور شغوف ومعدل ولاء مرتفع</span></li>
                <li className="flex items-start gap-2"><span>• قابلية عالية لربط إعلانات الرعايات والمنتجات الرقمية</span></li>
              </>
            )}
          </ul>
        </div>

        {/* Bottlenecks */}
        <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">
            <ShieldAlert size={15} />
            <span>{isAr ? 'ثغرات النمو ونقاط الهبوط (Bottlenecks)' : 'Growth Bottlenecks'}</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {data.bottlenecks?.map((bot, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-400 mt-1">•</span>
                <span>{bot}</span>
              </li>
            )) || (
              <>
                <li className="flex items-start gap-2"><span>• هبوط المشاهدات بعد أول دقيقة لضعف هوك البداية</span></li>
                <li className="flex items-start gap-2"><span>• عدم توحيد الهوية البصرية للصور المصغرة</span></li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Action Roadmap */}
      {data.growthRoadmap && data.growthRoadmap.length > 0 && (
        <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
          <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block mb-2">
            {isAr ? 'خطة العمل التنفيذية (30 يوماً القادمة):' : '30-Day Growth Roadmap:'}
          </span>
          <div className="space-y-2 text-xs text-slate-300">
            {data.growthRoadmap.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    )}
  </div>
);
};
