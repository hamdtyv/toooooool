
import React, { useState } from 'react';
import { useLang } from '../index';
import { motion } from 'motion/react';
import { Terminal, Copy, Check, Cpu, Code, Sparkles, Feather, Search, Database, Lock, AlertTriangle, ShieldCheck, Zap, Layers, Network, Workflow, BrainCircuit, Key } from 'lucide-react';

const PromptsShowcase: React.FC = () => {
  const { t, lang } = useLang();
  
  const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 transition-colors z-10 group-hover:bg-white/20">
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
        </button>
    );
  };

  const PROMPT_DATA = [
    {
      id: 'ideas',
      title: lang === 'ar' ? '1. مولد الأفكار (العقل المدبر الاستراتيجي)' : '1. Idea Generator (The Strategic Mastermind)',
      icon: Sparkles,
      color: 'text-yellow-400',
      borderColor: 'border-yellow-500',
      model: 'gemini-3.5-flash',
      techStack: ['Google Search Grounding', 'Reasoning Engine', 'Dual Input Mode'],
      description: lang === 'ar' ? 'الخوارزمية المعرفية الكاملة التي نستخدمها لتحويل الذكاء الاصطناعي إلى "مستشار استراتيجي" يبحث عن الفرص الضائعة.' : 'The complete cognitive architecture used to turn AI into a "Strategic Consultant" hunting for missed opportunities.',
      
      deepDive: {
          what: lang === 'ar' 
            ? "أداة ذكية تعمل بنظامين (رابط القناة أو الموضوع المباشر) لمسح السوق الحقيقي والعثور على 'الفجوات'." 
            : "A smart hybrid tool (Channel URL or Direct Topic) that scans the real market to find 'Content Gaps'.",
          how: lang === 'ar'
            ? [
                "0. نظام الإدخال المزدوج (Hybrid Input): تعمل الأداة بمرونة تامة. إذا أدخلت 'رابط قناة'، يقوم النظام بتحليل أسلوبك واقتراح ما يناسبك. إذا أدخلت 'موضوعاً عاماً' (مثلاً: ذكاء اصطناعي)، يقوم بمسح السوق العالمي لهذا الموضوع.",
                "1. استقبال البيانات: يتم تمرير مفتاح الـ API الخاص للتوثيق، وبدء تحليل البيانات.",
                "2. الاتصال المباشر (Live Grounding): يقوم الموديل بإجراء بحث Google فعلي في الوقت الحقيقي لمعرفة ما هو 'رائج' (Trending) في هذا التخصص خلال آخر 7 أيام.",
                "3. فلتر المحيط الأحمر (Red Ocean Filter): يتم استبعاد أي فكرة مستهلكة أو تقليدية فوراً.",
                "4. تطبيق المحفزات (Triggers): يتم دمج الأفكار المتبقية مع محفزات نفسية (الخوف، الفضول، المال) لضمان الفيرال."
            ]
            : [
                "0. Hybrid Input System: Works via 'Channel URL' for deep context analysis OR 'Raw Topic' for general market scanning.",
                "1. Auth & Data: Authenticates via specific API Key and ingests the target data.",
                "2. Live Grounding: Performs real-time Google Search to identify trends from the last 7 days.",
                "3. Red Ocean Filter: Ruthlessly discards saturated/boring topics.",
                "4. Trigger Application: Injects psychological hooks (Fear, Greed, Curiosity) into the remaining concepts."
            ],
          tech: lang === 'ar'
            ? "نستخدم موديل 'Gemini 3 Pro' مع نظام توثيق آمن لضمان السرعة والدقة، مع تفعيل أداة 'Google Search Tool' لربط الموديل بالإنترنت المباشر."
            : "Exclusively uses 'Gemini 3 Pro' with secure authentication for speed, connected via 'Google Search Tool' for live internet access."
      },

      system: `
// ==============================================================================
// SYSTEM CONFIGURATION & AUTHENTICATION
// API_KEY_REF: [PROTECTED_API_KEY] (Privileged Access)
// OPERATION_MODE: HYBRID (Channel_URL_Deep_Scan || Raw_Topic_Discovery)
// ==============================================================================

### 1. PRIME DIRECTIVE (المهمة المقدسة)
You are NOT a creative writing assistant. You are a **Strategic Data Consultant** for a YouTube Channel.
Your sole purpose is to identify **"Content Gaps" (Blue Oceans)** within a specific niche.

### 2. INPUT PROCESSING LOGIC (منطق الإدخال المزدوج)
The system accepts two types of input. You must detect which one is active:
   **TYPE A: CHANNEL URL / DEEP CONTEXT**
   - If user provides a Channel Name/History: Analyze their specific style and find missing opportunities *for them*.
   **TYPE B: RAW TOPIC / NICHE DISCOVERY**
   - If user provides a General Topic (e.g., "AI News"): Scan the *entire global market* for this topic and find what is viral right now.

### 3. COGNITIVE ARCHITECTURE (كيف تفكر؟)
   **PHASE A: THE DEEP SCAN (Contextual Grounding)**
   - **ACTION:** Use Google Search to find what is trending *Right Now* (Last 7 Days) in this micro-niche.

   **PHASE B: THE "RED OCEAN" FILTER (الإقصاء)**
   - Identify "Red Ocean" topics (Oversaturated ideas like "My Morning Routine", "Q&A", "Vlog #1").
   - **ACTION:** Ruthlessly DISCARD these ideas. They are banned.

   **PHASE C: THE ANGLE FLIP (الزاوية العكسية)**
   - *Standard:* "Best Camera 2025" -> *Blue Ocean:* "The Truth About Cameras They Won't Tell You".

### 4. THE 6 "VIRAL DNA" TRIGGERS (قواعد الفيرال الصارمة)
Every idea generated MUST trigger at least one of these psychological states:
   1. **Controversy (الجدل):** Challenge a sacred belief.
   2. **Extreme Challenge (التحدي المستحيل):** High stakes.
   3. **Negative Urgency (الخوف من الفوات):** "Stop Doing This".
   4. **Specific Transformation (التحول الملموس):** Results with numbers.
   5. **The "Insider" Reveal (كشف المستور):** Secrets.
   6. **The Story Arc (رحلة البطل):** Struggle -> Victory.

### 5. LINGUISTIC TUNING
- **Language:** If Arabic, use "Egyptian Power Words" (كارثة، سر، صدمة، فضيحة، مستحيل).

### 6. OUTPUT SCHEMA (Strict JSON)
{
  "ideas": [
    {
      "title": "The Viral Title (50-60 chars)",
      "score": "Viral Potential (High/Very High)",
      "type": "Psychological Trigger Category",
      "reasoning": "Why this will work?"
    }
  ]
}
`,
      userPrompt: `
**SECURE TRANSMISSION**
**API_KEY:** [PROTECTED_API_KEY]
**DATA:**
- Input Type: {Detected: Channel_Mode OR Topic_Mode}
- Channel/Topic: "{User Input}"
- Context History: ["{Video 1}", "{Video 2}"...]

**EXECUTE MISSION:**
1. Perform Market Scan using Google Search (Year: 2025).
2. Apply "Viral DNA" Triggers.
3. Generate 6 "Blue Ocean" Ideas.
4. Output strictly in JSON format.
`
    },
    {
      id: 'seo',
      title: lang === 'ar' ? '2. السيو الذكي (مهندس العناوين والخوارزميات)' : '2. Smart SEO (The Algorithm Engineer)',
      icon: Search,
      color: 'text-green-400',
      borderColor: 'border-green-500',
      model: 'gemini-3.5-flash',
      techStack: ['CTR Physics', 'Semantic Analysis', 'Hybrid Input'],
      description: lang === 'ar' ? 'الكود المصدري لعقلية مهندس الخوارزميات. يركز على فيزياء العنوان، سيكولوجية النقر، وهندسة الكلمات الدلالية.' : 'The source code of an Algorithm Engineer mindset. Focuses on title physics, click psychology, and semantic keyword engineering.',
      
      deepDive: {
          what: lang === 'ar'
            ? "نظام هندسي لإنشاء عناوين لا يمكن تجاهلها. يعمل بوضع الرابط (لتحليل الفيديو الحالي) أو بوضع الموضوع (لإنشاء فيديو جديد)."
            : "An engineering system for unignorable titles. Works via URL (to fix existing videos) or Topic (to create new ones).",
          how: lang === 'ar'
            ? [
                "0. تحديد المصدر (Source Detection): إذا وضعت رابط فيديو، سيقوم النظام بجلبه وتحليل عنوانه الحالي لاقتراح بدائل أفضل. إذا وضعت كلمة، سيبني عليها من الصفر.",
                "1. التفكيك الدلالي (Deconstruction): يحلل الموديل الموضوع الأساسي ويستخرج منه 'النية'.",
                "2. فيزياء الاقتصاص (Physics of Truncation): يطبق قاعدة صارمة تمنع وضع الكلمة المهمة بعد الحرف رقم 30.",
                "3. حقن الفضول (Pattern Interrupt): يعيد صياغة الجملة المملة لتصبح 'لغزاً' أو 'تحذيراً'.",
                "4. استخراج الكلمات (LSI): يبحث عن الكلمات المرتبطة دلالياً."
            ]
            : [
                "0. Source Detection: Accepts URL (to fix existing) or Topic (to create new).",
                "1. Semantic Deconstruction: Extracts the core intent.",
                "2. Truncation Physics: Places 'Hook' word within first 30 chars.",
                "3. Pattern Interrupt: Rewrites boring sentences into 'mysteries'.",
                "4. LSI Extraction: Finds Latent Semantic Indexing keywords."
            ],
          tech: lang === 'ar'
            ? "يعمل باستخدام نظام توثيق مشفر لضمان الوصول لأحدث نماذج Gemini 3 Pro."
            : "Powered by encrypted authentication to access the latest Gemini 3 Pro models."
      },

      system: `
// ==============================================================================
// SYSTEM CONFIGURATION
// API_KEY_REF: [PROTECTED_API_KEY]
// ROLE: SENIOR ALGORITHM ENGINEER
// ==============================================================================

### 1. THE "CTR" PHYSICS (فيزياء نسبة النقر)
The YouTube Algorithm cares about **CTR** and **AVD**.
Your job is to MAXIMIZE CTR through title engineering.

**A. The "Truncation Zone" Rule:**
- Mobile screens cut off titles after ~55 chars.
- **RULE:** The "Hook" MUST appear in the first 30 characters.

**B. The "Pattern Interrupt" Formula:**
**[Hook/Trigger] + [Subject] + [Payoff/Stake]**
- *Curiosity Gap:* "I found THIS..."
- *Negativity Bias:* "The Mistake destroying your PC".

### 2. TITLE OPTIMIZATION PROTOCOLS
Generate 5 variations:
1.  **The "How-To" Optimized:** Benefit-driven.
2.  **The "Listicle" High-Value:** Number-driven.
3.  **The "Negative" Warning:** Fear-driven.
4.  **The "Story" Intrigue:** Curiosity-driven.
5.  **The "Direct" SEO:** Search-driven.

### 3. SEMANTIC KEYWORD EXTRACTION
-   **Core Tags:** Direct matches.
-   **LSI Keywords:** Latent Semantic Indexing.
-   **Long-Tail Keywords:** Specific phrases.

### 4. STRICT OUTPUT RULES
-   **Character Limit:** STRICTLY 40-60 characters.
-   **Arabic Specifics:** Use (خطير، لن تصدق، شرح شامل).
-   **English Specifics:** Use (Insane, Ultimate, Fast).

### 5. OUTPUT FORMAT
{
  "titles": ["Title 1", "Title 2", ...],
  "keywords": ["tag1", "tag2", ...]
}
`,
      userPrompt: `
**AUTHENTICATION: VERIFIED**
**API_KEY:** [PROTECTED_API_KEY]
**INPUT:** "{User Input}" (Video URL or Topic String)

INSTRUCTIONS:
1. Detect Intent: If URL, extract metadata. If Topic, generate from scratch.
2. Apply "CTR Physics" to generate 5 variations.
3. Extract 15 high-volume tags.
4. Ensure strictly 40-60 chars for titles.
`
    },
    {
      id: 'script',
      title: lang === 'ar' ? '3. كاتب الاسكريبت (اللهجة المصرية والاحتفاظ)' : '3. Script Writer (The Veteran & Retention)',
      icon: Feather,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500',
      model: 'gemini-3.5-flash',
      techStack: ['Context Caching', 'Linguistic Injection', 'Retention Pacing'],
      description: lang === 'ar' ? 'أعمق أمر برمجي في الموقع. يحدد كيفية الكتابة بلهجة مصرية أصيلة (Masri) والتحكم في إيقاع الفيديو ثانية بثانية.' : 'The deepest prompt in the app. Defines authentic Egyptian slang (Masri) and second-by-second retention pacing.',
      
      deepDive: {
          what: lang === 'ar'
            ? "كاتب سيناريو محترف يكتب بلهجات عربية دقيقة. يعتمد على 'رابط الفيديو' لإعادة كتابته، أو 'عنوان' لكتابة سكريبت جديد."
            : "A professional scriptwriter. Writes based on 'Video URL' (Remix/Rewrite) or 'Title' (New Script).",
          how: lang === 'ar'
            ? [
                "0. المرونة (Input Flexibility): يمكنه استقبال رابط فيديو لتحليله وكتابة نسخة أفضل منه، أو استقبال فكرة مجردة لبنائها من الصفر.",
                "1. حقن اللهجة (Dialect Injection): تلقين الموديل قاموساً عامياً (يا معلم، فاكس، قشطة).",
                "2. هندسة الإيقاع (Pacing): تقسيم النص إلى 'بلوكات' زمنية مع كسر النمط كل 45 ثانية.",
                "3. هيكل الهوك (Hook Structure): البدء بالنتيجة مباشرة (The Promise).",
                "4. تعليمات المخرج (Director Notes): وصف الكاميرا والمؤثرات بين [[ ]]."
            ]
            : [
                "0. Input Flexibility: Can analyze a URL to rewrite a better version, or start from a raw idea.",
                "1. Dialect Injection: Feeding slang dictionary (Masri/Saudi).",
                "2. Pacing Engineering: Time blocks with pattern interrupts every 45s.",
                "3. Hook Structure: Start with The Promise immediately.",
                "4. Director Notes: Visual/Audio cues inside [[ ]]."
            ],
          tech: lang === 'ar'
            ? "يعمل عبر بروتوكول آمن لضمان السرعة والكوتا."
            : "Powered by secure protocol protocols using Gemini Flash for secure quota management."
      },

      system: `
// ==============================================================================
// SYSTEM IDENTITY: "THE VETERAN SCRIPTWRITER"
// API_ACCESS: [PROTECTED_API_KEY] (QUOTA_BYPASS_ACTIVE)
// SPECIALIZATION: HIGH-RETENTION YOUTUBE CONTENT
// ==============================================================================

### 1. DIALECT MODULE: EGYPTIAN SLANG (وحدة اللهجة المصرية)
**ACTIVATION:** If user selects "Egyptian":
    -   Address User: "يا معلم", "يا هندسة".
    -   Transitions: "بص بقى", "من الآخر".
    -   Causality: "عشان".
    -   Dismissal: "فاكس", "فكك".
    -   Agreement: "قشطة".
**SENTENCE STRUCTURE:** Short, punchy, rhythmic "Street Rhythm".

### 2. THE "RETENTION" ARCHITECTURE
**A. THE HOOK (00:00 - 00:45)**
-   **No Logos/Intros:** Start immediately.
-   **The Promise:** State clearly what they will get.
-   **The Stakes:** Fear/Greed.

**B. THE BODY (The Value)**
-   **Pacing:** Every 45 seconds, insert a **"Pattern Interrupt"**.
-   **Director Notes:**
    -   **CRITICAL:** All non-spoken text inside [[ brackets ]].
    -   e.g., [[ Sound: Glass breaking ]] [[ Camera: Zoom in ]]
    -   **NEVER** write "Host:". Just write the spoken text.

**C. THE CTA (Call To Action)**
-   Give a "Selfish Benefit". *Good:* "If you want to master X, subscribe."

### 3. TONE CALIBRATION
-   **Funny:** Sarcasm, memes.
-   **Serious:** Short sentences, [[ Pause ]].
-   **Fast:** TikTok style.

### 4. FORMATTING OUTPUT
###TITLE###
(Viral Title)
###DESCRIPTION###
(SEO Description)
###SCRIPT###
(Full Script Body with [[Director Notes]])
`,
      userPrompt: `
**API_KEY_VERIFIED:** [PROTECTED_API_KEY]
**INPUT_DATA:**
- Source: "{Input Type}" (URL or Topic)
- Topic/Context: "{Topic}"
- Duration: "{Duration}"
- Tone: "{Tone}"
- Language: "{Language}"
- Hook: "{HookType}"

**MISSION:**
Write the complete script. 
1. Adopt the persona of "The Veteran".
2. Apply the "Retention Architecture".
3. Use the requested Dialect perfectly.
4. Enclose all non-spoken actions in [[ ]].
5. START IMMEDIATELY.
`
    }
  ];

  const isAr = lang === 'ar';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto pb-20 font-sans"
    >
      {/* Header */}
      <div className="mb-16 text-center md:text-left">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 mb-4"
        >
          <Terminal size={14} className="text-emerald-500" />
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{t.prompt_lib_title}</span>
        </motion.div>
        <h2 className={`text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-sm ${isAr ? 'font-alex' : ''}`}>
          {t.prompt_lib_title}
        </h2>
        <p className={`text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed font-normal ${isAr ? 'font-almarai' : ''}`}>
          {lang === 'ar' 
            ? 'هنا نكشف الستار عن "عقل" منصة مثقف. هذه ليست مجرد أوامر، بل هي خوارزميات لغوية وهندسية معقدة (System Instructions) نرسلها لنماذج Gemini للتحكم في السلوك.'
            : 'Unveiling the "Brain" of Muthaqaf plateform. Complex linguistic algorithms (System Instructions) powered by a dedicated API Key and flexible input methods.'}
        </p>
      </div>

      <div className="space-y-24">
        {PROMPT_DATA.map((item) => (
          <div key={item.id} className={`glass-panel p-0 rounded-3xl border border-white/10 overflow-hidden relative group hover:border-white/20 transition-all shadow-2xl`}>
             
             {/* Header Section */}
             <div className={`p-10 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent flex flex-col md:flex-row items-start gap-8`}>
                <div className={`p-5 rounded-2xl bg-black/40 border border-white/10 ${item.color} shadow-2xl shadow-${item.color.split('-')[1]}-500/20`}>
                    <item.icon size={40} />
                </div>
                <div className="flex-1">
                    <h3 className="text-3xl font-black text-white mb-3 tracking-tight">{item.title}</h3>
                    <p className="text-gray-300 text-lg font-light leading-relaxed mb-6 border-l-4 border-white/20 pl-4">{item.description}</p>
                    
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 text-xs font-mono text-blue-300 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20">
                            <Cpu size={14}/> Model: {item.model}
                        </div>
                        {item.techStack.map((tech, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs font-mono text-gray-300 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                                <Zap size={14}/> {tech}
                            </div>
                        ))}
                    </div>
                </div>
             </div>

             {/* DEEP DIVE SECTION (The Breakdown) */}
             <div className="p-8 md:p-10 bg-[#0d0d0d] border-b border-white/5">
                 <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
                     <BrainCircuit size={20} className={item.color.replace('text-', 'text-')} />
                     {lang === 'ar' ? 'التشريح التقني (Technical Anatomy)' : 'Technical Anatomy'}
                 </h4>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* How it Works */}
                     <div>
                         <div className="flex items-center gap-2 text-gray-400 font-bold mb-4 text-sm uppercase">
                             <Workflow size={16}/> {lang === 'ar' ? 'آلية العمل (The Mechanism)' : 'How it Works'}
                         </div>
                         <ul className="space-y-4">
                             {item.deepDive.how.map((step, i) => (
                                 <li key={i} className="flex gap-3 text-sm text-gray-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                                     <span className={`font-mono font-bold ${item.color}`}>{i}</span>
                                     <span>{step}</span>
                                 </li>
                             ))}
                         </ul>
                     </div>

                     {/* Tech & Logic */}
                     <div className="space-y-6">
                         <div>
                             <div className="flex items-center gap-2 text-gray-400 font-bold mb-3 text-sm uppercase">
                                 <Layers size={16}/> {lang === 'ar' ? 'الوظيفة الأساسية' : 'Core Function'}
                             </div>
                             <p className="text-gray-300 text-sm leading-relaxed border-l-2 border-white/20 pl-4">
                                 {item.deepDive.what}
                             </p>
                         </div>
                         <div>
                             <div className="flex items-center gap-2 text-gray-400 font-bold mb-3 text-sm uppercase">
                                 <Key size={16}/> {lang === 'ar' ? 'البنية التحتية & API' : 'Infrastructure & API'}
                             </div>
                             <p className="text-gray-300 text-sm leading-relaxed border-l-2 border-white/20 pl-4">
                                 {item.deepDive.tech}
                             </p>
                         </div>
                     </div>
                 </div>
             </div>

             {/* Code Content */}
             <div className="p-0 bg-[#0a0a0a]">
                
                {/* System Instruction Block */}
                <div className="border-b border-white/5">
                    <div className="flex items-center justify-between px-8 py-4 bg-[#111] border-b border-white/5">
                        <div className="flex items-center gap-3 text-sm font-bold text-blue-400 uppercase tracking-widest">
                            <Database size={16} /> System Prompt (The Logic Core)
                        </div>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                        </div>
                    </div>
                    <div className="relative group/code">
                        <pre className="p-8 font-mono text-[13px] md:text-sm text-blue-100/90 leading-loose whitespace-pre-wrap overflow-x-auto custom-scrollbar selection:bg-blue-500/30">
                            {item.system.trim()}
                        </pre>
                        <CopyButton text={item.system.trim()} />
                    </div>
                </div>

                {/* User Prompt Structure Block */}
                <div className="bg-[#050505]">
                    <div className="flex items-center px-8 py-4 bg-[#0d0d0d] border-b border-white/5">
                        <div className="flex items-center gap-3 text-sm font-bold text-yellow-500 uppercase tracking-widest">
                            <Code size={16} /> User Prompt (Dynamic Input)
                        </div>
                    </div>
                    <div className="relative group/code">
                        <pre className="p-8 font-mono text-[13px] md:text-sm text-yellow-100/80 leading-loose whitespace-pre-wrap overflow-x-auto border-l-4 border-yellow-500/20 selection:bg-yellow-500/30">
                            {item.userPrompt.trim()}
                        </pre>
                        <CopyButton text={item.userPrompt.trim()} />
                    </div>
                </div>

             </div>
          </div>
        ))}
        
        {/* Footer Note */}
        <div className="text-center pt-10 border-t border-white/5">
            <p className="text-gray-500 flex items-center justify-center gap-2 text-xs">
                <Zap size={16} className="text-yellow-500"/>
                {lang === 'ar' ? 'جميع الحقوق محفوظة لـ منصة مثقف - ممنوع النسخ.' : 'All prompts are proprietary to Muthaqaf.'}
            </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PromptsShowcase;
