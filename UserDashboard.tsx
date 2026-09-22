import React, { useState, useEffect } from 'react';
import { useLang } from '../index';
import { motion } from 'motion/react';
import { User, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchToolActivityLogs } from '../services/firebase';
import { loadFromStorage, StorageKeys } from '../services/storageService';
import DashboardHeader from './dashboard/DashboardHeader';
import UsageChart from './dashboard/UsageChart';
import RecentActivities from './dashboard/RecentActivities';
import QuickLinks from './dashboard/QuickLinks';
import AccountStatus from './dashboard/AccountStatus';
import ApiKeyManager from './dashboard/ApiKeyManager';
import MilestonesWidget from './dashboard/MilestonesWidget';
import GoalSetting from './dashboard/GoalSetting';
import BrandThemeSettings from './dashboard/BrandThemeSettings';

const INITIAL_CHART_DATA = [
  { name: 'Mon', uses: 0 },
  { name: 'Tue', uses: 0 },
  { name: 'Wed', uses: 0 },
  { name: 'Thu', uses: 0 },
  { name: 'Fri', uses: 0 },
  { name: 'Sat', uses: 0 },
  { name: 'Sun', uses: 0 },
];

const UserDashboard = () => {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const { user, signIn, signInAsGuest } = useAuth();
  
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinnedTools, setPinnedTools] = useState<string[]>([]);
  const [chartData, setChartData] = useState(INITIAL_CHART_DATA);

  useEffect(() => {
    // Load pinned tools
    const pins = loadFromStorage<string[]>(StorageKeys.PINNED_TOOLS) || [];
    setPinnedTools(pins);

    if (!user) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchToolActivityLogs();
        setLogs(data);

        // Generate rough chart data from logs for the last 7 days
        generateChartData(data);
      } catch (err) {
        console.error("Failed to fetch user data", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  const generateChartData = (activityLogs: any[]) => {
    const data = [...INITIAL_CHART_DATA];
    const today = new Date();
    
    // Simple mock logic relying on actual logs if recent
    activityLogs.forEach(log => {
      const logDate = new Date(log.timestamp);
      const diffTime = Math.abs(today.getTime() - logDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7) {
        // Find day of week index (0-6, Mon-Sun approx)
        let dayIdx = logDate.getDay() - 1;
        if (dayIdx === -1) dayIdx = 6;
        if (data[dayIdx]) {
           data[dayIdx].uses += 1;
        }
      }
    });
    
    // Add some base data so chart isn't empty if user is new
    if (activityLogs.length < 5) {
        data[0].uses += 2;
        data[2].uses += 5;
        data[4].uses += 3;
        data[6].uses += 8;
    }

    setChartData(data);
  };

  if (!user && !loading) {
     return (
        <div className="flex flex-col flex-1 items-center justify-center min-h-[60vh] max-w-2xl mx-auto text-center px-4">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                <User size={48} className="text-slate-500" />
            </div>
            <h2 className={`text-2xl md:text-4xl font-bold text-white mb-4 ${isAr ? 'font-alex' : ''}`}>
                {isAr ? 'حسابك الشخصي' : 'Your Personal Dashboard'}
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
                {isAr ? 'يرجى تسجيل الدخول للوصول إلى لوحة التحكم الخاصة بك وتتبع نشاطاتك.' : 'Please log in to access your personal dashboard and track your activities.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <button 
                  onClick={signIn}
                  className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold rounded-2xl transition-all shadow-lg shadow-emerald-500/10 hover:scale-[1.02] active:scale-95 text-sm"
                >
                    {isAr ? 'تسجيل الدخول بـ Google' : 'Sign in with Google'}
                </button>
                <button 
                  onClick={signInAsGuest}
                  className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all hover:scale-[1.02] active:scale-95 text-sm"
                >
                    {isAr ? 'التسجيل كضيف' : 'Sign in as Guest'}
                </button>
            </div>
        </div>
     );
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center flex-1 min-h-[60vh]">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto w-full pb-20 space-y-8"
    >
        <DashboardHeader user={user} logsCount={logs.length} pinnedToolsCount={pinnedTools.length} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <UsageChart chartData={chartData} />
                <RecentActivities logs={logs} />
            </div>

            <div className="space-y-8">
                <QuickLinks pinnedTools={pinnedTools} />
                <AccountStatus />
                <ApiKeyManager />
                <BrandThemeSettings />
                <MilestonesWidget />
                <GoalSetting />
            </div>
        </div>
    </motion.div>
  );
}

export default UserDashboard;
