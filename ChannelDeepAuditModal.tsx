import React, { useState } from 'react';
import { useChannel } from '../../contexts/ChannelContext';
import { useLang } from '../../index';
import {
  X,
  Sparkles,
  Youtube,
  ExternalLink,
  Share2,
  Copy,
  Check,
  TrendingUp,
  BarChart3,
  Search,
  Hash,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  DollarSign,
  Clock,
  Target,
  Users,
  Compass,
  MessageSquare,
  Award,
  Flame,
  ArrowUpRight,
  RefreshCw,
  Printer,
  FileText
} from 'lucide-react';

interface Props {
  onAskCopilot?: (prompt: string) => void;
}

export const ChannelDeepAuditModal: React.FC<Props> = ({ onAskCopilot }) => {
  const { auditChannel, setAuditChannel, refreshChannel, isLoading } = useChannel();
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'overview' | 'seo' | 'swot' | 'videos' | 'ideas'>('overview');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!auditChannel) return null;

  const { title, handle, avatar, banner, subscriberCount, videoCount, url, description, recentVideos, analysis } = auditChannel;

  const handleCopy = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAskCopilotCustom = (prompt: string) => {
    if (onAskCopilot) {
      onAskCopilot(prompt);
      setAuditChannel(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#0b0f19] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Banner / Header */}
        <div className="relative border-b border-slate-800/80 bg-[#080f14]/90 overflow-hidden shrink-0">
          {banner ? (
            <div className="h-28 sm:h-36 w-full relative overflow-hidden">
              <img
                src={banner}
                alt="Banner"
                className="w-full h-full object-cover opacity-50"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080f14] via-[#080f14]/60 to-transparent" />
            </div>
          ) : (
            <div className="h-20 w-full bg-gradient-to-r from-emerald-950/40 via-slate-900 to-[#080f14]" />
          )}

          {/* Channel Identity Row */}
          <div className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 -mt-10 sm:-mt-12 relative z-10">
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={avatar}
                  alt={title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 bg-slate-800"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-slate-950 shadow">
                  <Youtube size={12} />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight truncate max-w-[260px] sm:max-w-md">{title}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
                    Grade {analysis?.overallGrade || 'A'} ({analysis?.verdictScore || 85}/100)
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-400 mt-1 font-mono">
                  <span className="text-cyan-400">{handle}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">{subscriberCount}</span>
                  <span>•</span>
                  <span>{videoCount}</span>
                  {analysis?.nicheCategory && (
                    <>
                      <span>•</span>
                      <span className="text-amber-400">{analysis?.nicheCategory}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => refreshChannel(auditChannel.id)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                title={isAr ? 'إعادة الفحص والتشخيص' : 'Re-audit'}
              >
                <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                <span>{isAr ? 'تحديث' : 'Refresh'}</span>
              </button>

              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink size={13} />
                <span>{isAr ? 'يوتيوب' : 'YouTube'}</span>
              </a>

              <button
                onClick={() => setAuditChannel(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-4 sm:px-6 border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto text-xs font-medium py-1.5 custom-scrollbar">
            {[
              { id: 'overview', labelAr: '📊 التشخيص الشامل', labelEn: 'Overview & Persona' },
              { id: 'seo', labelAr: '🔍 السيو والكلمات المفتاحية', labelEn: 'SEO & Keywords' },
              { id: 'swot', labelAr: '⚡ مصفوفة القوة والفرص (SWOT)', labelEn: 'SWOT Matrix' },
              { id: 'videos', labelAr: `🎬 الفيديوهات الأخيرة (${recentVideos?.length || 0})`, labelEn: 'Recent Videos' },
              { id: 'ideas', labelAr: '💡 10 أفكار فيروسية مخصصة', labelEn: 'Viral Ideas (10)' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW & PERSONA */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Executive Summary Card */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-400" />
                    <span>{isAr ? 'الملخص والتشخيص الاستراتيجي' : 'Executive Strategy Summary'}</span>
                  </h3>
                  <button
                    onClick={() => handleCopy(analysis?.summary || '', 'summary')}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                  >
                    {copiedSection === 'summary' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{isAr ? 'نسخ' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  {analysis?.summary}
                </p>
              </div>

              {/* Official YouTube Channel Bio / Description */}
              {auditChannel?.description && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                      <FileText size={13} className="text-cyan-400" />
                      <span>{isAr ? 'الوصف الرسمي للقناة على يوتيوب (About Bio):' : 'Official YouTube Channel Bio:'}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(auditChannel.description || '', 'bio')}
                      className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    >
                      {copiedSection === 'bio' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{isAr ? 'نسخ' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {auditChannel.description}
                  </p>
                </div>
              )}

              {/* Niche & Pillars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                    <Target size={14} className="text-red-400" />
                    <span>{isAr ? 'النيتش والاهتمامات الفرعية' : 'Niche & Sub-Niches'}</span>
                  </div>
                  <div className="text-sm font-bold text-white mb-2">{analysis?.nicheCategory}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis?.subNiches?.map((sn, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-mono">
                        {sn}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                    <Compass size={14} className="text-emerald-400" />
                    <span>{isAr ? 'ركائز المحتوى (Content Pillars)' : 'Content Pillars'}</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {analysis?.contentPillars?.map((cp, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{cp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                    <Flame size={14} className="text-amber-400" />
                    <span>{isAr ? 'نبرة المحتوى والجاذبية' : 'Tone & Style'}</span>
                  </div>
                  <div className="text-sm font-bold text-amber-300 mb-1">{analysis?.contentTone}</div>
                  <div className="text-xs text-slate-400 leading-relaxed">
                    {isAr ? 'مُصمم لخلق تواصل مباشر واحتفاظ عالي بالمشاهدين.' : 'Engineered for direct connection & high viewer retention.'}
                  </div>
                </div>
              </div>

              {/* Target Audience Persona Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users size={16} className="text-cyan-400" />
                    <span>{isAr ? 'ديموغرافيا وشخصية الجمهور المستهدف (Audience DNA)' : 'Target Audience Persona'}</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
                    {analysis?.targetAudience?.ageGroup}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {analysis?.targetAudience?.persona}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="text-xs font-semibold text-rose-400 mb-2">
                      {isAr ? 'نقاط الألم والدوافع النفسية للجمهور:' : 'Viewer Pain Points & Desires:'}
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {analysis?.targetAudience?.painPoints?.map((pp, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-400">•</span>
                          <span>{pp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="text-xs font-semibold text-cyan-400 mb-2">
                      {isAr ? 'مواضيع واهتمامات يبحث عنها جمهورك:' : 'Topics They Actively Search For:'}
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {analysis?.targetAudience?.interestTopics?.map((it, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-cyan-400">•</span>
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Revenue & Upload Schedule Strategy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">{isAr ? 'العائد التقديري والـ RPM المتوقع' : 'Estimated Monthly Revenue & RPM'}</div>
                    <div className="text-base font-bold text-white mt-0.5">{analysis?.contentStrategy?.estimatedMonthlyRevenue}</div>
                    <div className="text-xs text-emerald-400 font-mono">RPM: {analysis?.contentStrategy?.estimatedRPM}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">{isAr ? 'الجدول والمدة الزمنية المثالية' : 'Recommended Schedule & Length'}</div>
                    <div className="text-sm font-bold text-white mt-0.5">{analysis?.contentStrategy?.recommendedUploadSchedule}</div>
                    <div className="text-xs text-amber-400">{analysis?.contentStrategy?.idealVideoLength}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SEO & KEYWORDS */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              {/* SEO Score Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex flex-col items-center justify-center text-indigo-300 font-black">
                    <span className="text-2xl">{analysis?.seoAnalysis?.score || 85}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">SEO Score</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{isAr ? 'تشخيص سيو القناة والظهور في البحث' : 'Channel SEO & Search Discovery Audit'}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {isAr
                        ? 'تحليل جاهزية القناة لتصدر كلمات البحث واقتراحات خوارزميات يوتيوب.'
                        : 'Evaluation of keyword density, search discoverability, and metadata strength.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAskCopilotCustom(`اكتب لي خطة سيو كاملة لقناتي ${title} تشمل وصفاً احترافياً وكلمات مفتاحية متصدرة لرفع الترتيب في البحث`)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition-all shrink-0"
                >
                  <Sparkles size={14} />
                  <span>{isAr ? 'توليد سيو كامل عبر مُثقّف' : 'Generate Full SEO with Copilot'}</span>
                </button>
              </div>

              {/* Top Keywords */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Search size={15} className="text-cyan-400" />
                    <span>{isAr ? 'الكلمات المفتاحية البحثية الذهبية للقناة (High-Volume Keywords)' : 'Top Channel Keywords'}</span>
                  </h4>
                  <button
                    onClick={() => handleCopy(analysis?.seoAnalysis?.topKeywords?.join(', ') || '', 'keywords')}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                  >
                    {copiedSection === 'keywords' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{isAr ? 'نسخ الكل' : 'Copy All'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {analysis?.seoAnalysis?.topKeywords?.map((kw, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium hover:border-cyan-500/40 transition-colors"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Top Hashtags */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Hash size={15} className="text-emerald-400" />
                    <span>{isAr ? 'الهاشتاجات المقترحة للفيديوهات والشورتس' : 'Recommended Hashtags'}</span>
                  </h4>
                  <button
                    onClick={() => handleCopy(analysis?.seoAnalysis?.topHashtags?.join(' ') || '', 'hashtags')}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                  >
                    {copiedSection === 'hashtags' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{isAr ? 'نسخ الكل' : 'Copy All'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {analysis?.seoAnalysis?.topHashtags?.map((ht, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono"
                    >
                      {ht}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description Recommendations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/20">
                  <div className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                    <ShieldCheck size={14} />
                    <span>{isAr ? 'نقاط القوة في الوصف الحالي' : 'Description Strengths'}</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {analysis?.seoAnalysis?.descriptionStrengths?.map((ds, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">✓</span>
                        <span>{ds}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/20">
                  <div className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                    <Lightbulb size={14} />
                    <span>{isAr ? 'تحسينات موصى بها للوصف' : 'Description Improvements'}</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {analysis?.seoAnalysis?.descriptionImprovements?.map((di, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-400">→</span>
                        <span>{di}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SWOT MATRIX */}
          {activeTab === 'swot' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <ShieldCheck size={18} />
                    <span>{isAr ? '🟢 نقاط القوة الحالية (Strengths)' : '🟢 Strengths'}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-200">
                    {analysis?.swot?.strengths?.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span className="leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <AlertTriangle size={18} />
                    <span>{isAr ? '🔴 نقاط الضعف والعوائق (Weaknesses)' : '🔴 Weaknesses'}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-200">
                    {analysis?.swot?.weaknesses?.map((w, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span className="leading-relaxed">{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Opportunities */}
                <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Lightbulb size={18} />
                    <span>{isAr ? '🟡 الفرص الذهبية للنمو الفيروسي (Opportunities)' : '🟡 Growth Opportunities'}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-200">
                    {analysis?.swot?.growthOpportunities?.map((o, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span className="leading-relaxed">{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Threats */}
                <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                    <Target size={18} />
                    <span>{isAr ? '🟣 التحديات والمنافسة في النيتش (Threats)' : '🟣 Threats & Pitfalls'}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-200">
                    {analysis?.swot?.threatsOrPitfalls?.map((t, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">•</span>
                        <span className="leading-relaxed">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RECENT VIDEOS */}
          {activeTab === 'videos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Youtube size={16} className="text-red-500" />
                  <span>{isAr ? 'الفيديوهات الأخيرة المرصودة للقناة' : 'Recent Scraped Uploads'}</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {recentVideos?.length || 0} {isAr ? 'فيديوهات' : 'Videos'}
                </span>
              </div>

              {(!recentVideos || recentVideos.length === 0) ? (
                <div className="text-center py-10 bg-slate-900/40 rounded-xl border border-slate-800 text-xs text-slate-500">
                  {isAr ? 'لم يتم العثور على فيديوهات حديثة في الصفحة العامة للقناة.' : 'No recent uploads found in public grid.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentVideos.map((v) => (
                    <div
                      key={v.id}
                      className="flex flex-col bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all group"
                    >
                      <div className="relative aspect-video bg-slate-950">
                        <img
                          src={v.thumbnail}
                          alt={v.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        {v.duration && (
                          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-white font-mono font-bold">
                            {v.duration}
                          </div>
                        )}
                      </div>

                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <h4 className="text-xs font-bold text-slate-200 line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                          {v.title}
                        </h4>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
                          <span className="font-mono text-emerald-400">{v.views}</span>
                          <span>{v.publishedTime}</span>
                          <a
                            href={v.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-white"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: VIRAL IDEAS */}
          {activeTab === 'ideas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-400" />
                    <span>{isAr ? 'أفكار فيروسية مخصصة خصيصاً لهوية هذه القناة' : 'Tailored Viral Ideas'}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isAr
                      ? 'مبنية على سيكولوجية جمهور القناة، مواضيع الفيديوهات الناجحة، ونسبة الـ CTR المتوقعة.'
                      : 'Generated based on your audience psychology and recent content momentum.'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {analysis?.suggestedViralIdeas?.map((idea, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all space-y-2.5 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                          {idea.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                          {idea.format}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                          CTR {idea.estimatedCtrPotential}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs text-slate-300">
                      <span className="text-amber-400 font-bold">{isAr ? 'الهوك الافتتاحي: ' : 'Opening Hook: '}</span>
                      <span>"{idea.hook}"</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span className="line-clamp-1">{idea.concept}</span>
                      <button
                        type="button"
                        onClick={() => handleAskCopilotCustom(`اكتب اسكريبت احترافي كامل لفيديو بعنوان: "${idea.title}" مع هوك: "${idea.hook}" لقناتي ${title}`)}
                        className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1 transition-colors shrink-0"
                      >
                        <Sparkles size={12} />
                        <span>{isAr ? 'كتابة الاسكريبت' : 'Write Script'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3.5 border-t border-slate-800/80 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAskCopilotCustom(`أنا أعمل على قناتي ${title} (${analysis?.nicheCategory}). ما هي خطتك لزيادة المشاهدات والمشتركين بنسبة 50% خلال الـ 30 يوماً القادمة؟`)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold shadow-lg shadow-red-600/20 flex items-center gap-1.5 transition-all"
            >
              <MessageSquare size={14} />
              <span>{isAr ? 'استشر مُثقّف Copilot حول هذه القناة' : 'Ask Copilot About This Channel'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center gap-1.5 transition-colors"
            >
              <Printer size={13} />
              <span>{isAr ? 'طباعة / PDF' : 'Print / PDF'}</span>
            </button>
          </div>

          <button
            onClick={() => setAuditChannel(null)}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
