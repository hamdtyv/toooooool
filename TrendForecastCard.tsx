import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Radar, Flame, Brain, Activity, Target, Zap, ArrowUpRight } from 'lucide-react';

interface Props {
  data: {
    niche?: string;
    overall_sentiment: string;
    momentum_score: number;
    forecasted_topics: Array<{
      topic_name: string;
      search_velocity: string;
      sentiment_shift: string;
      action_plan: string;
      chart_data: Array<{ day: string; volume: number }>;
    }>;
  };
  isAr: boolean;
  onUseTopic?: (topic: string) => void;
}

export const TrendForecastCard: React.FC<Props> = ({ data, isAr, onUseTopic }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  if (!data) return null;

  return (
    <div className="w-full my-3 bg-[#060c0e] border border-white/10 rounded-xl p-4 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Radar size={16} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              {data.niche ? (isAr ? `توقعات مجال: ${data.niche}` : `Forecast for: ${data.niche}`) : (isAr ? 'تقرير اتجاهات التريند' : 'Trend Forecast')}
            </h4>
            <div className="text-[11px] text-slate-400">
              {isAr ? 'معدل الزخم والبحث وفرص الانتشار' : 'Velocity & viral momentum'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded text-xs">
            <span className="text-[10px] text-slate-400 font-mono">{isAr ? 'الزخم:' : 'Score:'}</span>
            <span className="font-bold text-amber-400">{data.momentum_score}/100</span>
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

      {/* Sentiment Overview */}
      <div className="bg-white/5 border border-white/5 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Brain className="text-purple-400 shrink-0 mt-0.5" size={18} />
        <div>
          <span className="text-xs font-bold text-purple-300 block mb-1">
            {isAr ? 'تحليل المشاعر وسلوك البحث العام:' : 'Audience Sentiment & Search Shift:'}
          </span>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
            {data.overall_sentiment}
          </p>
        </div>
      </div>

      {/* Topics list */}
      <div className="space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>{isAr ? 'المواضيع الفيروسية المتوقعة (Breakout Topics)' : 'Forecasted Viral Topics'}</span>
          <span className="text-[11px] text-blue-400 font-normal">{isAr ? 'انقر على أي موضوع لتوليد اسكريبت فوري' : 'Click topic to generate script'}</span>
        </div>

        {data.forecasted_topics?.map((topic, idx) => (
          <div 
            key={idx} 
            className="bg-[#040807] border border-white/10 hover:border-blue-500/40 rounded-xl p-4 transition-all duration-300 group"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 font-mono text-xs font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <h5 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                      {topic.topic_name}
                    </h5>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-3">
                    <div className="bg-white/5 rounded-lg p-2">
                      <span className="text-[10px] text-slate-400 block font-mono uppercase">{isAr ? 'سرعة البحث' : 'Velocity'}</span>
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                        <Activity size={12} /> {topic.search_velocity}
                      </span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <span className="text-[10px] text-slate-400 block font-mono uppercase">{isAr ? 'تحول المزاج' : 'Sentiment'}</span>
                      <span className="text-xs font-medium text-slate-200 mt-0.5 truncate block">
                        {topic.sentiment_shift}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                    <span className="font-bold text-blue-400 block mb-1">{isAr ? 'خطة العمل المقترحة:' : 'Action Plan:'}</span>
                    {topic.action_plan}
                  </div>
                </div>

                {onUseTopic && (
                  <button
                    onClick={() => onUseTopic(topic.topic_name)}
                    className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold transition-colors self-start"
                  >
                    <span>{isAr ? 'توليد اسكريبت لهذا الموضوع' : 'Generate Script for this Topic'}</span>
                    <ArrowUpRight size={14} />
                  </button>
                )}
              </div>

              {/* Chart */}
              <div className="lg:col-span-6 bg-[#020504] rounded-xl border border-white/5 p-3 flex flex-col justify-between">
                <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between mb-1">
                  <span>{isAr ? 'محاكاة زخم البحث (7 أيام)' : '7-Day Search Velocity Simulation'}</span>
                  <span className="text-blue-400 font-bold">PROJECTED</span>
                </div>
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={topic.chart_data}>
                      <defs>
                        <linearGradient id={`trendGrad_${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" stroke="#334155" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="#334155" fontSize={9} tickLine={false} axisLine={false} width={24} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#040807', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', fontSize: '11px' }}
                        itemStyle={{ color: '#60a5fa' }}
                      />
                      <Area type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill={`url(#trendGrad_${idx})`} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
    )}
  </div>
);
};
