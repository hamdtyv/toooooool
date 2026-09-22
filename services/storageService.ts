
export const StorageKeys = {
  LANG: 'tubeview_lang',
  
  // Data Caches (Specific ID) - Prefix ensures uniqueness
  CHANNEL_DATA: (id: string) => `tv_data_${id}`,
  CHANNEL_HEALTH: (id: string) => `tv_health_${id}`,
  CHANNEL_AI: (id: string) => `tv_ch_ai_${id}`, // AI Audit Persistence
  VIDEO_DATA: (id: string) => `tv_video_${id}`,
  VIDEO_AI: (id: string) => `tv_vid_ai_${id}`, // Video AI Persistence
  TIMING_AI: (id: string) => `tv_time_ai_${id}`, // Timing AI Persistence
  ATLAS_AI: (id: string) => `tv_atlas_ai_${id}`, // Atlas AI Persistence
  LIVE_AI: (id: string) => `tv_live_ai_${id}`, // Live Forecast Persistence
  EARNINGS_AI: (id: string) => `tv_earn_ai_${id}`, // NEW: Earnings Realism Report
  COMPETITOR: (id: string) => `tv_comp_${id}`,
  IDEAS: (id: string) => `tv_ideas_${id}`,
  PLAN: (id: string) => `tv_plan_${id}`,
  OUTLIERS: (id: string) => `tv_outliers_${id}`,
  EARNINGS: (id: string) => `tv_earn_${id}`,
  VPH: (id: string) => `tv_vph_${id}`,
  SEO: (id: string) => `tv_seo_${id}`,
  AUDIENCE: (id: string) => `tv_aud_dna_${id}`,
  SCRIPT: (id: string) => `tv_script_${id}`, 
  
  // Last Active State (For Auto-Restore on Page Load)
  LAST_VIEWED_CHANNEL: 'tv_last_channel',
  LAST_VIEWED_VIDEO: 'tv_last_video',
  LAST_VIEWED_TIMING: 'tv_last_timing', 
  LAST_VIEWED_ATLAS: 'tv_last_atlas', 
  LAST_VIEWED_LIVE: 'tv_last_live',
  LAST_VIEWED_COMPETITOR: 'tv_last_comp',
  LAST_VIEWED_IDEAS: 'tv_last_ideas',
  LAST_VIEWED_PLAN: 'tv_last_plan',
  LAST_VIEWED_OUTLIERS: 'tv_last_outliers',
  LAST_VIEWED_EARNINGS: 'tv_last_earn',
  LAST_VIEWED_VPH: 'tv_last_vph',
  LAST_VIEWED_SEO: 'tv_last_seo',
  LAST_VIEWED_AUDIENCE: 'tv_last_audience',
  LAST_VIEWED_LIVE_PAGE: 'tv_last_live_page',
  LAST_GEN_IMAGE: 'tv_last_image',
  LAST_VIEWED_SCRIPT: 'tv_last_script',

  IDEAS_CHAT_HISTORY: 'tv_ideas_chat_history',
  SCRIPTS_CHAT_HISTORY: 'tv_scripts_chat_history',
  PLANNER_CHAT_HISTORY: 'tv_planner_chat_history',
  SEO_CHAT_HISTORY: 'tv_seo_chat_history',

  // Strategic Archive (Discrete result snapshots)
  STRATEGIC_ARCHIVE: 'tv_strategic_archive',
  
  // Scoped Chat History (Dynamic based on route/tool)
  CHAT_MESSAGES_SCOPED: (scope: string) => `tv_chat_history_${scope.replace(/[^a-zA-Z0-9]/g, '_')}`,
  CHAT_MESSAGES: 'tv_chat_history_perm',
  
  // Generic Scoped State Persistence (Background Sync)
  SECTION_STATE: (section: string) => `tv_state_${section.replace(/[^a-zA-Z0-9]/g, '_')}`,
  
  // Global Job States
  ACTIVE_JOBS: 'tv_active_jobs',
  
  // User Config
  USER_YT_KEY: 'tv_user_yt_key_v1',
  PINNED_TOOLS: 'tv_pinned_tools_v1'
};

interface StorageItem<T> {
  value: T;
  timestamp: number;
  expiryMinutes: number;
}

// Default expiry set to 1 year (525600 minutes) for persistence
export const saveToStorage = <T>(key: string, value: T, expiryMinutes: number = 525600) => {
  // Define item outside try block to ensure scope availability
  const item: StorageItem<T> = {
    value,
    timestamp: Date.now(),
    expiryMinutes
  };

  try {
    localStorage.setItem(key, JSON.stringify(item));
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
         console.warn("Storage Quota Exceeded. Trying to clear old cache...");
         // Simple cleanup strategy: Remove oldest huge items
         try {
             localStorage.removeItem(StorageKeys.LAST_GEN_IMAGE);
             localStorage.setItem(key, JSON.stringify(item));
         } catch (retryError) {
             console.warn('LocalStorage save failed even after cleanup', retryError);
         }
    } else {
         console.warn('LocalStorage save failed', e);
    }
  }
};

export const loadFromStorage = <T>(key: string): T | null => {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item: StorageItem<T> = JSON.parse(itemStr);
    
    // Check expiry
    const now = Date.now();
    const ageMinutes = (now - item.timestamp) / (1000 * 60);

    if (item.expiryMinutes > 0 && ageMinutes > item.expiryMinutes) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  } catch (e) {
    // If JSON parse fails or other error, return null safely
    return null;
  }
};

export const clearStorageKey = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn("Failed to clear key", key, e);
  }
};

export const getStorageItemExpiry = (key: string): number | null => {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item: StorageItem<any> = JSON.parse(itemStr);
    
    if (item.expiryMinutes <= 0) return 9999;

    const now = Date.now();
    const expiryTime = item.timestamp + (item.expiryMinutes * 60 * 1000);
    const diffMs = expiryTime - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  } catch (e) {
    return null;
  }
};

export const clearAllStorage = () => {
  try {
    localStorage.clear();
  } catch (e) {
    console.warn("Failed to clear all storage", e);
  }
};

export const renewStorageItem = (key: string): boolean => {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return false;

    const item: StorageItem<any> = JSON.parse(itemStr);
    item.timestamp = Date.now();
    item.expiryMinutes = 525600;

    localStorage.setItem(key, JSON.stringify(item));
    return true;
  } catch (e) {
    return false;
  }
};
