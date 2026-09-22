import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LinkedChannel } from '../types';
import {
  getStoredLinkedChannels,
  saveStoredLinkedChannels,
  getActiveLinkedChannel,
  setActiveChannelId,
  getActiveChannelId,
  removeLinkedChannel,
  analyzeAndLinkChannel,
  syncAllChannelsFromFirestore
} from '../services/linkedChannelService';
import { useLang } from '../index';

interface ChannelContextType {
  linkedChannels: LinkedChannel[];
  activeChannel: LinkedChannel | null;
  isLoading: boolean;
  loadingStep: string;
  error: string | null;
  linkChannelByUrl: (urlOrHandle: string) => Promise<LinkedChannel>;
  refreshChannel: (idOrUrl: string) => Promise<LinkedChannel>;
  selectActiveChannel: (id: string) => void;
  deleteChannel: (id: string) => void;
  isManagerOpen: boolean;
  setIsManagerOpen: (open: boolean) => void;
  auditChannel: LinkedChannel | null;
  setAuditChannel: (channel: LinkedChannel | null) => void;
  isComparisonOpen: boolean;
  setIsComparisonOpen: (open: boolean) => void;
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export const ChannelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const [linkedChannels, setLinkedChannels] = useState<LinkedChannel[]>(() => getStoredLinkedChannels());
  const [activeChannel, setActiveChannelState] = useState<LinkedChannel | null>(() => getActiveLinkedChannel());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isManagerOpen, setIsManagerOpen] = useState<boolean>(false);
  const [auditChannel, setAuditChannel] = useState<LinkedChannel | null>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);

  // Initial Firestore sync on mount
  useEffect(() => {
    syncAllChannelsFromFirestore().then(synced => {
      setLinkedChannels(synced);
      const active = getActiveLinkedChannel();
      setActiveChannelState(active);
    }).catch(err => console.warn('Channel sync error:', err));
  }, []);

  const selectActiveChannel = useCallback((id: string) => {
    setActiveChannelId(id);
    const found = linkedChannels.find(c => c.id === id);
    if (found) {
      setActiveChannelState(found);
    }
  }, [linkedChannels]);

  const linkChannelByUrl = async (urlOrHandle: string): Promise<LinkedChannel> => {
    setIsLoading(true);
    setError(null);
    setLoadingStep(isAr ? '🔍 جاري الاتصال بيوتيوب واستخراج بيانات القناة...' : '🔍 Connecting to YouTube & extracting channel data...');

    try {
      const stepTimer1 = setTimeout(() => {
        setLoadingStep(isAr ? '📊 تحليل الفيديوهات الأخيرة والمشاهدات ومعدلات التفاعل...' : '📊 Scanning recent uploads, views & engagement...');
      }, 1500);

      const stepTimer2 = setTimeout(() => {
        setLoadingStep(isAr ? '🧠 تشخيص الذكاء الاصطناعي للسيو، الجمهور، ونقاط القوة والضعف...' : '🧠 AI Deep Audit on SEO, Audience & SWOT...');
      }, 3500);

      const channel = await analyzeAndLinkChannel(urlOrHandle, lang);

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const updated = getStoredLinkedChannels();
      setLinkedChannels(updated);
      setActiveChannelState(channel);
      setIsLoading(false);
      return channel;
    } catch (err: any) {
      setIsLoading(false);
      const msg = err?.message || (isAr ? 'حدث خطأ أثناء فحص القناة' : 'Failed to analyze channel');
      setError(msg);
      throw err;
    }
  };

  const refreshChannel = async (idOrUrl: string): Promise<LinkedChannel> => {
    const target = linkedChannels.find(c => c.id === idOrUrl || c.url === idOrUrl || c.handle === idOrUrl);
    const url = target ? (target.handle || target.url) : idOrUrl;
    return await linkChannelByUrl(url);
  };

  const deleteChannel = (id: string) => {
    const updated = removeLinkedChannel(id);
    setLinkedChannels(updated);
    if (activeChannel?.id === id) {
      const nextActive = updated.length > 0 ? updated[0] : null;
      setActiveChannelState(nextActive);
    }
    if (auditChannel?.id === id) {
      setAuditChannel(null);
    }
  };

  return (
    <ChannelContext.Provider
      value={{
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
        auditChannel,
        setAuditChannel,
        isComparisonOpen,
        setIsComparisonOpen
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
};

export const useChannel = () => {
  const context = useContext(ChannelContext);
  if (!context) {
    throw new Error('useChannel must be used within a ChannelProvider');
  }
  return context;
};
