<div align="center">

# 📐 موجه التطوير التنفيذي — Build Specification

## وثيقة الأوامر الهندسية الكاملة لبناء منصة «مُثقّف | Muthaqaf AI Studio»

**موجه مُوجَّه لمطوِّر برمجيات (أو فريق تطوير) لبناء المنصة كاملة من الصفر — بلا افتراضات، بلا غموض**

وثيقة رقم MUTHAQAF-SPEC-001 • الإصدار 1.0 • هذه الوثيقة عقد تنفيذي: كل ما فيها «إلزامي» ما لم يُذكر عكس ذلك

</div>

---

# الفهرس

| # | القسم | المحتوى |
|---|---|---|
| 0 | [قواعد القراءة والالتزام](#0-قواعد-القراءة-والالتزام) | كيف تنفذ هذه الوثيقة |
| 1 | [المشروع والبيئة والاعتماديات](#1-المشروع-والبيئة-والاعتماديات) | حزمة العمل الكاملة |
| 2 | [نظام التصميم Design Tokens](#2-نظام-التصميم) | الهوية البصرية بالقيم الدقيقة |
| 3 | [نظام اللغة والترجمة](#3-نظام-اللغة-والترجمة) | ثنائية اللغة + لغة المخرجات |
| 4 | [العقد الأساسي — types.ts](#4-العقد-الأساسي-typests) | كل الواجهات والحقول |
| 5 | [طبقة التخزين المحلي](#5-طبقة-التخزين-المحلي) | كل المفاتيح بصيغتها |
| 6 | [خدمة Firebase والبيانات السحابية](#6-خدمة-firebase) | المجموعات والقواعد |
| 7 | [خدمة المفاتيح apiKeyService](#7-خدمة-المفاتيح) | إدارة وتدوير المفاتيح |
| 8 | [خدمة يوتيوب youtubeService](#8-خدمة-يوتيوب) | الاستراتيجيات الثلاث |
| 9 | [خدمة Gemini — geminiService](#9-خدمة-gemini) | 23 دالة + أنماط البرومبت |
| 10 | [محرك الحسابات algoService](#10-محرك-الحسابات) | الخوارزميات الحتمية |
| 11 | [الخادم الخلفي server.ts](#11-الخادم-الخلفي) | الـ Endpoints بعقودها |
| 12 | [محلل يوتيوب youtubeAnalyzer](#12-محلل-يوتيوب) | السكرابينج بالتفصيل |
| 13 | [السياقات الأربعة Contexts](#13-السياقات-الأربعة) | محرك المهام كاملاً |
| 14 | [الاستوديو الرئيسي CopilotStudio](#14-الاستوديو-الرئيسي) | الشاشة الأم وسلوكها |
| 15 | [الأدوات الـ 28 — مواصفة تنفيذية](#15-الأدوات-الـ-28--مواصفة-تنفيذية) | أداة بأداة بخطوات التنفيذ |
| 16 | [الأدوات المستقلة الـ 17](#16-الأدوات-المستقلة-الـ-17) | مواصفة كل شاشة |
| 17 | [مكونات القنوات الأربعة](#17-مكونات-القنوات-الأربعة) | الربط والتدقيق والمقارنة |
| 18 | [لوحة المستخدم والمكونات المساندة](#18-لوحة-المستخدم) | 9 مكونات + المساعدات |
| 19 | [الجودة والاختبار ومعايير القبول](#19-الجودة-والاختبار) | التعريف بـ«منتهي» |
| 20 | [خطة التنفيذ المرحلية](#20-خطة-التنفيذ-المرحلية) | 9 مراحل بترتيب الاعتماديات |

---

# 0. قواعد القراءة والالتزام

أيها المطوّر، هذه الوثيقة هي **أمر بناء**. التزم بما يلي:

1. **أسماء المعرّفات إلزامية:** الأسماء المذكورة (`geminiService`, `startJob`, `StorageKeys.CHANNEL_DATA`...) هي أسماء ملفات ودوال ومتغيرات **فعليّة** يجب أن تُطبق حرفياً، لأن كل شيء آخر في المنصة يعتمد عليها.
2. **الأرقام والقيم دقيقة:** القيم العددية (المهل، الحدود، نسب، ألوان HEX، مدد retry) تُطبق كما هي ما لم تُطلب تعديلات موثقة.
3. **كل ميزة لها: (واجهة + خط تنفيذ + تخزين + تسجيل نشاط + حالة خطأ عربية).** أي ميزة تنقصها واحدة من الخمسة غير مقبولة.
4. **لغة الواجهة ثنائية دائماً:** أي نص تقابله بين قوسين معقوفين «...» يُبنى كمفتاحين في `TRANSLATIONS` (نسخة `ar` ونسخة `en`).
5. **منع الـ CDN لكود التطبيق:** كل المكتبات تُثبَّت من npm وتُدار عبر Vite bundling. ممنوع import maps أو تحميل React من شبكات خارجية.
6. **منع process.env في كود المتصفح:** المتغيرات البيئية للخادم فقط؛ العميل يحصل على المفاتيح عبر الخدمات الموثقة.
7. **TypeScript صارم:** المشروع لا يُسلَّم إلا بـ `tsc --noEmit` نظيف تماماً (صفر أخطاء).

**تعريف «منتهي» (Definition of Done) لأي ميزة:**
- ✅ تعمل بالعربية والإنجليزية، وتحترم لغة المخرجات المستقلة.
- ✅ تعرض حالة تحميل وصفية بالعربية أثناء العمل، ورسالة خطأ عربية مفهومة عند الفشل.
- ✅ تخزّن نتيجتها في مفتاح Storage المناسب وتعيد عرضها عند العودة للشاشة.
- ✅ تسجل استخدامها عبر `logToolActivity`.
- ✅ تجتاز `npm run lint` وسيناريوهات القبول في القسم 19.

---

# 1. المشروع والبيئة والاعتماديات

## 1.1 بطاقة المشروع

| البند | القيمة |
|---|---|
| اسم الحزمة | `yt_xpert` |
| الوصف | Professional AI-Powered YouTube Intelligence & Content Creation Copilot |
| نوع التطبيق | SPA + خادم Express موحّد |
| منفذ التطوير والإنتاج | **3000** (إلزامي) |
| نمط المسارات | HashRouter — `/` و `/chat` كلاهما يفتح الاستوديو، وأي مسار آخر `Navigate replace` إلى `/` |

## 1.2 الاعتماديات (ثبّت هذه الإصدارات أو أحدث توافق)

**تشغيلية (dependencies):**

| الحزمة | الإصدار | دورها |
|---|---|---|
| `react` / `react-dom` | ^19.2.0 | إطار الواجهة |
| `react-router-dom` | ^7.9.6 | التوجيه (HashRouter) |
| `@google/genai` | latest | SDK Gemini من الخادم |
| `express` | ^5.2.1 | الخادم |
| `firebase` | ^12.13.0 | Auth + Firestore |
| `lucide-react` | ^0.554.0 | الأيقونات |
| `recharts` | ^3.8.1 | الرسوم البيانية |
| `motion` | ^12.38.0 | الحركات |
| `html2canvas` | latest | تصوير البطاقات PNG |
| `tsx` / `esbuild` | ^4.23 / ^0.28 | تشغيل وتجميع الخادم |

**تطويرية:** `vite` ^6.2.0، `@vitejs/plugin-react` ^5.0.0، `typescript` ~5.8.2، `@types/node` ^22.

## 1.3 ملفات الإعداد

**`tsconfig.json`** — إلزامي: `target: ES2022`، `module: ESNext`، `moduleResolution: bundler`، `jsx: react-jsx`، `lib: [ES2022, DOM, DOM.Iterable]`، `paths: { "@/*": ["./*"] }`، `noEmit: true`، `skipLibCheck: true`، `types: ["node", "vite/client"]`.

**`vite.config.ts`** — إلزامي:

```ts
server: { port: 3000, host: '0.0.0.0', allowedHosts: true },
plugins: [react()],
resolve: { alias: { '@': path.resolve(__dirname, '.') } }
```

**`package.json` scripts** — إلزامي:

```json
{
  "dev": "tsx server.ts",
  "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
  "start": "node dist/server.cjs",
  "lint": "tsc --noEmit"
}
```

**`.env.local`** (انسخه من `.env.example`):

```ini
VITE_YOUTUBE_API_KEY=   # اختياري: مفتاح YouTube Data API v3
GEMINI_API_KEY=         # مفتاح Gemini من جهة الخادم
```

## 1.4 نقطة دخول الخادم الواحد

الخادم (`server.ts`) هو **البوابة الوحيدة**: في التطوير يركّب Vite كـ middleware (`middlewareMode: true, appType: "spa", allowedHosts: true`)، وفي الإنتاج يقدم مجلد `dist` الثابت ويعالج كل المسارات عبر `app.get('*all')` بإرجاع `index.html`. المسارات `/api/*` تُعرَّف **قبل** تركيب الـ middleware دائماً. الاستماع على `0.0.0.0:3000`.

---

# 2. نظام التصميم

> أرضية الهوية: «Liquid Botanical Glass» — زجاج نباتي داكن فاخر. طبّق هذه القيم في `index.html` كمتغيرات CSS عامة + كلاسات جاهزة.

## 2.1 رموز الألوان

| الرمز | القيمة | الاستخدام |
|---|---|---|
| `--color-brand` | `#00ff9d` | لون العلامة «نعناع كهربائي» — أزرار، توهجات، تفاعلات |
| `--color-brand-glow` | `rgba(0, 255, 157, 0.3)` | توهج العلامة |
| `--color-dark` | `#050a09` | خلفية «أبنوس الغابة العميق» |
| `--color-leaf` | `#064e3b` | زمردي عميق — هالات الخلفية |
| `--glass-bg` | `rgba(8, 15, 12, 0.6)` | خلفية الزجاج |
| `--glass-border` | `rgba(255, 255, 255, 0.1)` | حواف الزجاج |
| لون النص الأساسي | `#e2e8f0` | body |

## 2.2 الخطوط (حمّلها من Google Fonts)

| الخط | الأوزان | الاستخدام | الكلاس |
|---|---|---|---|
| Space Grotesk | 300, 500, 700 | العناوين اللاتينية التقنية | `.font-space` |
| Outfit | 300, 400, 600, 800 | نص الجسم | `.font-outfit` (افتراضي body) |
| Alexandria | 400, 700, 900 | النصوص العربية الكبيرة | `.font-alex` |
| JetBrains Mono | افتراضي | الأرقام والإحصاءات | `.font-mono` |

## 2.3 الكلاسات الأساسية

**`.glass-panel`** — اللوحة الزجاجية العالمية (طبّقها حرفياً):
```css
background: rgba(10, 12, 11, 0.7);
backdrop-filter: blur(8px) saturate(130%);
border: 1px solid rgba(255,255,255,0.05);
box-shadow: 0 8px 24px -10px rgba(0,0,0,0.4);
border-radius: 2rem;
transition: transform 0.2s ease, border-color 0.2s ease;
will-change: transform; backface-visibility: hidden;
/* hover: */ border-color: rgba(0,255,157,0.2); transform: translateY(-2px);
```

**باقي النظام:**
- `.anim-fluid`: هالة شعاعية `radial-gradient(circle at center, var(--color-leaf), transparent 80%)` بحركة `fluid 30s ease-in-out infinite` (scale 0.9→1.1 + إزاحات ±2%).
- شريط تمرير مخصص بعرض 6px وthumb متدرج شفاف→نعناعي→شفاف.
- `html { scroll-behavior: smooth }`، `body { user-select: none; overflow-x: hidden; line-height: 1.6; isolation: isolate }`.
- تحسين أداء: `section, div.bento-zone { content-visibility: auto; contain-intrinsic-size: 500px; contain: layout style }`.
- تدرجات الفئات (Tailwind gradient classes) لكل مهارة — تُعرَّف في `skillsData.ts` حقل `color` (مثال: `from-blue-500 to-indigo-600`) مع `glowColor` مكافئ بصيغة rgba.
- أنماط طباعة: إخفاء الشوائب (aside/header/footer/أزرار) وتحويل اللوحات لخلفية بيضاء ونص أسود.
- `<html lang="en" class="dark">` مبدئياً، ويتحرك اتجاه النص `dir` مع اللغة (عربي = RTL).

---

# 3. نظام اللغة والترجمة

## 3.1 المبادئ

1. **النوعان:**
   - `type Language = 'en' | 'ar'` — لغة الواجهة.
   - `type ResultLanguage = 'auto' | 'ar' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko' | 'hi' | 'tr' | 'nl' | 'pl' | 'sv' | 'da' | 'fi' | 'el' | 'he'` — لغة مخرجات AI مستقلة (21 خياراً).
2. **`constants.ts` يصدّر `TRANSLATIONS: Record<Language, Translation>`** — قاموس مزدوج بحوالي **300+ مفتاح** يغطي كل نص في المنصة.
3. **`index.tsx` يصدّر خطاف `useLang(): { lang, setLang, t }`** — المصدر الوحيد للغة في كل المكونات (كل الملفات تستورده من `'../index'` أو `'../../index'`). يقرأ/يكتب `StorageKeys.LANG`، ويضبط `<html lang>` و`dir`.
4. **`utils/langMapper.ts` يصدّر `getLanguageName(code, uiLang)`** — يحوّل رمز ResultLanguage إلى اسم لغة مقروء («الألمانية»/«German»).
5. **`ResultLanguageSelector`** — قائمة منسدلة عالمية تُوضع في رأس كل أداة توليد نص.

## 3.2 تعليمة اللغة للنموذج (منطق إلزامي)

```
إذا resultLang = auto أو فارغ:
   ar → "يجب أن يكون الإخراج باللغة العربية" | en → "Output must be in English"
غير ذلك:
   "يجب أن يكون الإخراج باللغة {اسم اللغة من getLanguageName}"
```

هذه التعليمة تُلحق بكل system prompt في geminiService (انظر 9.2).

---

# 4. العقد الأساسي types.ts

> أنشئ `types.ts` بهذه الواجهات **حرفياً** — هي العقود التي تتشاركها كل الخدمات والمكونات.

## 4.1 بيانات يوتيوب الخام (متوافقة مع YouTube Data API v3)

```ts
ChannelStats      { viewCount, subscriberCount, hiddenSubscriberCount, videoCount }  // strings
ChannelSnippet    { title, description, customUrl, publishedAt, thumbnails{default,medium,high}, country?, localized? }
ChannelBranding   { image?: { bannerExternalUrl? } }
ChannelContentDetails { relatedPlaylists: { uploads } }
ChannelData       { id, snippet, statistics, brandingSettings, contentDetails }

VideoStats        { viewCount, likeCount, favoriteCount, commentCount }
VideoSnippet      { publishedAt, channelId, title, description, thumbnails{medium,high,maxres?}, channelTitle, tags?, categoryId, defaultLanguage?, defaultAudioLanguage? }
VideoContentDetails { duration, dimension, definition, caption, licensedContent, projection }
VideoData         { id, snippet, statistics, contentDetails }
```

## 4.2 عناصر القناة المُسحوبة والتحليل

```ts
ChannelVideoItem  { id, title, views: string, publishedTime: string, thumbnail,
                    duration?: string, url: string, type?: 'long'|'short', estimatedVPH?: number }

ChannelAnalysisReport {
  summary: string
  nicheCategory: string
  subNiches: string[]
  contentPillars: string[]
  contentTone: string
  targetAudience: { persona, ageGroup, painPoints: string[], interestTopics: string[] }
  seoAnalysis: { score: number /*0-100*/, topKeywords: string[], topHashtags: string[],
                 titleFormulasUsed: string[], descriptionStrengths: string[], descriptionImprovements: string[] }
  swot: { strengths[], weaknesses[], growthOpportunities[], threatsOrPitfalls[] }
  contentStrategy: { recommendedUploadSchedule, idealVideoLength, shortFormStrategy,
                     retentionAdvice, estimatedRPM, estimatedMonthlyRevenue }
  suggestedViralIdeas: { title, hook, concept, format: 'Long-Form'|'Shorts', estimatedCtrPotential }[]
  verdictScore: number      // 0-100
  overallGrade: 'S'|'A+'|'A'|'B'|'C'
}

LinkedChannel {
  id, userId?, url, handle, title, avatar, banner?, verified?,
  subscriberCount, videoCount, viewCount?, description, country?, joinedDate?,
  links?: { title, url }[], recentVideos: ChannelVideoItem[],
  analysis: ChannelAnalysisReport, linkedAt: number, lastUpdated: number
}
```

## 4.3 أنواع التحليل الجدولي والنفسي

```ts
VideoIdea     { title, score, type }
ScheduleAnalysis { consistencyScore: number /*0-100*/, frequentDays: string[], frequentHours: string[],
                   isConsistent: boolean, timezone: string, nextPredictedUpload: string }
Demographic   { ageGroup, gender, genderLabel /*Localized*/ }
WeeklyScheduleItem {
  dayName, hour: number, timeStr,
  strength: 'viral'|'excellent'|'good'|'weak', strengthLabel,
  demographics: Demographic, isTopDay: boolean,
  actionType: 'publish'|'research'|'scripting'|'community'|'rest', actionLabel
}
AudiencePersona {
  segments: { new, casual, loyal },            // أرقام
  contentPreferences: { new: string[], casual: string[], loyal: string[] },
  formats: { shorts, videos, live },
  devices: { mobile, desktop, tv },
  demographics: { age: Record<string, number> /*"18-24": 40*/, gender: { male, female } },
  geography: { country, percent }[],
  languages: string[], otherChannels: string[],
  onlineActivity: string, growthDrivers: string[]
}
```

## 4.4 سجل النشاط

```ts
ActivityLogEntry {
  id: string, timestamp: number,
  actor: { id /*userId أو process*/, name },
  action: string,
  target: { type /*'channel'|'video'|'seo'...*/, id, title },
  payload: Record<string, any>,
  meta: { severity: 'info'|'warn'|'error', version: number }
}
```

## 4.5 أنواع علم النفس المتقدمة

```ts
OutlierPsychology { trigger, packaging_secrets: string[], emotional_hook, replication_strategy }
VphPsychology     { momentum_status /*Explosive|Decaying|Evergreen*/, audience_verdict, action_step }
```

---

# 5. طبقة التخزين المحلي

أنشئ `services/storageService.ts` يصدّر: `saveToStorage(key, value)`، `loadFromStorage<T>(key): T | null`، `clearStorageKey(key)`، والكائن الثابت `StorageKeys`. التخزين JSON serialization كامل مع try/catch لكل عملية. **هذه مفاتيحه الإلزامية:**

## 5.1 مفاتيح البيانات (تُبنى بدالة تضم المعرف — بادئة `tv_`)

| المفتاح | الصيغة | يخزن |
|---|---|---|
| `LANG` | `tubeview_lang` | لغة الواجهة |
| `CHANNEL_DATA(id)` | `tv_data_{id}` | بيانات قناة API |
| `CHANNEL_HEALTH(id)` | `tv_health_{id}` | نتائج فحص صحة |
| `CHANNEL_AI(id)` | `tv_ch_ai_{id}` | تقرير التدقيق AI للقناة |
| `VIDEO_DATA(id)` | `tv_video_{id}` | بيانات فيديو API |
| `VIDEO_AI(id)` | `tv_vid_ai_{id}` | التحليل العميق للفيديو |
| `TIMING_AI(id)` | `tv_time_ai_{id}` | تحليل توقيت فيديو |
| `ATLAS_AI(id)` | `tv_atlas_ai_{id}` | تحليل الأطلس الزمني |
| `LIVE_AI(id)` | `tv_live_ai_{id}` | توقع العداد الحي |
| `EARNINGS_AI(id)` | `tv_earn_ai_{id}` | تقرير واقعية الأرباح |
| `COMPETITOR(id)` | `tv_comp_{id}` | تحليل المنافسين |
| `IDEAS(id)` | `tv_ideas_{id}` | الأفكار المولدة |
| `PLAN(id)` | `tv_plan_{id}` | خطة النمو |
| `OUTLIERS(id)` | `tv_outliers_{id}` | قائمة الـ Outliers |
| `EARNINGS(id)` | `tv_earn_{id}` | حسابات الأرباح |
| `VPH(id)` | `tv_vph_{id}` | نتائج VPH |
| `SEO(id)` | `tv_seo_{id}` | مخرجات السيو |
| `AUDIENCE(id)` | `tv_aud_dna_{id}` | شخصية الجمهور |
| `SCRIPT(id)` | `tv_script_{id}` | السكريبت المولد |

## 5.2 مفاتيح آخر حالة (استعادة تلقائية عند فتح الصفحة)

`LAST_VIEWED_CHANNEL`، `LAST_VIEWED_VIDEO`، `LAST_VIEWED_TIMING`، `LAST_VIEWED_ATLAS`، `LAST_VIEWED_LIVE`، `LAST_VIEWED_COMPETITOR`، `LAST_VIEWED_IDEAS`، `LAST_VIEWED_PLAN`، `LAST_VIEWED_OUTLIERS`، `LAST_VIEWED_EARNINGS`، `LAST_VIEWED_VPH`، `LAST_VIEWED_SEO`، `LAST_VIEWED_AUDIENCE`، `LAST_VIEWED_LIVE_PAGE`، `LAST_GEN_IMAGE`، `LAST_VIEWED_SCRIPT` — كلها ثابتة بادئها `tv_last_`.

## 5.3 محادثات وحالة عامة

| المفتاح | الغرض |
|---|---|
| `IDEAS_CHAT_HISTORY` / `SCRIPTS_CHAT_HISTORY` / `PLANNER_CHAT_HISTORY` / `SEO_CHAT_HISTORY` | ذاكرة محادثة كل ورشة |
| `STRATEGIC_ARCHIVE` | أرشيف لقطات النتائج الاستراتيجية |
| `CHAT_MESSAGES_SCOPED(scope)` | `tv_chat_history_{scope المنظف}` — محادثة كل مسار |
| `CHAT_MESSAGES` | `tv_chat_history_perm` — المحادثة الدائمة |
| `SECTION_STATE(section)` | `tv_state_{section}` — حالة أي قسم (عبر خطاف `useSectionState` في AppStateContext) |
| `ACTIVE_JOBS` | `tv_active_jobs` — حالات المهام الجارية |

---

# 6. خدمة Firebase

## 6.1 التهيئة (`services/firebase.ts`)

1. اقرأ الإعداد من `firebase-applet-config.json` (المشروع + `firestoreDatabaseId` لقاعدة بيانات مسماة).
2. `initializeApp` ثم **`getFirestore(app, firebaseConfig.firestoreDatabaseId)`** (قاعدة مسماة — حرجة) و`getAuth(app)`.
3. `GoogleAuthProvider` مع النطاقات: `https://www.googleapis.com/auth/tasks` و`https://www.googleapis.com/auth/gmail.send`.
4. **الصادرات الإلزامية:** `db, auth, googleProvider, cachedAccessToken/getAccessToken, signInWithGoogle() (popup + كاش التوكن + منع تسجيل متوازٍ عبر promise واحد), logOut(), OperationType {CREATE,UPDATE,DELETE,LIST,GET,WRITE}, handleFirestoreError(error, op, path) (ترجمة كل أكواد Firestore لرسائل عربية حسب العملية ثم throw), testConnection(), logToolActivity(...), fetchToolActivityLogs(toolId?)`.

## 6.2 بنية المجموعات (Firestore)

| المسار | المحتوى |
|---|---|
| `users/{uid}` | ملف المستخدم: `uid, email` (تحقق صرامة في القواعد) |
| `user_api_keys/{userId}` | مفاتيح المستخدم: youtube/gemini + طوابع زمنية |
| `linked_channels/{channelId}` | قنوات المستخدم المرتبطة (`LinkedChannel` كاملة) |
| مسار السجلات الديناميكي | وثائق `ActivityLogEntry` لكل استخدام أداة |

## 6.3 قواعد الأمان (`firestore.rules`) — إلزامية

```
- القاعدة الافتراضية: allow read, write: if false  (قفل شامل)
- isSignedIn(): request.auth != null
- isValidId(id): string ≤128 حرف يطابق ^[a-zA-Z0-9_\-]+$
- التحقق من كل وثيقة قبل القبول:
  • users: يجب أن تحوي uid وemail وuid == request.auth.uid وemail ≤256
  • سجلات النشاط: يجب أن تحوي (id, userId, toolId, toolName, action, timestamp, payload)
    وuserId == request.auth.uid وحدود طول صارمة (id/toolId ≤64, toolName/action ≤128)
  • user_api_keys: تحقق مالك مماثل
```

---

# 7. خدمة المفاتيح

أنشئ `services/apiKeyService.ts` (استيراد من `firebase.ts` و`constants.ts`):

## 7.1 الصادرات والعقود

```ts
interface KeyHealth { ok: boolean; source: 'user'|'env'|'default'; masked: string }

subscribeToKeysChange(cb: () => void): void      // pub-sub ينبّه الواجهة عند أي تغيير
loadUserApiKeys(userId): Promise<void>            // جلب من user_api_keys + تعبئة الكاش
saveUserApiKeys(userId, youtubeApiKey, geminiApiKey): Promise<void>
getCachedUserKeys(): { youtube?: string; gemini?: string }
getYouTubeApiKey(): string     // أولوية: المستخدم → VITE_YOUTUBE_API_KEY → YOUTUBE_API_KEYS[0] الافتراضي
getGeminiApiKey(): string      // أولوية: المستخدم → فارغ (الخادم يعوّضه بمفتاحه)
logApiUsage(service, endpoint): Promise<void>     // توثيق استهلاك
fetchApiUsageLogs(): Promise<...>                  // قراءة السجلات
loadUsageStatistics(userId): Promise<...>          // إحصاءات اللوحة الشهرية
callWithRetryAndBackoff<T>(fn, service, endpoint, retries?, delay?): Promise<T>
```

## 7.2 منطق إعادة المحاولة الأسّي (إلزامي)

- عند `429/403 quotaExceeded` أو خطأ شبكة: أعِد المحاولة حتى 3 مرات بتأخير متضاعف (ابدأ 1000ms واضاعف كل مرة، مع jitter).
- الخدمتان المتأثرتان: `'youtube'` و`'gemini'` (نقطة القياس `gemini_content_generation`).
- بعد استنفاد المحاولات: أرجع null/ارفع خطأ مفهوماً — لا تعطل الواجهة أبداً.

## 7.3 مؤشرات الصحة في الواجهة

صدّر `youtubeHealth` و`geminiHealth` (قراءة KeyHealth للعرض في `LiquidGlassHeader`) — تُحدَّث عبر `subscribeToKeysChange`.

---

# 8. خدمة يوتيوب

أنشئ `services/youtubeService.ts`:

```ts
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

fetchYoutubeData(endpoint, params): Promise<any|null>
```
1. ابنِ الرابط: `{BASE_URL}/{endpoint}?{params}&key={getYouTubeApiKey()}`.
2. لفّ الطلب داخل `callWithRetryAndBackoff(..., 'youtube', endpoint)`.
3. **الحالات:** `403/429` → ارمِ خطأ `quotaExceeded: Status ...` (ليُعاد المحاولة)؛ `404` → أرجع `null` فوراً؛ أي غير ok → خطأ نصي؛ بعد استنفاد المحاولات أرجع `null` (لا تكسر الواجهة).

```ts
fetchChannelData(input: string): Promise<ChannelData|null>
```
**جلب القناة بثلاث استراتيجيات متتالية — إلزامي:**
1. **معرف مباشر:** يبدأ بـ `UC` وطوله 24 → `channels?part=snippet,statistics,brandingSettings,contentDetails&id={input}`.
2. **معرف يد:** يبدأ بـ `@` → `channels?...&forHandle={encoded}`.
3. **بحث احتياطي (الحل السحري):** `search?part=snippet&type=channel&q={input}&maxResults=1` ← خذ `channelId` من أول نتيجة ← اجلب تفاصيله الكاملة. يسمح للمستخدم بكتابة «اسم القناة» نصاً حرّاً.

```ts
fetchVideoData(videoId): Promise<VideoData|null>
// videos?part=snippet,statistics,contentDetails&id={videoId} → items[0] أو null

fetchLatestContentMixed(channelId): Promise<{ latestVideo, latestShort }>
```
1. حوّل معرف القناة لقائمة الرفع: `UC...` → `UU...` واجلب `playlistItems?part=snippet&playlistId={UU}&maxResults=50`.
2. إن فشل (404/فارغ): اجلب `channels?part=contentDetails&id={id}` وخذ `relatedPlaylists.uploads` الحقيقي وأعد المحاولة.
3. اجلب تفاصيل كل الفيديوهات بنداء `videos?...&id={ids مضمومة بفواصل}`.
4. **افصل:** أحدث **فيديو طويل** (المدة > 60 ثانية) وأحدث **Short** (≤ 60 ثانية، بقراءة `duration` بعد `parseISO8601Duration`).

---

# 9. خدمة Gemini

أنشئ `services/geminiService.ts` — قلب المنصة الذكي.

## 9.1 الثوابت والبنية التحتية

```ts
const MODEL_SMART = 'gemini-3.8-flash';
const MODEL_FAST  = 'gemini-3.8-flash';
const MODEL_IMAGE = 'gemini-3.1-flash-image';
```

- **`getAi(toolName)`** يرجع غلافاً بواجهة `@google/genai`: كل نداء `generateContent` يُحوَّل إلى `POST /api/gemini` مع `model, contents, systemInstruction` + ترويسة `x-gemini-api-key: getGeminiApiKey()`، ملفوفاً في `withRetry` (يعاود عبر `callWithRetryAndBackoff(...,'gemini','gemini_content_generation')` بأسّ).
- **`getLangInstruction(lang, resultLang)`** — كما في القسم 3.2.
- **`cleanAndParseJson(text, defaultVal)`** — إلزامي بهذا الترتيب: trim ← إزالة أسوار ` ```json ` و ` ``` ` ← تقطيع من **أول `{` إلى آخر `}`** ← `JSON.parse` داخل try؛ عند فشل: `console.warn` + أرجع `defaultVal` (لا تكسر أبداً).

## 9.2 نمط البرومبت الموحد (طبّقه على كل دالة)

```
1. هوية خبير: "أنت {شخصية الخبير}..." بقواعد صارمة للأسلوب.
2. سياق المدخلات: بيانات القناة/الفيديو/نص المستخدم منسقاً.
3. تعليمة المهمة بدقة + قواعد ممنوعات.
4. صيغة الإخراج: "أعد النتيجة كـ JSON فقط بهذا الهيكل: {...}" (وصف الحقول حرفياً).
5. ألحق getLangInstruction(lang, resultLang).
6. parse عبر cleanAndParseJson مع default احتياطي آمن.
```

## 9.3 كتالوج الدوال الـ 23 (التوقيع + مخرجات JSON المطلوبة)

| # | الدالة | المدخلات | المخرجات (JSON) |
|---|---|---|---|
| 1 | `chatWithGemini(history, message, lang, options{fast,think,search}, image?)` | سجل رسائل + نص + صورة base64 اختيارية | **نص حر** (ليس JSON). `think` → MODEL_SMART وإلا MODEL_FAST؛ لغة الرد = لغة آخر رسالة مستخدم |
| 2 | `generateChannelAudit(channelData, lang, resultLang?)` | `ChannelData` | `ChannelAnalysisReport` كاملاً (القسم 4.2) |
| 3 | `generateCompetitorDeepDive(...)` | قناتان/بيانات منافس | تحليل استخباراتي عميق + فجوات |
| 4 | `generateEarningsAudit(title, desc, viewCount, country, lang, resultLang?)` | بيانات فيديو | تقرير واقعية الأرباح + توصيات رفع RPM |
| 5 | `generateVideoDeepAnalysis(videoData, lang, resultLang?)` | `VideoData` | تشريح كامل (SEO/احتباس/مصغرة/عنوان) |
| 6 | `generateAdvancedSeo(query, type, lang, resultLang?)` | كلمة مفتاحية + نوع | عناوين + وصف + وسوم مرتبة |
| 7 | `generateAiTitles(topic, lang, resultLang?)` | موضوع | حزمة عناوين فيروسية مصنفة |
| 8 | `generateAiVideoIdeas(channelTitle, channelDesc, recentTitles[], keywords[], lang, resultLang?, topic?, options?{creativityLevel, targetAudience, videoFormat})` | سياق القناة + معايير إبداع | 5 أفكار: عنوان + زاوية + مصغرة مقترحة + تنفيذ |
| 9 | `generateCustomGrowthPlan(title, desc, stats, lang, resultLang?)` | قناة + إحصاءات | خطة نمو مرحلية |
| 10 | `generateCompetitorAnalysis(title?, desc?, recent[], keywords[], lang, resultLang?, nicheInput?)` | قناتك + منافس | فجوات وفرص |
| 11 | `generateAudienceDeepDive(title, desc, recent[], lang, resultLang?)` | قناة | `AudiencePersona` (4.3) |
| 12 | `generateViralScript(...)` | موضوع + نبرة + مدة | سكريبت كامل (هوك/أقسام/خاتمة/توجيهات) |
| 13 | `generateBananaImage(prompt, mode, aspectRatio, lang, resultLang?)` | وصف + نمط | صورة (base64) — mode: `thumbnail` يحقن برومبت «سينمائية يوتيوب 16:9 بإضاءة دراماتيكية وتشبع عالٍ ومساحة عنوان» |
| 14 | `editBananaImage(baseImage, prompt, aspectRatio, lang, resultLang?, overlay1?, overlay2?)` | صورة + تعليمات | صورة معدلة + تراكب نصي للمصغرات |
| 15 | `analyzeImageDeeply(image, lang, resultLang?)` | صورة base64 | تحليل بصري نقدي مفصل |
| 16 | `generateOutlierAnalysis(title, views, avg, lang, resultLang?)` | فيديو شاذ | `OutlierPsychology` (4.5) |
| 17 | `generateVphAnalysis(title, vph, age, lang, resultLang?)` | أرقام VPH | `VphPsychology` + تشخيص |
| 18 | `generateTimingAnalysis(title, pubDate, country, views, lang, resultLang?)` | فيديو منشور | حكم التوقيت + المشاهدات الضائعة |
| 19 | `generateRegionTimingAnalysis(region, lang, resultLang?)` | بلد/منطقة | أسبوع نشر ذهبي كامل |
| 20 | `generateLiveForecast(title, subs, velocity, lang, resultLang?)` | عداد حي | توقع نمو + لحظات محطات |
| 21 | `generateTrendForecast(niche, lang, resultLang?)` | نيش | مواضيع + `chart_data` (زخم 7 أيام للـ AreaChart) + مشاعر |
| 22 | `generateThumbnailPrompts(title, lang, resultLang?)` | عنوان | **مفهومان بصريان متنافسان** (برومبتان جاهزان للتوليد) |
| 23 | `analyzeThumbnailAb(base64A, base64B, title, lang, resultLang?)` | مصغرتان | حكم سيكولوجي + CTR متوقع لكل واحدة + الفائز |

---

# 10. محرك الحسابات

أنشئ `services/algoService.ts` — خوارزميات حتمية **بدون أي AI** (نتائج فورية قابلة للتكرار). مصادرها: `CPM_RATES` و`COUNTRY_TIMEZONES` من constants، وأنواع 4.3.

| الدالة | التوقيع | المنطق الإلزامي |
|---|---|---|
| `detectNiche` | `(title, desc, tags[]) → string` | قوائم كلمات مفتاحية لكل نيش (جيمنج/تقنية/مال/تعليم/طبخ...) ← أول تطابق يفوز، وإلا `general` |
| `getSeasonalityMultiplier` | `() → number` | حسب الشهر الحالي: Q4 (أكتوبر–ديسمبر) أعلى مضاعف، الصيف أقل — قيم بين ~0.9 و~1.3 |
| `calculateComplexRevenue` | `(views, engagementRate, country, context) → تفصيل` | `views × CPM(البلد){min,max} × engagement × seasonality × niche-context` — أرجع نطاقاً (من/إلى) لا رقماً واحداً |
| `estimateEarnings` | `(views, country='US', tags[]) → سريع` | تقدير أدسنس فوري من CPM فقط |
| `generateSmartTitles` | `(baseTitle) → string[5]` | 5 صيغ قواعد: سؤال فضول، رقم/قائمة، تحذير/خطأ، مقابل/مقارنة، تحدي زمن |
| `generateKeywords` | `(title, desc) → string[]` | تقطيع + تركيبات + كلمات طويلة الذيل |
| `detectOutliers` | `(videos: VideoData[]) → قائمة` | احسب متوسط مشاهدات القناة ← الفيديو الذي يتجاوز المتوسط **بمضاعف عتبة قياسية** هو Outlier؛ أرجع لكل شاذ: المضاعف، المشاهدات، المتوسط |
| `analyzeAdvancedAudienceTiming` | `(videos, country, lang) → تحليل` | جمّع ساعات النشر التاريخية ← ذروات التفاعل الزمنية حسب `COUNTRY_TIMEZONES` |
| `analyzeChannelUploadPattern` | `(videos, country, lang) → ScheduleAnalysis` | consistencyScore من توزيع الأيام، frequentDays/Hours، توقع الرفع القادم |
| `generateWeeklySchedule` | `(videos, country, lang, channelTitle) → WeeklyScheduleItem[]` | أسبوع كامل: قوة كل فتحة (viral/excellent/good/weak) + demographic + إجراء (publish/research/scripting/community/rest) |
| `generateVideoIdeas` | `(niche) → VideoIdea[]` | أفكار احتياطية فورية عند غياب AI |
| `calculateWinProbability` | `(قناةA, قناةB, سياق) → نسبة` | مزيج: مشتركين، متوسط مشاهدات، VPH، اتجاه النمو ← نسبة مئوية لكل طرف |

---

# 11. الخادم الخلفي

أنشئ `server.ts` بـ Express 5 (استيراد `createServer` من Vite و`GoogleGenAI` من `@google/genai` و`{ scrapeYouTubeChannel, performDeepChannelAiAudit }` من `./server/youtubeAnalyzer`):

```
app.use(express.json({ limit: '10mb' }))   // لاستيعاب صور base64
```

## 11.1 `GET /api/health`
→ `200 { "status": "ok" }`

## 11.2 `POST /api/gemini` — بروكسي Gemini المؤمّن

**الطلب:** `{ model?, contents, systemInstruction?, userApiKey? }` + ترويسة اختيارية `x-gemini-api-key`.

**سلسلة المفاتيح (بالترتيب):**
1. `clientKey = header['x-gemini-api-key'] || body.userApiKey`
2. `serverKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY`

**تعقيم إلزامي لكل مفتاح:** trim ← إزالة اقتباسات طرفية `" '` ← ارفض: فارغ، `undefined`، `null`، ما يحوي `YOUR_`، الأقصر من 10 أحرف، والمكرر.

**لا مفاتيح صالحة؟** → `400` برسالة عربية: «مفتاح Gemini API غير متوفر أو غير صالح. يرجى إدخال مفتاح صالح في لوحة التحكم (Settings / API Keys) أو إضافة GEMINI_API_KEY في Secrets.»

**سلسلة الموديلات:**
```
مطلوب يحوي '3.5' → حوّله إلى 'gemini-3.8-flash'
isImageModel (الاسم يحوي 'image'):
   [المطلوب, 'gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image']
نصي:
   [المطلوب, 'gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash', 'gemini-2.5-flash']
```

**حلقة التنفيذ (إلزامية بهذا التداخل):** لكل مفتاح ← أنشئ `GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } })` ← لكل موديل ← محاولتان:
- نجاح → `res.json({ ...response, text: response.text })` وارجع فوراً.
- رسالة تحوي `API_KEY_INVALID`/`API key not valid` → اقطع حلقة الموديلات وانتقل للمفتاح التالي.
- `503 / high demand / UNAVAILABLE / 429 / RESOURCE_EXHAUSTED` → المحاولة الأولى: انتظر **400ms** وأعد نفس الموديل؛ الثانية: انتقل للموديل التالي.
- أي فشل آخر → انتقل للموديل التالي.

**الاستنفاد الكامل:** → `res.status(lastError?.status || 500).json({ error: lastError?.message || 'Failed to generate content from Gemini', status })`.

**اللوجging:** طباعة `[Gemini Proxy] Processing request. Candidate keys count: N` (بدون كشف المفاتيح أبداً) و`[Gemini Proxy] Model X (attempt n) failed: msg` لكل فشل.

## 11.3 `POST /api/youtube/analyze-by-url`

**الطلب:** `{ urlOrHandle, lang = 'ar', userApiKey? }`.

1. تحقق: `urlOrHandle` نص غير فارغ ← وإلا `400`: «يرجى إدخال رابط القناة أو المعرف (@handle) بشكل صحيح.»
2. `scraped = await scrapeYouTubeChannel(urlOrHandle.trim())` مع لوج `[YouTube Analyzer] Starting crawl for: "..."`.
3. `aiReport = await performDeepChannelAiAudit(scraped, lang, clientKey || undefined)`.
4. ابنِ `channelRecord` بمعرف `ch_{Date.now()}_{random5}`: كل حقول `LinkedChannel` (url, handle, title, avatar, banner, subscriberCount, videoCount, description, country, joinedDate, links, recentVideos, analysis: aiReport, linkedAt, lastUpdated).
5. → `200 { success: true, channel: channelRecord }`.
6. أي خطأ → `500 { error: err?.message || 'فشل في تحليل القناة. يرجى التأكد من صحة الرابط والمحاولة مجدداً.' }`.

---

# 12. محلل يوتيوب

أنشئ `server/youtubeAnalyzer.ts` بثلاث صادرات:

## 12.1 `normalizeYouTubeUrl(input) → { channelUrl, videosUrl, handle }`

تعامل مع كل الصيغ: `@handle` مجردة، `youtube.com/@handle`، `youtube.com/channel/UC...`، `youtube.com/c/name`، `youtube.com/user/name`، روابط بمعاملات زائدة. الناتج: رابط القناة الموحد + رابط تبويب `/videos` + الـ handle النظيف (regex: `pathname.match(/@([^/?#]+)/)`).

## 12.2 `scrapeYouTubeChannel(urlOrHandle) → ScrapedRawChannel` — بدون أي مفتاح API

1. **اجلب HTML** `channelUrl` ثم `videosUrl` بـ `fetch` عادي (مع try/catch لكل طلب — فشل أحدهما لا يقتل العملية، طبّع `[YouTube Scraper] Fetch ... error`).
2. **استخرج Meta:** لكل خاصية (title, description, image...) جرّب ثلاثة regex بالترتيب:
   `<meta property="{p}" content="...">` ← `<meta content="..." property="{p}">` ← `<meta name="{p}" content="...">`.
3. **استخرج `ytInitialData`:**
   `html.match(/var\s+ytInitialData\s*=\s*({.+?});<\/script>/s)` ← أو `window["ytInitialData"] = ...` ← ثم `JSON.parse`.
4. **استخرج الإحصاءات من HTML الخام بـ regex متدرج:**
   - المشتركون: `"subscriberCountText":{"simpleText":"..."}` ← نسخة accessibility ← نمط عربي `"content":"[0-9.,KMBkmb]+ (subscribers|مشترك|مشتركاً|مشتركين)"`.
   - عدد الفيديو، بلد، تاريخ الانضمام، الروابط الخارجية — بنفس فلسفة الأنماط المتعددة.
5. **آخر 30 فيديو** من شجرة `ytInitialData` (tab videos → richGridRenderer items): id, title, views, publishedTime, thumbnail, duration, url، و`type: 'long'|'short'`.
6. **Fallbacks إلزامية:** عنوان افتراضي = الـ handle؛ صورة رمزية احتياطية: `https://ui-avatars.com/api/?name={handle}&background=0D9488&color=fff&size=200&bold=true`؛ وصف افتراضي «قناة يوتيوب رسمية للمنشئ {handle}». **لا ترمِ خطأً إلا إذا استحال كل شيء.**

## 12.3 `performDeepChannelAiAudit(scraped, lang, apiKey?) → ChannelAnalysisReport`

مرر السجل المُسحوب لنموذج ذكي عبر نفس بروكسي/مفاتيح القسم 11.2 وابنِ `ChannelAnalysisReport` (القسم 4.2) بنمط البرومبت الموحد (9.2) — التحليل: ملخص، نيش، أعمدة محتوى، نبرة، جمهور مستهدف، SEO Score، SWOT، استراتيجية (جدول نشر/طول مثالي/شورتس/احتباس/RPM متوقع)، 5+ أفكار فيروسية، verdictScore وoverallGrade.

---

# 13. السياقات الأربعة

## 13.1 `AuthContext` (`contexts/AuthContext.tsx`)

- يلفّ `auth/signInWithGoogle/logOut` + `loadUserApiKeys(uid)` عند كل تغيير مستخدم.
- يصدّر `useAuth(): { user, loading, signIn, signOut }`.

## 13.2 `AppStateContext`

- حالة واجهة مُداومة عبر storageService.
- **يصدّر خطاف `useSectionState(section, initial)`** — زوج `[state, setState]` يُخزَّن تلقائياً في `StorageKeys.SECTION_STATE(section)` عند كل تغيير ويُستعاد عند التركيب. كل الأدوات المستقلة تعتمد عليه.

## 13.3 `ChannelContext`

- الحالة: `activeChannel: LinkedChannel | null` + `linkedChannels: LinkedChannel[]`.
- عند البدء: اقرأ من localStorage وFirestore (`linkedChannelService`)؛ استعادة آخر قناة نشطة من `LAST_VIEWED_CHANNEL`.
- الوظائف: `addChannel(urlOrHandle, lang)` (نداء `/api/youtube/analyze-by-url` ← حفظ محلي + سحابي)، `removeChannel(id)`، `updateChannel(id)` (إعادة سحب وتحديث `lastUpdated`)، `setActiveChannel(id)`.
- يصدّر `useChannel()` (ارمِ خطأ إن استُخدم خارج المزود).

## 13.4 `JobContext` — محرك المهام (الأهم)

```ts
type JobStatus = 'idle' | 'loading' | 'success' | 'error';
type ToolType = 'competitor' | 'planner' | 'ideas' | 'outliers' | 'audience' | 'script' | 'image' | 'seo'
              | 'outlier_analysis' | 'vph_analysis' | 'channel_audit' | 'video_audit' | 'timing_audit'
              | 'atlas_audit' | 'live_audit' | 'earnings_audit';   // 16 نوعاً

interface JobState { status: JobStatus; currentId: string | null; error?: string; result?: any }
interface JobContextType {
  jobs: Record<ToolType, JobState>;
  startJob(tool, input, lang, resultLang, options?): Promise<void>;
  resetJob(tool): void;
}
```

**مطابقة المهمة (المرحلة 1 — توحيد المدخل):**

| المجموعة | الأدوات | المعالجة |
|---|---|---|
| قنوات | competitor, planner, ideas, outliers, audience, channel_audit, live_audit, earnings_audit | `extractId(input)` → إن وُجد id صالح استخدمه؛ وإلا نص حر: لِـ planner/outliers/audience/channel_audit/live_audit/earnings_audit جرّب `fetchChannelData(input)` فإن وجد قناة استخدم `channel.id` وإلا ألغِ بصمت |
| فيديو | video_audit, timing_audit | `extractId` ← اقبل النوع `video` فقط |
| نص | atlas_audit | النص كما هو (منطقة/بلد) |

**المرحلة 2 — التنفيذ (لأداة):** اضبط `{status:'loading', currentId, error:undefined, result:undefined}` ← نفّذ حسب الجدول:

| الأداة | مسار التنفيذ | التخزين عند النجاح |
|---|---|---|
| earnings_audit | خذ `{title, desc, viewCount, country}` من options ← `generateEarningsAudit` | `EARNINGS_AI(id)` |
| live_audit | خذ `{channelTitle, currentSubs, velocity}` ← `generateLiveForecast` | `LIVE_AI(id)` |
| atlas_audit | **كاش أولاً:** إن وجد `ATLAS_AI(id)` اعرضه فوراً؛ وإلا `generateRegionTimingAnalysis` | `ATLAS_AI(id)` |
| channel_audit | `fetchChannelData` ← `generateChannelAudit` | `CHANNEL_AI(id)` |
| video_audit | `fetchVideoData` ← `generateVideoDeepAnalysis` | `VIDEO_AI(id)` |
| timing_audit | `fetchVideoData` ← `generateTimingAnalysis` | `TIMING_AI(id)` |
| vph_analysis | `fetchVideoData` ← حساب VPH محلي ← `generateVphAnalysis` | `VPH(id)` |
| outlier_analysis | بيانات فيديو شاذ ← `generateOutlierAnalysis` | `OUTLIERS(id)` |
| competitor | `generateCompetitorAnalysis` (+ DeepDive) | `COMPETITOR(id)` |
| planner | `generateCustomGrowthPlan` | `PLAN(id)` |
| ideas | `generateAiVideoIdeas` | `IDEAS(id)` |
| audience | `generateAudienceDeepDive` | `AUDIENCE(id)` |
| script | `generateViralScript` | `SCRIPT(id)` |
| seo | `generateAdvancedSeo` | `SEO(id)` |
| image | `generateBananaImage` / `editBananaImage` | `LAST_GEN_IMAGE` |
| outliers | `detectOutliers` (محلي) ثم تفصيل شاذ بالـ AI | `OUTLIERS(id)` |

**المرحلة 3 — الإنهاء:** نجاح → `{status:'success', result}` + حفظ التخزين؛ فشل → `{status:'error', error: رسالة عربية}`. كل النتائج تُقرأ من الكاش فور رجوع المستخدم للأداة (استعادة كاملة للجلسة).


---

# 14. الاستوديو الرئيسي

أنشئ `components/copilot/CopilotStudio.tsx` — الشاشة الأم (`/` و `/chat`).

## 14.1 التخطيط

1. **رأس القناة:** `ChannelHeaderSelector` (القناة النشطة: صورة + إحصاءات + تبديل) + زر `LinkedChannelsManagerModal`.
2. **منطقة المحادثة:** سياق القناة النشطة + اقتراحات سريعة + سجل محفوظ.
3. **رصيف المهارات `SkillDock`:** شريط سفلي تفاعلي يعرض الـ 28 مهارة بأيقونة lucide وتدرج لوني لكل واحدة، مصنفة بفلاتر الفئات الأربع، بتكبير hover (أسلوب Dock).
4. **نافذة المهارات `SkillsModal`:** عند اختيار مهارة — تعرض العنوان الكامل، الوصف، حقل الإدخال بـ `placeholderAr/En`، و**البرومبتات المقترحة الثلاثة** (`suggestedPromptsAr/En`) كأزرار جاهزة.
5. **منطقة النتائج:** تُعرض في الودجات (15.3).

## 14.2 سلوك تنفيذ المهارة (التدفق الإلزامي)

```
اختيار مهارة → SkillsModal → إدخال المستخدم → بدء التنفيذ:
- لوّح المراحل للواجهة عبر loadingPhase (نصوص عربية وصفية) مثال:
  '2/3 توليد الصورتين المصغرتين بالذكاء الاصطناعي (قد يستغرق 10-15 ثانية)...'
  'جاري توليد الصورة المصغرة بدقة 16:9 استوديو سينمائي...'
- المسارات الخاصة:
  • channel_audit + mastermind → مسار التدقيق العميق للقناة (12.3)
  • thumbnail_ab → generateThumbnailPrompts ← توليد صورتين ← analyzeThumbnailAb
- النتيجة → الودجت المناسب + logToolActivity + حفظ التخزين
```

## 14.3 skillsData.ts — سجل المهارات

صدّر `SKILLS_LIST: SkillItem[]` — كل عنصر إلزامي به:

```ts
{ id, titleAr, titleEn, shortTitleAr, shortTitleEn, descAr, descEn,
  icon (lucide), color (tailwind gradient), glowColor (rgba),
  category: 'growth'|'content'|'seo'|'analytics',
  placeholderAr, placeholderEn, suggestedPromptsAr[3], suggestedPromptsEn[3],
  systemPromptAr?, systemPromptEn? }
```

## 14.4 الودجات السبعة (`components/copilot/widgets/`)

| الودجت | يعرض | مميزات |
|---|---|---|
| `TrendForecastCard` | مواضيع التريند | **Recharts AreaChart** لزخم 7 أيام لكل موضوع + شارات اتجاه |
| `ThumbnailAbCard` | المصغرتان A/B جنباً لجنب | صور + تحليل سيكولوجي + CTR متوقع + شارة الفائز |
| `ThumbnailGenCard` | المصغرة المولدة | معاينة 16:9 + تحميل + إعادة توليد |
| `ViralScriptCard` | السكريبت | أقسام منسقة (هوك/جسم/خاتمة) + نسخ |
| `SeoCard` | حزمة السيو | عناوين + وصف + وسوم بأزرار نسخ فردي ونسخ الكل |
| `IdeasBankCard` | الأفكار الخمس | عنوان + زاوية + مصغرة مقترحة + تنفيذ |
| `ChannelAuditCard` | تقرير التدقيق | أيقونات (BarChart2, ShieldAlert, CheckCircle2, TrendingUp, Users, Eye, Target, Sparkles) + **زر تحميل PNG عبر html2canvas** |

---

# 15. الأدوات الـ 28 — مواصفة تنفيذية

> لكل أداة: **المعرف/الفئة/الرمز** كما في skillsData، ثم: الواجهة، خط التنفيذ (بأسماء الدوال الحقيقية)، التخزين، ومعيار القبول.
> الفئات: 🚀 growth (9) • 🎬 content (11) • 🔍 seo (2) • 📊 analytics (6). كلها: تبديل لغة + ResultLanguageSelector + تسجيل نشاط.

## 🚀 فئة النمو

### 15.1 `trend_forecasting` — تنبؤ التريند والسرعة الفيروسية
- **واجهة:** حقل «أدخل مجال قناتك أو الكلمة المفتاحية...» + 3 برومبتات مقترحة.
- **التنفيذ:** `generateTrendForecast(niche)` ← نظف JSON ← `TrendForecastCard` بمخطط الزخم.
- **تخزين:** مفتاح القسم (SECTION_STATE). **قبول:** يظهر ≥3 مواضيع ولكل موضوع chart_data قابلية رسم AreaChart.

### 15.2 `thumbnail_ab` — محاكي المصغرات A/B
- **واجهة:** حقل «أدخل عنوان الفيديو أو فكرته لاختبار...».
- **التنفيذ (3 مراحل بعرض loadingPhase):** 1/3 `generateThumbnailPrompts(title)` ← 2/3 توليد الصورتين (كل منهما `generateBananaImage(mode:'thumbnail', '16:9')` — اعرض «قد يستغرق 10-15 ثانية») ← 3/3 `analyzeThumbnailAb(imgA, imgB, title)` ← `ThumbnailAbCard`.
- **قبول:** صورتان ظاهرتان + CTR متوقع + فائز معلن.

### 15.3 `thumbnail_gen` — توليد مصغرات سينمائية 16:9
- **التنفيذ:** `generateBananaImage(prompt, mode='thumbnail', '16:9')` ← `ThumbnailGenCard` (تحميل + إعادة توليد + تعديل بـ `editBananaImage`). **قبول:** الصورة نسبة 16:9 فعلياً.

### 15.4 `viral_script` — كاتب الاسكريبتات الفيروسية
- **التنفيذ:** `generateViralScript(topic, tone, duration...)` ← `ViralScriptCard`. **تخزين:** `SCRIPT(id)`. **قبول:** يحوي هوك أول 15 ثانية مميزاً + أقساماً زمنية + خاتمة CTA.

### 15.5 `retention_pacing` — محلل احتباس المشاهدين
- **التنفيذ:** لصق السكريبت ← برومبت تشخيص نقاط الهبوط بالثواني ← خريطة حرارية تقديرية + حلول إيقاعية. **قبول:** مواضع مشكلة بنسب ثوانٍ + علاج لكل موضع.

### 15.6 `shorts_repurpose` — محرك التدوير لشورتس
- **التنفيذ:** برومبت استخراج 3–5 مقاطع: توقيت + هوك + نص شاشة + وصف ووسوم. **قبول:** 3–5 مقاطع، لكل منها هوك مستقل.

### 15.7 `broll_director` — مخرج B-Roll والمؤثرات
- **التنفيذ:** برومبت تحويل فقرات السكريبت إلى Shot List مرقمة + توقيتات SFX/موسيقى. **قبول:** جدول لقطات قابل للتسليم لمونتير.

### 15.8 `curiosity_calibrator` — معاير الرهانات وفجوة الفضول
- **التنفيذ:** برومبت مدرسة MrBeast/Veritasium: رفع الرهان + فجوة فضول تُغلق بالنهاية. **قبول:** الفكرة قبل/بعد + قيمة رهان أعلى بوضوح.

### 15.9 `narrative_arc` — مهندس البناء السردي
- **التنفيذ:** رحلة البطل ثلاثية الفصول على محتوى تعليمي/وثائقي + نقاط تعليق قبل الإعلانات. **قبول:** هيكل فصول كامل بلحظة تحول.

### 15.10 `dopamine_trigger` — مقياس الدوبامين
- **التنفيذ:** خريطة شحنة عاطفية كل ~45 ثانية + إعادة ترتيب مقترحة. **قبول:** توزيع زمني بصري للمحفزات.

### 15.11 `eye_tracking_sim` — هندسة مسار النظرة
- **التنفيذ:** وصف عناصر المصغرة ← مسار بصر (أول التفاتة←...←النهاية) + تقييم النقطة البؤرية + إعادة تكوين. **قبول:** مسار مرقم + توصيات تكوين.

### 15.12 `visual_branding` — البصمة البصرية
- **التنفيذ:** نيش + أسلوب مفضل ← دليل هوية: ألوان، خطوط، قالب مصغرة ثابت، إضاءة، زوايا. **قبول:** لوحة ألوان بأكواد HEX.

### 15.13 `podcast_strategist` — مستشار البودكاست
- **التنفيذ:** ضيف + موضوع ← أسئلة غير تقليدية + لحظات صراحة + Chapters تشويقية. **قبول:** ≥10 أسئلة مقسمة فصول.

## 🔍 فئة السيو

### 15.14 `seo_tools` — خبير السيو والعناوين
- **التنفيذ:** `generateAdvancedSeo(query, type)` ← `SeoCard`: عناوين + وصف مُهندَس (السطران الأولان) + وسوم بثلاث طبقات (عامة/متوسطة/طويلة الذيل) + نسخ بنقرة. **تخزين:** `SEO(id)`. **قبول:** ≥10 عنوان و≥20 وسم.

### 15.15 `global_localization` — التعريب والوصول العالمي
- **التنفيذ:** عنوان+وصف ← إعادة صياغة (ليست ترجمة حرفية) لأعلى لغات CPM: EN/ES/DE (+ غيرها). **قبول:** لكل لغة: عنوان + وصف متوافقان ثقافياً.

## 📊 فئة التحليلات و🚀 تكملة النمو

### 15.16 `algorithm_predictor` — محاكي الخوارزمية
- **التنفيذ:** فكرة فيديو ← تشخيص مصدر الزيارات الأمثل (Browse/Suggested/Search) + ضبط العنوان والمصغرة والبنية لخدمته. **قبول:** مصدر واحد معلن + 3 تعديلات موجهة له.

### 15.17 `viral_ideas` — بنك الأفكار
- **التنفيذ:** `generateAiVideoIdeas(...)` بمعايير الضبط (creativityLevel/targetAudience/videoFormat) ← `IdeasBankCard` ← تخزين `IDEAS(id)` وأرشفة بالبنك. **قبول:** 5 أفكار غير متشابهة بزوايا مختلفة.

### 15.18 `channel_audit` — فحص القناة الشامل
- **التنفيذ:** مسار JobContext `channel_audit` (13.4) ← `ChannelAuditCard` بصحة رقمية + SWOT + خطة إنقاذ. **قبول:** verdictScore 0–100 + grade حرفي.

### 15.19 `timing_atlas` — المجهر الزمني وأفضل الأوقات
- **التنفيذ:** مسار `atlas_audit`: **كاش أولاً** ← `generateRegionTimingAnalysis(region)` ← أسبوع ذهبي بالساعات لكل يوم/منطقة. **تخزين:** `ATLAS_AI(region)`. **قبول:** جدول 7 أيام قابل للتنفيذ.

### 15.20 `sponsor_pitch` — مولد عروض الرعاية
- **التنفيذ:** شركة + نيش + مشاهدات ← إيميل عرض احترافي + باقات تسعير (مقطع/متكامل/كامل) + نصائح تفاوض. **قبول:** إيميل جاهز للإرسال (وزره يفتح المسار المتكامل مع Gmail — 16.4).

### 15.21 `earnings_lab` — مختبر الأرباح والـ RPM
- **التنفيذ:** مسار `earnings_audit` (options: title/desc/viewCount/country) ← `generateEarningsAudit` فوق حسابات `calculateComplexRevenue` المحلية ← AdSense + رعايات متوقعة + سبل مضاعفة RPM. **تخزين:** `EARNINGS_AI(id)`. **قبول:** نطاقا أرباح (من–إلى) لا رقم واحد.

### 15.22 `digital_products` — مهندس المنتجات الرقمية
- **التنفيذ:** نيش + خبرة ← مسار تحويل (مشاهد←مشترك←عميل): فكرة منتج + تسعير + خطة إطلاق + محتوى ترويجي. **قبول:** قمع كامل بمراحل مرقمة.

### 15.23 `community_booster` — صائد الردود وتنشيط المجتمع
- **التنفيذ:** موضوع ← تعليق مثبت + استطلاعات + ردود لأول 100 تعليق. **قبول:** تعليق مثبت واحد قوي + 3 استطلاعات.

### 15.24 `audience_dna` — سيكولوجية الجمهور
- **التنفيذ:** مسار `audience` ← `generateAudienceDeepDive` ← `AudiencePersona` كاملة (segments/formats/devices/age/gender/geography/growthDrivers). **تخزين:** `AUDIENCE(id)`. **قبول:** النسب المئوية مجموعها 100 لكل مجموعة.

### 15.25 `competitor_recon` — استخبارات المنافسين
- **التنفيذ:** مسار `competitor` ← `generateCompetitorAnalysis` (+DeepDive) + `calculateWinProbability` ← فجوات المواضيع غير المغطاة + خطة استحواذ. **تخزين:** `COMPETITOR(id)`.

### 15.26 `outliers_hunter` — صائد الفيديوهات المتفجرة
- **التنفيذ:** `detectOutliers` محلياً على فيديوهات القناة ← لكل شاذ: المضاعف + `generateOutlierAnalysis` → `OutlierPsychology` (المحفز النفسي/أسرار الغلاف/الحل العاطفي/استراتيجية النسخ). **تخزين:** `OUTLIERS(id)`. **قبول:** مضاعف رقمي واضح لكل شاذ.

### 15.27 `mastermind` — بروتوكول العقل المدبر 360°
- **التنفيذ:** رابط قناة ← مسار التدقيق العميق الكامل (12.3) بـ**9 مستويات مسح**: (1) هوية وتموضع (2) صحة SEO (3) جودة الغلاف والعناوين (4) إيقاع النشر (5) ثغرات المحتوى (6) فرص النمو (7) تحويل الجمهور (8) تحقيق الدخل (9) خطة 90 يوماً ← بطاقة استخباراتية تفاعلية قابلة للتحميل PNG. **قبول:** المستويات التسعة كلها ممثلة في البطاقة + زر تحميل يعمل.

### 15.28 `versus_architect` — مستشار المواجهات
- **التنفيذ:** طرفان ← بنية صدامية متحيزة بجرأة محسوبة + نقاط اشتعال نقاش + عنوان متحيز. **قبول:** 5+ نقاط اشتعال قابلة للتعليق.

---

# 16. الأدوات المستقلة الـ 17

> شاشات كاملة خارج الاستوديو. كل واحدة: تُحمَّل حالتها عند الفتح (كاش + LAST_VIEWED)، وتحفظ عبر `useSectionState` أو مفاتيحها، وتسجل نشاطها.

## 16.1 `ChatAssistant` + `ChatPage` — المساعد العائم وصفحة المحادثة
- **التنفيذ:** `chatWithGemini(history, message, lang, {fast, think, search}, image?)` + وعي سياقي: عند الحاجة يسحب `fetchChannelData` و`fetchLatestContentMixed` و`estimateEarnings` و`detectOutliers` محلياً ثم يضمّن النتائج في سياق الرد.
- تخزين `CHAT_MESSAGES_SCOPED(scope)` أو `CHAT_MESSAGES` + زر مسح (`clearStorageKey`).
- **قبول:** يرد بلغة رسالة المستخدم دائماً + يستخدم DEFAULT_API_KEY بأمان + يعرض أخطاء الشبكة برسالة عربية.

## 16.2 `ImageGenerator` — استوديو الصور
- **نمطان:** `thumbnail` (يقفل `16:9` ويحقن برومبت المصغرة السينمائية) و`normal` (حر: 1:1/9:16/4:3...).
- **7 أساليب إلزامية** بقيم البرومبت: MrBeast (High Saturation)، Cinematic، Minimalist، Gaming، 3D Render، Dark/Horror، Comic Book — كما استُخرجت حرفياً.
- **ميزات:** رفع صورة ← `editBananaImage`؛ تحليل صورة ← `analyzeImageDeeply`؛ تنزيل؛ استعادة آخر توليد من `LAST_GEN_IMAGE`.

## 16.3 `VphTool`
- مدخل: رابط فيديو (أو أحدث فيديو/شورت للقناة عبر `fetchLatestContentMixed`) ← `calculateVPH` + `calculateAge` + `parseISO8601Duration` + `formatDetailedDuration` ← نتيجة + نصائح `VPH_TIPS_EXPANDED` ← `generateVphAnalysis` للتشخيص. تخزين `VPH(id)`.

## 16.4 `Planner`
- خطة محتوى بالـ AI (`generateCustomGrowthPlan` عبر مسار planner) + تعديل يدوي + **تصدير `exportPlanToGoogleTasks`** (Tasks API) + **إرسال بالبريد `sendEmail`** (Gmail API) + ذاكرة `PLANNER_CHAT_HISTORY` + تخزين `PLAN(id)`.

## 16.5 `ScriptWriter`
- ورشة متعددة الأقسام (هوك/مقدمة/فقرات/خاتمة) بـ`useSectionState` لكل قسم + تحسين قسم بقسم بـ `chatWithGemini` + تخزين `SCRIPT(id)` + `SCRIPTS_CHAT_HISTORY`.

## 16.6 `SeoTools` / 16.7 `IdeaGenerator`
- ورشتان كاملتان لمخرجات 15.14 و15.17 بحفظ تلقائي (`SEO(id)`/`IDEAS(id)`) ومحادثات مخصصة (`SEO_CHAT_HISTORY`/`IDEAS_CHAT_HISTORY`).

## 16.8 `EarningsCalculator`
- مدخلان: يدوي (مشاهدات/نيش/بلدان) أو تلقائي (قناة/فيديو بالرابط) ← `detectNiche` + `calculateComplexRevenue` + `estimateEarnings` + `generateEarningsAudit` ← تفصيل AdSense + رعايات + توصيات. تخزين `EARNINGS(id)`/`EARNINGS_AI(id)`.

## 16.9 `LiveCounter`
- `fetchChannelData` ← عدّاد لحظي للمشتركين/المشاهدات بمحاكاة نبض (زيادات سلسة) + `generateLiveForecast` لتوقع النمو. تخزين `LIVE_AI(id)` + `LAST_VIEWED_LIVE`.

## 16.10 `VideoAnalyzer`
- رابط فيديو ← `fetchVideoData` ← `analyzeVideoSEO` + VPH + مدة + أداء/عمر + `generateVideoDeepAnalysis` (مسار video_audit) + نصائح VPH. تخزين `VIDEO_DATA`/`VIDEO_AI`.

## 16.11 `VideoTimingInsight`
- فيديو منشور ← وقت النشر مقابل `COUNTRY_TIMEZONES` وجمهور القناة ← `generateTimingAnalysis`: كم مشاهدة ضاعت بسبب الساعة. تخزين `TIMING_AI(id)`.

## 16.12 `GlobalBestTimes`
- بلدان الجمهور (متعدد) ← `generateRegionTimingAnalysis` (مسار atlas_audit بكاش أولاً) ← أسبوع نشر كامل. تخزين `ATLAS_AI(region)`.

## 16.13 `Outliers`
- قناة ← `fetchLatestContentMixed`/فيديوهات حديثة ← `detectOutliers` ← بطاقات شاذة ← تفصيل AI. تخزين `OUTLIERS(id)`.

## 16.14 `AudienceDeepDive` + `AudienceInsights`
- نسختان متكاملتان: الأولى `generateAudienceDeepDive` (سيكولوجيا)، الثانية `analyzeAdvancedAudienceTiming` + `generateWeeklySchedule` + `analyzeChannelUploadPattern` (سلوك وتوقيت وجدول أسبوعي بالقوة الرباعية).

## 16.15 `CompetitorAnalysis`
- قناتك + منافس ← مقارنة بصرية شاملة + `calculateWinProbability` + `generateCompetitorAnalysis`/`DeepDive` + فجوات قابلة للاستغلال. تخزين `COMPETITOR(id)`.

## 16.16 `Guidelines` — الدليل المعرفي
- **14 قسمًا تعليمياً** بالمعرفات: idea_generator, script_writer, seo_tools, planner, image_generator, vph_tool, earnings_lab, live_counter, competitor_analysis, audience_deep_dive, outliers, video_timing, global_timing, activity_logs — محتوى منهجي «كيف تفكر» لكل أداة، بفهرس وتنقل داخلي.

## 16.17 `PromptsShowcase`
- معرض برومبتات احترافية مصنفة بزر نسخ لكل واحدة (لاستخدامها داخل المنصة أو خارجياً).

## مساعدات عامة

| المكوّن | المواصفة |
|---|---|
| `Tooltip` | تلميح عائم موحد (يُستخدم في ~15 شاشة) — انعكاس ذكي عند الحواف |
| `SlowMotionScroll` | تحسين التمرير العام — يُركّب في App فوق الـ Router |
| `LiquidGlassHeader` | شريط علوي زجاجي: تبديل اللغة + ResultLanguageSelector + **مؤشرات صحة المفاتيح** (`youtubeHealth/geminiHealth` + `subscribeToKeysChange`) + دخول/خروج |
| `Layout` | هيكل صفحات عام (رأس + مساحة + ChatAssistant عائم) |
| `ResultLanguageSelector` | منسدل الـ 21 لغة — يُضمن في كل شاشة توليد |
| `ActivityLogs` | سجل النشاط: `fetchToolActivityLogs(toolId?)` + فلترة + Recharts (AreaChart للاستخدام + أيقونات لكل أداة) |

---

# 17. مكونات القنوات الأربعة

## 17.1 `ChannelHeaderSelector`
شريط رأس دائم: صورة القناة النشطة + اسم + مشتركون + منتقي بين القنوات المرتبطة + زر إضافة قناة + زر مدير القنوات.

## 17.2 `LinkedChannelsManagerModal`
- إضافة: حقل رابط/handle ← `addChannel` (نداء `/api/youtube/analyze-by-url` مع لوج المراحل) ← بطاقة جديدة بحالة تحميل مرحلية.
- عرض القنوات: خاصّة/منافسة، آخر تحديث، إجراءات: (تعيين نشطة / تحديث إعادة سحب / حذف) — كل إجراء يلمس localStorage وFirestore معاً.
- **قبول:** ربط قناة برابط يعمل ويملأ كل الحقول بما فيها recentVideos وanalysis.

## 17.3 `ChannelDeepAuditModal`
- تشغيل تدقيق عميق على قناة مرتبطة (إعادة استخدم `analysis` المحفوظ أو حدّثه) ← عرض `ChannelAnalysisReport` كامل التبويبات (ملخص/SWOT/SEO/استراتيجية/أفكار) + زر تحميل PNG.

## 17.4 `ChannelComparisonModal`
- اختيار قناتين ← مقارنة بصرية لكل المؤشرات + **`calculateWinProbability`** بشارة فوز + توصيات المعركة القادمة.

---

# 18. لوحة المستخدم

`components/UserDashboard.tsx` يجمع 9 مكونات من `components/dashboard/`:

| # | المكوّن | المواصفة |
|---|---|---|
| 1 | `DashboardHeader` | تحية باسم المستخدم + ملخص حالة |
| 2 | `UsageChart` | Recharts للاستخدام الشهري من `loadUsageStatistics` |
| 3 | `RecentActivities` | آخر 10 عمليات من سجل النشاط بأوقاتها وأيقوناتها |
| 4 | `QuickLinks` | اختصارات الأدوات الأكثر استخداماً |
| 5 | `AccountStatus` | حالة الحساب + المفاتيح المربوطة |
| 6 | `ApiKeyManager` | نموذج حفظ مفاتيح YouTube/Gemini ← `saveUserApiKeys` (تنقية المدخلات + إخفاء بالعرض masked + تنبيه نجاح/فشل عربي) |
| 7 | `MilestonesWidget` | إنجازات وأرقام قياسية من `loadFromStorage(StorageKeys...)` |
| 8 | `GoalSetting` | أهداف عددية (مشتركين/مشاهدات) + تقدم حالي |
| 9 | `BrandThemeSettings` | تخصيص هوية العلامة داخل المنصة عبر `useAppState` |

**مكملات:** `AuthContext` يغذي كل ما سبق بالهوية؛ `ActivityLogs` الشاشة الكاملة للسجل (16-جدول المساعدات).

---

# 19. الجودة والاختبار

## 19.1 بوابات آلية (لا تسليم بدونها)

```bash
npm run lint                      # tsc --noEmit: صفر أخطاء
node scripts/checkModules.mjs     # زاحف شجرة الموديولات: كل import يتحول 200 JS، صفر مراجع CDN
node scripts/renderTest.mjs       # jsdom + Vite SSR: #root > 100 حرف، صفر أخطاء runtime
```

## 19.2 سيناريوهات القبول اليدوية (E2E)

1. **الإقلاع:** فتح `/` يرسم الاستوديو بالعربية خلال ≤3 ثوانٍ — لا صفحة بيضاء ولا أخطاء كونسول.
2. **اللغة:** تبديل ar/en يقلب كل النصوص واتجاه الصفحة فوراً ويُحفظ بعد التحديث.
3. **ربط قناة:** لصق رابط صالح ← تظهر القناة ببياناتها + 30 فيديو + تحليل كامل؛ تبقى بعد تحديث الصفحة.
4. **مهمة كاملة:** تشغيل channel_audit ← تحميل وصفى ← بطاقة نتيجة ← تغلق التطبيق وتفتح ← النتيجة مستعادة من الكاش.
5. **A/B:** تشغيل thumbnail_ab ← مرحلتا تحميل الظاهرتان ← مصغرتان + CTR + فائز.
6. **سقوط المفاتيح:** بدون مفتاح Gemini، أي أداة AI تعرض الرسالة العربية الإرشادية (لا كراش).
7. **quota:** محاكاة 429 ← retry أسّي ← نجاح أو رسالة مفهومة.
8. **التصدير:** زر PNG في ChannelAuditCard/Mastermind ينزّل صورة صحيحة.
9. **تسجيل النشاط:** بعد أي أداة، سطر جديد في ActivityLogs بتفاصيل العملية.
10. **الطباعة:** صفحة التدقيق بالمعاينة للطباعة تخرج نظيفة أبيض/أسود.

---

# 20. خطة التنفيذ المرحلية

> ابنِ بالترتيب — كل مرحلة تعتمد على سابقتها فقط:

| المرحلة | النطاق | مخرجها القابل للإثبات |
|---|---|---|
| **M1** | الهيكل: package.json + tsconfig + vite + index.html (نظام التصميم) + index.tsx (useLang) + App.tsx (Router + مزودات فارغة) + types.ts + storageService + constants (TRANSLATIONS + CPM_RATES + COUNTRY_TIMEZONES + VPH_TIPS_EXPANDED + YOUTUBE_API_KEYS) | صفحة زجاجية داكنة تبديل لغة يعمل |
| **M2** | الخادم: server.ts الثلاث endpoints + youtubeAnalyzer (12) | curl للـ health والتحليل يرجع سجل قناة |
| **M3** | الخدمات: firebase + apiKeyService + youtubeService + geminiService + algoService + langMapper | نداءات خدمة ناجحة من كونسول مؤقت |
| **M4** | السياقات: Auth + AppState + JobContext + ChannelContext | ربط قناة حقيقي من الواجهة يعمل ويُخزن |
| **M5** | الاستوديو: CopilotStudio + SkillDock + SkillsModal + skillsData (28) + الودجات السبعة | تنفيذ 5 مهارات أساسية من الواجهة |
| **M6** | الأدوات المستقلة (16) دفعة أولى: ImageGenerator, VphTool, EarningsCalculator, VideoAnalyzer, Outliers | كل شاشة تحفظ وتستعيد حالتها |
| **M7** | دفعة ثانية: Planner (+Tasks/Gmail), ScriptWriter, SeoTools, IdeaGenerator, LiveCounter, TimingInsight, GlobalBestTimes, Audience×2, CompetitorAnalysis, ChatAssistant/ChatPage | سيناريو قبول كامل على كل شاشة |
| **M8** | القنوات: HeaderSelector + ManagerModal + DeepAudit + Comparison + Guidelines + PromptsShowcase + ActivityLogs | تدقيق عميق ومقارنة فوز تعملان |
| **M9** | لوحة المستخدم (9 مكونات) + LiquidGlassHeader + Tooltip + SlowMotionScroll + بوابات الجودة (19.1) + مراجعة 19.2 كاملة | **التسليم النهائي** |

---

<div align="center">

## ⚖️ خاتمة الوثيقة

**هذه هي الوصفة الكاملة:** 20 قسماً، 28 أداة موصفة تنفيذياً، 17 شاشة مستقلة، 4 سياقات، 23 دالة AI، 12 خوارزمية حتمية، 3 نقاط نهاية خادم، 45+ مفتاح تخزين، ومصفوفة قبول من 10 سيناريوهات.

**المطوّر الذي يكمل المراحل M1→M9 ويمرر كل بوابات الجودة يكون قد بنى «مُثقّف» كما هو — حرفاً بحرف.**

</div>
