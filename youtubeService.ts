
import { getYouTubeApiKey, callWithRetryAndBackoff } from './apiKeyService';
import { ChannelData, VideoData } from '../types';
import { parseISO8601Duration } from '../utils';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * Universal Fetch Wrapper for YouTube API.
 * Employs custom API Key and retry with exponential backoff.
 */
export const fetchYoutubeData = async (endpoint: string, params: string): Promise<any | null> => {
    try {
        return await callWithRetryAndBackoff(async () => {
            const apiKey = getYouTubeApiKey();
            const url = `${BASE_URL}/${endpoint}?${params}&key=${apiKey}`;
            
            const response = await fetch(url);
            
            if (response.status === 403 || response.status === 429) {
                throw new Error(`quotaExceeded: Status ${response.status}`);
            }

            if (response.status === 404) {
                return null;
            }

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        }, 'youtube', endpoint);
    } catch (e) {
        console.error("YouTube fetch exhausted and failed:", e);
        return null;
    }
};

/**
 * Robust Channel Fetcher
 * Handles: IDs (UC...), Handles (@name), and Search Terms (MrBeast)
 */
export const fetchChannelData = async (input: string): Promise<ChannelData | null> => {
    let cleanInput = input.trim();
    
    // Strategy 1: If it looks like a Channel ID (UC...), try direct ID fetch
    if (cleanInput.startsWith('UC') && cleanInput.length === 24) {
        const data = await fetchYoutubeData('channels', `part=snippet,statistics,brandingSettings,contentDetails&id=${cleanInput}`);
        if (data && data.items && data.items.length > 0) return data.items[0];
    }

    // Strategy 2: If it looks like a Handle (@name), try forHandle
    if (cleanInput.startsWith('@')) {
        const data = await fetchYoutubeData('channels', `part=snippet,statistics,brandingSettings,contentDetails&forHandle=${encodeURIComponent(cleanInput)}`);
        if (data && data.items && data.items.length > 0) return data.items[0];
    }

    // Strategy 3: Search Fallback (The Magic Fix)
    // If the above failed, or if it's just a name like "Joe Rogan"
    // We search for a *channel* type matching the query
    const searchData = await fetchYoutubeData('search', `part=snippet&type=channel&q=${encodeURIComponent(cleanInput)}&maxResults=1`);
    
    if (searchData && searchData.items && searchData.items.length > 0) {
        const foundId = searchData.items[0].snippet.channelId;
        // Now fetch the full details for this ID
        const finalData = await fetchYoutubeData('channels', `part=snippet,statistics,brandingSettings,contentDetails&id=${foundId}`);
        if (finalData && finalData.items && finalData.items.length > 0) return finalData.items[0];
    }

    return null;
};

/**
 * Fetch video data using key rotation.
 */
export const fetchVideoData = async (videoId: string): Promise<VideoData | null> => {
    const data = await fetchYoutubeData('videos', `part=snippet,statistics,contentDetails&id=${videoId}`);

    if (data && data.items && data.items.length > 0) {
      return data.items[0] as VideoData;
    }
    return null;
};

/**
 * Fetch a mix of latest content types using key rotation.
 */
export const fetchLatestContentMixed = async (channelId: string): Promise<{ latestVideo: VideoData | null, latestShort: VideoData | null }> => {
    // FIX: Use fallback strategy for Playlist ID if UC hack fails (causing 404)
    let playlistId = channelId.replace('UC', 'UU');
    let plData = await fetchYoutubeData('playlistItems', `part=snippet&playlistId=${playlistId}&maxResults=50`);

    // If 404/Empty, try to fetch channel details to get the REAL uploads ID
    if (!plData) {
         const chData = await fetchYoutubeData('channels', `part=contentDetails&id=${channelId}`);
         if (chData && chData.items && chData.items.length > 0) {
             playlistId = chData.items[0].contentDetails.relatedPlaylists.uploads;
             plData = await fetchYoutubeData('playlistItems', `part=snippet&playlistId=${playlistId}&maxResults=50`);
         }
    }

    if (!plData || !plData.items || plData.items.length === 0) return { latestVideo: null, latestShort: null };

    const videoIds = plData.items.map((i: any) => i.snippet.resourceId.videoId).join(',');
    const vidData = await fetchYoutubeData('videos', `part=snippet,statistics,contentDetails&id=${videoIds}`);

    if (!vidData || !vidData.items) return { latestVideo: null, latestShort: null };

    let latestVideo: VideoData | null = null;
    let latestShort: VideoData | null = null;

    for (const video of vidData.items) {
        const durationSec = parseISO8601Duration(video.contentDetails.duration);
        if (durationSec <= 60 && !latestShort) {
            latestShort = video;
        } else if (durationSec > 60 && !latestVideo) {
            latestVideo = video;
        }
        if (latestVideo && latestShort) break;
    }

    return { latestVideo, latestShort };
};
