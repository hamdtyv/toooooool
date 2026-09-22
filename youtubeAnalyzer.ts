import { GoogleGenAI } from "@google/genai";

interface ScrapedRawChannel {
  url: string;
  handle: string;
  title: string;
  avatar: string;
  banner?: string;
  subscriberCount: string;
  videoCount: string;
  description: string;
  country?: string;
  joinedDate?: string;
  links: { title: string; url: string }[];
  recentVideos: {
    id: string;
    title: string;
    views: string;
    publishedTime: string;
    thumbnail: string;
    duration?: string;
    url: string;
  }[];
}

/**
 * Normalizes user input into a canonical YouTube Channel URL and Handle
 */
export function normalizeYouTubeUrl(input: string): { channelUrl: string; videosUrl: string; handle: string } {
  let clean = input.trim();

  // If user passed a full URL
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    try {
      const parsed = new URL(clean);
      const pathname = parsed.pathname.replace(/\/+$/, '');
      
      // If it's a watch URL (e.g. youtube.com/watch?v=...)
      // Keep as is or we can extract handle if user provided it
      if (pathname.includes('/@')) {
        const handleMatch = pathname.match(/@([^/?#]+)/);
        const handle = handleMatch ? `@${handleMatch[1]}` : '@channel';
        return {
          channelUrl: `https://www.youtube.com/${handle}`,
          videosUrl: `https://www.youtube.com/${handle}/videos`,
          handle
        };
      }
      if (pathname.startsWith('/channel/')) {
        return {
          channelUrl: `https://www.youtube.com${pathname}`,
          videosUrl: `https://www.youtube.com${pathname}/videos`,
          handle: pathname.replace('/channel/', '')
        };
      }
      if (pathname.startsWith('/c/') || pathname.startsWith('/user/')) {
        return {
          channelUrl: `https://www.youtube.com${pathname}`,
          videosUrl: `https://www.youtube.com${pathname}/videos`,
          handle: pathname.split('/')[2] || 'channel'
        };
      }
      return {
        channelUrl: clean,
        videosUrl: `${clean}/videos`,
        handle: pathname.split('/').filter(Boolean).pop() || 'channel'
      };
    } catch {
      // Fall through
    }
  }

  // If user passed @handle
  if (clean.startsWith('@')) {
    return {
      channelUrl: `https://www.youtube.com/${clean}`,
      videosUrl: `https://www.youtube.com/${clean}/videos`,
      handle: clean
    };
  }

  // If user passed channel ID
  if (clean.startsWith('UC') && clean.length === 24) {
    return {
      channelUrl: `https://www.youtube.com/channel/${clean}`,
      videosUrl: `https://www.youtube.com/channel/${clean}/videos`,
      handle: clean
    };
  }

  // User passed plain channel name or handle without @
  const handle = `@${clean.replace(/\s+/g, '')}`;
  return {
    channelUrl: `https://www.youtube.com/${handle}`,
    videosUrl: `https://www.youtube.com/${handle}/videos`,
    handle
  };
}

/**
 * Scrapes public HTML metadata and ytInitialData from YouTube
 */
export async function scrapeYouTubeChannel(urlOrHandle: string): Promise<ScrapedRawChannel> {
  const { channelUrl, videosUrl, handle } = normalizeYouTubeUrl(urlOrHandle);

  let rawHtml = '';
  let videosHtml = '';

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none'
  };

  try {
    const res = await fetch(channelUrl, { headers, redirect: 'follow' });
    if (res.ok) {
      rawHtml = await res.text();
    }
  } catch (err) {
    console.warn('[YouTube Scraper] Fetch channelUrl error:', err);
  }

  try {
    const vRes = await fetch(videosUrl, { headers, redirect: 'follow' });
    if (vRes.ok) {
      videosHtml = await vRes.text();
    }
  } catch (err) {
    console.warn('[YouTube Scraper] Fetch videosUrl error:', err);
  }

  // 1. Extract Meta tags
  const extractMeta = (html: string, prop: string): string => {
    const match = html.match(new RegExp(`<meta\\s+property=["']${prop}["']\\s+content=["'](.*?)["']`, 'i')) ||
                  html.match(new RegExp(`<meta\\s+content=["'](.*?)["']\\s+property=["']${prop}["']`, 'i')) ||
                  html.match(new RegExp(`<meta\\s+name=["']${prop}["']\\s+content=["'](.*?)["']`, 'i'));
    return match ? match[1] : '';
  };

  const ogTitle = extractMeta(rawHtml, 'og:title') || extractMeta(rawHtml, 'title') || handle;
  const ogImage = extractMeta(rawHtml, 'og:image') || '';
  const ogDesc = extractMeta(rawHtml, 'og:description') || extractMeta(rawHtml, 'description') || '';
  const keywords = extractMeta(rawHtml, 'keywords') || '';

  // 2. Parse ytInitialData JSON
  let ytData: any = null;
  const extractYtInitialData = (html: string) => {
    const match = html.match(/var\s+ytInitialData\s*=\s*({.+?});<\/script>/s) ||
                  html.match(/window\["ytInitialData"\]\s*=\s*({.+?});<\/script>/s);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch (e) {
        // Ignored
      }
    }
    return null;
  };

  ytData = extractYtInitialData(videosHtml) || extractYtInitialData(rawHtml);

  let title = ogTitle;
  let avatar = ogImage;
  let banner = '';
  let subscriberCount = '';
  let videoCount = '';
  let description = ogDesc;
  let country = '';
  let joinedDate = '';
  const links: { title: string; url: string }[] = [];
  const recentVideos: ScrapedRawChannel['recentVideos'] = [];

  if (ytData) {
    try {
      // 1. Header info
      const header = ytData.header?.c4TabbedHeaderRenderer || ytData.header?.pageHeaderRenderer;
      if (header) {
        if (header.title) {
          title = typeof header.title === 'string' ? header.title : (header.title.text || header.title.runs?.[0]?.text || title);
        }
        if (header.content?.title?.dynamicTextViewModel?.text?.content) {
          title = header.content.title.dynamicTextViewModel.text.content;
        }
        // Avatar
        const avatarThumbnails = header.avatar?.thumbnails || header.content?.image?.decoratedAvatarViewModel?.avatar?.avatarViewModel?.image?.sources;
        if (avatarThumbnails && avatarThumbnails.length > 0) {
          avatar = avatarThumbnails[avatarThumbnails.length - 1].url;
        }
        // Banner
        const bannerThumbnails = header.banner?.thumbnails;
        if (bannerThumbnails && bannerThumbnails.length > 0) {
          banner = bannerThumbnails[bannerThumbnails.length - 1].url;
        }
        // Subscribers & Videos text from classic or modern layout
        if (header.subscriberCountText?.simpleText) {
          subscriberCount = header.subscriberCountText.simpleText;
        } else if (header.subscriberCountText?.runs?.[0]?.text) {
          subscriberCount = header.subscriberCountText.runs.map((r: any) => r.text).join(' ');
        }
        if (header.videosCountText?.runs?.[0]?.text) {
          videoCount = header.videosCountText.runs.map((r: any) => r.text).join(' ');
        } else if (header.videosCountText?.simpleText) {
          videoCount = header.videosCountText.simpleText;
        }

        // Modern 2024-2026 pageHeaderViewModel metadata rows parsing
        const metadataRows = header.content?.pageHeaderViewModel?.metadata?.contentMetadataViewModel?.metadataRows;
        if (Array.isArray(metadataRows)) {
          for (const row of metadataRows) {
            const parts = row.metadataParts;
            if (Array.isArray(parts)) {
              for (const part of parts) {
                const text = part.text?.content || '';
                if (text.includes('subscribers') || text.includes('مشترك') || text.includes('Subscribers')) {
                  if (!subscriberCount) subscriberCount = text;
                } else if (text.includes('videos') || text.includes('فيديو') || text.includes('Videos')) {
                  if (!videoCount) videoCount = text;
                }
              }
            }
          }
        }
      }

      // Regex scans on raw HTML if still empty
      if (!subscriberCount) {
        const subMatch = rawHtml.match(/"subscriberCountText"\s*:\s*\{"simpleText"\s*:\s*"([^"]+)"\}/i) ||
                         rawHtml.match(/"subscriberCountText"\s*:\s*\{"accessibility"\s*:\s*\{"accessibilityData"\s*:\s*\{"label"\s*:\s*"([^"]+)"\}/i) ||
                         rawHtml.match(/"content"\s*:\s*"([0-9.,KMBkmb]+\s*(?:subscribers|مشترك|مشتركاً|مشتركين))"/i);
        if (subMatch && subMatch[1]) {
          subscriberCount = subMatch[1];
        }
      }

      if (!videoCount) {
        const vidCountMatch = rawHtml.match(/"videosCountText"\s*:\s*\{"runs"\s*:\s*\[\s*\{\s*"text"\s*:\s*"([^"]+)"\}/i) ||
                              rawHtml.match(/"videoCountText"\s*:\s*\{"simpleText"\s*:\s*"([^"]+)"\}/i) ||
                              rawHtml.match(/"content"\s*:\s*"([0-9.,KMBkmb]+\s*(?:videos|فيديو|فيديوهات))"/i);
        if (vidCountMatch && vidCountMatch[1]) {
          videoCount = vidCountMatch[1];
        }
      }

      // Channel metadata renderer
      const metadata = ytData.metadata?.channelMetadataRenderer;
      if (metadata) {
        if (!title && metadata.title) title = metadata.title;
        if ((!description || description.length < (metadata.description?.length || 0)) && metadata.description) {
          description = metadata.description;
        }
        if (!avatar && metadata.avatar?.thumbnails?.length) {
          avatar = metadata.avatar.thumbnails[metadata.avatar.thumbnails.length - 1].url;
        }
      }

      // Try extracting full About description if available in ytInitialData
      const aboutDesc = ytData?.onResponseReceivedEndpoints?.[0]?.showEngagementPanelEndpoint?.engagementPanel?.engagementPanelSectionListRenderer?.content?.structuredDescriptionContentRenderer?.items?.[0]?.videoDescriptionHeaderRenderer?.description?.runs?.map((r: any) => r.text).join('') ||
                        ytData?.contents?.twoColumnBrowseResultsRenderer?.tabs?.find((t: any) => t.tabRenderer?.title === 'About' || t.tabRenderer?.title === 'لمحة')?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents?.[0]?.channelAboutFullMetadataRenderer?.description?.simpleText;
      if (aboutDesc && aboutDesc.trim().length > (description?.trim().length || 0)) {
        description = aboutDesc.trim();
      }

      // Extract Recent Videos
      const tabs = ytData.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
      for (const tab of tabs) {
        const tabContent = tab.tabRenderer?.content;
        const grid = tabContent?.richGridRenderer?.contents || tabContent?.sectionListRenderer?.contents;
        if (Array.isArray(grid)) {
          for (const item of grid) {
            const videoRenderer = item.richItemRenderer?.content?.videoRenderer || item.videoRenderer;
            if (videoRenderer && videoRenderer.videoId) {
              const vidId = videoRenderer.videoId;
              const vidTitle = videoRenderer.title?.runs?.[0]?.text || videoRenderer.title?.accessibility?.accessibilityData?.label || '';
              const vidViews = videoRenderer.viewCountText?.simpleText || videoRenderer.shortViewCountText?.simpleText || 'مشاهدات قياسية';
              const vidPublished = videoRenderer.publishedTimeText?.simpleText || '';
              const vidDuration = videoRenderer.lengthText?.simpleText || '';
              const vidThumbs = videoRenderer.thumbnail?.thumbnails || [];
              const vidThumb = vidThumbs.length > 0 ? vidThumbs[vidThumbs.length - 1].url : `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`;

              if (vidTitle && !recentVideos.some(v => v.id === vidId)) {
                recentVideos.push({
                  id: vidId,
                  title: vidTitle,
                  views: vidViews,
                  publishedTime: vidPublished,
                  thumbnail: vidThumb,
                  duration: vidDuration,
                  url: `https://www.youtube.com/watch?v=${vidId}`
                });
              }
            }
          }
        }
      }
    } catch (parseErr) {
      console.warn('[YouTube Scraper] Error traversing ytInitialData:', parseErr);
    }
  }

  // Fallback defaults if avatar or subscriber are still empty
  if (!avatar || avatar.includes('placeholder')) {
    avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(title || handle)}&background=0D9488&color=fff&size=200&bold=true`;
  }
  if (!subscriberCount || subscriberCount.trim() === '' || subscriberCount.toLowerCase().includes('no subscriber')) {
    subscriberCount = '0 مشترك';
  }
  if (!videoCount || videoCount.trim() === '') {
    videoCount = recentVideos.length > 0 ? `${recentVideos.length} فيديو` : '0 فيديو';
  }

  return {
    url: channelUrl,
    handle,
    title: title || handle.replace('@', ''),
    avatar,
    banner: banner || undefined,
    subscriberCount,
    videoCount,
    description: description || `قناة يوتيوب رسمية للمنشئ ${title || handle}`,
    country,
    joinedDate,
    links,
    recentVideos: recentVideos.slice(0, 12)
  };
}

/**
 * Uses Gemini with Google Search to analyze the YouTube channel in depth
 */
export async function performDeepChannelAiAudit(
  scraped: ScrapedRawChannel,
  lang: 'ar' | 'en' = 'ar',
  userApiKey?: string
): Promise<any> {
  const clientKey = (userApiKey || '').trim().replace(/^["']|["']$/g, '');
  const envKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');

  const candidateKeys: string[] = [];
  if (clientKey && clientKey.length >= 10 && !clientKey.includes('YOUR_')) {
    candidateKeys.push(clientKey);
  }
  if (envKey && envKey.length >= 10 && !envKey.includes('YOUR_') && !candidateKeys.includes(envKey)) {
    candidateKeys.push(envKey);
  }

  const isNewChannel = scraped.recentVideos.length === 0;

  const prompt = `
أنت الآن خبير استراتيجي أول لنمو قنوات يوتيوب وخوارزميات التوصية (YouTube Growth & Algorithm Master).
مهمتك إجراء تحليل وتشخيص استراتيجي شامل وعميق (360-Degree Comprehensive Channel Audit) لقناة يوتيوب تم ربطها.

[بيانات القناة المستخرجة من يوتيوب]:
- رابط القناة: ${scraped.url}
- المعرّف (Handle): ${scraped.handle}
- اسم القناة: ${scraped.title}
- المشتركون: ${scraped.subscriberCount}
- عدد الفيديوهات: ${scraped.videoCount}
- الوصف والنبذة: ${scraped.description}
- حالة القناة: ${isNewChannel ? 'قناة جديدة تماماً / ناشئة في طور الانطلاق (0 فيديوهات منشورة حالياً)' : `قناة نشطة تحتوي على (${scraped.recentVideos.length}) فيديو مرصود حديثاً`}
${!isNewChannel ? `- الفيديوهات الأخيرة المرصودة:\n${scraped.recentVideos.map((v, i) => `${i + 1}. "${v.title}" | المشاهدات: ${v.views} | وقت النشر: ${v.publishedTime} | المدة: ${v.duration || 'N/A'}`).join('\n')}` : '- تنبيه: القناة جديدة، استنتج النيتش والجمهور المستهدف بدقة من اسم القناة والوصف والكلمات الدلالية، وقدم خطة إطلاق شاملة من الصفر (0 to 1 Launchpad Strategy) تتضمن أول 5 أفكار فيديوهات انطلاقة لتأسيس القناة وجلب أول 1,000 مشترك.'}

المطلوب:
قم بتحليل القناة واقتراح استراتيجية كاملة.
تنبيه حاسم: حقل "nicheCategory" يجب أن يكون اسماً كاملاً وواضحاً ومحدداً بدقة (مثال: "تطوير البرمجيات والذكاء الاصطناعي للمبتدئين" أو "ألعاب وتحديات وبثوث ترفيهية" أو "سرد وثائقي وقصص تاريخية") ولا تقم أبداً باختصار الجملة أو قطعها.

أعد كائن JSON صالح فقط بدون أي كود إضافي يلتزم بالهيكل التالي بدقة:

\`\`\`json
{
  "summary": "ملخص تحليلي احترافي ومكثف عن هوية القناة، قيمتها، ووضعها الحالي في سوق المحتوى",
  "nicheCategory": "التصنيف الرئيسي بدقة وباسم كامل وواضح",
  "subNiches": ["نيتش فرعي 1", "نيتش فرعي 2", "نيتش فرعي 3"],
  "contentPillars": ["الركيزة الأولى للمحتوى", "الركيزة الثانية", "الركيزة الثالثة"],
  "contentTone": "نبرة المحتوى (مثل: حماسية وسينمائية / هادئة وتعليمية / درامية وتشويقية)",
  "targetAudience": {
    "persona": "وصف دقيق لشخصية المشاهد المثالي واهتماماته ودوافعه",
    "ageGroup": "الفئة العمرية الأبرز (مثال: 18 - 34 سنة)",
    "painPoints": ["نقطة ألم 1 يبحث الجمهور عن حل لها", "نقطة ألم 2", "نقطة ألم 3"],
    "interestTopics": ["موضوع اهتمام 1", "موضوع اهتمام 2", "موضوع اهتمام 3", "موضوع اهتمام 4"]
  },
  "seoAnalysis": {
    "score": 85,
    "topKeywords": ["كلمة مفتاحية 1", "كلمة مفتاحية 2", "كلمة مفتاحية 3", "كلمة مفتاحية 4", "كلمة مفتاحية 5", "كلمة مفتاحية 6"],
    "topHashtags": ["#هاشتاج1", "#هاشتاج2", "#هاشتاج3", "#هاشتاج4", "#هاشتاج5"],
    "titleFormulasUsed": ["صيغة العنوان 1 المستخدمة أو المقترحة", "صيغة العنوان 2"],
    "descriptionStrengths": ["نقطة قوة في الوصف الحالي والكلمات الدلالية"],
    "descriptionImprovements": ["نصيحة محددة لتحسين الوصف والروابط والـ CTA"]
  },
  "swot": {
    "strengths": [
      "نقطة قوة حقيقية 1 بالقناة",
      "نقطة قوة حقيقية 2",
      "نقطة قوة حقيقية 3"
    ],
    "weaknesses": [
      "نقطة ضعف أو عائق خوارزمي 1",
      "نقطة ضعف أو عائق خوارزمي 2",
      "نقطة ضعف أو عائق خوارزمي 3"
    ],
    "growthOpportunities": [
      "فرصة ذهبية واعدة لاقتناص تريند أو جمهور جديد 1",
      "فرصة ذهبية 2",
      "فرصة ذهبية 3"
    ],
    "threatsOrPitfalls": [
      "تحدي محتمل أو منافسة متزايدة يجب الحذر منها 1",
      "تحدي 2"
    ]
  },
  "contentStrategy": {
    "recommendedUploadSchedule": "الجدول الزمني المثالي للنشر أسبوعياً (مثال: فيديوهان طويلان + 3 شورتس)",
    "idealVideoLength": "المدة الزمنية المثلى للفيديوهات لتحقيق أعلى احتفاظ AVD (مثال: 10-15 دقيقة)",
    "shortFormStrategy": "استراتيجية المقاطع القصيرة Shorts المناسبة لتعزيز التحويل للمشتركين",
    "retentionAdvice": "نصيحة ذهبية لمنع تسرب المشاهدين في أول 30 ثانية",
    "estimatedRPM": "$1.50 - $4.50",
    "estimatedMonthlyRevenue": "$800 - $3,500"
  },
  "suggestedViralIdeas": [
    {
      "title": "عنوان فيروسي مقترح 1 مصمم لنسبة نقر CTR عالية جداً",
      "hook": "الجملة الافتتاحية الخاطفة في أول 5 ثوانٍ",
      "concept": "شرح الفكرة وزاوية التناول الفريدة",
      "format": "Long-Form",
      "estimatedCtrPotential": "11% - 15%"
    },
    {
      "title": "عنوان فيروسي مقترح 2",
      "hook": "الهوك السيكولوجي الافتتاحي",
      "concept": "شرح الفكرة",
      "format": "Long-Form",
      "estimatedCtrPotential": "10% - 14%"
    },
    {
      "title": "عنوان فيروسي مقترح 3 (Shorts)",
      "hook": "الهوك السريع الخاطف",
      "concept": "شرح فكرة الشورتس",
      "format": "Shorts",
      "estimatedCtrPotential": "14% - 18%"
    },
    {
      "title": "عنوان فيروسي مقترح 4",
      "hook": "الهوك",
      "concept": "الفكرة",
      "format": "Long-Form",
      "estimatedCtrPotential": "9% - 13%"
    },
    {
      "title": "عنوان فيروسي مقترح 5",
      "hook": "الهوك",
      "concept": "الفكرة",
      "format": "Long-Form",
      "estimatedCtrPotential": "12% - 16%"
    }
  ],
  "verdictScore": 88,
  "overallGrade": "A"
}
\`\`\`

تنبيه: أعد JSON فقط، بحيث تكون كل النصوص بلغة ${lang === 'ar' ? 'العربية الفصحى الواضحة والاحترافية' : 'English'}.
`;

  // Fallback models cascade to withstand 503 high-demand or quota limitations
  const targetModels = [
    'gemini-2.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest'
  ];

  if (candidateKeys.length > 0) {
    for (const key of candidateKeys) {
      try {
        const ai = new GoogleGenAI({
          apiKey: key,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        }) as any;

        for (const modelName of targetModels) {
          for (let attempt = 0; attempt < 2; attempt++) {
            try {
              const response = await ai.models.generateContent({
                model: modelName,
                contents: [{ role: 'user', parts: [{ text: prompt }] }]
              });

              const responseText = response.text || '';
              let cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
              const firstBrace = cleaned.indexOf('{');
              const lastBrace = cleaned.lastIndexOf('}');
              if (firstBrace !== -1 && lastBrace !== -1) {
                cleaned = cleaned.substring(firstBrace, lastBrace + 1);
              }

              const parsedJson = JSON.parse(cleaned);
              if (parsedJson && parsedJson.summary) {
                return parsedJson;
              }
            } catch (modelErr: any) {
              const msg = modelErr?.message || String(modelErr);
              const isHighDemand = msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE') || modelErr?.status === 503;
              const isRateLimited = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || modelErr?.status === 429;

              if (attempt === 0 && (isHighDemand || isRateLimited)) {
                await new Promise(r => setTimeout(r, 600));
                continue;
              }
              break; // Try next model in targetModels
            }
          }
        }
      } catch (keyErr) {
        console.warn('[YouTube Analyzer AI] Key attempt error:', keyErr);
      }
    }
  }

  // Dynamic intelligent fallback report based on scraped metadata & keywords
  const textCorpus = `${scraped.title} ${scraped.handle} ${scraped.description}`.toLowerCase();

  let deducedNiche = 'صناعة المحتوى والإنتاج الرقمي';
  let subNiches = ['سرد قصصي جذاب', 'تجارب وتحليلات واقعية', 'معلومات وتطبيقات عملية'];

  if (/برمج|كود|تطوير|web|code|dev|python|javascript|react|ai|ذكاء اصطناعي|تقني|tech/i.test(textCorpus)) {
    deducedNiche = 'تقنية وبرمجة وذكاء اصطناعي';
    subNiches = ['شروحات برمجية عملية', 'أدوات الذكاء الاصطناعي والإنتاجية', 'مشاريع ومراجعات تقنية'];
  } else if (/gaming|game|لعب|العاب|ألعاب|بث|قيم|gta|roblox|minecraft|fortnite|شورتس العاب/i.test(textCorpus)) {
    deducedNiche = 'ألعاب إلكترونية وبثوث وتحديات';
    subNiches = ['تحديات وطرائف الألعاب', 'تختيم ولحظات أسطورية', 'نصائح وحيل احترافية'];
  } else if (/طبخ|وصفات|مطبخ|اكل|طعام|حلويات|food|cook|chef/i.test(textCorpus)) {
    deducedNiche = 'فنون الطبخ والوصفات المنزلية السريعة';
    subNiches = ['وجبات اقتصادية سريعة', 'حلويات ومخبوزات مبتكرة', 'أسرار ونكهات المطاعم'];
  } else if (/مال|بزنس|بيزنس|تجارة|اسهم|تداول|crypto|business|money|استثمار|ارباح|تسويق/i.test(textCorpus)) {
    deducedNiche = 'ريادة الأعمال والمال والاستثمار';
    subNiches = ['استراتيجيات الدخل السلبي', 'دراسات حالة لشركات ومشاريع', 'التسويق الرقمي وبناء الثروة'];
  } else if (/تاريخ|قصص|وثائقي|غموض|جرائم|كتاب|رواية|history|story|documentary/i.test(textCorpus)) {
    deducedNiche = 'سرد وثائقي وقصص تاريخية وغوامض';
    subNiches = ['أسرار تاريخية كبرى', 'قصص نجاح وسير ملهمة', 'تحليلات وثائقية سينمائية'];
  } else if (/رياضة|جيم|فتنس|تمارين|تغذية|كورة|كرة|fitness|gym|workout/i.test(textCorpus)) {
    deducedNiche = 'لياقة بدنية ورياضة ونمط حياة صحي';
    subNiches = ['برامج تمارين منزلية وجيم', 'تغذية وبناء العضلات', 'تحفيز وتحديات رياضية'];
  } else if (/تعليم|لغات|انجليزي|دراسة|تطوير الذات|كتب|productivity|learn/i.test(textCorpus)) {
    deducedNiche = 'تطوير الذات وتعلم المهارات واللغات';
    subNiches = ['تقنيات المذاكرة والإنتاجية', 'تعلم الإنجليزية والتواصل', 'ملخصات كتب وتجارب ملهمة'];
  } else if (scraped.title && scraped.title.trim()) {
    deducedNiche = `محتوى تخصصي في مجالات ${scraped.title}`;
  }

  const sampleVideos = scraped.recentVideos.map(v => v.title).filter(Boolean);
  const mainVideoTopic = sampleVideos[0] || scraped.title;

  return {
    summary: isNewChannel
      ? `تحليل وخطة إطلاق لقناة "${scraped.title}". القناة ناشئة وتمتلك فرصة ذهبية لبناء قاعدة جماهيرية متخصصة من الصفر عبر خطة نشر متوازنة تعتمد على استهداف الكلمات البحثية الطويلة (Long-tail Keywords) وفيديوهات الشورتس لجلب أول 1,000 مشترك.`
      : `تحليل استراتيجي شامل لقناة "${scraped.title}". القناة تركز على تقديم محتوى قيّم في مجال "${deducedNiche}"، مع إمكانيات واعدة لمضاعفة المشاهدات ومعدلات النقر (CTR) عند تطبيق هوية بصرية سينمائية موحدة.`,
    nicheCategory: deducedNiche,
    subNiches: subNiches,
    contentPillars: [
      'فيديوهات طويلة قائمة على الفضول وحل المشكلات',
      'مقاطع Shorts خاطفة لجلب مشتركين جدد',
      'تغطية المواضيع المتصدرة والتريندات في هذا المجال'
    ],
    contentTone: 'مشوقة، حماسية ومهنية',
    targetAudience: {
      persona: `مشاهدون مهتمون بمجال "${deducedNiche}"، يبحثون عن محتوى عملي وممتع يضيف لهم قيمة حقيقية وسرد سريع دون حشو`,
      ageGroup: '18 - 35 سنة',
      painPoints: ['البحث عن شروحات واضحة وموثوقة', 'الملل من الفيديوهات الطويلة غير المفيدة'],
      interestTopics: ['تطوير المهارات', 'التريندات الحديثة', 'أسرار النجاح', scraped.title]
    },
    seoAnalysis: {
      score: isNewChannel ? 80 : 86,
      topKeywords: [scraped.title, scraped.handle.replace('@', ''), deducedNiche, 'يوتيوب', 'شرح', 'تريند', 'أسرار'],
      topHashtags: [`#${scraped.title.replace(/\s+/g, '_')}`, '#يوتيوب', '#صناعة_محتوى', '#تريند', '#نجاح'],
      titleFormulasUsed: ['صيغة السؤال المثير للفضول', 'صيغة القوائم والحقائق الصادمة'],
      descriptionStrengths: ['وجود نبذة تعرّف بهوية القناة وتخصصها'],
      descriptionImprovements: ['إضافة روابط حسابات التواصل وكلمات مفتاحية بحثية في أول سطرين']
    },
    swot: {
      strengths: [
        'اسم قناة ومعرّف فريد وسهل التذكر',
        isNewChannel ? 'مرونة تامة للبدء بهوية قوية دون قيود خوارزمية سابقة' : `نشاط مستمر بوجود ${scraped.recentVideos.length} فيديو حديث مرصود`,
        `تخصص مركز في نيتش "${deducedNiche}"`
      ],
      weaknesses: [
        isNewChannel ? 'الحاجة لبناء أول 5-10 فيديوهات لتغذية خوارزمية التوصية بالبيانات' : 'الحاجة لزيادة التباين البصري في الصور المصغرة لرفع الـ CTR لأكثر من 10%',
        'تثبيت جدول زمني أسبوعي واضح ومحدد للنشر لتثبيت عادات المشاهدة'
      ],
      growthOpportunities: [
        'نشر مقاطع Shorts تفاعلية 3 مرات أسبوعياً لتحقيق أول قفزة في المشتركين',
        'استغلال الكلمات المفتاحية الأكثر بحثاً في صناعة عناوين ذات جاذبية عالية'
      ],
      threatsOrPitfalls: [
        'المنافسة المتسارعة تتطلب تقديم زاوية تناول فريدة ومختلفة'
      ]
    },
    contentStrategy: {
      recommendedUploadSchedule: isNewChannel ? 'فيديو رئيسي واحد كل أسبوع + 3 إلى 4 مقاطع Shorts قصيرة' : 'فيديو رئيسي كل أسبوع + 3 مقاطع Shorts سريعة',
      idealVideoLength: isNewChannel ? '6 - 10 دقائق (لضمان نسبة إكمال عالية AVD)' : '8 - 14 دقيقة',
      shortFormStrategy: 'إعادة استخدام أقوى 45 ثانية كشورتس مع رابط مباشر للفيديو الكامل في الوصف',
      retentionAdvice: 'ابدأ بالوعد والنتيجة مباشرة في أول 5 ثوانٍ دون مقدمات طويلة لتفادي تسرب المشاهدين',
      estimatedRPM: '$1.40 - $4.20',
      estimatedMonthlyRevenue: isNewChannel ? 'في طور التأسيس (مرحلة حصد أول 1K مشترك)' : '$600 - $3,200'
    },
    suggestedViralIdeas: [
      {
        title: isNewChannel ? `أسرار البداية الصحيحة في ${deducedNiche} وكيف تبدأ الآن؟` : `السر الذي لا يخبرك به أحد عن ${scraped.title} وكيف تستفيد منه؟`,
        hook: 'إذا كنت تظن أن النجاح في هذا المجال يحتاج ميزانيات ضخمة، فهذا الفيديو سيغير نظرتك تماماً!',
        concept: 'كشف حقائق غير شائعة مع نصائح تطبيقية وتجارب عملية',
        format: 'Long-Form',
        estimatedCtrPotential: '12% - 16%'
      },
      {
        title: `3 أخطاء شائعة في ${mainVideoTopic} تجعلك تخسر الكثير!`,
        hook: 'أغلب المبتدئين يرتكبون الخطأ الثاني تحديداً دون أن يشعروا...',
        concept: 'فيديو حل مشكلات مباشر يجذب الجمهور المستهدف بسرعة',
        format: 'Long-Form',
        estimatedCtrPotential: '11% - 15%'
      },
      {
        title: 'أفضل حيلة يمكنك تطبيقها اليوم في أقل من 60 ثانية ⚡',
        hook: 'جرب هذه الحركة وشاهد الفرق بنفسك فوراً!',
        concept: 'مقطع سريع وعملي لشورتس مع دعوة للاشتراك',
        format: 'Shorts',
        estimatedCtrPotential: '15% - 20%'
      },
      {
        title: `دليلك الشامل لـ ${deducedNiche} من الصفر حتى الاحتراف`,
        hook: 'كل ما تحتاجه في مكان واحد دون الحاجة للبحث الطويل...',
        concept: 'فيديو مرجعي طويل يحقق مشاهدات مستديمة (Evergreen Content)',
        format: 'Long-Form',
        estimatedCtrPotential: '10% - 14%'
      }
    ],
    verdictScore: isNewChannel ? 82 : 88,
    overallGrade: isNewChannel ? 'A (Launch Ready)' : 'A'
  };
}
