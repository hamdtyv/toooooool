import { CPM_RATES, COUNTRY_TIMEZONES } from '../constants';
import { VideoData, ScheduleAnalysis, WeeklyScheduleItem, VideoIdea } from '../types';

// Niche Economics Map
const NICHE_ECONOMICS: Record<string, { rpm: number, affinity: string }> = {
    'Gaming': { rpm: 1.5, affinity: 'Entertainment' },
    'Vlog': { rpm: 2.0, affinity: 'Lifestyle' },
    'Tech': { rpm: 6.0, affinity: 'High Tech' },
    'Finance': { rpm: 12.0, affinity: 'Business' },
    'Education': { rpm: 4.0, affinity: 'Learning' },
    'Comedy': { rpm: 2.5, affinity: 'Entertainment' },
    'Music': { rpm: 1.8, affinity: 'Art' },
    'News': { rpm: 3.0, affinity: 'Current Events' },
    'Automotive': { rpm: 5.5, affinity: 'Cars' },
    'Travel': { rpm: 3.5, affinity: 'Lifestyle' },
    'Fitness': { rpm: 4.5, affinity: 'Health' },
    'Unknown': { rpm: 2.0, affinity: 'General' }
};

export const detectNiche = (title: string, desc: string, tags: string[] = []): string => {
    const text = `${title} ${desc} ${tags.join(' ')}`.toLowerCase();
    
    if (text.includes('money') || text.includes('stock') || text.includes('invest') || text.includes('crypto') || text.includes('business')) return 'Finance';
    if (text.includes('tech') || text.includes('review') || text.includes('unboxing') || text.includes('phone') || text.includes('pc')) return 'Tech';
    if (text.includes('game') || text.includes('play') || text.includes('minecraft') || text.includes('roblox') || text.includes('stream')) return 'Gaming';
    if (text.includes('tutorial') || text.includes('how to') || text.includes('learn') || text.includes('guide')) return 'Education';
    if (text.includes('vlog') || text.includes('day in') || text.includes('life') || text.includes('trip')) return 'Vlog';
    if (text.includes('funny') || text.includes('comedy') || text.includes('prank') || text.includes('meme')) return 'Comedy';
    if (text.includes('music') || text.includes('song') || text.includes('clip') || text.includes('cover')) return 'Music';
    if (text.includes('workout') || text.includes('gym') || text.includes('fitness') || text.includes('diet')) return 'Fitness';
    if (text.includes('car') || text.includes('drive') || text.includes('racing') || text.includes('motor')) return 'Automotive';
    
    return 'Unknown';
};

export const getSeasonalityMultiplier = (): number => {
    const month = new Date().getMonth();
    // Q4 is highest (Oct, Nov, Dec)
    if (month >= 9) return 1.3;
    // Q1 is lowest (Jan, Feb)
    if (month <= 1) return 0.7;
    return 1.0;
};

export const calculateComplexRevenue = (views: number, engagementRate: number, country: string, context: string) => {
    const niche = detectNiche(context, '', []);
    const baseRpm = NICHE_ECONOMICS[niche]?.rpm || 2.0;
    
    // Country multiplier
    let countryMult = 1;
    if (['US', 'AU', 'CA', 'GB', 'DE'].includes(country)) countryMult = 2.5;
    else if (['IN', 'PH', 'PK', 'EG'].includes(country)) countryMult = 0.3;
    else if (['SA', 'AE', 'KW', 'QA'].includes(country)) countryMult = 1.8;

    const seasonality = getSeasonalityMultiplier();
    
    // Adjusted RPM
    const realRpm = baseRpm * countryMult * seasonality;
    
    // Monetized views assumption (~60%)
    const monetizedViews = views * 0.6;
    
    const adRevenue = (monetizedViews / 1000) * realRpm;
    
    // Engagement bonus for sponsorships
    const sponsorValue = (views / 1000) * (realRpm * 1.5) * (engagementRate > 5 ? 1.2 : 0.8);
    
    // Affiliate Estimate (1% conversion, $5 avg comm)
    const affiliateRevenue = (views * 0.001) * 5; 
    
    // Product estimate
    const productRevenue = (views * 0.0005) * 20;

    return {
        adRevenue,
        sponsorValue,
        affiliateRevenue,
        productRevenue,
        totalPotential: adRevenue + sponsorValue + affiliateRevenue + productRevenue,
        metrics: {
            niche,
            rpm: realRpm.toFixed(2),
            monetizedViews: Math.floor(monetizedViews),
            productType: niche === 'Education' ? 'Course' : 'Merch'
        }
    };
};

export const estimateEarnings = (views: string | number, country: string = 'US', tags: string[] = []) => {
    const v = typeof views === 'string' ? parseInt(views) : views;
    const niche = detectNiche(tags.join(' '), '', []);
    const baseRpm = NICHE_ECONOMICS[niche]?.rpm || 2.0;
    
    let countryMult = 1;
    if (CPM_RATES[country]) {
        countryMult = (CPM_RATES[country].min + CPM_RATES[country].max) / 2;
    } else {
        // Fallback logic
        if (['US', 'CA', 'AU', 'GB'].includes(country)) countryMult = 3;
        else if (['SA', 'AE'].includes(country)) countryMult = 2;
        else countryMult = 0.5;
    }

    const estRpm = baseRpm * (countryMult / 2); // normalizing
    const earnings = (v / 1000) * estRpm;
    
    return {
        min: earnings * 0.7,
        max: earnings * 1.3,
        avg: earnings
    };
};

export const generateSmartTitles = (baseTitle: string): string[] => {
    return [
        `Why ${baseTitle} is taking over`,
        `The secret about ${baseTitle}`,
        `${baseTitle}: The Complete Guide`,
        `Stop doing ${baseTitle} (Do this instead)`,
        `I tried ${baseTitle} for 7 days`
    ];
};

export const generateKeywords = (title: string, desc: string): string[] => {
    const combined = `${title} ${desc}`.toLowerCase();
    const words = combined.split(/\s+/);
    // Simple filter
    return [...new Set(words.filter(w => w.length > 4))].slice(0, 15);
};

export const detectOutliers = (videos: VideoData[]) => {
    if (videos.length < 5) return [];
    
    // Calculate average views
    const views = videos.map(v => parseInt(v.statistics.viewCount));
    const avg = views.reduce((a, b) => a + b, 0) / views.length;
    
    // Standard Deviation
    const squareDiffs = views.map(v => Math.pow(v - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    const stdDev = Math.sqrt(avgSquareDiff);
    
    // Threshold: Avg + 1.5 * StdDev
    const threshold = avg + (1.0 * stdDev); // Relaxed threshold for more results
    
    return videos.filter(v => parseInt(v.statistics.viewCount) > threshold).map(v => ({
        ...v,
        performanceMultiple: (parseInt(v.statistics.viewCount) / avg).toFixed(1)
    }));
};

export const analyzeAdvancedAudienceTiming = (videos: VideoData[], country: string, lang: 'en' | 'ar') => {
    if (!videos.length) return null;
    
    const uploadHours = videos.map(v => new Date(v.snippet.publishedAt).getHours());
    const counts: Record<number, number> = {};
    uploadHours.forEach(h => counts[h] = (counts[h] || 0) + 1);
    
    let bestHour = parseInt(Object.keys(counts).reduce((a, b) => counts[parseInt(a)] > counts[parseInt(b)] ? a : b));
    
    const tz = COUNTRY_TIMEZONES[country] || 'UTC';
    const ampm = bestHour >= 12 ? 'PM' : 'AM';
    const hour12 = bestHour % 12 || 12;
    
    return {
        day: 'Best Day', // Placeholder as we aggregate
        hour: bestHour,
        timeStr: `${hour12}:00 ${ampm}`,
        timeZone: tz,
        country
    };
};

export const analyzeChannelUploadPattern = (videos: VideoData[], country: string, lang: 'en' | 'ar'): ScheduleAnalysis => {
    // Determine frequency
    const dates = videos.map(v => new Date(v.snippet.publishedAt).getTime()).sort((a,b) => b - a); // Newest first
    
    let diffs = [];
    for(let i = 0; i < dates.length - 1; i++) {
        diffs.push((dates[i] - dates[i+1]) / (1000 * 60 * 60 * 24)); // Days
    }
    
    const avgDiff = diffs.length ? diffs.reduce((a, b) => a + b, 0) / diffs.length : 7;
    const consistency = Math.max(0, 100 - (Math.sqrt(diffs.map(d => Math.pow(d - avgDiff, 2)).reduce((a,b) => a+b, 0)/diffs.length) * 10));
    
    // Frequent Days
    const days = videos.map(v => new Date(v.snippet.publishedAt).toLocaleDateString('en-US', { weekday: 'long' }));
    const dayCounts: Record<string, number> = {};
    days.forEach(d => dayCounts[d] = (dayCounts[d] || 0) + 1);
    const sortedDays = Object.entries(dayCounts).sort((a,b) => b[1] - a[1]).map(x => x[0]).slice(0, 3);

    // Predict next upload
    const lastUpload = dates[0];
    const nextUploadMs = lastUpload + (avgDiff * 24 * 60 * 60 * 1000);
    const nextDate = new Date(nextUploadMs);

    return {
        consistencyScore: Math.round(consistency),
        frequentDays: sortedDays,
        frequentHours: ["18:00 - 20:00"], // Simplified
        isConsistent: consistency > 60,
        timezone: COUNTRY_TIMEZONES[country] || 'UTC',
        nextPredictedUpload: nextDate.toLocaleDateString()
    };
};

export const generateWeeklySchedule = (videos: VideoData[], country: string, lang: 'en' | 'ar', channelTitle: string): WeeklyScheduleItem[] => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return days.map(day => ({
        dayName: day,
        hour: 18,
        timeStr: "06:00 PM",
        strength: ['Monday', 'Thursday'].includes(day) ? 'excellent' : 'good',
        strengthLabel: 'Good',
        demographics: { ageGroup: '18-34', gender: 'Mixed', genderLabel: 'Mixed' },
        isTopDay: ['Monday', 'Thursday'].includes(day),
        actionType: ['Monday', 'Thursday'].includes(day) ? 'publish' : 'research',
        actionLabel: ['Monday', 'Thursday'].includes(day) ? (lang === 'ar' ? 'نشر' : 'Publish') : (lang === 'ar' ? 'بحث' : 'Research')
    }));
};

export const generateVideoIdeas = (niche: string): VideoIdea[] => {
    return [
        { title: `Top 10 ${niche} Tips`, score: '95', type: 'Listicle' },
        { title: `How to master ${niche}`, score: '92', type: 'Tutorial' },
        { title: `${niche} Mistakes to Avoid`, score: '88', type: 'Warning' }
    ];
};

export const calculateWinProbability = (
    myStats: { views: number, subs: number, videos: number },
    compStats: { views: number, subs: number, videos: number }
) => {
    // 1. Velocity Ratio (Views per Video)
    const myAvg = myStats.videos > 0 ? myStats.views / myStats.videos : 0;
    const compAvg = compStats.videos > 0 ? compStats.views / compStats.videos : 0;
    const velocityScore = (myAvg / (myAvg + compAvg)) * 100;

    // 2. Engagement Potential (Sub to View ratio - Lower is often better for viral, higher for loyalty)
    // Here we treat higher ratio as "Loyalty Power"
    const myLoyalty = myStats.views > 0 ? (myStats.subs / myStats.views) : 0;
    const compLoyalty = compStats.views > 0 ? (compStats.subs / compStats.views) : 0;
    
    // Normalize logic
    let winChance = 50; // Base
    
    if (velocityScore > 50) winChance += 10; // You get more views per video
    if (myStats.subs < compStats.subs && velocityScore > 40) winChance += 15; // Underdog bonus (you are smaller but fighting well)
    
    return Math.min(99, Math.max(1, Math.floor(winChance)));
};