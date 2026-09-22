
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadFromStorage, saveToStorage, StorageKeys } from '../services/storageService';

export interface ArchiveItem {
  id: string;
  type: string; // 'script', 'analysis', 'image', 'chat_snapshot'
  title: string;
  payload: any;
  timestamp: number;
}

interface AppStateContextType {
  getSectionState: <T>(section: string, defaultValue: T) => T;
  setSectionState: <T>(section: string, state: T) => void;
  addToArchive: (item: Omit<ArchiveItem, 'id' | 'timestamp'>) => void;
  allState: Record<string, any>;
  isDragonTheme: boolean;
  setIsDragonTheme: (val: boolean) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (val: boolean) => void;
  isReadingMode: boolean;
  setIsReadingMode: (val: boolean) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allState, setAllState] = useState<Record<string, any>>({});
  const [isDragonTheme, setIsDragonThemeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('is_dragon_theme');
    return saved === null ? true : saved === 'true';
  });
  const [isReadingMode, setIsReadingModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('is_reading_mode');
    return saved === null ? false : saved === 'true';
  });
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('is_dragon_theme', isDragonTheme.toString());
    if (isDragonTheme) {
      document.body.classList.remove('classic-theme');
    } else {
      document.body.classList.add('classic-theme');
    }
  }, [isDragonTheme]);

  useEffect(() => {
    localStorage.setItem('is_reading_mode', isReadingMode.toString());
    if (isReadingMode) {
      document.body.classList.add('reading-mode');
    } else {
      document.body.classList.remove('reading-mode');
    }
  }, [isReadingMode]);

  useEffect(() => {
    // This is tricky because we don't know all sections beforehand.
    // In a real app we might iterate keys, but here we just rely on getSectionState lazy loading.
  }, []);

  function getSectionState<T>(section: string, defaultValue: T): T {
    if (allState[section] !== undefined) {
      return allState[section];
    }
    // Try localStorage
    const saved = loadFromStorage<T>(StorageKeys.SECTION_STATE(section));
    if (saved !== null) {
      return saved;
    }
    return defaultValue;
  }

  function setSectionState<T>(section: string, state: T) {
    setAllState(prev => ({ ...prev, [section]: state }));
    saveToStorage(StorageKeys.SECTION_STATE(section), state);
  }

  function addToArchive(item: Omit<ArchiveItem, 'id' | 'timestamp'>) {
    const archive = loadFromStorage<ArchiveItem[]>(StorageKeys.STRATEGIC_ARCHIVE) || [];
    const newItem: ArchiveItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    // Keep last 100 items
    const updated = [newItem, ...archive].slice(0, 100);
    saveToStorage(StorageKeys.STRATEGIC_ARCHIVE, updated);
  }

  return (
    <AppStateContext.Provider value={{ 
      getSectionState, 
      setSectionState, 
      addToArchive, 
      allState,
      isDragonTheme,
      setIsDragonTheme: setIsDragonThemeState,
      isReadingMode,
      setIsReadingMode: setIsReadingModeState,
      isAnalyzing,
      setIsAnalyzing
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used within AppStateProvider');
  return context;
};

// Simplified Hook for components
export function useSectionState<T>(section: string, defaultValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const { getSectionState, setSectionState } = useAppState();
  
  const state = getSectionState(section, defaultValue);
  
  const setState = (val: T | ((prev: T) => T)) => {
    const newState = val instanceof Function ? val(state) : val;
    setSectionState(section, newState);
  };
  
  return [state, setState];
}
