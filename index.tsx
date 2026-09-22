
import React, { useState, useEffect, createContext, useContext } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Language, Translation, ResultLanguage } from './types';
import { TRANSLATIONS } from './constants';
import { saveToStorage, loadFromStorage, StorageKeys } from './services/storageService';
import { AuthProvider } from './contexts/AuthContext';

interface LangContextType {
  lang: Language;
  setLang: (l: Language) => void;
  resultLang: ResultLanguage;
  setResultLang: (l: ResultLanguage) => void;
  t: Translation;
  isRTL: boolean;
}

const LangContext = createContext<LangContextType>({
  lang: 'ar',
  setLang: () => {},
  resultLang: 'auto',
  setResultLang: () => {},
  t: TRANSLATIONS.ar,
  isRTL: true
});

export const useLang = () => useContext(LangContext);

const Root = () => {
  const [lang, setLangState] = useState<Language>(() => loadFromStorage<Language>(StorageKeys.LANG) || 'ar');
  const [resultLang, setResultLangState] = useState<ResultLanguage>(() => loadFromStorage<ResultLanguage>('tv_result_lang') || 'auto');
  
  const setLang = (l: Language) => {
    setLangState(l);
    saveToStorage(StorageKeys.LANG, l, 525600);
  };

  const setResultLang = (l: ResultLanguage) => {
    setResultLangState(l);
    saveToStorage('tv_result_lang', l, 525600);
  };
  
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);
  
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Strict Font Switching based on Language
    if (lang === 'ar') {
      document.body.style.fontFamily = "'IBM Plex Sans Arabic', 'Cairo', sans-serif";
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.body.style.fontFamily = "'Inter', sans-serif";
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }
  }, [lang]);

  return (
    <AuthProvider>
      <LangContext.Provider value={{ lang, setLang, resultLang, setResultLang, t: TRANSLATIONS[lang], isRTL: lang === 'ar' }}>
        <App />
      </LangContext.Provider>
    </AuthProvider>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

// Standard check to prevent multiple roots in dev/reload scenarios
const root = (window as any)._reactRoot || ReactDOM.createRoot(rootElement);
if (!(window as any)._reactRoot) (window as any)._reactRoot = root;

root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
