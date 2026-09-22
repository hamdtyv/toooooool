import { ResultLanguage } from '../types';

export const getLanguageName = (code: ResultLanguage, uiLang: 'en' | 'ar'): string => {
  if (code === 'auto') return uiLang === 'ar' ? 'Arabic' : 'English';
  
  const map: Record<string, string> = {
    ar: 'Arabic',
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    ru: 'Russian',
    zh: 'Chinese',
    ja: 'Japanese',
    ko: 'Korean',
    hi: 'Hindi',
    tr: 'Turkish',
    nl: 'Dutch',
    pl: 'Polish',
    sv: 'Swedish',
    da: 'Danish',
    fi: 'Finnish',
    el: 'Greek',
    he: 'Hebrew'
  };
  
  return map[code] || 'English';
};
