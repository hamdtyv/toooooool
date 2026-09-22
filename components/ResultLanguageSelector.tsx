import React from 'react';
import { useLang } from '../index';
import { ResultLanguage } from '../types';
import { Globe } from 'lucide-react';

const ResultLanguageSelector: React.FC = () => {
  const { resultLang, setResultLang, lang } = useLang();

  const languages: { value: ResultLanguage; labelAr: string; labelEn: string }[] = [
    { value: 'auto', labelAr: 'تلقائي (حسب الإدخال)', labelEn: 'Auto (Same as input)' },
    { value: 'ar', labelAr: 'العربية', labelEn: 'Arabic' },
    { value: 'en', labelAr: 'الإنجليزية', labelEn: 'English' },
    { value: 'es', labelAr: 'الإسبانية', labelEn: 'Spanish' },
    { value: 'fr', labelAr: 'الفرنسية', labelEn: 'French' },
    { value: 'de', labelAr: 'الألمانية', labelEn: 'German' },
    { value: 'it', labelAr: 'الإيطالية', labelEn: 'Italian' },
    { value: 'pt', labelAr: 'البرتغالية', labelEn: 'Portuguese' },
    { value: 'ru', labelAr: 'الروسية', labelEn: 'Russian' },
    { value: 'zh', labelAr: 'الصينية', labelEn: 'Chinese' },
    { value: 'ja', labelAr: 'اليابانية', labelEn: 'Japanese' },
    { value: 'ko', labelAr: 'الكورية', labelEn: 'Korean' },
    { value: 'hi', labelAr: 'الهندية', labelEn: 'Hindi' },
    { value: 'tr', labelAr: 'التركية', labelEn: 'Turkish' },
    { value: 'nl', labelAr: 'الهولندية', labelEn: 'Dutch' },
    { value: 'pl', labelAr: 'البولندية', labelEn: 'Polish' },
    { value: 'sv', labelAr: 'السويدية', labelEn: 'Swedish' },
    { value: 'da', labelAr: 'الدنماركية', labelEn: 'Danish' },
    { value: 'fi', labelAr: 'الفنلندية', labelEn: 'Finnish' },
    { value: 'el', labelAr: 'اليونانية', labelEn: 'Greek' },
    { value: 'he', labelAr: 'العبرية', labelEn: 'Hebrew' },
  ];

  return (
    <div className="flex items-center gap-2 mb-4 justify-end relative z-30">
      <Globe size={16} className="text-gray-400" />
      <select
        value={resultLang}
        onChange={(e) => setResultLang(e.target.value as ResultLanguage)}
        className="glass-select text-xs text-gray-300 rounded-lg px-2 py-1 outline-none border border-white/10 cursor-pointer"
      >
        {languages.map((l) => (
          <option key={l.value} value={l.value}>
            {lang === 'ar' ? l.labelAr : l.labelEn}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ResultLanguageSelector;
