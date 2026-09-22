
import { getGeminiApiKey, callWithRetryAndBackoff } from './apiKeyService';
import { ResultLanguage } from "../types";
import { getLanguageName } from "../utils/langMapper";

// MODEL CONFIGURATION
const MODEL_SMART = 'gemini-3.8-flash'; 
const MODEL_FAST = 'gemini-3.8-flash';
const MODEL_IMAGE = 'gemini-3.1-flash-image';

/**
 * Proxy helper to call Gemini server-side
 */
const callGeminiProxy = async (model: string, contents: any, systemInstruction?: string): Promise<any> => {
    const userApiKey = getGeminiApiKey();
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            ...(userApiKey ? { 'x-gemini-api-key': userApiKey } : {})
        },
        body: JSON.stringify({ 
            model, 
            contents, 
            systemInstruction,
            userApiKey: userApiKey || undefined
        })
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || err.message || 'Gemini API Error');
    }
    const data = await response.json();
    
    // Polyfill text() method and response object structure
    const rawText = data.text || (data.candidates?.[0]?.content?.parts?.[0]?.text) || '';
    return {
        ...data,
        text: typeof rawText === 'string' ? rawText : '', // Support direct text property access
        response: {
            ...data,
            text: () => rawText
        }
    };
};

// Retry helper for API calls using exponential backoff wrapper
const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> => {
    return callWithRetryAndBackoff(fn, 'gemini', 'gemini_content_generation', retries + 1, delay);
};

/**
 * Compatibility helper to maintain existing SDK-like calls while using the proxy
 */
const getAi = (toolName: string = 'default') => {
    return {
        getGenerativeModel: (config: any) => ({
            generateContent: async (req: any) => {
                const contents = req.contents || (Array.isArray(req) ? req : [req]);
                const responseData = await callGeminiProxy(config.model, contents, config.systemInstruction);
                return responseData;
            }
        }),
        models: {
            generateContent: async (req: any) => {
                const contents = req.contents || (Array.isArray(req) ? req : [req]);
                const responseData = await callGeminiProxy(req.model || MODEL_SMART, contents, req.systemInstruction);
                return responseData;
            }
        }
    };
};

const getLangInstruction = (lang: 'en' | 'ar', resultLang?: ResultLanguage) => {
    if (!resultLang || resultLang === 'auto') {
        return lang === 'ar' ? 'يجب أن يكون الإخراج باللغة العربية' : 'Output must be in English';
    }
    const targetLang = getLanguageName(resultLang, lang);
    return lang === 'ar' ? `يجب أن يكون الإخراج باللغة ${targetLang}` : `Output must be in ${targetLang}`;
};

const cleanAndParseJson = (text: string | undefined, defaultVal: any) => {
    if (!text) return defaultVal;
    try {
        let clean = text.trim();
        clean = clean.replace(/```json/g, '').replace(/```/g, '');
        const firstBrace = clean.indexOf('{');
        const lastBrace = clean.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            clean = clean.substring(firstBrace, lastBrace + 1);
        }
        return JSON.parse(clean);
    } catch (e) {
        console.warn("JSON Parse Error", e);
        return defaultVal;
    }
};

/**
 * 1. CHAT WITH GEMINI
 */
export const chatWithGemini = async (
    history: { role: string; text: string }[],
    message: string,
    lang: 'en' | 'ar',
    options: { fast: boolean; think: boolean; search: boolean },
    image?: string
) => {
    try {
        const modelName = options.think ? MODEL_SMART : MODEL_FAST;
        const systemInstruction = lang === 'ar' 
            ? "أنت مساعد ذكي متخصص في يوتيوب وصناعة المحتوى. أجب باختصار واحترافية. يجب أن تكون لغة إجابتك هي نفس اللغة التي يتحدث بها المستخدم في رسالته الأخيرة."
            : "You are a smart assistant specialized in YouTube and content creation. Answer concisely and professionally. Your response language MUST match the language the user is speaking in their last message.";

        const contents: any[] = history.map(h => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.text }]
        }));

        const currentParts: any[] = [];
        if (image) {
            const base64Data = image.split(',')[1];
            const mimeType = image.split(';')[0].split(':')[1];
            currentParts.push({ inlineData: { mimeType, data: base64Data } });
        }
        currentParts.push({ text: message });
        contents.push({ role: 'user', parts: currentParts });

        const result = await withRetry(() => callGeminiProxy(modelName, contents, systemInstruction));
        const resultText = result?.response?.text ? result.response.text() : (result?.text || '');
        return resultText || (lang === 'ar' ? "عذراً، لم أستطع الرد حالياً. يرجى المحاولة مرة أخرى." : "Sorry, I could not generate a response.");
    } catch (e: any) {
        console.error("Chat Error", e);
        const errMsg = e?.message || "";
        if (errMsg.includes("API key") || errMsg.includes("400") || errMsg.includes("INVALID_ARGUMENT") || errMsg.includes("غير متوفر")) {
            return lang === 'ar' 
                ? "⚠️ تنبيه: مفتاح Gemini API غير صالح أو غير مهيأ. يرجى الذهاب إلى لوحة التحكم > قسم 'مفاتيح الـ API' وإدخال مفتاح Gemini API صالح للبدء."
                : "⚠️ Notice: The Gemini API key is missing or invalid. Please go to Dashboard > 'API Key Manager' to configure a valid key.";
        }
        if (errMsg.includes("503") || errMsg.includes("high demand") || errMsg.includes("UNAVAILABLE")) {
            return lang === 'ar'
                ? "⚠️ خوادم النموذج تشهد ضغطاً مؤقتاً عالياً. تم تفعيل النماذج البديلة التلقائية، يرجى إعادة إرسال رسالتك الآن."
                : "⚠️ High temporary demand detected. Automatic fallback models enabled, please resend your message.";
        }
        return lang === 'ar' ? "⚠️ تعذر الاتصال بمحرك الذكاء الاصطناعي. يرجى التحقق من اتصالك والمحاولة لاحقاً." : "⚠️ Connection error occurred. Please try again later.";
    }
};

/**
 * 2. CHANNEL AUDIT (STRATEGIC)
 */
export const generateChannelAudit = async (channelData: any, lang: 'en' | 'ar', resultLang?: ResultLanguage) => {
    try {
        const ai = getAi('generateChannelAudit');
        const isAr = lang === 'ar';
        const prompt = `
        **الدور:** استراتيجي يوتيوب خبير ومحلل بيانات ضخمة.
        **المهمة:** تحليل هذه القناة بناءً على بياناتها الوصفية بدقة متناهية.
        
        **البيانات:**
        - العنوان: ${channelData.snippet.title}
        - الوصف: ${channelData.snippet.description.substring(0, 400)}
        - الإحصائيات: ${JSON.stringify(channelData.statistics)}
        - الدولة: ${channelData.snippet.country || 'عالمي'}

        **${getLangInstruction(lang, resultLang)} وبصيغة JSON فقط:**
        {
            "archetype": "لقب القناة (مثلاً: الحكيم، المهرج، الثوري، الخبير الاستراتيجي)",
            "psychology": "تحليل نفسي عميق: ما هو الدافع الخفي الذي يجعل الناس يشاهدون هذه القناة؟",
            "strengths": ["نقطة قوة استراتيجية 1", "نقطة قوة استراتيجية 2"],
            "weaknesses": ["نقطة ضعف قاتلة 1", "نقطة ضعف قاتلة 2"],
            "opportunity": "فرصة نمو ضائعة يمكن استغلالها فوراً",
            "verdict_score": 85,
            "verdict_text": "رأي نهائي قاطع في سطر واحد يحدد مصير القناة",
            "self_development": "تعليمات مخفية للمستخدم لمساعدته على فهم 'لماذا' تم تحليل القناة بهذا الشكل وكيف يطور مهاراته في تحليل القنوات وبناء الهوية بناءً على هذا التقرير."
        }
        `;

        const response = await withRetry(() => ai.models.generateContent({
            model: MODEL_SMART,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));

        return cleanAndParseJson(response.text, null);
    } catch (e) {
        console.error("Audit Error", e);
        return null;
    }
};

/**
 * 19. COMPETITOR SPY DEEP DIVE (The War Room)
 */
export const generateCompetitorDeepDive = async (
    competitorTitle: string, 
    competitorDesc: string, 
    myNiche: string,
    lang: 'en' | 'ar',
    resultLang?: ResultLanguage,
    myChannelTitle?: string
) => {
    try {
        const ai = getAi('generateCompetitorDeepDive');
        const isAr = lang === 'ar';
        const context = myChannelTitle ? `مقارنة بين قناتي "${myChannelTitle}" والمنافس "${competitorTitle}"` : `تحليل المنافس "${competitorTitle}" في مجال "${myNiche}"`;
        const prompt = `
        **هوية النظام: محلل استخبارات تنافسية عسكرية (MILITARY-GRADE COMPETITIVE INTELLIGENCE ANALYST)**
        **الحالة:** متصل بالويب العالمي، يقوم بتحليل البصمة الرقمية الكاملة للهدف.
        **الهدف:** تفكيك شامل للمنافس "${competitorTitle}" وتقديم تقرير استخباراتي قابل للتنفيذ.

        **بروتوكول التحليل المتقدم (يجب استكمال جميع النقاط):**
        1.  **تحليل SWOT الكامل:**
            -   **Strengths (نقاط القوة):** استخدم بحث جوجل لتحديد نقاط القوة الداخلية التي تمنحهم ميزة (مثال: شخصية قوية، جودة إنتاج عالية، وصول حصري للمعلومات).
            -   **Weaknesses (نقاط الضعف):** ابحث عن نقاط الضعف الداخلية التي يمكن استغلالها (مثال: جدول نشر غير منتظم، تجاهل تعليقات الجمهور، محتوى متكرر).
            -   **Opportunities (الفرص):** حدد الفرص الخارجية في السوق التي يتجاهلونها (مثال: منصات جديدة، أنواع محتوى ناشئة، تعاونات استراتيجية).
            -   **Threats (التهديدات):** ابحث عن التهديدات الخارجية التي قد تؤثر عليهم (مثال: تغير خوارزميات، منافسون جدد شرسون، تغير اهتمامات الجمهور).
        2.  **تحديد ركائز المحتوى (Content Pillars):** ما هي 3-5 مواضيع أساسية تشكل هوية القناة وتجذب جمهورهم الأساسي؟
        3.  **تحليل معنويات الجمهور (Audience Sentiment):** ابحث في وسائل التواصل الاجتماعي والمنتديات لفهم ما يحبه الجمهور فيهم وما يكرهونه.
        4.  **تحديد موقع العلامة التجارية (Brand Positioning):** كيف يقدمون أنفسهم للسوق؟ (مثال: 'الخبير الموثوق'، 'المعلم الصبور'، 'المصدر الأول للأخبار العاجلة').
        5.  **استراتيجية تحقيق الدخل (Monetization Strategy):** بناءً على تحليل شامل، قدم أفضل تخمين لكيفية تحقيقهم للدخل (إعلانات، رعاية، منتجات، تسويق بالعمولة، إلخ).

        **${getLangInstruction(lang, resultLang)} وبصيغة JSON فقط:**
        {
            "swot_analysis": {
                "strengths": ["قوة 1 مدعومة بالبحث", "قوة 2 مدعومة بالبحث"],
                "weaknesses": ["ضعف 1 يمكن استغلاله", "ضعف 2 يمكن استغلاله"],
                "opportunities": ["فرصة سوق 1 يتجاهلونها", "فرصة سوق 2 يتجاهلونها"],
                "threats": ["تهديد خارجي 1 يواجههم", "تهديد خارجي 2 يواجههم"]
            },
            "content_pillars": ["ركيزة محتوى 1", "ركيزة محتوى 2", "ركيزة محتوى 3"],
            "audience_sentiment": {
                "positive": "أكثر شيء يحبه الجمهور فيهم هو...",
                "negative": "أكثر شيء يكرهه الجمهور فيهم هو..."
            },
            "brand_positioning": "يضعون أنفسهم في السوق على أنهم...",
            "monetization_strategy": "أفضل تخمين لاستراتيجية تحقيق الدخل الخاصة بهم هو...",
            "attack_vector": "أفضل زاوية هجوم استراتيجية للتفوق عليهم هي... (يجب أن تكون مبتكرة ومبنية على التحليل أعلاه)",
            "self_development": "تعليمات مخفية للمستخدم لمساعدته على فهم 'لماذا' تم تحليل المنافس بهذا الشكل وكيف يطور مهاراته في تحليل السوق والمنافسين بناءً على هذا التقرير."
        }
        `;

        const response = await withRetry(() => ai.models.generateContent({
            model: MODEL_SMART,
            contents: prompt,
            config: { 
                responseMimeType: "application/json"
            }
        }));

        return cleanAndParseJson(response.text, null);
    } catch (e) {
        console.error("Competitor Deep Dive Error", e);
        return null;
    }
};

export const generateEarningsAudit = async (title: string, desc: string, viewCount: string, country: string, lang: 'en' | 'ar', resultLang?: ResultLanguage) => {
    try {
        const ai = getAi('generateEarningsAudit');
        const prompt = `
        **هوية النظام: رأسمالي مغامر وخبير نمو لعام 2028 (VENTURE CAPITALIST & GROWTH STRATEGIST)**
        **الحالة:** متصل بالويب العالمي، يبحث عن اتجاهات السوق الناشئة ونماذج الأعمال المبتكرة.
        **المهمة:** تحليل البصمة الرقمية للكيان أدناه وتحديد 3 "مسرحيات نمو" (Growth Plays) عالية التأثير ومبتكرة لتحويله إلى إمبراطورية إعلامية.

        **بيانات الكيان:**
        - **العنوان:** ${title}
        - **الوصف:** ${desc}
        - **عدد المشاهدات (للسياق):** ${viewCount}
        - **الدولة الأساسية:** ${country}

        **بروتوكول التحليل المتقدم:**
        1.  **بحث السوق (Market Research):** استخدم بحث جوجل لتحديد أحدث الاتجاهات ونماذج تحقيق الدخل في مجال هذا الكيان. ابحث عن دراسات حالة لنجاحات غير متوقعة.
        2.  **تحديد 3 مسرحيات نمو:** ابتكر ثلاث استراتيجيات نمو مميزة وقابلة للتنفيذ. يجب أن تكون كل واحدة مختلفة تمامًا عن الأخرى.
        3.  **تحليل المخاطر/المكافآت:** لكل مسرحية نمو، قدم تحليلاً موجزاً للمخاطر المحتملة والمكافأة المتوقعة.

        **${getLangInstruction(lang, resultLang)} وبصيغة JSON فقط:**
        {
          "investment_thesis": "أطروحة استثمارية موجزة تلخص لماذا هذا الكيان يمثل فرصة نمو هائلة (أو لا).",
          "growth_plays": [
            {
              "play_name": "اسم مبتكر لمسرحية النمو الأولى (مثال: 'استوديو المحتوى المصغر')",
              "strategy": "شرح مفصل للاستراتيجية، وكيفية تنفيذها، وما الذي يجعلها فريدة من نوعها.",
              "risk_reward_analysis": {
                  "risk": "المخاطرة الأساسية لهذه الاستراتيجية (مثال: 'تتطلب استثمارًا أوليًا كبيرًا في المعدات').",
                  "reward": "المكافأة المحتملة إذا نجحت (مثال: 'يمكن أن تصبح المصدر الأول للمحتوى عالي الجودة في هذا المجال').'"
              },
              "estimated_roi": "تقدير لعائد الاستثمار (مثال: '10x-15x على مدى 24 شهرًا')"
            },
            {
              "play_name": "اسم مبتكر لمسرحية النمو الثانية (مثال: 'منصة البيانات الحصرية')",
              "strategy": "شرح مفصل للاستراتيجية...",
              "risk_reward_analysis": {
                  "risk": "...",
                  "reward": "..."
              },
              "estimated_roi": "..."
            },
            {
              "play_name": "اسم مبتكر لمسرحية النمو الثالثة (مثال: 'القمة الافتراضية المدفوعة')",
              "strategy": "شرح مفصل للاستراتيجية...",
              "risk_reward_analysis": {
                  "risk": "...",
                  "reward": "..."
              },
              "estimated_roi": "..."
            }
          ],
          "final_verdict": "الحكم النهائي: هل هذا الكيان 'قابل للاستثمار' (Investable) أم 'نمط حياة' (Lifestyle Business)؟ ولماذا؟"
        }
        `;

        const response = await withRetry(() => ai.models.generateContent({
            model: MODEL_SMART,
            contents: prompt,
            config: { 
                responseMimeType: "application/json"
            }
        }));

        return cleanAndParseJson(response.text, null);
    } catch (e) {
        console.error("AI Earnings Audit Error", e);
        return null;
    }
};

export const generateVideoDeepAnalysis = async (videoData: any, lang: 'en' | 'ar', resultLang?: ResultLanguage) => {
    try {
        const ai = getAi('generateVideoDeepAnalysis');
        const prompt = `
        **الدور:** خبير تحسين محركات البحث (SEO) ومهندس نقرات (CTR) في يوتيوب.
        **المهمة:** تحليل عميق جداً لبيانات فيديو يوتيوب لزيادة المشاهدات.
        **البيانات:**
        - العنوان: ${videoData.snippet.title}
        - العلامات (Tags): ${videoData.snippet.tags?.join(', ') || 'لا يوجد'}
        - الإحصائيات: ${JSON.stringify(videoData.statistics)}
        
        **المطلوب:** تقييم العنوان الحالي وتقديم بدائل أقوى بكثير، واقتراح فكرة صورة مصغرة لا تقاوم.
        
        **${getLangInstruction(lang, resultLang)} وبصيغة JSON فقط:**
        {
            "title_score": 80,
            "title_critique": "نقد لاذع وبناء للعنوان الحالي",
            "better_titles": ["عنوان بديل مدمر 1", "عنوان بديل مدمر 2"],
            "thumbnail_idea": "وصف دقيق لصورة مصغرة تجبر المشاهد على النقر",
            "self_development": "تعليمات مخفية للمستخدم لمساعدته على فهم 'لماذا' تم تحليل الفيديو بهذا الشكل وكيف يطور مهاراته في اختيار العناوين وتصميم الصور المصغرة بناءً على هذا التقرير."
        }
        `;
        const response = await withRetry(() => ai.models.generateContent({
            model: MODEL_SMART,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return cleanAndParseJson(response.text, null);
    } catch (e) { return null; }
};

export const generateAdvancedSeo = async (query: string, type: string, lang: 'en' | 'ar', resultLang?: ResultLanguage) => {
    try {
        const ai = getAi('generateAdvancedSeo');
        const prompt = `
        **الدور:** مهندس خوارزميات يوتيوب وخبير SEO متقدم.
        **المهمة:** باستخدام بحث جوجل المباشر، قم بتحليل أحدث الاتجاهات والأحداث المتعلقة بـ ${type} بعنوان "${query}" لتحسين الـ SEO.
        
        **المطلوب:** تقديم استراتيجية SEO متكاملة، عناوين محسنة جداً، كلمات مفتاحية ذهبية، وخطاف للوصف.
        
        **${getLangInstruction(lang, resultLang)} وبصيغة JSON فقط:**
        {
            "strategy_note": "ملاحظة استراتيجية حول كيفية تصدر نتائج البحث لهذا الموضوع",
            "titles": [ 
                { "text": "عنوان محسن 1", "score": 95, "rationale": "لماذا هذا العنوان سينجح؟" },
                { "text": "عنوان محسن 2", "score": 90, "rationale": "لماذا هذا العنوان سينجح؟" }
            ],
            "keywords": ["كلمة_مفتاحية_قوية_1", "كلمة_مفتاحية_قوية_2", "كلمة_مفتاحية_قوية_3"],
            "description_hook": "أول سطرين في الوصف (Hook) لجذب المشاهد والخوارزمية معاً",
            "self_development": "تعليمات مخفية للمستخدم لمساعدته على فهم 'لماذا' تم اختيار هذه الكلمات والعناوين وكيف يطور مهاراته في الـ SEO بناءً على هذا التقرير."
        }
        `;
        const response = await withRetry(() => ai.models.generateContent({
            model: MODEL_SMART,
            contents: prompt,
            config: { 
                responseMimeType: "application/json"
            }
        }));
        return cleanAndParseJson(response.text, null);
    } catch (e) { return null; }
};

export const generateAiTitles = async (topic: string, lang: 'en' | 'ar', resultLang?: ResultLanguage) => {
    const res = await generateAdvancedSeo(topic, 'topic', lang, resultLang);
    return res?.titles?.map((t: any) => t.text) || [];
};

export const generateAiVideoIdeas = async (channelTitle: string, channelDesc: string, recentTitles: string[], keywords: string[], lang: 'en' | 'ar', resultLang?: ResultLanguage, topic?: string, options?: { creativityLevel: string, targetAudience: string, videoFormat: string }) => {
    try {
        const ai = getAi('generateAiVideoIdeas');
        const context = topic ? `الموضوع: ${topic}` : `القناة: ${channelTitle}, الفيديوهات الأخيرة: ${recentTitles.join(', ')}`;
        const prompt = `
        **هوية النظام: العقل المدبر الاستراتيجي للأفكار (MASTERMIND STRATEGIST 2026)**
        **المهمة:** توليد 6 أفكار فيديوهات فيروسية ومبتكرة للغاية، مصممة خصيصًا للمعايير التالية. يجب عليك دائمًا إرجاع بنية JSON صالحة تحتوي على 6 أفكار، حتى لو كانت المدخلات محدودة. استخدم إبداعك لملء أي فجوات.

        **1. السياق الأساسي:** ${context}
        **2. مستوى الإبداع المطلوب:** ${options?.creativityLevel || 'balanced'} (safe = أفكار مجربة, balanced = مزيج من المألوف والجديد, insane = أفكار جريئة وصادمة لم يقم بها أحد من قبل).
        **3. الجمهور المستهدف:** ${options?.targetAudience || 'general'} (beginners = تبسيط المفاهيم, general = جاذبية واسعة, experts = محتوى عميق ومتخصص).
        **4. صيغة الفيديو:** ${options?.videoFormat || 'any'} (shorts = أفكار سريعة وعمودية, long = محتوى طويل ومتعمق, any = متنوع).

        **العمليات المتقدمة:**
        - **تحليل الفجوات (Gap Analysis):** استخدم بحث جوجل لتحديد الموضوعات الفرعية التي لم يتم تغطيتها بشكل كافٍ في هذا المجال.
        - **التنبؤ بالتريند (Trend Forecasting):** ابحث عن الاتجاهات الناشئة التي يمكن دمجها مع سياق القناة لخلق محتوى مستقبلي.
        - **الهندسة النفسية (Psychological Engineering):** صمم كل فكرة لتثير فضولاً شديداً أو عاطفة قوية لدى الجمهور المستهدف.

        **${getLangInstruction(lang, resultLang)} وبصيغة JSON فقط:**
        {
            "ideas": [
                {
                    "title": "عنوان الفكرة المثير والمصمم للنقر",
                    "score": "عالي جداً/متوسط/منخفض (بناءً على احتمالية النجاح الفيروسي)",
                    "type": "نوع الفيديو المقترح (مثال: وثائقي قصير، تحدي، تجربة اجتماعية، تحليل عميق)",
                    "why_it_works": "شرح استراتيجي دقيق يوضح كيف تلبي هذه الفكرة جميع المعايير المتقدمة (الفجوة، التريند، التأثير النفسي)"
                }
            ],
            "self_development": "تعليمات مخفية للمستخدم لمساعدته على فهم 'لماذا' تم اختيار هذه الأفكار وكيف يطور مهاراته في توليد الأفكار الإبداعية بناءً على هذا التقرير."
        }
        `;
        const response = await withRetry(() => ai.models.generateContent({
            model: MODEL_SMART,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return cleanAndParseJson(response.text, { ideas: [], self_development: "" });
    } catch (e) { return { ideas: [], self_development: "" }; }
};

export const generateCustomGrowthPlan = async (title: string, desc: string, stats: any, lang: 'en' | 'ar', resultLang?: ResultLanguage) => {
    try {
        const ai = getAi('generateCustomGrowthPlan');
        const prompt = `
        **هوية النظام: رئيس قسم النمو الاستراتيجي (CHIEF GROWTH OFFICER 2026)**
        **الحالة:** متصل بالإنترنت فائق السرعة، ومُدرَّب على تحليل بيانات السوق والاتجاهات الحالية.
        **المهمة:** بناء خطة نمو عسكرية مخصصة ومفصلة للغاية لمدة 7 أيام لقناة "${title}" بناءً على بحث عميق وتحليل استراتيجي للسوق. يجب عليك دائمًا إرجاع بنية JSON صالحة وكاملة، مع ملء جميع الحقول المطلوبة. إذا كانت البيانات غير متوفرة، فاستخدم خبرتك لتقديم تقديرات معقولة.

        **البيانات الأولية:**
        - الوصف: ${desc.substring(0, 300)}
        - الإحصائيات: ${JSON.stringify(stats)}

        **العمليات المتقدمة المطلوبة:**
        1.  **بحث السوق (Market Research):** استخدم بحث جوجل لتحديد أكبر 3 منافسين مباشرين للقناة، وتحليل نقاط قوتهم وضعفهم.
        2.  **تحديد الفرص (Opportunity Analysis):** ابحث عن فجوات المحتوى (Content Gaps) أو الاتجاهات الناشئة (Emerging Trends) في مجال القناة التي يمكن استغلالها فورًا.
        3.  **التشخيص القاسي (Brutal Diagnosis):** بناءً على البيانات والبحث، حدد نقطة الفشل الحرجة الوحيدة التي تمنع القناة من النمو بشكل أُسّي.
        4.  **صياغة الخطة (Strategic Formulation):** قم بإنشاء خطة يومية عملية وقابلة للتنفيذ تركز على إصلاح نقطة الفشل واستغلال الفرص المكتشفة.

        **${getLangInstruction(lang, resultLang)} وبصيغة JSON فقط:**
        {
            "audit_summary": "تشخيص دقيق وقاسي للمشكلة الحقيقية التي تمنع القناة من النمو (مثال: 'القناة تفتقر إلى هوية واضحة وتتحدث إلى الجميع، وبالتالي لا أحد يستمع')",
            "north_star_metric": "المقياس الوحيد الذي يجب الهوس به هذا الأسبوع لتحقيق أقصى تأثير (مثال: 'زيادة نسبة الاحتفاظ بالجمهور في أول 30 ثانية بنسبة 20%')",
            "strategic_focus": "التركيز الاستراتيجي العام للأسبوع (مثال: 'التحول من محتوى عام إلى محتوى متخصص يستهدف الخبراء')",
            "market_opportunity": "الفرصة الذهبية المكتشفة في السوق التي يجب استغلالها (مثال: 'لا يوجد أي منافس يقدم تحليلات متعمقة للأخبار التقنية، الجميع يكتفي بالسطحيات')",
            "success_probability": 90,
            "self_development": "تعليمات مخفية للمستخدم لمساعدته على فهم 'لماذا' تم اختيار هذا الأسلوب الاستراتيجي وكيف يطور مهاراته كصانع محتوى بناءً على هذا التحليل.",
            "week_plan": [
                {
                    "day": "اليوم الأول: التأسيس",
                    "task": "مهمة محددة وواضحة تركز على الهدف الاستراتيجي",
                    "difficulty": "صعب/متوسط/سهل",
                    "method": "شرح تفصيلي لكيفية تنفيذ المهمة بأعلى جودة ممكنة",
                    "tool_recommendation": "الأداة المثالية من المنصة لتنفيذ هذه المهمة (seo, ideas, competitor, outliers)"
                }
            ],
            "final_command": "أمر نهائي قوي ومباشر يحفز على التنفيذ الفوري للخطة العسكرية."
        }
        `;
        const response = await withRetry(() => ai.models.generateContent({
            model: MODEL_SMART,
            contents: prompt,
            config: { 
                responseMimeType: "application/json"
            }
        }));
        return cleanAndParseJson(response.text, null);
    } catch (e) { return null; }
};

export const generateCompetitorAnalysis = async (title: string | null, desc: string | null, recent: string[], keywords: string[], lang: 'en' | 'ar', resultLang?: ResultLanguage, nicheInput?: string) => {
    try {
        const ai = getAi('generateCompetitorAnalysis');
        const context = nicheInput ? `المجال: ${nicheInput}` : `القناة: ${title}`;
        const prompt = `
        **الدور:** خبير تصنيف وتحليل أسواق يوتيوب.
        **المهمة:** تحديد المجال (Niche) الدقيق لـ ${context}.
        
        **المطلوب:** تحديد المجال بدقة متناهية (ليس فقط "ألعاب" بل "ألعاب رعب مستقلة").
        
        **${getLangInstruction(lang, resultLang)} وبصيغة JSON فقط:**
        {
            "niche": "المجال الدقيق والمحدد"
        }
        `;
        const response = await withRetry(() => ai.models.generateContent({
            model: MODEL_SMART,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return cleanAndParseJson(response.text, { niche: "عام" });
    } catch (e) { return { niche: "عام" }; }
};

export const generateAudienceDeepDive = async (title: string, desc: string, recent: string[], lang: 'en' | 'ar', resultLang?: ResultLanguage) => {
    try {
        const ai = getAi('generateAudienceDeepDive');
        const prompt = `
        **هوية النظام: محلل سلوكيات الجمهور الفائق (AUDIENCE BEHAVIORAL ARCHITECT 2026)**
        **المهمة:** بناء ملف تعريفي شامل ودقيق للغاية لجمهور قناة يوتيوب: \"${title}\". استخدم بحث جوجل لتحليل الأنماط الثقافية والسلوكية المتعلقة بمحتوى القناة.

        **البيانات الأولية للتحليل:**
        - الوصف: ${desc.substring(0, 300)}
        - أحدث الفيديوهات: ${recent.join(', ')}

        **المخرجات المطلوبة (${getLangInstruction(lang, resultLang)} وبصيغة JSON فقط). يجب عليك ملء كل حقل في بنية JSON بشكل كامل. لا تترك أي حقل فارغًا. استخدم تحليلك لتقدير المعلومات إذا لم تكن متاحة بشكل مباشر:**
        {
          "psychographic_profile": "تحليل نفسي معمق: ما هو الدافع الرئيسي الخفي (الدافع) الذي يجعلهم يشاهدون؟ (مثال: 'البحث عن التقدير الاجتماعي، الهروب من الواقع، الشعور بالإنجاز')",
          "interest_map": {
            "other_channels": ["قناة 1 يتابعونها بشدة", "قناة 2 في مجال مختلف ولكنها تهمهم"],
            "brands": ["علامة تجارية يثقون بها 1", "علامة تجارية يطمحون لها 2"],
            "influencers": ["مؤثر يتابعونه 1", "شخصية عامة تلهمهم 2"]
          },
          "demographics": {
            "age_group": "الفئة العمرية الأكثر احتمالية (مثال: 18-24)",
            "gender_ratio": "النسبة بين الذكور والإناث (مثال: 70% ذكور)",
            "top_geographies": ["أهم 3 دول من حيث التركيز السكاني", "دولة 2", "دولة 3"]
          },
          "behavioral_analysis": {
            "active_times": ["أكثر الأوقات نشاطاً على يوتيوب (مثال: '8-11 مساءً أيام الأسبوع')", "وقت الذروة في عطلة نهاية الأسبوع"],
            "format_preferences": ["تنسيق الفيديو المفضل (مثال: 'فيديوهات قصيرة ومباشرة')", "تنسيق آخر (مثال: 'بث مباشر تفاعلي')"],
            "device_usage": ["الجهاز الأكثر استخداماً (مثال: 'الهواتف الذكية بنسبة 90%')", "جهاز آخر (مثال: 'مشاهدة على التلفاز الذكي')"]
          },
          "audience_segments": [
            { "name": "الشريحة 1 (مثال: المبتدئون)", "description": "وصف لهذه الشريحة واحتياجاتها" },
            { "name": "الشريحة 2 (مثال: الخبراء)", "description": "وصف لهذه الشريحة ودوافعها المختلفة" }
          ],
          "self_development": "تعليمات مخفية للمستخدم لمساعدته على فهم 'لماذا' تم تحليل الجمهور بهذا الشكل وكيف يطور مهاراته في فهم سيكولوجية الجماهير بناءً على هذا التقرير."
        }
        `;
        const response = await withRetry(() => ai.models.generateContent({
            model: MODEL_SMART,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return cleanAndParseJson(response.text, null);
    } catch (e) { return null; }
};

/**
 * UPDATED: 2026 GIGA SCRIPT WRITER
 * Connected to Live Web and Time-Aware
 */
export const generateViralScript = async (
    topic: string, 
    duration: string, 
    tone: string, 
    language: string, 
    hookType: string, 
    customHook: string, 
    lang: 'en' | 'ar',
    resultLang: ResultLanguage | undefined,
    timeContext: string,
    strategy: string,
    psychology: string,
    targetPlatform: string,
    contentComplexity: string,
    seoFocus: string,
    mode: 'full' | 'bullets' | 'titles' | 'structure' = 'full'
) => {
    try {
        const ai = getAi('generateViralScript');
        const modeInstructions = {
            full: "قم بكتابة سكريبت كامل ومفصل للفيديو.",
            bullets: "قم بكتابة أهم النقاط (Bullet Points) التي يجب تغطيتها في الفيديو.",
            titles: "قم بتوليد مجموعة من العناوين الجذابة والخطافات (Hooks) القوية فقط.",
            structure: "قم برسم هيكل الفيديو (Structure) وتقسيمه إلى مقدمة، عرض، وخاتمة مع توقيتات تقديرية."
        };

        const prompt = `
        **هوية النظام: مهندس المحتوى العصبي-الخوارزمي (NEURO-ALGORITHMIC CONTENT ENGINEER 2026)**
        **الحالة:** متصل بالويب العالمي، يحلل في الوقت الفعلي سيكولوجية الجمهور وخوارزميات المنصات.
        **الوقت الحالي:** ${timeContext}
        **الهدف:** هندسة محتوى فائق الدقة مصمم للسيطرة على الخوارزميات وتحقيق أقصى تأثير نفسي على المشاهد.

        **النمط المطلوب:** ${modeInstructions[mode]}

        **المهمة المتقدمة:**
        1.  **تحليل متعدد الأبعاد:** استخدم بحث جوجل لفهم الموضوع "${topic}" من زوايا متعددة: علمية، ثقافية، تاريخية، وأحدث الأخبار.
        2.  **التخصيص للمنصة:** قم بتكييف هيكل السكريبت بالكامل ليناسب خوارزمية وسلوك المستخدم على منصة **${targetPlatform}**.
        3.  **معايرة التعقيد:** اضبط عمق المحتوى ومصطلحاته ليتناسب تمامًا مع مستوى تعقيد **${contentComplexity}**.
        4.  **هندسة SEO الدقيقة:** ركز جهود الـSEO بناءً على **${seoFocus}** لضمان أقصى قدر من الوصول العضوي.
        5.  **التلاعب النفسي الأخلاقي:** طبق مبادئ **${psychology}** بشكل متطور في كل جزء من السكريبت لخلق تجربة مشاهدة لا تُنسى.
        6.  **تعليمات التطوير الذاتي:** أضف تعليمات مخفية للمستخدم لمساعدته على فهم "لماذا" تم اختيار هذا الأسلوب. استخدم التنسيق التالي للتعليمات: "تعليمات: [نص التعليمة هنا]".

        **بيانات الإدخال الاستراتيجية:**
        - الموضوع: ${topic}
        - المدة: ${duration}
        - النبرة: ${tone}
        - اللغة: ${language}
        - الاستراتيجية: ${strategy}
        - المنصة: ${targetPlatform}
        - التعقيد: ${contentComplexity}
        - تركيز SEO: ${seoFocus}
        - المحفز النفسي: ${psychology}

        **${getLangInstruction(lang, resultLang)} وبصيغة JSON فقط:**
        {
            "seoTitle": "عنوان مصمم بدقة للمنصة المستهدفة، يجمع بين قوة الـSEO والجاذبية النفسية.",
            "seoDescription": "وصف محسن للمنصة، يحتوي على كلمات مفتاحية دقيقة (Long-tail) وسؤال تفاعلي قوي.",
            "platform_specific_hooks": {
                "visual_hook": "وصف خطاف بصري لأول 3 ثوانٍ، مصمم لإيقاف التمرير (Scrolling) على ${targetPlatform}.",
                "verbal_hook": "أول جملة في السكريبت، مصممة لإثارة الفضول الفوري."
            },
            "algorithm_triggers": [
                "عامل خوارزمي 1 (مثال: استخدام طوابع زمنية لزيادة وقت المشاهدة على يوتيوب)",
                "عامل خوارزمي 2 (مثال: تشجيع الحفظ والمشاركة في أول 10 ثوانٍ على انستغرام)"
            ],
            "retention_strategy": "وصف موجز لاستراتيجية الاحتفاظ بالجمهور المتبعة في السكريبت (مثال: 'استخدام 3 حلقات مفتوحة (Open Loops) يتم إغلاقها في نهاية الفيديو')",
            "scriptBody": "المحتوى المطلوب بناءً على النمط (${mode})، مع [[ملاحظات إخراجية دقيقة للمونتاج تتناسب مع ${targetPlatform}]] وحقائق موثقة من بحث الويب لعام 2026. تذكر استخدام 'تعليمات: [النص]' لإضافة نصائح تطوير الذات."
        }
        `;

        const response = await withRetry(() => ai.models.generateContent({
            model: MODEL_SMART,
            contents: prompt,
            config: { 
                responseMimeType: "application/json" 
            }
        }));
        return cleanAndParseJson(response.text, null);
    } catch (e) {
        console.error("Giga Script Error", e);
        throw e;
    }
};

export const generateBananaImage = async (prompt: string, mode: string, aspectRatio: string, lang: 'en' | 'ar', resultLang?: ResultLanguage) => {
    try {
        const ai = getAi('generateBananaImage');
        const ratioMap: any = { '16:9': '16:9', '9:16': '9:16', '1:1': '1:1' };
        const response = await withRetry(() => ai.models.generateContent({
            model: MODEL_IMAGE,
            contents: { parts: [{ text: prompt }] },
            config: { imageConfig: { aspectRatio: ratioMap[aspectRatio] || '1:1' } }
        }));
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (e) { return null; }
};

export const editBananaImage = async (baseImage: string, prompt: string, aspectRatio: string, lang: 'en' | 'ar', resultLang?: ResultLanguage, overlay1?: string | null, overlay2?: string | null) => {
    try {
        const ai = getAi('editBananaImage');
        const parts: any[] = [];
        parts.push({ inlineData: { mimeType: 'image/png', data: baseImage.split(',')[1] } });
        parts.push({ text: prompt || "Edit this image" });
        
        const response = await withRetry(() => ai.models.generateContent({
            model: MODEL_IMAGE,
            contents: { parts },
            config: { imageConfig: { aspectRatio: aspectRatio as any } }
        }));
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (e) { return null; }
};

export const analyzeImageDeeply = async (image: string, lang: 'en' | 'ar', resultLang?: ResultLanguage) => {
    try {
        const ai = getAi('analyzeImageDeeply');
        const prompt = `
        **هوية النظام: محلل بصري مجهري وخبير سيكولوجية الصور (MICROSCOPIC VISUAL ANALYST & IMAGE PSYCHOLOGIST)**
        **المهمة:** تحليل هذه الصورة/الصورة المصغرة بدقة 100%، جزءاً بجزء، بكسل ببكسل. لا تترك أي تفصيل دون فحص.
        
        **بروتوكول التحليل الفائق:**
        1. **المسح المجهري (Micro-Scan):** حلل كل عنصر في الصورة (الأشخاص، الأشياء، الخلفية، النصوص). ما هي جودتها؟ ما هو تأثيرها النفسي؟
        2. **توزيع الانتباه (Attention Heatmap):** أين تذهب العين أولاً؟ ثانياً؟ ثالثاً؟ هل هذا التوزيع يخدم الهدف؟
        3. **سيكولوجية الألوان المتقدمة:** لا تكتفِ بذكر الألوان، بل حلل التباين، التشبع، وكيف تثير هذه الألوان مشاعر محددة (خوف، فضول، حماس).
        4. **تحليل الـ CTR المتوقع:** بناءً على ملايين الصور الناجحة، ما هي نسبة النقر المتوقعة؟ ولماذا؟
        5. **التكوين والنسب (Rule of Thirds, Golden Ratio):** هل التكوين متوازن؟ هل هناك فوضى بصرية؟
        
        **${getLangInstruction(lang, resultLang)} وبصيغة JSON فقط:**
        {
            "ctr_score": 85,
            "verdict": "حكم نهائي قاطع وشامل",
            "visual_hierarchy": "وصف دقيق للمسار البصري الذي تسلكه العين",
            "primary_emotion": "التحليل النفسي للمشاعر المثارة",
            "color_palette": ["#hex1", "#hex2", "#hex3"],
            "micro_analysis": [
                {"element": "العنصر 1", "analysis": "تحليل عميق جداً لهذا الجزء"},
                {"element": "العنصر 2", "analysis": "تحليل عميق جداً لهذا الجزء"}
            ],
            "actionable_fixes": [
                "تعديل جوهري 1 لزيادة النقر 200%",
                "تعديل جوهري 2 لتحسين الوضوح البصري"
            ],
            "seo_tags": ["كلمات مفتاحية بصرية مقترحة للصورة"]
        }
        `;
        
        const response = await withRetry(() => ai.models.generateContent({
            model: MODEL_SMART,
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: image.split(',')[1] } },
                    { text: prompt }
                ]
            },
            config: { responseMimeType: "application/json" }
        }));
        return cleanAndParseJson(response.text, null);
    } catch (e) { return null; }
};

export const generateOutlierAnalysis = async (title: string, views: string, avg: string, lang: 'en' | 'ar', resultLang?: ResultLanguage) => {
    try {
        const ai = getAi('generateOutlierAnalysis');
        const prompt = `
        **هوية النظام: مهندس الهندسة العكسية للفيروسات (VIRAL REVERSE-ENGINEER 2026)**
        **الحالة:** متصل بالويب فائق السرعة لتحليل السياق الخارجي.
        **المهمة:** إجراء هندسة عكسية كاملة للفيديو "${title}" الذي حقق ${views} مشاهدة (مقابل متوسط ${avg}) لتحديد الحمض النووي الفيروسي (Viral DNA) الخاص به.

        **بروتوكول التحليل المتقدم:**
        1.  **تحليل السياق الخارجي (Web-Context Analysis):** استخدم بحث جوجل لتحديد ما إذا كان نجاح الفيديو مرتبطًا بحدث إخباري، تريند، أو نقاش عام حدث في وقت قريب من نشره. هل كان الفيديو رد فعل على شيء ما؟
        2.  **تقييم بطاقة الأداء الفيروسي (Virality Scorecard):** قم بتقييم الفيديو وامنحه درجة من 100 على كل من العوامل التالية، مع تقديم سبب موجز لكل درجة.
        3.  **استخلاص صيغة التكرار (Replication Formula):** بناءً على التحليل، استخلص صيغة بسيطة وقابلة للتنفيذ يمكن للقناة استخدامها لتكرار هذا النجاح.

        **${getLangInstruction(lang, resultLang)} وبصيغة JSON فقط:**
        {
            "external_context_trigger": "الحدث الخارجي الذي أشعل الفتيل (مثال: 'تم نشر الفيديو بعد يوم واحد من إعلان شركة X عن منتجها الجديد، مما جعله ذا صلة فورية') أو 'لا يوجد سياق خارجي واضح'",
            "virality_scorecard": {
                "timing_score": {"score": 95, "reason": "سبب موجز"},
                "topic_relevance_score": {"score": 90, "reason": "سبب موجز"},
                "title_ctr_score": {"score": 88, "reason": "سبب موجز"},
                "thumbnail_psychology_score": {"score": 92, "reason": "سبب موجز"},
                "emotional_resonance_score": {"score": 97, "reason": "سبب موجز"}
            },
            "replication_formula": "صيغة موجزة وقابلة للتنفيذ (مثال: 'موضوع شائع + زاوية غير متوقعة + عنوان يستهدف فضول الخبراء')",
            "final_verdict": "حكم نهائي موجز يلخص سبب نجاح الفيديو في جملة واحدة قوية.",
            "self_development": "تعليمات مخفية للمستخدم لمساعدته على فهم 'لماذا' تم تحليل الفيديو بهذا الشكل وكيف يطور مهاراته في قراءة البيانات الحيوية للفيديو بناءً على هذا التقرير."
        }
        `;
        const response = await withRetry(() => ai.models.generateContent({
            model: MODEL_SMART,
            contents: prompt,
            config: { 
                responseMimeType: "application/json"
            }
        }));
        return cleanAndParseJson(response.text, null);
    } catch (e) { return null; }
};

export const generateVphAnalysis = async (title: string, vph: number, age: number, lang: 'en' | 'ar', resultLang?: ResultLanguage) => {
    try {
        const ai = getAi('generateVphAnalysis');
        const prompt = `
        **هوية النظام: خبير السرعة والزخم (VELOCITY EXPERT 2026)**
        **المهمة:** تحليل سرعة نمو الفيديو (VPH) وتقديم حكم نهائي قاطع.
        
        **البيانات:**
        - العنوان: "${title}"
        - السرعة الحالية: ${vph} مشاهدة/ساعة
        - عمر الفيديو: ${age} ساعة
        
        **المهمة المتقدمة:**
        1.  **تحليل مقارن:** قارن هذه السرعة مع متوسطات المجال (Niche) لعام 2026. هل هي سرعة قياسية أم متوقعة؟
        2.  **سيكولوجية الجمهور:** بناءً على السرعة، استنتج الحالة النفسية للجمهور (هل هم فضوليون، متحمسون، أم غير مهتمين؟).
        3.  **توصية استراتيجية:** قدم "حكم الجمهور" (Audience Verdict) و "خطوة قادمة" (Action Step) عملية جداً ومبنية على بيانات.
        
        **${getLangInstruction(lang, resultLang)} وبصيغة JSON فقط:**
        {
            "momentum_status": "حالة الزخم (مثلاً: انفجار خوارزمي وشيك، نمو عضوي صحي، مرحلة الاحتضار)",
            "audience_verdict": "حكم الجمهور بأسلوب ذكي وعميق يحلل سيكولوجية التفاعل الحالي (مثال: 'الجمهور فضولي لكنه لم يقتنع بعد، العنوان أقوى من المحتوى')",
            "action_step": "نصيحة عملية فورية وقابلة للتنفيذ خلال 5 دقائق (مثال: 'غير أول 3 ثوانٍ من الفيديو لشيء أكثر إثارة، العنوان الحالي يعد بالكثير')",
            "viral_potential_score": 92,
            "self_development": "تعليمات مخفية للمستخدم لمساعدته على فهم 'لماذا' تم تحليل الزخم بهذا الشكل وكيف يطور مهاراته في قراءة البيانات الحيوية للفيديو بناءً على هذا التقرير."
        }
        `;
        const response = await withRetry(() => ai.models.generateContent({
            model: MODEL_SMART,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return cleanAndParseJson(response.text, null);
    } catch (e) { return null; }
};

export const generateTimingAnalysis = async (title: string, pubDate: string, country: string, views: string, lang: 'en' | 'ar', resultLang?: ResultLanguage) => {
    try {
        const ai = getAi('generateTimingAnalysis');
        const prompt = `
        **الدور:** عالم بيانات يوتيوب وخبير سلوك المستخدمين.
        **المهمة:** تحليل كفاءة وقت النشر لهذا الفيديو.
        **البيانات:**
        - عنوان الفيديو: "${title}"
        - تاريخ ووقت النشر: ${pubDate}
        - الجمهور المستهدف/الدولة: ${country}
        - المشاهدات الحالية: ${views}
        
        **المطلوب:** تحليل عميق جداً لمدى ملاءمة وقت النشر مع سلوك الجمهور في تلك الدولة. هل كان الوقت مثالياً؟ لماذا؟
        
        **${getLangInstruction(lang, resultLang)} وبصيغة JSON فقط:**
        {
            "timing_score": 85,
            "verdict": "حكم نهائي على وقت النشر (ممتاز، سيء، يحتاج تعديل)",
            "audience_psychology": "التحليل النفسي للجمهور في هذا الوقت (ماذا كانوا يفعلون؟ هل كانوا مستعدين للمشاهدة؟)",
            "better_time_suggestion": "اقتراح وقت نشر أفضل ولماذا"
        }
        `;
        const response = await withRetry(() => ai.models.generateContent({
            model: MODEL_SMART,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return cleanAndParseJson(response.text, null);
    } catch (e) { return null; }
};

export const generateRegionTimingAnalysis = async (region: string, lang: 'en' | 'ar', resultLang?: ResultLanguage) => {
    try {
        const ai = getAi('generateRegionTimingAnalysis');
        const prompt = `
        **هوية النظام: خبير التوقيت العالمي (ATLAS STRATEGIST 2026)**
        **المهمة:** تحليل استراتيجي فائق العمق لأفضل وقت للنشر في منطقة: ${region}.
        
        **المتطلبات المتقدمة:**
        1.  **تحليل ثقافي وسلوكي:** ابحث عن العادات الثقافية الدقيقة (مثل أوقات الصلاة، العطلات الرسمية، المناسبات الاجتماعية) وأنماط استهلاك الإنترنت في "${region}" لعام 2026.
        2.  **سيكولوجية المشاهد:** حلل الحالة النفسية للمشاهدين في أوقات الذروة المختلفة (متى يكونون في حالة مزاجية للتعلم مقابل الترفيه؟ متى يكونون أكثر قابلية للشراء؟).
        3.  **استراتيجية المحتوى:** قدم "نصيحة ذهبية" استراتيجية لا تقتصر على الوقت، بل على نوع المحتوى الذي يجب نشره في ذلك الوقت تحديداً.
        
        **${getLangInstruction(lang, resultLang)} وبصيغة JSON فقط:**
        {
            "region_name": "${region}",
            "time_zone": "المنطقة الزمنية (مثال: GMT+3)",
            "golden_hour": "الساعة الذهبية الدقيقة (مثال: 8:15 مساءً)",
            "traffic_intensity": "كثافة المرور (مرتفعة جداً/متوسطة/منخفضة)",
            "psychological_context": "تحليل نفسي عميق لسبب نجاح هذا الوقت (مثال: 'وقت الاسترخاء بعد العشاء، حيث يكون المشاهد في حالة مزاجية تسمح بالتركيز على محتوى تعليمي طويل')",
            "best_content_type": "أفضل نوع محتوى لهذا الوقت (مثال: 'فيديو وثائقي عميق أو بودكاست تحليلي')",
            "strategic_tip": "نصيحة استراتيجية ذهبية ومفصلة للنشر في هذه المنطقة (مثال: 'انشر الفيديو قبل 90 دقيقة من الساعة الذهبية وقم بعمل بث مباشر تشويقي قبل 15 دقيقة')"
        }
        `;
        const response = await withRetry(() => ai.models.generateContent({
            model: MODEL_SMART,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return cleanAndParseJson(response.text, null);
    } catch (e) { return null; }
};

export const generateLiveForecast = async (title: string, subs: string, velocity: number, lang: 'en' | 'ar', resultLang?: ResultLanguage) => {
    try {
        const ai = getAi('generateLiveForecast');
        const prompt = `
        **هوية النظام: المحلل التنبؤي (PREDICTIVE ANALYST 2026)**
        **المهمة:** تقديم تنبؤ استراتيجي فائق الدقة ومباشر لنمو قناة يوتيوب.
        
        **البيانات المباشرة:**
        - اسم القناة: "${title}"
        - المشتركين الحاليين: ${subs}
        - سرعة النمو (مشترك/دقيقة): ${velocity}
        
        **المطلوب:**
        1.  **حسابات معقدة:** قم بإجراء عمليات حسابية متقدمة للتنبؤ بالوقت الدقيق للوصول للمحطة القادمة (Milestone)، مع الأخذ في الاعتبار تباطؤ النمو الطبيعي (Decay Rate).
        2.  **تحليل الزخم:** قدم تعليقاً حماسياً وواقعياً جداً حول حالة الزخم الحالية للقناة.
        3.  **رؤية استراتيجية:** قدم رؤية استراتيجية ذكية ومبتكرة للحفاظ على الزخم أو مضاعفته، مع ربطها بتريندات أو أحداث متوقعة في 2026.
        
        **${getLangInstruction(lang, resultLang)} وبصيغة JSON فقط:**
        {
            "next_milestone": "المحطة القادمة المنطقية (مثال: 1,000,000 مشترك)",
            "estimated_time": "الوقت المقدر للوصول (مثال: '3 أيام و 14 ساعة')",
            "growth_status": "حالة النمو الحالية (مثال: 'نمو أُسّي، حالة نادرة من الانفجار الفيروسي!')",
            "strategic_insight": "رؤية استراتيجية ذكية ومفصلة (مثال: 'استغل هذا الزخم بإطلاق منتج رقمي صغير خلال الـ 48 ساعة القادمة قبل أن يهدأ المنحنى')"
        }
        `;
        const response = await withRetry(() => ai.models.generateContent({
            model: MODEL_SMART,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return cleanAndParseJson(response.text, null);
    } catch (e) { return null; }
};

export const generateTrendForecast = async (niche: string, lang: 'en' | 'ar', resultLang?: ResultLanguage) => {
    try {
        const ai = getAi('generateTrendForecast');
        const prompt = `
        **هوية النظام: محلل التريندات المستقبلي (TREND FORECASTER 2026)**
        **المهمة:** التنبؤ بمواضيع المحتوى الفيروسي المستقبلية في مجال: "${niche}".
        
        **المتطلبات:**
        1. **تحليل سرعة البحث (Search Volume Velocity):** قم بتخمين البيانات لسرعة نمو مصطلحات البحث المتعلقة بالمجال واستنتاج المواضيع القادمة بقوة.
        2. **تحول المشاعر (Sentiment Shift):** حلل التوجهات الاجتماعية لتحديد ما إذا كان الجمهور يتجه نحو السلبية، الإيجابية، أو التعليم العميق.
        3. **5 مواضيع فيروسية:** قدم 5 مواضيع ذات إمكانية فيروسية عالية بناءً على التحليل أعلاه.
        
        **${getLangInstruction(lang, resultLang)} وبصيغة JSON فقط بالتنسيق التالي:**
        {
            "overall_sentiment": "شرح عام للمشاعر تجاه هذا المجال (مثال: 'انتقال من الحماس المفرط إلى الرغبة في التطبيق العملي الواقعي')",
            "momentum_score": 85, 
            "forecasted_topics": [
                {
                    "topic_name": "اسم الموضوع الدقيق المثير للفضول",
                    "search_velocity": "نمو بنسبة +350% في آخر 48 ساعة",
                    "sentiment_shift": "تحول من الشك إلى الفضول",
                    "action_plan": "خطة استراتيجية مصغرة لإنشاء المحتوى حول هذا الموضوع (ماذا يجب أن تغطي وماذا تتجنب)",
                    "chart_data": [
                        {"day": "Day 1", "volume": 12},
                        {"day": "Day 2", "volume": 25},
                        {"day": "Day 3", "volume": 45},
                        {"day": "Day 4", "volume": 68},
                        {"day": "Day 5", "volume": 95},
                        {"day": "Day 6", "volume": 140},
                        {"day": "Day 7", "volume": 210}
                    ]
                }
            ]
        }
        `;
        const response = await withRetry(() => ai.models.generateContent({
            model: MODEL_SMART,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return cleanAndParseJson(response.text, null);
    } catch (e) { return null; }
};

export const generateThumbnailPrompts = async (title: string, lang: 'en' | 'ar', resultLang?: ResultLanguage) => {
    try {
        const ai = getAi('generateThumbnailPrompts');
        const prompt = `
        You are an expert YouTube Thumbnail designer.
        The user wants to create a thumbnail for a video titled: "${title}".
        Generate two distinct, highly engaging visual concepts for the thumbnail. 
        Focus on strong contrast, emotional faces, clear focal points, and minimalist background.
        
        Concept A should be "Curiosity & Mystery" based.
        Concept B should be "Shock & Direct Value" based.
        
        Provide the output ONLY in JSON format:
        {
            "promptA": "detailed image generation prompt for concept A (in English)",
            "promptB": "detailed image generation prompt for concept B (in English)"
        }
        `;
        const response = await withRetry(() => ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return cleanAndParseJson(response.text, null);
    } catch (e) { return null; }
};

export const analyzeThumbnailAb = async (base64A: string, base64B: string, title: string, lang: 'en' | 'ar', resultLang?: ResultLanguage) => {
    try {
        const ai = getAi('analyzeThumbnailAb');
        const prompt = `
        **هوية النظام: خبير تحليل واختبار الصور المصغرة A/B (Thumbnail A/B Simulator)**
        **المهمة:** تحليل الصورتين المرفقتين (الصورة الأولى A والصورة الثانية B) المخصصتين لفيديو بعنوان: "${title}".
        
        **المتطلبات:**
        1. تحليل نظرية الألوان، التباين، والتركيز البصري.
        2. تحليل الانفعالات العاطفية والتفاعل المتوقع.
        3. توقع نسبة النقر إلى الظهور (CTR) لكلتا الصورتين (من 1 إلى 100).
        4. تحديد الفائز (A أو B) مع تقديم أسباب قوية.
        
        **${getLangInstruction(lang, resultLang)} وبصيغة JSON فقط بالتنسيق التالي:**
        {
            "winner": "A",
            "reasoning": "سبب فوز هذه الصورة باختصار",
            "analysisA": {
                "ctr_prediction": 12.5,
                "color_theory": "تحليل الألوان للنسخة A",
                "emotional_engagement": "تحليل التفاعل العاطفي للنسخة A",
                "strengths": ["نقطة قوة 1", "نقطة قوة 2"]
            },
            "analysisB": {
                "ctr_prediction": 14.2,
                "color_theory": "تحليل الألوان للنسخة B",
                "emotional_engagement": "تحليل التفاعل العاطفي للنسخة B",
                "strengths": ["نقطة قوة 1", "نقطة قوة 2"]
            }
        }
        `;
        
        const partA = { inlineData: { data: base64A.split(',')[1] || base64A, mimeType: "image/jpeg" } };
        const partB = { inlineData: { data: base64B.split(',')[1] || base64B, mimeType: "image/jpeg" } };
        
        const response = await withRetry(() => ai.models.generateContent({
            model: MODEL_SMART,
            contents: [prompt, partA, partB]
        }));
        
        const textResponse = response.text || '';
        return cleanAndParseJson(textResponse, null);
    } catch (e) { return null; }
};
