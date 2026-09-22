import React, { useState, useRef, useEffect } from 'react';
import { useChannel } from '../../contexts/ChannelContext';
import { useLang } from '../../index';
import {
  Youtube,
  ChevronDown,
  Plus,
  BarChart3,
  Scale,
  Check,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const ChannelHeaderSelector: React.FC = () => {
  const {
    linkedChannels,
    activeChannel,
    selectActiveChannel,
    setIsManagerOpen,
    setAuditChannel,
    setIsComparisonOpen
  } = useChannel();

  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (linkedChannels.length === 0) {
    return (
      <button
        onClick={() => setIsManagerOpen(true)}
        className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm group whitespace-nowrap"
        title={isAr ? 'ربط وتحليل قناة يوتيوب' : 'Link YouTube Channel'}
      >
        <Youtube size={14} className="text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
        <span className="hidden xs:inline">{isAr ? 'ربط قناة يوتيوب' : 'Link Channel'}</span>
        <Plus size={12} className="text-emerald-400 shrink-0" />
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Active Channel Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1.5 rounded-xl bg-[#0a1210]/80 hover:bg-[#0f1d19]/90 border border-emerald-500/25 hover:border-emerald-500/40 text-slate-200 text-xs font-medium flex items-center gap-2 transition-all shadow-sm whitespace-nowrap"
        title={activeChannel?.title}
      >
        {activeChannel ? (
          <div className="flex items-center gap-1.5">
            <img
              src={activeChannel.avatar}
              alt={activeChannel.title}
              className="w-5 h-5 rounded-full object-cover border border-emerald-500/40 shrink-0"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex items-center gap-1.5 text-start">
              <span className="font-semibold text-white truncate max-w-[90px] sm:max-w-[140px] text-[11px] sm:text-xs">
                {activeChannel.title}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 font-mono hidden sm:inline-block">
                {activeChannel.subscriberCount}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Youtube size={14} />
            <span>{isAr ? 'اختر قناة' : 'Select Channel'}</span>
          </div>
        )}

        <ChevronDown size={13} className={`text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full mt-2 w-72 bg-[#090f14]/95 backdrop-blur-xl border border-emerald-500/20 rounded-2xl shadow-2xl z-50 p-2 text-slate-200 animate-in fade-in zoom-in-95 duration-150 right-0"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800/80 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Youtube size={13} className="text-emerald-400" />
              <span>{isAr ? 'القنوات المربوطة' : 'Linked Channels'}</span>
            </span>
            <span className="text-emerald-400 font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10">
              {linkedChannels.length}
            </span>
          </div>

          {/* Channels List */}
          <div className="max-h-52 overflow-y-auto py-1 space-y-1 custom-scrollbar">
            {linkedChannels.map((ch) => {
              const isSelected = activeChannel?.id === ch.id;

              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    selectActiveChannel(ch.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2 rounded-xl flex items-center justify-between text-xs transition-colors ${
                    isSelected
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-white'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-start truncate min-w-0">
                    <img
                      src={ch.avatar}
                      alt={ch.title}
                      className="w-7 h-7 rounded-lg object-cover shrink-0 border border-slate-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="truncate min-w-0">
                      <div className="font-semibold text-xs truncate text-white">{ch.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {ch.handle} • <span className="text-emerald-400">{ch.subscriberCount}</span>
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check size={15} className="text-emerald-400 shrink-0 ms-2" />}
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="pt-2 mt-1 border-t border-slate-800/80 space-y-1">
            {activeChannel && (
              <button
                onClick={() => {
                  setAuditChannel(activeChannel);
                  setIsOpen(false);
                }}
                className="w-full px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 text-xs font-medium flex items-center gap-2 transition-colors"
              >
                <BarChart3 size={13} className="text-emerald-400" />
                <span>{isAr ? 'تقرير التشخيص الشامل 360°' : '360° Deep Audit'}</span>
              </button>
            )}

            {linkedChannels.length > 1 && (
              <button
                onClick={() => {
                  setIsComparisonOpen(true);
                  setIsOpen(false);
                }}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-cyan-300 text-xs font-medium flex items-center gap-2 transition-colors"
              >
                <Scale size={13} className="text-cyan-400" />
                <span>{isAr ? 'مقارنة القنوات' : 'Compare Channels'}</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsManagerOpen(true);
                setIsOpen(false);
              }}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Plus size={13} className="text-emerald-400" />
                <span>{isAr ? 'إدارة وربط قناة جديدة' : 'Manage / Link New'}</span>
              </div>
              <Sparkles size={12} className="text-emerald-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

