import React, { useState } from 'react';
import { useChannel } from '../../contexts/ChannelContext';
import { useLang } from '../../index';
import {
  Youtube,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Star,
  ExternalLink,
  Activity,
  Sparkles,
  TrendingUp,
  Search,
  Eye,
  AlertCircle,
  Copy,
  ArrowRight,
  X,
  BarChart3,
  Scale,
  Layers,
  Check,
  Zap,
  Globe
} from 'lucide-react';

export const LinkedChannelsManagerModal: React.FC = () => {
  const {
    linkedChannels,
    activeChannel,
    isLoading,
    loadingStep,
    error,
    linkChannelByUrl,
    refreshChannel,
    selectActiveChannel,
    deleteChannel,
    isManagerOpen,
    setIsManagerOpen,
    setAuditChannel,
    setIsComparisonOpen
  } = useChannel();

  const { lang } = useLang();
  const isAr = lang === 'ar';

  const [inputUrl, setInputUrl] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedDescIds, setExpandedDescIds] = useState<Record<string, boolean>>({});

  const toggleExpandDesc = (id: string) => {
    setExpandedDescIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isManagerOpen) return null;

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setLocalError(null);
    try {
      await linkChannelByUrl(inputUrl.trim());
      setInputUrl('');
    } catch (err: any) {
      setLocalError(err?.message || (isAr ? 'فشل فحص الرابط' : 'Failed to analyze channel link'));
    }
  };

  const handleQuickPaste = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputUrl(text);
        }
      }
    } catch (e) {
      // Clipboard denied or unavailable
    }
  };

  const handleCopyHandle = (handle: string, id: string) => {
    navigator.clipboard.writeText(handle);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sampleChannels = [
    { name: '@MrBeast', url: 'https://youtube.com/@MrBeast', label: 'MrBeast (ترفيه عالمي)' },
    { name: '@khaledsallam', url: 'https://youtube.com/@khaledsallam', label: 'خالد سلام (سرد وثائقي)' },
    { name: '@AlDaheeh', url: 'https://youtube.com/@AlDaheeh', label: 'الدحيح (تبسيط علوم)' },
    { name: '@AliAbdaal', url: 'https://youtube.com/@AliAbdaal', label: 'Ali Abdaal (إنتاجية وتقنية)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#0f172a]/95 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800/80 bg-[#080f14]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <Youtube className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 flex-wrap">
                <span>{isAr ? 'إدارة القنوات المربوطة والتشخيص الذكي' : 'Linked YouTube Channels & 360° AI Hub'}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium">
                  {linkedChannels.length} {isAr ? 'قنوات' : 'Channels'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? 'اربط أي قناة برابطها أو معرّفها فقط بدون أي API، وسيتكفل الذكاء الاصطناعي بتحليل كل شيء عنها!'
                  : 'Link any YouTube channel via URL or handle without any API key. Get instant 360° AI audit!'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsManagerOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
          {/* Add Channel Form */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0b141b]/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Plus size={16} className="text-emerald-400" />
                {isAr ? 'ربط قناة جديدة عبر الرابط أو المعرف' : 'Link New Channel via URL or Handle'}
              </span>
              <button
                type="button"
                onClick={handleQuickPaste}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <Copy size={12} />
                <span>{isAr ? 'لصق من الحافظة' : 'Paste from clipboard'}</span>
              </button>
            </div>

            <form onSubmit={handleLinkSubmit} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder={isAr ? 'مثال: https://youtube.com/@ChannelName أو @handle أو اسم القناة' : 'e.g. https://youtube.com/@Channel or @handle'}
                  disabled={isLoading}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/70 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Youtube size={16} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !inputUrl.trim()}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin text-slate-950" />
                    <span>{isAr ? 'جاري الفحص...' : 'Analyzing...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="text-slate-950" />
                    <span>{isAr ? 'ربط وتحليل القناة' : 'Link & Deep Audit'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Samples */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-slate-400">{isAr ? 'أمثلة سريعة للتجربة:' : 'Quick samples to test:'}</span>
              {sampleChannels.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => setInputUrl(sample.url)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-emerald-950/40 border border-slate-700/60 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 transition-all flex items-center gap-1"
                >
                  <span className="font-mono text-emerald-400">{sample.name}</span>
                </button>
              ))}
            </div>

            {/* Error state */}
            {(localError || error) && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0 text-rose-400" />
                <span>{localError || error}</span>
              </div>
            )}
          </div>

          {/* Crawler Loading Progress */}
          {isLoading && (
            <div className="p-5 rounded-2xl bg-[#09110e]/95 border border-emerald-500/30 shadow-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <RefreshCw size={18} className="animate-spin" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{loadingStep}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{isAr ? 'نقوم باستخراج البيانات الحية وتحليل الأداء واستخراج الرؤى...' : 'Live crawling and performing algorithmic deep analysis...'}</div>
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full w-2/3 animate-[shimmer_2s_infinite]" />
              </div>
            </div>
          )}

          {/* Linked Channels Header with Comparison Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-200">
                {isAr ? 'قنواتك المربوطة حالياً' : 'Your Linked Channels'}
              </h3>
              <span className="text-xs text-slate-500">
                ({linkedChannels.length})
              </span>
            </div>

            {linkedChannels.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  setIsManagerOpen(false);
                  setIsComparisonOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <Scale size={13} />
                <span>{isAr ? 'مقارنة القنوات جنباً إلى جنب' : 'Side-by-Side Comparison'}</span>
              </button>
            )}
          </div>

          {/* Linked Channels List */}
          {linkedChannels.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-800 bg-[#0b141b]/40">
              <Youtube size={36} className="mx-auto text-slate-600 mb-3" />
              <h4 className="text-base font-semibold text-slate-300">
                {isAr ? 'لم تقم بربط أي قناة يوتيوب بعد' : 'No YouTube Channels Linked Yet'}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                {isAr
                  ? 'أدخل رابط قناتك أو أي قناة منافسة في الأعلى لبدء الفحص والتشخيص الفوري وتخصيص كل أدوات التطبيق لنيتش قناتك.'
                  : 'Enter your channel URL or handle above to perform a 360° audit and personalize all copilot features.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {linkedChannels.map((ch) => {
                const isActive = activeChannel?.id === ch.id;
                const isNewChannel = !ch.videoCount || ch.videoCount.startsWith('0') || (ch.recentVideos && ch.recentVideos.length === 0);

                return (
                  <div
                    key={ch.id}
                    className={`relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-gradient-to-b from-[#0e1e19]/95 to-[#0b141b]/95 border-emerald-500/60 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                        : 'bg-[#0b141b]/80 border-slate-800 hover:border-slate-700 hover:bg-[#0f1b24]/90'
                    }`}
                  >
                    {/* Top Section */}
                    <div>
                      {/* Active / Channel Info Bar */}
                      <div className="flex items-start justify-between gap-3 mb-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={ch.avatar}
                              alt={ch.title}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-700/80 shadow-md bg-slate-900"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            {isActive && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center shadow">
                                <Check size={9} className="text-slate-950 font-bold" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm sm:text-base font-bold text-white hover:text-emerald-400 transition-colors truncate">
                                {ch.title}
                              </h4>
                            </div>

                            <div className="flex items-center gap-1 text-xs text-slate-400 font-mono mt-0.5">
                              <span className="truncate">{ch.handle}</span>
                              <button
                                onClick={() => handleCopyHandle(ch.handle, ch.id)}
                                className="p-0.5 text-slate-500 hover:text-slate-300 shrink-0 transition-colors"
                                title={isAr ? 'نسخ المعرف' : 'Copy handle'}
                              >
                                {copiedId === ch.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Active Status Badge or Set Active Button */}
                        {isActive ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-1 shrink-0 shadow-sm">
                            <CheckCircle2 size={12} />
                            <span>{isAr ? 'القناة النشطة' : 'Active Channel'}</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => selectActiveChannel(ch.id)}
                            className="px-3 py-1 rounded-xl bg-slate-800/90 hover:bg-emerald-600 hover:text-slate-950 text-slate-300 text-xs font-medium border border-slate-700 transition-all shrink-0 active:scale-95"
                          >
                            {isAr ? 'تعيين كنشطة' : 'Set Active'}
                          </button>
                        )}
                      </div>

                      {/* Actual Numerical Stats Grid */}
                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-3">
                        <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-slate-900/50 border border-slate-800/40 text-center">
                          <span className="text-[10px] sm:text-xs text-slate-400 font-medium">{isAr ? 'المشتركون الفعليون' : 'Subscribers'}</span>
                          <span className="text-sm font-extrabold text-emerald-400 font-mono mt-0.5">{ch.subscriberCount || '0 مشترك'}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-slate-900/50 border border-slate-800/40 text-center">
                          <span className="text-[10px] sm:text-xs text-slate-400 font-medium">{isAr ? 'عدد الفيديوهات' : 'Videos'}</span>
                          <span className="text-sm font-extrabold text-cyan-400 font-mono mt-0.5">{ch.videoCount || '0 فيديو'}</span>
                        </div>
                      </div>

                      {/* Launchpad Badge for New Channels */}
                      {isNewChannel && (
                        <div className="mb-3 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs flex items-center gap-2">
                          <Sparkles size={14} className="text-cyan-400 shrink-0" />
                          <span className="leading-snug">
                            {isAr 
                              ? '🚀 قناة ناشئة: تم إعداد خطة إطلاق شاملة من الصفر (0 to 1 Launchpad) وأول 5 أفكار فيديوهات انطلاقة!'
                              : '🚀 Launchpad Ready: AI prepared a 0 to 1 launch strategy with initial viral concepts!'}
                          </span>
                        </div>
                      )}

                      {/* Full Niche Category (No Truncation) */}
                      {ch.analysis?.nicheCategory && (
                        <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                            <Layers size={12} className="text-emerald-400 shrink-0" />
                            <span>{isAr ? 'النيتش والجمهور المستهدف:' : 'Niche & Category:'}</span>
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-emerald-300 leading-snug break-words">
                            {ch.analysis.nicheCategory}
                          </div>
                          {ch.analysis.subNiches && ch.analysis.subNiches.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {ch.analysis.subNiches.map((sub, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[10px] font-medium">
                                  #{sub}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Description / Bio with Read More / Show Less */}
                      <div className="mb-3 text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mb-1">
                          <span>{isAr ? 'نبذة ووصف القناة:' : 'Channel Bio:'}</span>
                          {ch.description && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(ch.description);
                                setCopiedId(`desc_${ch.id}`);
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                              className="text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                              title={isAr ? 'نسخ النبذة' : 'Copy bio'}
                            >
                              {copiedId === `desc_${ch.id}` ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                              <span>{copiedId === `desc_${ch.id}` ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ' : 'Copy')}</span>
                            </button>
                          )}
                        </div>
                        <p className={expandedDescIds[ch.id] ? 'whitespace-pre-wrap text-slate-200' : 'line-clamp-2 text-slate-400'}>
                          {ch.description || ch.analysis?.summary || (isAr ? 'قناة يوتيوب رسمية' : 'Official YouTube Channel')}
                        </p>
                        {((ch.description || ch.analysis?.summary)?.length || 0) > 70 && (
                          <button
                            type="button"
                            onClick={() => toggleExpandDesc(ch.id)}
                            className="mt-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors inline-flex items-center gap-1"
                          >
                            <span>
                              {expandedDescIds[ch.id] 
                                ? (isAr ? 'عرض أقل ↑' : 'Show less ↑') 
                                : (isAr ? 'قراءة المزيد من الوصف ↓' : 'Read full description ↓')}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs mt-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setAuditChannel(ch);
                            setIsManagerOpen(false);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                        >
                          <BarChart3 size={14} className="text-emerald-400" />
                          <span>{isAr ? 'تقرير تشخيص 360°' : '360° AI Audit'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => refreshChannel(ch.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                          title={isAr ? 'إعادة فحص القناة وتحديث التقرير' : 'Re-analyze & refresh'}
                        >
                          <RefreshCw size={14} />
                        </button>

                        <a
                          href={ch.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                          title={isAr ? 'فتح على يوتيوب' : 'Open on YouTube'}
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteChannel(ch.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title={isAr ? 'حذف القناة' : 'Delete channel'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-t border-slate-800/80 bg-[#080f14]/80 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Zap size={13} className="text-emerald-400" />
            <span>{isAr ? 'التحليل فوري بدون قيود API' : 'Instant AI audit without API quotas'}</span>
          </div>

          <button
            onClick={() => setIsManagerOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
