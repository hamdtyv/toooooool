import React, { useState } from 'react';
import { SKILLS_LIST, SkillItem } from './skillsData';
import { Layers, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';

interface Props {
  activeSkill: SkillItem | null;
  onSelectSkill: (skill: SkillItem) => void;
  onOpenSkillsModal: () => void;
  isAr: boolean;
}

export const SkillDock: React.FC<Props> = ({ activeSkill, onSelectSkill, onOpenSkillsModal, isAr }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'content' | 'growth' | 'seo' | 'analytics'>('all');

  const categories = [
    { id: 'all', labelAr: 'كل المهارات', labelEn: 'All Skills' },
    { id: 'content', labelAr: 'المحتوى والمصغرات', labelEn: 'Content & Visuals' },
    { id: 'growth', labelAr: 'النمو والتريند', labelEn: 'Growth & Trends' },
    { id: 'seo', labelAr: 'السيو والعناوين', labelEn: 'SEO & Titles' },
    { id: 'analytics', labelAr: 'التحليلات والأرباح', labelEn: 'Analytics & Revenue' },
  ];

  const filteredSkills = activeCategory === 'all' 
    ? SKILLS_LIST 
    : SKILLS_LIST.filter(s => s.category === activeCategory);

  return (
    <div className="w-full select-none mb-2">
      {/* Category Pills & Modal Trigger */}
      <div className="flex items-center justify-between gap-2 px-1 mb-2 overflow-x-auto custom-scrollbar no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-tight transition-all duration-200 whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              {isAr ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenSkillsModal}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/30 text-[11px] font-bold text-emerald-400 transition-all active:scale-95"
          title={isAr ? 'عرض دليل المهارات بالكامل' : 'View full skills library'}
        >
          <Layers size={13} />
          <span>{isAr ? 'لوحة المهارات' : 'Skills Hub'}</span>
          <span className="w-5 h-4 rounded-full bg-emerald-500/20 text-[10px] flex items-center justify-center font-mono font-bold text-emerald-300">{SKILLS_LIST.length}</span>
        </button>
      </div>

      {/* Horizontal Interactive Skills Action Bar */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 px-1 snap-x">
        {filteredSkills.map(skill => {
          const Icon = skill.icon;
          const isSelected = activeSkill?.id === skill.id;

          return (
            <button
              key={skill.id}
              onClick={() => onSelectSkill(skill)}
              className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 border snap-start ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/25 text-white border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400/50 scale-[1.02]'
                  : 'bg-[#08100d]/90 hover:bg-[#0d1a15] text-slate-300 hover:text-white border-white/10 hover:border-emerald-500/30 shadow-md'
              }`}
            >
              <div 
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                  isSelected 
                    ? 'bg-emerald-400 text-black shadow-sm' 
                    : 'bg-white/10 text-emerald-400 group-hover:bg-emerald-500/20'
                }`}
              >
                <Icon size={14} />
              </div>
              <span className="tracking-tight">
                {isAr ? skill.shortTitleAr : skill.shortTitleEn}
              </span>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
