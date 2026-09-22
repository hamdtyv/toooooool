import React from 'react';
import { User, Activity, Star, Zap, Download } from 'lucide-react';
import { useLang } from '../../index';

interface DashboardHeaderProps {
  user: any;
  logsCount: number;
  pinnedToolsCount: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, logsCount, pinnedToolsCount }) => {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const downloadReport = () => {
    window.print();
  };

  return (
    <div className="bg-[#0a0c0b]/80 border border-white/5 p-8 rounded-[2rem] flex flex-col md:flex-row items-center md:items-start gap-8 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="w-24 h-24 md:w-32 md:h-32 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center shrink-0 overflow-hidden shadow-2xl relative z-10">
            {user?.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
                <User size={48} className="text-emerald-500" />
            )}
        </div>

        <div className="flex-1 text-center md:text-left relative z-10 w-full flex flex-col items-center md:items-start">
            <div className="w-full flex flex-col md:flex-row items-center justify-between mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-4 md:mb-0">
                    <Zap size={14} className="text-emerald-400" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono">
                        {isAr ? 'قائد النشاطات' : 'Command Center'}
                    </span>
                </div>
                
                <button 
                  onClick={downloadReport}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl text-sm flex items-center gap-2 transition-colors md:ml-auto"
                >
                    <Download size={16} />
                    {isAr ? 'تحميل التقرير كـ PDF' : 'Download Monthly Report'}
                </button>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2">{user?.displayName || (isAr ? 'المستخدم' : 'User')}</h1>
            <p className="text-slate-400 font-mono text-sm">{user?.email}</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
                <div className="bg-black/40 border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
                    <Activity size={18} className="text-blue-400" />
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{isAr ? 'إجمالي الأنشطة' : 'Total Logs'}</p>
                        <p className="text-lg font-bold text-white">{logsCount}</p>
                    </div>
                </div>
                <div className="bg-black/40 border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
                    <Star size={18} className="text-yellow-400" />
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{isAr ? 'الأدوات المثبتة' : 'Pinned Tools'}</p>
                        <p className="text-lg font-bold text-white">{pinnedToolsCount}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default DashboardHeader;
