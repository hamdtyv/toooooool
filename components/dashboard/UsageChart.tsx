import React from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';
import { useLang } from '../../index';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface UsageChartProps {
  chartData: any[];
}

const UsageChart: React.FC<UsageChartProps> = ({ chartData }) => {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl relative overflow-hidden backdrop-blur-sm">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <PieChartIcon size={20} className="text-emerald-500"/>
            {isAr ? 'تحليل استخدامك للأسبوع' : 'Weekly Usage Analytics'}
        </h3>
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorUses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#334155" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#334155" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#10b981' }}
                    />
                    <Area type="monotone" dataKey="uses" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUses)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};

export default UsageChart;
