import { LinkedChannel } from '../types';
import { loadFromStorage, saveToStorage } from './storageService';
import { getGeminiApiKey } from './apiKeyService';
import { db, auth } from './firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';

const STORAGE_KEY_CHANNELS = 'muthaqaf_linked_channels';
const STORAGE_KEY_ACTIVE_ID = 'muthaqaf_active_channel_id';

/**
 * Call the backend server endpoint to crawl YouTube channel by URL and generate full AI report
 */
export async function analyzeAndLinkChannel(urlOrHandle: string, lang: 'ar' | 'en' = 'ar'): Promise<LinkedChannel> {
  const userApiKey = getGeminiApiKey();

  const response = await fetch('/api/youtube/analyze-by-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(userApiKey ? { 'x-gemini-api-key': userApiKey } : {})
    },
    body: JSON.stringify({
      urlOrHandle,
      lang,
      userApiKey: userApiKey || undefined
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'تعذر تحليل رابط القناة. يرجى التأكد من الرابط والمحاولة مجدداً.');
  }

  const data = await response.json();
  if (!data.success || !data.channel) {
    throw new Error(data.error || 'استجابة غير صالحة من محلل القنوات');
  }

  const newChannel: LinkedChannel = data.channel;

  // Save to local storage
  const existing = getStoredLinkedChannels();
  // If channel already exists with same handle or URL, update it, otherwise prepend
  const filtered = existing.filter(c => c.handle !== newChannel.handle && c.url !== newChannel.url && c.id !== newChannel.id);
  const updatedList = [newChannel, ...filtered];
  saveStoredLinkedChannels(updatedList);
  setActiveChannelId(newChannel.id);

  // Sync to Firestore if authenticated
  syncChannelToFirestore(newChannel).catch(e => console.warn('[Firestore] Sync channel error:', e));

  return newChannel;
}

/**
 * Load all linked channels from LocalStorage
 */
export function getStoredLinkedChannels(): LinkedChannel[] {
  return loadFromStorage<LinkedChannel[]>(STORAGE_KEY_CHANNELS) || [];
}

/**
 * Save linked channels to LocalStorage
 */
export function saveStoredLinkedChannels(channels: LinkedChannel[]): void {
  saveToStorage(STORAGE_KEY_CHANNELS, channels);
}

/**
 * Get active channel ID
 */
export function getActiveChannelId(): string | null {
  return loadFromStorage<string>(STORAGE_KEY_ACTIVE_ID);
}

/**
 * Set active channel ID
 */
export function setActiveChannelId(id: string | null): void {
  if (id) {
    saveToStorage(STORAGE_KEY_ACTIVE_ID, id);
  } else {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
  }
}

/**
 * Get active channel object (or the first available linked channel)
 */
export function getActiveLinkedChannel(): LinkedChannel | null {
  const channels = getStoredLinkedChannels();
  if (channels.length === 0) return null;

  const activeId = getActiveChannelId();
  if (activeId) {
    const found = channels.find(c => c.id === activeId);
    if (found) return found;
  }

  return channels[0];
}

/**
 * Delete a linked channel by ID
 */
export function removeLinkedChannel(id: string): LinkedChannel[] {
  const channels = getStoredLinkedChannels();
  const updated = channels.filter(c => c.id !== id);
  saveStoredLinkedChannels(updated);

  const activeId = getActiveChannelId();
  if (activeId === id) {
    const nextActive = updated.length > 0 ? updated[0].id : null;
    setActiveChannelId(nextActive);
  }

  // Delete from Firestore if user is authenticated
  if (auth.currentUser) {
    const docRef = doc(db, 'linked_channels', id);
    deleteDoc(docRef).catch(err => console.warn('[Firestore] Delete channel doc failed:', err));
  }

  return updated;
}

/**
 * Sync a single channel to Firestore
 */
async function syncChannelToFirestore(channel: LinkedChannel) {
  if (!auth.currentUser) return;
  try {
    const channelDocRef = doc(db, 'linked_channels', channel.id);
    await setDoc(channelDocRef, {
      id: channel.id,
      userId: auth.currentUser.uid,
      url: channel.url,
      handle: channel.handle,
      title: channel.title,
      avatar: channel.avatar,
      banner: channel.banner || '',
      subscriberCount: channel.subscriberCount,
      videoCount: channel.videoCount,
      description: channel.description,
      niche: channel.analysis?.nicheCategory || 'General',
      payload: channel,
      createdAt: new Date(channel.linkedAt).toISOString(),
      updatedAt: new Date(channel.lastUpdated).toISOString()
    });
  } catch (err) {
    console.warn('[Firestore Sync] Channel save error:', err);
  }
}

/**
 * Fetch all channels for current user from Firestore and merge with local storage
 */
export async function syncAllChannelsFromFirestore(): Promise<LinkedChannel[]> {
  if (!auth.currentUser) return getStoredLinkedChannels();

  try {
    const q = query(collection(db, 'linked_channels'), where('userId', '==', auth.currentUser.uid));
    const snapshot = await getDocs(q);
    const firestoreChannels: LinkedChannel[] = [];
    
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.payload) {
        firestoreChannels.push(data.payload as LinkedChannel);
      }
    });

    if (firestoreChannels.length > 0) {
      const localChannels = getStoredLinkedChannels();
      const mergedMap = new Map<string, LinkedChannel>();
      
      localChannels.forEach(c => mergedMap.set(c.id, c));
      firestoreChannels.forEach(c => mergedMap.set(c.id, c));

      const merged = Array.from(mergedMap.values());
      saveStoredLinkedChannels(merged);
      return merged;
    }
  } catch (err) {
    console.warn('[Firestore Sync] fetch all channels failed:', err);
  }

  return getStoredLinkedChannels();
}
