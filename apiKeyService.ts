import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { YOUTUBE_API_KEYS } from '../constants';

export interface KeyHealth {
  status: 'healthy' | 'degraded' | 'rate-limited' | 'invalid' | 'unknown';
  message: string;
  lastChecked: number;
  usageCountThisMonth: number;
  limitThisMonth: number;
}

// Memory cache
let cachedUserKeys: { youtubeApiKey?: string; geminiApiKey?: string } | null = null;
let listeners: (() => void)[] = [];

export let youtubeHealth: KeyHealth = { 
  status: 'unknown', 
  message: 'Not used yet', 
  lastChecked: Date.now(), 
  usageCountThisMonth: 0, 
  limitThisMonth: 10000 // Youtube free tier limit approx
};

export let geminiHealth: KeyHealth = { 
  status: 'unknown', 
  message: 'Not used yet', 
  lastChecked: Date.now(), 
  usageCountThisMonth: 0, 
  limitThisMonth: 1500000 // Custom limit approx for display
};

export function subscribeToKeysChange(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
}

function notifyListeners() {
  listeners.forEach(l => l());
}

/**
 * Fetch and watch keys
 */
export async function loadUserApiKeys(userId: string) {
  if (!userId) return;
  try {
    const docRef = doc(db, 'user_api_keys', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      cachedUserKeys = docSnap.data() as { youtubeApiKey?: string; geminiApiKey?: string };
    } else {
      cachedUserKeys = {};
    }
    notifyListeners();
    // Load monthly statistics
    await loadUsageStatistics(userId);
  } catch (e) {
    console.warn("Could not load custom user api keys from Firestore", e);
    // Guest fallback
    const localYoutube = localStorage.getItem('guest_youtube_api_key');
    const localGemini = localStorage.getItem('guest_gemini_api_key');
    cachedUserKeys = {
      youtubeApiKey: localYoutube || undefined,
      geminiApiKey: localGemini || undefined
    };
    notifyListeners();
  }
}

/**
 * Save user API Keys
 */
export async function saveUserApiKeys(userId: string, youtubeApiKey: string, geminiApiKey: string) {
  const cleanYoutube = youtubeApiKey.trim();
  const cleanGemini = geminiApiKey.trim();

  // Handle guest storage
  const isGuest = !auth.currentUser || auth.currentUser.isAnonymous;
  if (isGuest) {
    localStorage.setItem('guest_youtube_api_key', cleanYoutube);
    localStorage.setItem('guest_gemini_api_key', cleanGemini);
    cachedUserKeys = { youtubeApiKey: cleanYoutube, geminiApiKey: cleanGemini };
    notifyListeners();
    return;
  }

  try {
    const docRef = doc(db, 'user_api_keys', userId);
    const data = {
      userId,
      youtubeApiKey: cleanYoutube,
      geminiApiKey: cleanGemini,
      updatedAt: new Date().toISOString()
    };
    await setDoc(docRef, data);
    cachedUserKeys = { youtubeApiKey: cleanYoutube, geminiApiKey: cleanGemini };
    notifyListeners();
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `user_api_keys/${userId}`);
  }
}

export function getCachedUserKeys() {
  return cachedUserKeys;
}

/**
 * Retrieve active API Key
 */
export function getYouTubeApiKey(): string {
  if (cachedUserKeys?.youtubeApiKey) {
    return cachedUserKeys.youtubeApiKey;
  }
  return YOUTUBE_API_KEYS[0] || '';
}

export function getGeminiApiKey(): string {
  if (cachedUserKeys?.geminiApiKey) {
    return cachedUserKeys.geminiApiKey;
  }
  return import.meta.env.VITE_GEMINI_API_KEY || '';
}

/**
 * Log API calls to Firestore for tracking and charting
 */
export async function logApiUsage(
  apiType: 'youtube' | 'gemini',
  endpoint: string,
  quotaUsed: number,
  tokensUsed: number,
  status: 'success' | 'error' | 'retry'
) {
  const currentUser = auth.currentUser;
  
  // Track locally regardless
  if (apiType === 'youtube') {
    youtubeHealth.usageCountThisMonth += quotaUsed;
    youtubeHealth.lastChecked = Date.now();
    if (status === 'error') {
      youtubeHealth.status = 'rate-limited';
      youtubeHealth.message = 'Quota limits exceeded or bad key';
    } else {
      youtubeHealth.status = 'healthy';
      youtubeHealth.message = 'Fully operational';
    }
  } else {
    geminiHealth.usageCountThisMonth += tokensUsed;
    geminiHealth.lastChecked = Date.now();
    if (status === 'error') {
      geminiHealth.status = 'rate-limited';
      geminiHealth.message = 'Token quota or rate limit exceeded';
    } else {
      geminiHealth.status = 'healthy';
      geminiHealth.message = 'Fully operational';
    }
  }
  notifyListeners();

  if (!currentUser) {
    // Save to local storage for guests so they get logs too
    try {
      const guestLogs = JSON.parse(localStorage.getItem('guest_api_usage_logs') || '[]');
      guestLogs.push({
        id: 'log_' + Math.random().toString(36).substring(2, 9),
        userId: 'guest',
        apiType,
        endpoint,
        quotaUsed,
        tokensUsed,
        status,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('guest_api_usage_logs', JSON.stringify(guestLogs.slice(-100)));
    } catch {}
    return;
  }

  const id = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  const path = 'api_usage_logs';
  try {
    await setDoc(doc(db, path, id), {
      id,
      userId: currentUser.uid,
      apiType,
      endpoint,
      quotaUsed,
      tokensUsed,
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.warn("Failed to write API usage log to Firestore: ", error);
  }
}

/**
 * Fetch logs for charts
 */
export async function fetchApiUsageLogs() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    try {
      return JSON.parse(localStorage.getItem('guest_api_usage_logs') || '[]');
    } catch {
      return [];
    }
  }

  const path = 'api_usage_logs';
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', currentUser.uid)
    );
    const querySnapshot = await getDocs(q);
    const logs: any[] = [];
    querySnapshot.forEach((doc) => {
      logs.push(doc.data());
    });
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    return handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Calculate month-to-date usage count
 */
export async function loadUsageStatistics(userId: string) {
  try {
    const logs = await fetchApiUsageLogs();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let youtubeSum = 0;
    let geminiSum = 0;

    logs.forEach(log => {
      const logDate = new Date(log.timestamp);
      if (logDate >= startOfMonth) {
        if (log.apiType === 'youtube') {
          youtubeSum += log.quotaUsed || 0;
        } else if (log.apiType === 'gemini') {
          geminiSum += log.tokensUsed || 0;
        }
      }
    });

    youtubeHealth.usageCountThisMonth = youtubeSum;
    geminiHealth.usageCountThisMonth = geminiSum;
    youtubeHealth.status = youtubeSum > youtubeHealth.limitThisMonth * 0.9 ? 'degraded' : 'healthy';
    geminiHealth.status = geminiSum > geminiHealth.limitThisMonth * 0.9 ? 'degraded' : 'healthy';
    notifyListeners();
  } catch (e) {
    console.warn("Failed to calculate API usage stats", e);
  }
}

/**
 * EXPOSITIONAL RETRY & BACKOFF WRAPPER SERVICE
 * Catches rate limits/failures and exponentially retries them.
 */
export async function callWithRetryAndBackoff<T>(
  fn: () => Promise<T>,
  apiType: 'youtube' | 'gemini',
  endpointName: string,
  maxRetries = 4,
  baseDelay = 1500
): Promise<T> {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const result = await fn();
      
      // Successfully executed API call
      // Estimate approximate usage if not quantifiable
      const quota = apiType === 'youtube' ? (endpointName === 'search' ? 100 : 1) : 0;
      const tokens = apiType === 'gemini' ? 800 : 0; // standard estimation per average call
      
      await logApiUsage(apiType, endpointName, quota, tokens, 'success');
      return result;
    } catch (error: any) {
      attempt++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isRetryable = 
        errorMessage.includes('429') || 
        errorMessage.includes('503') ||
        errorMessage.includes('high demand') ||
        errorMessage.includes('UNAVAILABLE') ||
        errorMessage.includes('quota') || 
        errorMessage.includes('quotaExceeded') || 
        errorMessage.includes('RESOURCE_EXHAUSTED') ||
        error?.status === 429 ||
        error?.status === 503 ||
        error?.code === 429 ||
        error?.code === 503;

      if (isRetryable && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`[API Key Manager] Temporary service or rate limit on ${apiType}:${endpointName}. Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
        
        await logApiUsage(apiType, endpointName, apiType === 'youtube' ? 0 : 0, 0, 'retry');
        
        // Wait
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // If other error or retries exhausted, log failure and rethrow
      await logApiUsage(apiType, endpointName, 0, 0, 'error');
      throw error;
    }
  }

  throw new Error(`[API Key Manager] API request to ${endpointName} failed after ${maxRetries} retries.`);
}
