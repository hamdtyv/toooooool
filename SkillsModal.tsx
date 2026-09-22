import React, { useState } from 'react';
import { SKILLS_LIST, SkillItem } from './skillsData';
import { X, Search, Sparkles, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectSkill: (skill: SkillItem, promptToUse?: string) => void;
  isAr: boolean;
}

export const SkillsModal: React.FC<Props> = ({ isOpen, onClose, onSelectSkill, isAr }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', labelAr: `الكل (${SKILLS_LIST.length})`, labelEn: `All (${SKILLS_LIST.length})` },
    { id: 'content', labelAr: 'المحتوى والسرد', labelEn: 'Content & Narrative' },
    { id: 'growth', labelAr: 'التريند والنمو', labelEn: 'Trends & Growth' },
    { id: 'seo', labelAr: 'السيو والوصول', labelEn: 'SEO & Reach' },
    { id: 'analytics', labelAr: 'التحليلات والأرباح', labelEn: 'Analytics & Revenue' },
  ];

  const filtered = SKILLS_LIST.filter(skill => {
    const matchesCat = selectedCat === 'all' || skill.category === selectedCat;
    const query = searchTerm.toLowerCase().trim();
    if (!query) return matchesCat;
    const inTitle = (skill.titleAr + skill.titleEn).toLowerCase().includes(query);
    const inDesc = (skill.descAr + skill.descEn).toLowerCase().includes(query);
    return matchesCat && (inTitle || inDesc);
  });

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in font-sans">
      <div 
        className="relative w-full max-w-4xl max-h-[85vh] bg-[#050a08] border border-emerald-500/25 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-950/30 to-[#050a08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                {isAr ? 'مكتبة مهارات استوديو مُثقّف' : 'Muthaqaf AI Skills Hub'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'اختر أي مهارة لتفعيلها فوراً داخل الشات الذكي مع نماذج جاهزة' : 'Select any skill to activate in chat or choose a 1-click sample prompt'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 bg-[#030605] border-b border-white/5 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className={`absolute top-2.5 ${isAr ? 'right-3' : 'left-3'} text-slate-500`} size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'ابحث عن مهارة (تريند، اسكريبت، سيو...)' : 'Search skills...'}
              className={`w-full py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCat === cat.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5'
                }`}
              >
                {isAr ? cat.labelAr : cat.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Skills Cards Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(skill => {
            const Icon = skill.icon;
            const prompts = isAr ? skill.suggestedPromptsAr : skill.suggestedPromptsEn;

            return (
              <div
                key={skill.id}
                className="bg-[#030705] hover:bg-[#07110c] border border-white/10 hover:border-emerald-500/40 rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {isAr ? skill.titleAr : skill.titleEn}
                        </h4>
                        <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">
                          {skill.category}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectSkill(skill);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-black font-bold text-xs transition-all border border-emerald-500/30 flex items-center gap-1 shrink-0"
                    >
                      <span>{isAr ? 'تفعيل' : 'Use'}</span>
                      <Zap size={12} />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed my-2.5">
                    {isAr ? skill.descAr : skill.descEn}
                  </p>

                  {/* Ready-to-run prompts */}
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1.5">
                      {isAr ? 'نماذج تشغيل فورية بنقرة واحدة:' : '1-Click Starters:'}
                    </span>
                    <div className="space-y-1.5">
                      {prompts.slice(0, 2).map((p, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => {
                            onSelectSkill(skill, p);
                            onClose();
                          }}
                          className="w-full text-right rtl:text-right ltr:text-left p-2 rounded-lg bg-white/[0.02] hover:bg-white/10 text-[11px] text-slate-300 hover:text-emerald-200 transition-colors border border-white/5 flex items-center justify-between group/p"
                        >
                          <span className="truncate pr-2">{p}</span>
                          <ArrowRight size={12} className="text-slate-500 group-hover/p:text-emerald-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
