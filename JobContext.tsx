
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchChannelData, fetchYoutubeData, fetchVideoData } from '../services/youtubeService';
import { 
  generateCompetitorAnalysis, 
  generateCompetitorDeepDive,
  generateCustomGrowthPlan, 
  generateAiVideoIdeas, 
  generateAudienceDeepDive, 
  generateViralScript,
  generateBananaImage,
  editBananaImage,
  generateAdvancedSeo,
  generateOutlierAnalysis, 
  generateVphAnalysis,
  generateChannelAudit,
  generateVideoDeepAnalysis,
  generateTimingAnalysis,
  generateRegionTimingAnalysis,
  generateLiveForecast,
  generateEarningsAudit
} from '../services/geminiService';
import { detectOutliers } from '../services/algoService';
import { extractId } from '../utils';
import { saveToStorage, loadFromStorage, StorageKeys } from '../services/storageService';
import { ResultLanguage } from '../types';

// Types
type JobStatus = 'idle' | 'loading' | 'success' | 'error';
type ToolType = 'competitor' | 'planner' | 'ideas' | 'outliers' | 'audience' | 'script' | 'image' | 'seo' | 'outlier_analysis' | 'vph_analysis' | 'channel_audit' | 'video_audit' | 'timing_audit' | 'atlas_audit' | 'live_audit' | 'earnings_audit';

interface JobState {
  status: JobStatus;
  currentId: string | null; 
  error?: string;
  result?: any; 
}

interface JobContextType {
  jobs: Record<ToolType, JobState>;
  startJob: (tool: ToolType, input: string, lang: 'en' | 'ar', resultLang: ResultLanguage, options?: any) => Promise<void>;
  resetJob: (tool: ToolType) => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) throw new Error("useJobs must be used within a JobProvider");
  return context;
};

export const JobProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Record<ToolType, JobState>>({
    competitor: { status: 'idle', currentId: null },
    planner: { status: 'idle', currentId: null },
    ideas: { status: 'idle', currentId: null },
    outliers: { status: 'idle', currentId: null },
    audience: { status: 'idle', currentId: null },
    script: { status: 'idle', currentId: null },
    image: { status: 'idle', currentId: null },
    seo: { status: 'idle', currentId: null },
    outlier_analysis: { status: 'idle', currentId: null },
    vph_analysis: { status: 'idle', currentId: null },
    channel_audit: { status: 'idle', currentId: null },
    video_audit: { status: 'idle', currentId: null },
    timing_audit: { status: 'idle', currentId: null },
    atlas_audit: { status: 'idle', currentId: null },
    live_audit: { status: 'idle', currentId: null },
    earnings_audit: { status: 'idle', currentId: null },
  });

  const updateJob = (tool: ToolType, updates: Partial<JobState>) => {
    setJobs(prev => ({ ...prev, [tool]: { ...prev[tool], ...updates } }));
  };

  const startJob = async (tool: ToolType, input: string, lang: 'en' | 'ar', resultLang: ResultLanguage, options?: any) => {
    let targetId = input; 
    let isRawText = false;
    
    if (['competitor', 'planner', 'ideas', 'outliers', 'audience', 'channel_audit', 'live_audit', 'earnings_audit'].includes(tool)) {
        const { id, type } = extractId(input);
        if (id && type !== 'unknown') { targetId = id; } 
        else {
            isRawText = true;
            if (['planner', 'outliers', 'audience', 'channel_audit', 'live_audit', 'earnings_audit'].includes(tool)) {
                 const possibleChannel = await fetchChannelData(input);
                 if (possibleChannel) { targetId = possibleChannel.id; isRawText = false; } 
                 else { return; }
            }
        }
    } else if (tool === 'video_audit' || tool === 'timing_audit') {
        const { id, type } = extractId(input);
        if (id && type === 'video') { targetId = id; }
    } else if (tool === 'atlas_audit') {
        targetId = input; 
    }

    updateJob(tool, { status: 'loading', currentId: targetId, error: undefined, result: undefined });

    try {
      if (tool === 'earnings_audit') {
          const { title, desc, viewCount, country } = options;
          const result = await generateEarningsAudit(title, desc, viewCount, country, lang, resultLang);
          if (result) {
              saveToStorage(StorageKeys.EARNINGS_AI(targetId), result);
              updateJob(tool, { status: 'success', result });
          } else { throw new Error("Audit Failed"); }
          return;
      }
      if (tool === 'live_audit') {
          const { channelTitle, currentSubs, velocity } = options;
          const result = await generateLiveForecast(channelTitle, currentSubs, velocity, lang, resultLang);
          if (result) { saveToStorage(StorageKeys.LIVE_AI(targetId), result); updateJob(tool, { status: 'success', result }); }
          else { throw new Error("Forecast Failed"); }
          return;
      }
      if (tool === 'atlas_audit') {
          const cachedResult = loadFromStorage(StorageKeys.ATLAS_AI(targetId));
          if (cachedResult) {
              updateJob(tool, { status: 'success', result: cachedResult });
              return;
          }
          const result = await generateRegionTimingAnalysis(targetId, lang, resultLang);
          if (result) { saveToStorage(StorageKeys.ATLAS_AI(targetId), result); updateJob(tool, { status: 'success', result }); }
          else { throw new Error("Atlas Failed"); }
          return;
      }
      if (tool === 'timing_audit') {
          let video = options?.videoData;
          if (!video) video = await fetchVideoData(targetId);
          const countryCode = options?.countryCode || 'US';
          if (video) {
              const result = await generateTimingAnalysis(video.snippet.title, video.snippet.publishedAt, countryCode, video.statistics.viewCount, lang, resultLang);
              if (result) { saveToStorage(StorageKeys.TIMING_AI(targetId), result); updateJob(tool, { status: 'success', result }); } 
              else { throw new Error("Timing Analysis Failed"); }
          } else { throw new Error("Video not found"); }
          return;
      }
      if (tool === 'video_audit') {
          let video = options?.videoData;
          if (!video) video = await fetchVideoData(targetId);
          if (video) {
              const result = await generateVideoDeepAnalysis(video, lang, resultLang);
              if (result) { saveToStorage(StorageKeys.VIDEO_AI(targetId), result); updateJob(tool, { status: 'success', result }); }
              else { throw new Error("Video Analysis Failed"); }
          } else { throw new Error("Video not found"); }
          return;
      }
      if (tool === 'channel_audit') {
          let channel = options?.channelData;
          if (!channel) channel = await fetchChannelData(targetId);
          if (channel) {
              const result = await generateChannelAudit(channel, lang, resultLang);
              if (result) { saveToStorage(StorageKeys.CHANNEL_AI(targetId), result); updateJob(tool, { status: 'success', result }); }
              else { throw new Error("AI Audit Failed"); }
          } else { throw new Error("Channel data not found"); }
          return;
      }
      if (tool === 'outlier_analysis') {
          const { title, views, avg } = options;
          const result = await generateOutlierAnalysis(title, views, avg, lang, resultLang);
          if (result) updateJob(tool, { status: 'success', result });
          else throw new Error("Analysis failed");
          return;
      }
      if (tool === 'vph_analysis') {
          const { title, vph, age } = options;
          const result = await generateVphAnalysis(title, vph, age, lang, resultLang);
          if (result) updateJob(tool, { status: 'success', result });
          else throw new Error("VPH Analysis failed");
          return;
      }
      if (tool === 'image') {
          const { mode, aspectRatio, activeTab, editImage, overlayImage, overlayImage2, referenceImage } = options;
          let imageUrl: string | null = null;
          let actionDesc = "";
          if (activeTab === 'generate') {
              if (referenceImage) {
                  imageUrl = await editBananaImage(referenceImage, input, aspectRatio, lang, resultLang, null, null);
                  actionDesc = `Generate with Ref (${aspectRatio})`;
              } else {
                  imageUrl = await generateBananaImage(input, mode, aspectRatio, lang, resultLang);
                  actionDesc = `${mode} (${aspectRatio})`;
              }
          } else if (editImage) {
               imageUrl = await editBananaImage(editImage, input, aspectRatio, lang, resultLang, overlayImage, overlayImage2);
               actionDesc = overlayImage ? `Blend Images (${aspectRatio})` : `Edit/Outpaint (${aspectRatio})`;
          }
          if (imageUrl) {
              saveToStorage(StorageKeys.LAST_GEN_IMAGE, { image: imageUrl, prompt: input, mode, aspectRatio });
          } else { throw new Error("Image Generation Failed"); }
      }
      else if (tool === 'seo') {
          const { detectedVideo } = options;
          const inputType = detectedVideo ? 'video' : 'topic';
          const query = detectedVideo || input;
          const result = await generateAdvancedSeo(query, inputType, lang, resultLang);
          if (result && result.titles && result.titles.length > 0) {
              saveToStorage(StorageKeys.SEO(input), result);
          } else { throw new Error("AI SEO Generation Failed"); }
      }
      else if (tool === 'script') {
          const { duration, tone, language, hookType, customHook, timeContext, strategy, psychology, targetPlatform, contentComplexity, seoFocus, mode } = options;
          const result = await generateViralScript(targetId, duration, tone, language, hookType, customHook, lang, resultLang, timeContext, strategy, psychology, targetPlatform || 'youtube', contentComplexity || 'intermediate', seoFocus || 'niche', mode || 'full');
          if (result) {
              saveToStorage(StorageKeys.SCRIPT(targetId), result);
          } else { throw new Error("Script Generation Failed"); }
      }
      else {
          let channel = null;
          if (!isRawText) {
              channel = await fetchChannelData(targetId);
              if (!channel) {
                  if (['competitor', 'ideas'].includes(tool)) { isRawText = true; } 
                  else { throw new Error("Channel not found"); }
              } else { saveToStorage(StorageKeys.CHANNEL_DATA(targetId), channel); }
          }

          if (tool === 'competitor') {
              const { myNiche } = options || {};
              const result = await generateCompetitorDeepDive(
                  channel ? channel.snippet.title : input, 
                  channel ? channel.snippet.description : "N/A", 
                  myNiche || "General", 
                  lang,
                  resultLang
              );
              const finalResult = result || await generateCompetitorAnalysis(channel ? channel.snippet.title : null, channel ? channel.snippet.description : null, [], [], lang, resultLang, isRawText ? input : undefined);
              saveToStorage(StorageKeys.COMPETITOR(targetId), finalResult);
          } 
          else if (tool === 'planner' && channel) {
              const result = await generateCustomGrowthPlan(channel.snippet.title, channel.snippet.description, channel.statistics, lang, resultLang);
              if (result) {
                  saveToStorage(StorageKeys.PLAN(targetId), result);
              } else { throw new Error("AI Failed"); }
          }
          else if (tool === 'ideas') {
               const { creativityLevel, targetAudience, videoFormat } = options || {};
               const result = await generateAiVideoIdeas(channel ? channel.snippet.title : '', channel ? channel.snippet.description : '', [], [], lang, resultLang, isRawText ? input : undefined, { creativityLevel, targetAudience, videoFormat });
               saveToStorage(StorageKeys.IDEAS(targetId), result);
          }
          else if (tool === 'outliers' && channel) {
               let playlistId = channel.contentDetails?.relatedPlaylists?.uploads;
               if (!playlistId) {
                   // Fallback to UU hack
                   playlistId = channel.id.replace('UC', 'UU');
               }
               
               let data = await fetchYoutubeData('playlistItems', `part=snippet&playlistId=${playlistId}&maxResults=50`);
               
               // If still no data, try to fetch channel again to be sure
               if (!data || !data.items || data.items.length === 0) {
                   const freshChannel = await fetchYoutubeData('channels', `part=contentDetails&id=${channel.id}`);
                   if (freshChannel && freshChannel.items?.[0]?.contentDetails?.relatedPlaylists?.uploads) {
                       playlistId = freshChannel.items[0].contentDetails.relatedPlaylists.uploads;
                       data = await fetchYoutubeData('playlistItems', `part=snippet&playlistId=${playlistId}&maxResults=50`);
                   }
               }

               if (data && data.items && data.items.length > 0) {
                    const videoIds = data.items.map((i: any) => i.snippet.resourceId.videoId).join(',');
                    const statsData = await fetchYoutubeData('videos', `part=statistics,snippet&id=${videoIds}`);
                    const outliersFound = detectOutliers(statsData?.items || []);
                    saveToStorage(StorageKeys.OUTLIERS(targetId), outliersFound);
               } else {
                   throw new Error("Could not find video uploads for this channel.");
               }
          }
          else if (tool === 'audience' && channel) {
               const result = await generateAudienceDeepDive(channel.snippet.title, channel.snippet.description, [], lang, resultLang);
               if (result) {
                   saveToStorage(StorageKeys.AUDIENCE(targetId), result);
               } else { throw new Error("AI Failed"); }
          }
      }
      updateJob(tool, { status: 'success' });
    } catch (e: any) {
      const isQuotaError = e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED');
      updateJob(tool, { 
        status: 'error', 
        error: isQuotaError 
          ? (lang === 'ar' ? "QUOTA_EXCEEDED" : "QUOTA_EXCEEDED")
          : (e.message || "Failed") 
      });
    }
  };

  const resetJob = (tool: ToolType) => { updateJob(tool, { status: 'idle', currentId: null, error: undefined, result: undefined }); };

  return <JobContext.Provider value={{ jobs, startJob, resetJob }}>{children}</JobContext.Provider>;
};
