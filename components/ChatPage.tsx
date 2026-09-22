import React from 'react';
import ChatAssistant from './ChatAssistant';
import { useLang } from '../index';
import { Bot, Sparkles } from 'lucide-react';

const ChatPage: React.FC = () => {
  const { lang, t } = useLang();
  const isAr = lang === 'ar';

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-120px)] max-w-5xl mx-auto w-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
            <Bot size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className={`text-2xl md:text-3xl font-black text-white uppercase italic leading-tight ${isAr ? 'font-alex' : 'font-space'}`}>
              {isAr ? 'المساعد الذكي' : 'AI Assistant'}
            </h2>
            <p className="text-slate-500 text-xs md:text-sm font-light mt-1">
              {isAr ? 'مركز الاستخبارات والتواصل المباشر مع مُثقّف' : 'Intelligence hub and direct communication channel with Muthaqaf'}
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/10">
          <Sparkles size={14} className="text-emerald-400 animate-pulse" />
          <span className="text-[10px] font-space font-bold tracking-widest text-emerald-400/60 uppercase">NEURAL_LINK_STABLE</span>
        </div>
      </div>

      <div className="flex-1 glass-panel border-white/5 relative overflow-hidden flex flex-col shadow-2xl shadow-black/50">
        <div className="absolute inset-0 bg-emerald-500/[0.01] pointer-events-none"></div>
        {/* We use the ChatAssistant component here, but we'll modify it to behave as a fixed element if needed or just pass props */}
        <ChatAssistant isFixedPage={true} />
      </div>
    </div>
  );
};

export default ChatPage;
