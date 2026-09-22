import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { scrapeYouTubeChannel, performDeepChannelAiAudit } from "./server/youtubeAnalyzer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // YouTube Channel Analyzer by URL/Handle (Zero-API Key Scraping + Deep AI Audit)
  app.post("/api/youtube/analyze-by-url", async (req, res) => {
    const { urlOrHandle, lang = 'ar', userApiKey } = req.body;

    if (!urlOrHandle || typeof urlOrHandle !== 'string' || !urlOrHandle.trim()) {
      return res.status(400).json({ error: "يرجى إدخال رابط القناة أو المعرف (@handle) بشكل صحيح." });
    }

    try {
      console.log(`[YouTube Analyzer] Starting crawl for: "${urlOrHandle.trim()}"`);
      const scraped = await scrapeYouTubeChannel(urlOrHandle.trim());
      console.log(`[YouTube Analyzer] Scraped title: "${scraped.title}", videos count: ${scraped.recentVideos.length}`);

      const clientKey = (req.headers['x-gemini-api-key'] as string || userApiKey || '').trim();
      const aiReport = await performDeepChannelAiAudit(scraped, lang, clientKey || undefined);

      const channelRecord = {
        id: `ch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        url: scraped.url,
        handle: scraped.handle,
        title: scraped.title,
        avatar: scraped.avatar,
        banner: scraped.banner,
        subscriberCount: scraped.subscriberCount,
        videoCount: scraped.videoCount,
        description: scraped.description,
        country: scraped.country,
        joinedDate: scraped.joinedDate,
        links: scraped.links,
        recentVideos: scraped.recentVideos,
        analysis: aiReport,
        linkedAt: Date.now(),
        lastUpdated: Date.now()
      };

      res.json({
        success: true,
        channel: channelRecord
      });
    } catch (err: any) {
      console.error("[YouTube Analyzer] Error analyzing channel:", err);
      res.status(500).json({
        error: err?.message || "فشل في تحليل القناة. يرجى التأكد من صحة الرابط والمحاولة مجدداً."
      });
    }
  });

  // Gemini Proxy Endpoint

  app.post("/api/gemini", async (req, res) => {
    const { model, contents, systemInstruction, userApiKey } = req.body;
    
    // Check possible key sources:
    // 1. Client header / body custom key (from user settings in UI)
    // 2. Server environment GEMINI_API_KEY
    // 3. Server environment VITE_GEMINI_API_KEY
    const clientKey = (req.headers['x-gemini-api-key'] as string || userApiKey || '').trim().replace(/^["']|["']$/g, '');
    const serverKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');

    const candidateKeys: string[] = [];
    if (clientKey && clientKey !== 'undefined' && clientKey !== 'null' && !clientKey.includes('YOUR_') && clientKey.length >= 10) {
      candidateKeys.push(clientKey);
    }
    if (serverKey && serverKey !== 'undefined' && serverKey !== 'null' && !serverKey.includes('YOUR_') && serverKey.length >= 10 && !candidateKeys.includes(serverKey)) {
      candidateKeys.push(serverKey);
    }

    if (candidateKeys.length === 0) {
      console.error("No valid Gemini API key found (client key or server env key missing)");
      return res.status(400).json({ 
        error: "مفتاح Gemini API غير متوفر أو غير صالح. يرجى إدخال مفتاح صالح في لوحة التحكم (Settings / API Keys) أو إضافة GEMINI_API_KEY في Secrets." 
      });
    }

    // Safe debugging log
    console.log(`[Gemini Proxy] Processing request. Candidate keys count: ${candidateKeys.length}`);

    let requestedModel = model || 'gemini-3.8-flash';
    if (requestedModel.includes('3.5')) requestedModel = 'gemini-3.8-flash';

    // Build fallback list based on model type (image vs text)
    const isImageModel = requestedModel.includes('image');
    const uniqueModels = isImageModel
      ? Array.from(new Set([requestedModel, 'gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image']))
      : Array.from(new Set([
          requestedModel,
          'gemini-3.1-flash-lite',
          'gemini-flash-latest',
          'gemini-3.8-flash',
          'gemini-2.5-flash'
        ]));

    let lastError: any = null;

    for (const key of candidateKeys) {
      try {
        const genAI = new GoogleGenAI({ 
          apiKey: key,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        }) as any;

        for (const targetModel of uniqueModels) {
          // Attempt up to 2 tries per model in case of temporary 503 spikes
          for (let attempt = 0; attempt < 2; attempt++) {
            try {
              const response = await genAI.models.generateContent({
                model: targetModel,
                systemInstruction: systemInstruction ? { role: 'system', parts: [{ text: systemInstruction }] } : undefined,
                contents: contents
              });

              return res.json({
                ...response,
                text: response.text
              });
            } catch (modelErr: any) {
              lastError = modelErr;
              const msg = modelErr?.message || String(modelErr);
              const isHighDemand = msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE') || modelErr?.status === 503;
              const isRateLimited = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || modelErr?.status === 429;
              
              console.warn(`[Gemini Proxy] Model ${targetModel} (attempt ${attempt + 1}) failed:`, msg);

              // If key is totally invalid, break inner loop to try next key
              if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
                break;
              }

              // If high demand or rate limited, wait a moment and either retry or advance to next model
              if (isHighDemand || isRateLimited) {
                if (attempt === 0) {
                  await new Promise(r => setTimeout(r, 400));
                  continue; // retry same model once
                }
              }
              break; // advance to next model
            }
          }
        }
      } catch (keyErr: any) {
        lastError = keyErr;
        console.warn(`[Gemini Proxy] Key initialization failed:`, keyErr);
      }
    }

    console.error("Gemini Proxy All Attempts Failed:", lastError);
    const status = lastError?.status || 500;
    res.status(status).json({ 
      error: lastError?.message || "Failed to generate content from Gemini",
      status
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
