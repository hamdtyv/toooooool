
import React, { useState, useRef, useLayoutEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '../index';
import ChatAssistant from './ChatAssistant';
import LiquidGlassHeader from './LiquidGlassHeader';
import {
  LayoutDashboard, 
  BarChart2, 
  Video, 
  Search, 
  DollarSign, 
  Activity,
  Globe,
  TrendingUp,
  Lightbulb,
  Swords,
  Gem,
  CheckCircle,
  Menu,
  Radar,
  X,
  Users,
  Image as ImageIcon,
  Feather,
  BookOpen,
  Timer,
  Compass,
  Sparkles as SparklesIcon,
  ChevronRight,
  MessageSquare as ChatIcon,
  History,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang, setLang, t } = useLang();
  const isAr = lang === 'ar';
  const { user, signIn, signInAsGuest, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const savedScroll = sessionStorage.getItem('tv_sidebar_scroll');
    if (sidebarRef.current && savedScroll) {
      sidebarRef.current.scrollTop = parseInt(savedScroll, 10);
    }
  }, [location.pathname]);

  const handleSidebarScroll = (e: React.UIEvent<HTMLElement>) => {
    sessionStorage.setItem('tv_sidebar_scroll', e.currentTarget.scrollTop.toString());
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden ${
          isActive 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
            : 'text-slate-500 hover:bg-white/5 hover:text-white border border-transparent'
        }`}
      >
        <div className={`transition-all duration-700 relative z-10 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-6 opacity-60 group-hover:opacity-100'}`}>
          <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
        </div>
        <span className={`text-[13.5px] font-bold tracking-tight transition-all duration-300 relative z-10 ${isActive ? 'text-white' : 'group-hover:translate-x-1'} ${isAr ? 'font-alex' : 'font-outfit'}`}>{label}</span>
        {isActive && (
          <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-emerald-400 shadow-[4px_0_15px_rgba(0,255,157,0.4)] rounded-full"></div>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex relative bg-[#050a09] selection:bg-emerald-500/30 selection:text-emerald-100">
      {/* Liquid Glass Navigation Header */}
      <LiquidGlassHeader />
      
      <div className="lg:hidden flex items-center justify-between p-4 fixed top-0 left-0 right-0 z-[110]">
        <div className="flex-1"></div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2.5 text-emerald-400 bg-emerald-500/5 rounded-xl border border-emerald-500/10 active:scale-95 transition-all backdrop-blur-md">
            {isMobileMenuOpen ? <X size={22} strokeWidth={2}/> : <Menu size={22} strokeWidth={2}/>}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[150] lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar Architecture - Isolated Dynamic Column */}
      <aside 
        ref={sidebarRef}
        onScroll={handleSidebarScroll}
        className={`
          fixed top-0 bottom-0 w-80 bg-[#050a09]/98 border-r border-white/5 flex flex-col z-[200] transition-all duration-700 ease-[0.16,1,0.3,1] overflow-y-auto custom-scrollbar backdrop-blur-3xl
          ${isAr ? 'right-0' : 'left-0'}
          ${isMobileMenuOpen ? 'translate-x-0' : (isAr ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')}
        `}>
        <div className="p-10 hidden lg:flex items-center gap-5 sticky top-0 bg-[#050a09]/95 backdrop-blur-2xl z-20 border-b border-white/10 shrink-0">
            <div className="relative w-14 h-14 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-emerald-400/40 rounded-[1.5rem] animate-[spin_12s_linear_infinite]"></div>
                <div className="absolute inset-3 border border-emerald-400/10 rounded-xl"></div>
                <SparklesIcon size={24} className="text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-black font-space brand-shimmer leading-none uppercase italic pr-2">
                {isAr ? 'مُثقّف' : 'MUTHAQAF'}
              </h1>
              <span className="text-[8px] font-space font-bold tracking-widest text-emerald-500/30 uppercase mt-1">STABLE_3.9</span>
            </div>
        </div>

        <nav className="flex-1 px-6 space-y-10 pb-20 mt-12">
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-white/20 uppercase px-6 py-2 tracking-[0.4em] font-space flex items-center justify-between mb-2">
              {lang === 'ar' ? 'التحليلات' : 'Analytics'}
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/30"></div>
            </div>
            <NavItem to="/" icon={LayoutDashboard} label={t.home} />
            <NavItem to="/chat" icon={ChatIcon} label={lang === 'ar' ? 'المساعد الذكي' : 'AI Assistant'} />
            <NavItem to="/channel" icon={BarChart2} label={t.channelAnalytics} />
            <NavItem to="/video" icon={Video} label={t.videoAnalytics} />
            <NavItem to="/timing" icon={Timer} label={t.videoTiming} />
            <NavItem to="/atlas" icon={Compass} label={t.globalTiming} />
            <NavItem to="/live" icon={Activity} label={t.liveCounter} />
            <NavItem to="/audience-dna" icon={Users} label={t.audienceDeepDive} />
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-bold text-white/20 uppercase px-6 py-2 tracking-[0.4em] font-space flex items-center justify-between mb-2">
              {lang === 'ar' ? 'أدوات النمو' : 'Synthesis'}
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/30"></div>
            </div>
            <NavItem to="/vph" icon={TrendingUp} label={t.vphTool} />
            <NavItem to="/seo" icon={Search} label={t.seoTools} />
            <NavItem to="/ideas" icon={Lightbulb} label={t.ideaGenerator} />
            <NavItem to="/planner" icon={CheckCircle} label={t.planner} />
            <NavItem to="/script-writer" icon={Feather} label={t.scriptWriter} />
            <NavItem to="/images" icon={ImageIcon} label={t.imageGenerator} />
            <NavItem to="/thumbnail-simulator" icon={ImageIcon} label={t.thumbnailSimulator} />
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-bold text-white/20 uppercase px-6 py-2 tracking-[0.4em] font-space flex items-center justify-between mb-2">
              {lang === 'ar' ? 'الاستراتيجية' : 'Strategy'}
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500/30"></div>
            </div>
            <NavItem to="/earnings" icon={DollarSign} label={t.earningsLab} />
            <NavItem to="/competitor" icon={Swords} label={t.competitorAnalysis} />
            <NavItem to="/outliers" icon={Gem} label={t.outliers} />
            <NavItem to="/forecast" icon={Radar} label={t.trendForecasting} />
          </div>
          
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-white/10 uppercase px-6 py-2 tracking-[0.4em] font-space">PROT_END</div>
            <NavItem to="/profile" icon={UserIcon} label={lang === 'ar' ? 'حسابي' : 'My Profile'} />
            <NavItem to="/logs" icon={History} label={lang === 'ar' ? 'سجل النشاطات' : 'Activity Logs'} />
            <NavItem to="/guidelines" icon={BookOpen} label={t.guidelines} />
          </div>
        </nav>

        <div className="p-8 border-t border-white/5 bg-[#050a09]/50 backdrop-blur-2xl mt-auto space-y-4">
          {user ? (
            <button 
              onClick={signOut}
              className="w-full flex items-center justify-between bg-white/5 hover:bg-red-500/10 p-5 rounded-2xl border border-white/5 transition-all text-slate-400 hover:text-red-400 font-bold text-[11px] font-space tracking-[0.2em]"
            >
               <div className="flex items-center gap-4">
                 <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                     {user.photoURL ? (
                         <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                     ) : (
                         <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                             <UserIcon size={12} className="text-slate-400" />
                         </div>
                     )}
                 </div>
                 <span className="truncate max-w-[120px] text-left">{user.displayName}</span>
               </div>
               <LogOut size={16} className="opacity-60" />
            </button>
          ) : (
            <div className="space-y-3 w-full">
              <button 
                onClick={signIn}
                className="w-full flex items-center justify-between bg-emerald-500/10 hover:bg-emerald-500/20 p-5 rounded-2xl border border-emerald-500/20 transition-all text-emerald-400 hover:text-emerald-300 font-bold text-[11px] font-space tracking-[0.2em]"
              >
                 <div className="flex items-center gap-4">
                   <LogIn size={18} />
                   <span>{lang === 'ar' ? 'تسجيل الدخول' : 'LOGIN'}</span>
                 </div>
                 <ChevronRight size={14} className={`opacity-40 transition-transform ${isAr ? 'rotate-180' : ''}`} />
              </button>

              <button 
                onClick={signInAsGuest}
                className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 p-5 rounded-2xl border border-white/5 transition-all text-slate-300 hover:text-white font-bold text-[11px] font-space tracking-[0.2em]"
              >
                 <div className="flex items-center gap-4">
                   <UserIcon size={18} />
                   <span>{lang === 'ar' ? 'التسجيل كضيف' : 'GUEST LOGIN'}</span>
                 </div>
                 <ChevronRight size={14} className={`opacity-40 transition-transform ${isAr ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}

          <button 
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="w-full flex items-center justify-between bg-white/5 hover:bg-emerald-500/10 p-5 rounded-2xl border border-white/5 transition-all text-slate-400 hover:text-emerald-400 font-bold text-[11px] font-space tracking-[0.2em]"
          >
             <div className="flex items-center gap-4">
               <Globe size={18} />
               <span>{lang === 'ar' ? 'SWITCH TO EN' : 'SWITCH TO AR'}</span>
             </div>
             <ChevronRight size={14} className={`opacity-40 transition-transform ${isAr ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>

      {/* Main Content Arena - Strict Spatial Containment */}
      <main className={`flex-1 relative overflow-x-hidden min-h-screen flex flex-col pt-24 md:pt-32 lg:pt-24 transition-all duration-500 ${isAr ? 'lg:mr-80' : 'lg:ml-80'}`}>
        {/* Organic Physics Background - Optimized for minimal GPU load */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-50">
          <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-emerald-800/[0.03] blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-teal-900/[0.05] blur-[120px]"></div>
        </div>

        <div className="relative z-10 px-4 sm:px-6 md:px-10 lg:px-12 flex-1 max-w-[1550px] mx-auto w-full flex flex-col animate-entrance pt-12 lg:pt-16 pb-32">
          {children}
        </div>

        <footer className="relative z-10 border-t border-white/5 py-12 md:py-20 mt-auto bg-[#050a09]/95 overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/[0.02] pointer-events-none"></div>
          <div className="container mx-auto px-4 sm:px-8 md:px-12 relative">
            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12 mb-16">
               <div className="flex flex-col items-center lg:items-start gap-4 text-center lg:text-left max-w-md">
                  <h2 className="text-2xl md:text-3xl font-black font-space brand-shimmer italic uppercase pr-2">
                     {isAr ? 'مُثقّف' : 'MUTHAQAF'}
                  </h2>
                  <p className={`text-slate-400 text-xs md:text-sm leading-relaxed ${isAr ? 'font-alex' : 'font-outfit'}`}>
                    {isAr ? "نظام استخبارات المحتوى الأرقى، مصمم حصرياً للمبدعين الذين لا يقبلون بأقل من السيادة الرقمية." : "The premium content intelligence architecture, engineered exclusively for creators who refuse to accept anything less than digital sovereignty."}
                  </p>
               </div>
               <div className="flex flex-col items-center gap-6 shrink-0">
                  <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                    {['XPERT_STRAT', 'BIO_SYNC', 'DEEP_FLOW'].map(tag => (
                      <span key={tag} className="px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-[9px] font-space font-bold tracking-widest text-emerald-500/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <a 
                    href="https://www.youtube.com/@mothaqf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 bg-emerald-600 text-white px-6 py-3.5 md:px-8 md:py-4 rounded-[1.25rem] md:rounded-[1.5rem] font-black font-space tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(0,255,157,0.3)] border border-emerald-400/30 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    <span className="text-sm md:text-lg uppercase">Join Evolution</span>
                  </a>
               </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-white/5 gap-6">
               <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] md:text-[12px] font-mono text-white/20 tracking-[0.3em] md:tracking-[0.5em] leading-none uppercase">BIOTIC_PROTOCOL_V3.9.7_STABLE</span>
               </div>
               <p className={`text-[10px] md:text-[12px] text-slate-700 tracking-[0.2em] md:tracking-[0.4em] uppercase font-bold text-center ${isAr ? 'font-alex' : 'font-outfit'}`}>
                  {lang === 'ar' ? 'البحث الذكي • تحليل البيانات العظمى • استخبارات المحتوى' : 'ELITE_RESEARCH • BIGDATA_ANALYSIS • CONTENT_INTELLIGENCE'}
               </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
