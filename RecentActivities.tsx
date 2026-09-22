import React from 'react';
import { Activity, ArrowRight, Calendar } from 'lucide-react';
import { useLang } from '../../index';
import { Link } from 'react-router-dom';

interface RecentActivitiesProps {
  logs: any[];
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ logs }) => {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl relative overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity size={20} className="text-blue-500"/>
                {isAr ? 'أحدث نشاطاتك' : 'Recent Activities'}
            </h3>
            <Link to="/logs" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                {isAr ? 'عرض الكل' : 'View All'} <ArrowRight size={14} className={isAr ? 'rotate-180' : ''}/>
            </Link>
        </div>
        {logs.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-10 italic">
                {isAr ? 'لا توجد عمليات سابقة مسجلة.' : 'No recent operations recorded.'}
            </p>
        ) : (
            <div className="space-y-3">
                {logs.slice(0, 5).map(log => (
                    <div key={log.id} className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] uppercase tracking-wider bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md font-bold">
                                    {log.toolName}
                                </span>
                                <span className="text-[10px] text-slate-400">{log.action}</span>
                            </div>
                            <p className="text-sm text-slate-300 line-clamp-1">{log.description}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 shrink-0 font-mono">
                            <Calendar size={12} />
                            {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default RecentActivities;
