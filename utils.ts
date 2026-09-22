
export const extractId = (url: string): { type: 'channel' | 'video' | 'search' | 'unknown', id: string } => {
  if (!url) return { type: 'unknown', id: '' };
  
  const cleanUrl = url.trim();

  // 1. Video ID detection (URL patterns)
  const videoRegex = /(?:v=|\/v\/|\/embed\/|youtu.be\/|shorts\/)([^&?\/%\s]{11})/;
  const videoMatch = cleanUrl.match(videoRegex);
  if (videoMatch) return { type: 'video', id: videoMatch[1] };

  // 2. Strict Raw Video ID Detection (11 chars)
  const rawVideoIdRegex = /^[a-zA-Z0-9_-]{11}$/;
  if (rawVideoIdRegex.test(cleanUrl)) {
      return { type: 'video', id: cleanUrl };
  }

  // 3. Channel ID (UC...) detection
  const channelIdRegex = /(UC[\w-]{21}[AQgw])/;
  const channelIdMatch = cleanUrl.match(channelIdRegex);
  if (channelIdMatch) return { type: 'channel', id: channelIdMatch[1] };
  
  // 4. Handle (@username) detection
  if (cleanUrl.includes('@')) {
      const handleMatch = cleanUrl.match(/@[\w\.\-]+/);
      if (handleMatch) return { type: 'channel', id: handleMatch[0] };
  }

  // 5. Fallback: If it looks like a channel URL but no ID found
  if (cleanUrl.includes('youtube.com/channel/')) {
      const parts = cleanUrl.split('/channel/');
      if (parts[1]) return { type: 'channel', id: parts[1].split(/[/?]/)[0] };
  }

  // 6. Intelligent Fallback: Treat as a Search Query
  // If it's not a URL and not an ID, it's likely a channel name (e.g. "MrBeast")
  if (!cleanUrl.includes('/') && !cleanUrl.includes('.')) {
     return { type: 'search', id: cleanUrl };
  }

  return { type: 'search', id: cleanUrl };
};

export const formatNumber = (num: string | number): string => {
  const n = Number(num);
  if (isNaN(n)) return '0';
  return new Intl.NumberFormat('en-US').format(n);
};

export const formatCurrency = (num: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(num);
};

export const calculateAge = (publishedAt: string): { years: number, months: number, days: number } => {
  const start = new Date(publishedAt);
  const end = new Date();
  
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months--;
    days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  return { years, months, days };
};

export const calculateVPH = (publishedAt: string, views: string): number => {
  const v = parseInt(views) || 0;
  const now = new Date().getTime();
  const pub = new Date(publishedAt).getTime();
  const hoursDiff = (now - pub) / (1000 * 60 * 60);
  const effectiveHours = Math.max(hoursDiff, 0.1);
  return Math.floor(v / effectiveHours);
};

export const parseISO8601Duration = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (parseInt(match[1] || '0') * 3600) + (parseInt(match[2] || '0') * 60) + parseInt(match[3] || '0');
};

export const formatDetailedDuration = (duration: string): string => {
    const seconds = parseISO8601Duration(duration);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

export const analyzeVideoSEO = (video: any) => {
    let score = 0;
    const titleLen = video.snippet.title.length;
    let titleScore = 0;
    if (titleLen >= 20 && titleLen <= 65) titleScore = 30;
    else if (titleLen > 65 && titleLen <= 80) titleScore = 20;
    else if (titleLen > 10) titleScore = 10;
    score += titleScore;

    const tags = video.snippet.tags || [];
    let tagsScore = 0;
    if (tags.length >= 15) tagsScore = 30;
    else if (tags.length >= 10) tagsScore = 20;
    else if (tags.length >= 5) tagsScore = 10;
    score += tagsScore;

    const desc = video.snippet.description || '';
    const descWords = desc.split(/\s+/).length;
    let descScore = 0;
    if (descWords > 100) descScore = 20;
    else if (descWords > 50) descScore = 10;
    else if (descWords > 10) descScore = 5;
    score += descScore;

    const stopWords = ['the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'a', 'is', 'of'];
    const titleKeywords = video.snippet.title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(' ')
        .filter((w: string) => w.length > 3 && !stopWords.includes(w));
    
    let keywordsFound = 0;
    const lowerDesc = desc.toLowerCase();
    titleKeywords.forEach((k: string) => {
        if (lowerDesc.includes(k)) keywordsFound++;
    });

    let synergyScore = 0;
    if (keywordsFound >= 3) synergyScore = 20;
    else if (keywordsFound >= 1) synergyScore = 10;
    score += synergyScore;

    return {
        totalScore: Math.min(100, score),
        breakdown: {
            title: { score: titleScore, max: 30, length: titleLen },
            tags: { score: tagsScore, max: 30, count: tags.length },
            desc: { score: descScore, max: 20, wordCount: descWords },
            synergy: { score: synergyScore, max: 20, matchCount: keywordsFound }
        }
    };
};
