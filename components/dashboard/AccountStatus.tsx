import React from 'react';
import { User } from 'lucide-react';
import { useLang } from '../../index';

const AccountStatus: React.FC = () => {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <div className="bg-purple-500/5 border border-purple-500/10 p-6 rounded-3xl relative overflow-hidden text-center">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
        <div className="w-16 h-16 mx-auto bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 mb-4">
            <User size={24} className="text-purple-400" />
        </div>
        <h4 className="text-white font-bold mb-2">{isAr ? 'جاهزية الحساب' : 'Account Status'}</h4>
        <p className="text-slate-400 text-sm mb-4">
            {isAr ? 'أنت تستخدم النسخة الاحترافية للمحلل الذكي وتمتلك صلاحيات الوصول الكامل.' : 'You are utilizing the pro tier of the smart analyzer with full access capabilities.'}
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-mono tracking-widest font-bold">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            ACTIVE
        </div>
    </div>
  );
};

export default AccountStatus;
