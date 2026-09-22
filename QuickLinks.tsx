import React from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { useLang } from '../../index';
import { Link } from 'react-router-dom';

interface QuickLinksProps {
  pinnedTools: string[];
}

const QuickLinks: React.FC<QuickLinksProps> = ({ pinnedTools }) => {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-3xl">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Star size={20} className="text-emerald-500"/>
            {isAr ? 'أدواتك المفضلة' : 'Your Starred Tools'}
        </h3>
        {pinnedTools.length === 0 ? (
            <p className="text-slate-500 text-sm italic">
                {isAr ? 'لم تقم بتثبيت أي أدوات في الداشبورد الرئيسي بعد.' : 'No tools pinned to your main dashboard yet.'}
            </p>
        ) : (
            <div className="flex flex-col gap-3">
                {pinnedTools.map(path => {
                    let displayName = '';
                    if (path.includes('?q=')) {
                        const [base, query] = path.split('?q=');
                        const sectionName = base.replace('/', '').replace(/-/g, ' ').toUpperCase() || 'HOME';
                        const decodedQuery = decodeURIComponent(query).toUpperCase();
                        displayName = `${sectionName} - ${decodedQuery}`;
                    } else {
                        displayName = path.replace('/', '').replace(/-/g, ' ').toUpperCase() || 'HOME';
                    }
                    return (
                        <Link key={path} to={path} className="p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all flex items-center justify-between group">
                            <span className="text-sm font-bold text-slate-300 group-hover:text-emerald-400">{displayName}</span>
                            <ArrowRight size={16} className={`text-slate-600 group-hover:text-emerald-500 ${isAr ? 'rotate-180' : ''}`} />
                        </Link>
                    );
                })}
            </div>
        )}
    </div>
  );
};

export default QuickLinks;
