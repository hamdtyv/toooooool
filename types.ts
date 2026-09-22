
export interface ChannelStats {
  viewCount: string;
  subscriberCount: string;
  hiddenSubscriberCount: boolean;
  videoCount: string;
}

export interface ChannelSnippet {
  title: string;
  description: string;
  customUrl: string;
  publishedAt: string;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
  };
  country?: string;
  localized?: {
    title: string;
    description: string;
  };
}

export interface ChannelBranding {
  image?: {
    bannerExternalUrl?: string;
  };
}

export interface ChannelContentDetails {
  relatedPlaylists: {
    uploads: string;
  };
}

export interface ChannelData {
  id: string;
  snippet: ChannelSnippet;
  statistics: ChannelStats;
  brandingSettings: ChannelBranding;
  contentDetails: ChannelContentDetails;
}

export interface VideoStats {
  viewCount: string;
  likeCount: string;
  favoriteCount: string;
  commentCount: string;
}

export interface VideoSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: {
    medium: { url: string };
    high: { url: string };
    maxres?: { url: string };
  };
  channelTitle: string;
  tags?: string[];
  categoryId: string;
  defaultLanguage?: string;
  defaultAudioLanguage?: string;
}

export interface VideoContentDetails {
  duration: string;
  dimension: string;
  definition: string;
  caption: string;
  licensedContent: boolean;
  projection: string;
}

export interface VideoData {
  id: string;
  snippet: VideoSnippet;
  statistics: VideoStats;
  contentDetails: VideoContentDetails;
}

export interface VideoIdea {
  title: string;
  score: string;
  type: string;
}

export interface ScheduleAnalysis {
  consistencyScore: number; // 0-100
  frequentDays: string[];
  frequentHours: string[]; // e.g., "5 PM - 7 PM"
  isConsistent: boolean;
  timezone: string;
  nextPredictedUpload: string;
}

export interface Demographic {
  ageGroup: string;
  gender: string;
  genderLabel: string; // Localized
}

export interface WeeklyScheduleItem {
  dayName: string;
  hour: number;
  timeStr: string;
  strength: 'viral' | 'excellent' | 'good' | 'weak'; // 4 levels
  strengthLabel: string;
  demographics: Demographic;
  isTopDay: boolean;
  actionType: 'publish' | 'research' | 'scripting' | 'community' | 'rest';
  actionLabel: string;
}

export interface AudiencePersona {
  segments: {
    new: number;
    casual: number;
    loyal: number;
  };
  contentPreferences: {
    new: string[];
    casual: string[];
    loyal: string[];
  };
  formats: {
    shorts: number;
    videos: number;
    live: number;
  };
  devices: {
    mobile: number;
    desktop: number;
    tv: number;
  };
  demographics: {
    age: Record<string, number>; // "18-24": 40
    gender: { male: number; female: number };
  };
  geography: { country: string; percent: number }[];
  languages: string[];
  otherChannels: string[];
  onlineActivity: string; // Description of when they are online
  growthDrivers: string[]; // Types of videos that grow audience
}

export interface ActivityLogEntry {
  id: string;
  timestamp: number;
  actor: {
    id: string; // User ID or system process ID
    name: string;
  };
  action: string;
  target: {
    type: string; // e.g., 'channel', 'video', 'seo'
    id: string; // Resource ID
    title: string;
  };
  payload: Record<string, any>; // Complex data/JSON-Patch
  meta: {
    severity: 'info' | 'warn' | 'error';
    version: number;
  };
}

// NEW: Advanced AI Types
export interface OutlierPsychology {
  trigger: string; // The main psychological trigger (FOMO, Curiosity, etc)
  packaging_secrets: string[]; // Why the title/thumb worked
  emotional_hook: string; // The emotion targeted
  replication_strategy: string; // How to copy this success
}

export interface VphPsychology {
  momentum_status: string; // "Explosive", "Decaying", "Evergreen"
  audience_verdict: string; // What the audience is feeling right now
  action_step: string; // Immediate action to take
}

export type Language = 'en' | 'ar';
export type ResultLanguage = 'auto' | 'ar' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko' | 'hi' | 'tr' | 'nl' | 'pl' | 'sv' | 'da' | 'fi' | 'el' | 'he';

export interface Translation {
  [key: string]: string;
}

export interface ChannelVideoItem {
  id: string;
  title: string;
  views: string;
  publishedTime: string;
  thumbnail: string;
  duration?: string;
  url: string;
  type?: 'long' | 'short';
  estimatedVPH?: number;
}

export interface ChannelAnalysisReport {
  summary: string;
  nicheCategory: string;
  subNiches: string[];
  contentPillars: string[];
  contentTone: string;
  targetAudience: {
    persona: string;
    ageGroup: string;
    painPoints: string[];
    interestTopics: string[];
  };
  seoAnalysis: {
    score: number; // 0-100
    topKeywords: string[];
    topHashtags: string[];
    titleFormulasUsed: string[];
    descriptionStrengths: string[];
    descriptionImprovements: string[];
  };
  swot: {
    strengths: string[];
    weaknesses: string[];
    growthOpportunities: string[];
    threatsOrPitfalls: string[];
  };
  contentStrategy: {
    recommendedUploadSchedule: string;
    idealVideoLength: string;
    shortFormStrategy: string;
    retentionAdvice: string;
    estimatedRPM: string;
    estimatedMonthlyRevenue: string;
  };
  suggestedViralIdeas: {
    title: string;
    hook: string;
    concept: string;
    format: 'Long-Form' | 'Shorts';
    estimatedCtrPotential: string;
  }[];
  verdictScore: number; // 0-100
  overallGrade: 'S' | 'A+' | 'A' | 'B' | 'C';
}

export interface LinkedChannel {
  id: string;
  userId?: string;
  url: string;
  handle: string;
  title: string;
  avatar: string;
  banner?: string;
  verified?: boolean;
  subscriberCount: string;
  videoCount: string;
  viewCount?: string;
  description: string;
  country?: string;
  joinedDate?: string;
  links?: { title: string; url: string }[];
  recentVideos: ChannelVideoItem[];
  analysis: ChannelAnalysisReport;
  linkedAt: number;
  lastUpdated: number;
}

