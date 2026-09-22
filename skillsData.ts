import { 
  Radar, 
  Image as ImageIcon, 
  Sparkles, 
  Feather, 
  Search, 
  Lightbulb, 
  BarChart2, 
  Timer, 
  DollarSign, 
  Gem, 
  Users, 
  Swords, 
  Brain, 
  Activity,
  Layers,
  Wand2,
  Clock,
  Scissors,
  Film,
  Zap,
  Briefcase,
  Globe,
  BookOpen,
  Heart,
  Eye,
  Palette,
  TrendingUp,
  MessageSquare,
  Mic,
  Crosshair,
  Flame,
  Award
} from 'lucide-react';

export interface SkillItem {
  id: string;
  titleAr: string;
  titleEn: string;
  shortTitleAr: string;
  shortTitleEn: string;
  descAr: string;
  descEn: string;
  icon: any;
  color: string; // Tailwind gradient class
  glowColor: string;
  category: 'growth' | 'content' | 'seo' | 'analytics';
  placeholderAr: string;
  placeholderEn: string;
  systemPromptAr?: string;
  systemPromptEn?: string;
  suggestedPromptsAr: string[];
  suggestedPromptsEn: string[];
}

export const SKILLS_LIST: SkillItem[] = [
  // 1. Trend Forecasting
  {
    id: 'trend_forecasting',
    titleAr: 'تنبؤ التريند والسرعة الفيروسية',
    titleEn: 'Trend & Velocity Radar',
    shortTitleAr: 'تنبؤ بالتريند',
    shortTitleEn: 'Trend Radar',
    descAr: 'تحليل سرعة البحث، تحول المشاعر، وتوقع المواضيع الفيروسية القادمة مع رسم بياني للزخم.',
    descEn: 'Forecast viral topics, search velocity, and audience sentiment shifts with 7-day projection charts.',
    icon: Radar,
    color: 'from-blue-500 to-indigo-600',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    category: 'growth',
    placeholderAr: 'أدخل مجال قناتك أو الكلمة المفتاحية (مثال: الذكاء الاصطناعي، الطبخ السريع، الجيمنج)...',
    placeholderEn: 'Enter your channel niche or topic (e.g., AI Tools, Quick Cooking, Tech Reviews)...',
    suggestedPromptsAr: [
      'توقع تريندات مجال الذكاء الاصطناعي وتطبيقاته لعام 2026',
      'ما هي المواضيع الصاعدة في مراجعات الهواتف الذكية؟',
      'توقع أفكار فيروسية لقنوات الجيمنج والبودكاست'
    ],
    suggestedPromptsEn: [
      'Forecast upcoming trends in AI technology for YouTube',
      'Predict viral breakout topics in personal finance & investing',
      'Analyze trending topics in tech gadgets and gaming'
    ]
  },

  // 2. Thumbnail A/B Battle
  {
    id: 'thumbnail_ab',
    titleAr: 'محاكي واختبار الصور المصغرة A/B',
    titleEn: 'Thumbnail A/B Battle Simulator',
    shortTitleAr: 'محاكي مصغرات A/B',
    shortTitleEn: 'Thumbnail A/B',
    descAr: 'توليد مفهومين بصريين متنافسين بالذكاء الاصطناعي، وتحليل سيكولوجية الألوان ونسبة النقر المتوقعة (CTR).',
    descEn: 'Generate dual competing visual concepts with AI, analyze color theory, and predict winning CTR.',
    icon: Sparkles,
    color: 'from-amber-500 to-orange-600',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    category: 'content',
    placeholderAr: 'أدخل عنوان الفيديو أو فكرته لاختبار وتوليد صورتين مصغرتين متنافستين...',
    placeholderEn: 'Enter your video title or concept to generate & battle 2 contrasting thumbnails...',
    suggestedPromptsAr: [
      'كيف ربحت 10,000 دولار من اليوتيوب في شهر واحد',
      'أخطر ثغرة تقنية كادت أن تدمر الإنترنت',
      'تحدي العيش لمدة 24 ساعة في الصحراء بدون ماء'
    ],
    suggestedPromptsEn: [
      'How I Built a $10,000/Month Business in 30 Days',
      'The Dark Secret Behind Quantum Computers',
      'I Survived 24 Hours Trapped in an Abandoned Bunker'
    ]
  },

  // 3. AI Thumbnail Generator
  {
    id: 'thumbnail_gen',
    titleAr: 'توليد صور مصغرة سينمائية 16:9',
    titleEn: 'AI Thumbnail & Visual Studio',
    shortTitleAr: 'توليد مصغرة',
    shortTitleEn: 'Thumbnail Gen',
    descAr: 'توليد صورة مصغرة عالية الدقة بأبعاد يوتيوب (16:9) مع إضاءة دراماتيكية وزوايا تجذب النقر.',
    descEn: 'Generate high-CTR cinematic 16:9 YouTube thumbnails with dramatic studio lighting.',
    icon: ImageIcon,
    color: 'from-pink-500 to-rose-600',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    category: 'content',
    placeholderAr: 'صف المشهد البصري للصورة المصغرة (مثال: شخص مصدوم ينظر إلى شاشة تشتعل نيراناً)...',
    placeholderEn: 'Describe the visual scene (e.g., shocked creator pointing at a floating holographic graph)...',
    suggestedPromptsAr: [
      'صورة مصغرة دراماتيكية: صانع محتوى مذهول يمسك درع اليوتيوب الذهبي المتوهج',
      'رائد فضاء يكتشف مدينة خيالية مضيئة بالنيون على سطح كوكب غريب',
      'مقارنة بصرية سينمائية بين سيارة قديمة متهالكة وسيارة فائقة السرعة حديثة'
    ],
    suggestedPromptsEn: [
      'Dramatic cinematic thumbnail: shocked YouTuber holding a glowing Golden Play Button',
      'Futuristic cyberpunk workstation with neon holographic trading charts',
      'Split comparison between a poor broken iPhone vs next-gen AI device'
    ]
  },

  // 4. Viral Retention Scriptwriter
  {
    id: 'viral_script',
    titleAr: 'كاتب الاسكريبتات الفيروسية الشامل',
    titleEn: 'Viral Retention Scriptwriter',
    shortTitleAr: 'كاتب اسكريبت',
    shortTitleEn: 'Viral Script',
    descAr: 'صياغة هوك (Hook) أول 15 ثانية يخطف الانتباه، ثم بناء سردي تصاعدي لمنع خروج المشاهد.',
    descEn: 'Craft psychological 15-second hooks, pacing spikes, and high-retention narrative scripts.',
    icon: Feather,
    color: 'from-emerald-500 to-teal-600',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    category: 'content',
    placeholderAr: 'أدخل موضوع الفيديو ونوع النبرة (مثال: قصة نجاح إيلون ماسك، نبرة حماسية وسريعة)...',
    placeholderEn: 'Enter video topic and desired tone (e.g., How OpenAI started, fast-paced cinematic documentary)...',
    suggestedPromptsAr: [
      'اسكريبت فيديو 5 دقائق: كيف تسيطر على تركيزك وتتخلص من إدمان الهاتف؟',
      'اسكريبت ريلز / شورتس 60 ثانية: 3 أسرار نفسية تجعل أي شخص يوافق على طلبك',
      'اسكريبت وثائقي 10 دقائق: السر المظلم وراء صعود شركات الوجبات السريعة'
    ],
    suggestedPromptsEn: [
      '5-minute script: The Neuroscience of Dopamine and Deep Work',
      '60-second YouTube Short: 3 cognitive biases that dictate human decisions',
      '10-minute documentary script: The Hidden Economics Behind Supermarkets'
    ]
  },

  // 5. Retention & Pacing Heatmap (NEW)
  {
    id: 'retention_pacing',
    titleAr: 'محلل احتباس المشاهدين وسيكولوجية الإيقاع',
    titleEn: 'Retention & Pacing Heatmap',
    shortTitleAr: 'محلل الاحتباس',
    shortTitleEn: 'Retention Pacing',
    descAr: 'تشخيص نقاط الملل وهبوط المشاهدين بالثواني، وتقديم حلول إيقاعية لرفع منحنى الاحتفاظ فوق 70%.',
    descEn: 'Identify drop-off friction points, pacing dead-zones, and re-hook triggers to maintain a 70%+ retention curve.',
    icon: Activity,
    color: 'from-orange-500 to-red-600',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    category: 'content',
    placeholderAr: 'الصق اسكريبت الفيديو أو هيكل فقراته لفحصه واكتشاف مواضع الملل وهبوط المشاهدين...',
    placeholderEn: 'Paste your script or video outline to map viewer retention drop-off risk and pacing fixes...',
    systemPromptAr: 'أنت خبير هندسة الاحتفاظ وسيكولوجية إيقاع اليوتيوب (YouTube Retention Engineer). حلل النص المقدم بالتفصيل: 1. حدد نقاط الضعف والهبوط المحتمل (Friction Points) بالثواني. 2. اقترح تعديلات إيقاعية (Pacing Resets) كل 45 ثانية. 3. حدد مواضع إدراج المؤثرات والـ B-Roll للحفاظ على نسبة احتفاظ أعلى من 70%.',
    systemPromptEn: 'You are an elite YouTube Retention & Pacing Specialist. Analyze the provided script: 1. Map drop-off friction points by second. 2. Recommend pacing resets and visual disruptions every 45 seconds. 3. Provide exact B-Roll and SFX placement to keep retention above 70%.',
    suggestedPromptsAr: [
      'حلل احتباس أول 60 ثانية من هذا السكريبت واقترح تعديلات ترفع المشاهدة لـ 80%',
      'كيف أجعل منتصف الفيديو مشوقاً لمنع خروج المشاهدين بعد الدقيقة الثالثة؟',
      'فحص إيقاع سكريبت مراجعة تقنية مدته 8 دقائق'
    ],
    suggestedPromptsEn: [
      'Analyze the first 60 seconds of this script to eliminate viewer drop-off',
      'How to eliminate the mid-video dip (minutes 3-5) and keep viewers hooked',
      'Perform a comprehensive retention audit on my 8-minute documentary script'
    ]
  },

  // 6. Long-to-Shorts Repurposing Engine (NEW)
  {
    id: 'shorts_repurpose',
    titleAr: 'محرك تدوير الفيديوهات الطويلة لشورتس',
    titleEn: 'Long-to-Shorts Repurposing Engine',
    shortTitleAr: 'تدوير لشورتس',
    shortTitleEn: 'Shorts Repurpose',
    descAr: 'استخراج 3-5 مقاطع شورتس وريلز فيروسية من أي فيديو طويل مع هوكات صادمة ونصوص للشاشة.',
    descEn: 'Extract 3-5 high-performing Shorts / Reels clips from long-form content with viral hooks and captions.',
    icon: Scissors,
    color: 'from-fuchsia-500 to-pink-600',
    glowColor: 'rgba(217, 70, 239, 0.4)',
    category: 'content',
    placeholderAr: 'الصق موضوع الفيديو الطويل أو السكريبت لاستخراج 3 إلى 5 مقاطع شورتس فيروسية...',
    placeholderEn: 'Paste your long-form topic or transcript to generate 3-5 viral 60-second Shorts frameworks...',
    systemPromptAr: 'أنت خبير يوتيوب شورتس وتيك توك الفيروسي. استخرج من المحتوى المقدم 3 إلى 5 مقاطع شورتس مستقلة وقوية. لكل مقطع قدم: 1. هوك أول 3 ثوانٍ (Visual + Verbal Hook). 2. صلب المقطع السريع (The Core Value). 3. نص الكابشن المقترح للشاشة (On-Screen Text). 4. دعوة تفاعل ذكية (Looping CTA).',
    systemPromptEn: 'You are a Viral Shorts & TikTok Architect. Extract 3-5 standalone viral Shorts from the provided content. For each: 1. 3-second Verbal + Visual Hook. 2. Fast-paced core punchline. 3. On-screen caption highlights. 4. Seamless looping CTA.',
    suggestedPromptsAr: [
      'استخرج 3 مقاطع شورتس متفجرة من حلقة بودكاست عن الذكاء الاصطناعي',
      'تحويل فيديو تعليمي 15 دقيقة إلى 4 فيديوهات ريلز سريعة وشيقة',
      'صياغة هوكات شورتس تدور بنظام الحلقة المغلقة (Seamless Loop)'
    ],
    suggestedPromptsEn: [
      'Extract 3 high-impact Shorts from a 20-minute tech podcast episode',
      'Repurpose a long educational video into 4 bite-sized viral Reels',
      'Create 3 perfect looping Shorts scripts from my latest video'
    ]
  },

  // 7. Smart B-Roll & SFX Director (NEW)
  {
    id: 'broll_director',
    titleAr: 'مخرج لقطات الـ B-Roll ومؤثرات المونتاج',
    titleEn: 'Smart B-Roll & SFX Director',
    shortTitleAr: 'مخرج B-Roll',
    shortTitleEn: 'B-Roll Director',
    descAr: 'تحويل السكريبت إلى Shot List تفصيلية لمونتير الفيديو مع توقيت المؤثرات الصوتية والموسيقى.',
    descEn: 'Convert scripts into professional editor shot lists with precise B-Roll visual cues and SFX timestamps.',
    icon: Film,
    color: 'from-violet-500 to-indigo-600',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    category: 'content',
    placeholderAr: 'الصق فقرات السكريبت لتوليد قائمة لقطات B-Roll وتوجيهات المونتاج والمؤثرات الصوتية...',
    placeholderEn: 'Paste your script to generate a full visual shot list, B-Roll prompts, and sound design cues...',
    systemPromptAr: 'أنت مخرج مونتاج احترافي (Post-Production Director). حول السكريبت إلى جدول إخراجي شامل: 1. نوع اللقطة (A-Roll / B-Roll / Screen Recording). 2. وصف المشهد البصري بدقة. 3. المؤثر الصوتي المناسب (Whoosh, Riser, Glitch, Pop). 4. الإيقاع الموسيقي والمود المطلوب.',
    systemPromptEn: 'You are a master YouTube Video Director & Video Editor. Transform the script into a structured production shot list: 1. Shot Type (A-Roll / B-Roll / Graphic). 2. Exact visual description. 3. SFX cues (Whoosh, Bass Drop, Pop, Glitch). 4. Background music mood transition timestamps.',
    suggestedPromptsAr: [
      'اكتب توجيهات B-Roll ومؤثرات صوتية لسكريبت مقدمة فيديو وثائقي',
      'قائمة لقطات وتأثيرات بصرية لفيديو مراجعة هاتف آيفون الجديد',
      'كيف أوزع الموسيقى والمؤثرات الصوتية لتصعيد الحماس في الفيديو؟'
    ],
    suggestedPromptsEn: [
      'Generate a comprehensive B-Roll & SFX shot list for this documentary intro',
      'Direct visual cues and motion graphics for a tech review video',
      'Map cinematic background music shifts and impact sound effects for my script'
    ]
  },

  // 8. High-Stakes & Curiosity Gap Calibrator (NEW)
  {
    id: 'curiosity_calibrator',
    titleAr: 'معاير الرهانات العالية وفجوة الفضول',
    titleEn: 'High-Stakes & Curiosity Calibrator',
    shortTitleAr: 'معاير الفضول',
    shortTitleEn: 'Curiosity Gap',
    descAr: 'إعادة هندسة الأفكار العادية بأسلوب MrBeast وVeritasium لتصبح تجارب وتحديات لا تقاوم.',
    descEn: 'Transform routine topics into high-stakes psychological challenges and irresistible curiosity gaps.',
    icon: Zap,
    color: 'from-amber-400 to-orange-500',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    category: 'growth',
    placeholderAr: 'أدخل فكرة الفيديو البسيطة لرفع قيمة الرهان وإضافة زوايا فضول سينمائية خارقة...',
    placeholderEn: 'Enter your simple video topic to amplify its stakes, psychological tension, and clickability...',
    systemPromptAr: 'أنت مستشار استراتيجية المحتوى بأسلوب كبار صناع المحتوى (MrBeast, Veritasium, Ryan Trahan). مهمتك رفع الرهان (Amplify Stakes) في الفكرة: 1. تحويل الفكرة من شرح عادي إلى تحدٍ ذي عواقب أو تجربة فريدة. 2. صياغة 3 عناوين تفتح فجوة فضول لا يمكن غلقها إلا بمشاهدة الفيديو. 3. سيناريو تصاعدي للتوتر والمفاجآت.',
    systemPromptEn: 'You are an elite YouTube Packaging Strategist inspired by MrBeast & Veritasium. Amplify the stakes: 1. Convert passive concepts into active high-stakes challenges with real consequence. 2. Craft 3 irresistible curiosity gap titles. 3. Build escalation milestones and narrative twists.',
    suggestedPromptsAr: [
      'حول فكرة "تجربة تطبيقات الإنتاجية" إلى تحدٍ ملحمي عالي الرهانات',
      'إعادة صياغة فكرة عن تعلم لغة جديدة لتصبح فيديو فيروسي يجلب مليون مشاهدة',
      'كيف أصنع فجوة فضول مستحيلة التجاهل لفيديو علمي معقد؟'
    ],
    suggestedPromptsEn: [
      'Turn "testing productivity apps" into a high-stakes 7-day challenge video',
      'Re-engineer a simple finance concept into a viral curiosity-driven experiment',
      'Create high-stakes packaging for a complex science/history topic'
    ]
  },

  // 9. Narrative Arc & Story Engine (NEW)
  {
    id: 'narrative_arc',
    titleAr: 'مهندس البناء السردي والقصصي',
    titleEn: 'Narrative Arc & Story Engine',
    shortTitleAr: 'البناء السردي',
    shortTitleEn: 'Story Arc',
    descAr: 'تطبيق هيكل السرد السينمائي (رحلة البطل) على أي محتوى تعليمي أو وثائقي لخلق تعلق عاطفي.',
    descEn: 'Apply cinematic storytelling structures (Hero’s Journey / Dan Harmon Story Circle) to non-fiction videos.',
    icon: BookOpen,
    color: 'from-teal-500 to-emerald-600',
    glowColor: 'rgba(20, 184, 166, 0.4)',
    category: 'content',
    placeholderAr: 'أدخل موضوع القصة أو المحتوى لبنائها على هيكل سردي سينمائي ثلاثي الفصول...',
    placeholderEn: 'Enter your topic or narrative premise to construct a 3-act cinematic story architecture...',
    systemPromptAr: 'أنت مؤلف سينمائي ومخرج سرد قصصي لليوتيوب. نظم المحتوى وفق هيكل السرد الاحترافي (Hero’s Journey & Dan Harmon Story Circle): 1. العالم العادي والشرارة الأولى (The Ordinary World & Inciting Incident). 2. الصراع والعقبات المتصاعدة (Rising Action & Obstacles). 3. نقطة التحول والذروة (The Climax & Epiphany). 4. التحول والدرس النهائي (The Transformation & Payoff).',
    systemPromptEn: 'You are a Master Narrative Architect. Structure the topic using the Dan Harmon Story Circle and 3-Act Structure: 1. Status Quo & Inciting Incident. 2. The Descent & Escalating Trials. 3. The Climax & Dark Night of the Soul. 4. Return with Transformation & Value.',
    suggestedPromptsAr: [
      'ابنِ قصة صعود وانهيار شركة تقنية عملاقة بهيكل سينمائي مشوق',
      'كيف أسرد قصة شخصية ملهمة دون أن تبدو مملة أو تقليدية؟',
      'تطبيق قواعد رحلة البطل على فيديو تعليمي عن البرمجة'
    ],
    suggestedPromptsEn: [
      'Build a gripping 3-act narrative arc on the collapse of a tech empire',
      'Structure a personal vulnerability story for maximum viewer resonance',
      'Apply the Hero’s Journey to an educational coding tutorial'
    ]
  },

  // 10. Dopamine & Emotional Trigger Map (NEW)
  {
    id: 'dopamine_trigger',
    titleAr: 'مقياس الدوبامين والشحن العاطفي',
    titleEn: 'Dopamine & Emotional Trigger Map',
    shortTitleAr: 'مقياس الدوبامين',
    shortTitleEn: 'Dopamine Map',
    descAr: 'توزيع الشحنات العاطفية والمفاجآت كل 45 ثانية لتحفيز إفراز الدوبامين وضمان المشاهدة للنهاية.',
    descEn: 'Map cognitive dopamine spikes, tension releases, and emotional payoffs across your timeline.',
    icon: Heart,
    color: 'from-rose-500 to-red-600',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    category: 'content',
    placeholderAr: 'أدخل أفكار أو سكريبت الفيديو لتوزيع محفزات الدوبامين والمشاعر النفسية...',
    placeholderEn: 'Input your video concept to plot dopamine trigger points and emotional shifts...',
    systemPromptAr: 'أنت عالم نفس سلوكي متخصص في كيمياء الدوبامين والانتباه في اليوتيوب. صمم خارطة شحن عاطفي للفيديو: 1. محفز الفضول الأولي (Dopamine Anticipation). 2. لحظات المفاجأة وكسر التوقع (Pattern Interrupts). 3. جرعات المكافأة المعرفية كل دقيقة (Cognitive Payoffs). 4. الإشباع النهائي (Emotional Climax & Closure).',
    systemPromptEn: 'You are a Behavioral Neuroscientist specializing in YouTube dopamine mechanics. Map out: 1. Initial anticipation hooks. 2. Pattern interrupts and curiosity loops every 45-60s. 3. Mini cognitive payoffs. 4. Final emotional resolution that triggers subscriptions.',
    suggestedPromptsAr: [
      'وزع 5 محفزات دوبامين ومفاجآت في فيديو مدته 7 دقائق',
      'كيف أكسر توقعات المشاهد في بداية الفيديو لإبقائه مذهولاً؟',
      'تحليل سيكولوجية إشراك المشاهد وجعله يشعر بأنه جزء من القصة'
    ],
    suggestedPromptsEn: [
      'Map 5 dopamine spikes and pattern interrupts across a 7-minute video',
      'How to design psychological pattern interrupts in the first 2 minutes',
      'Techniques to induce cognitive suspense and awe in educational videos'
    ]
  },

  // 11. Versus & Showdown Architect (NEW)
  {
    id: 'versus_architect',
    titleAr: 'مستشار المواجهات والمقارنات النارية',
    titleEn: 'Versus & Showdown Architect',
    shortTitleAr: 'مستشار المواجهات',
    shortTitleEn: 'Versus Architect',
    descAr: 'صياغة فيديوهات المقارنة الصدامية والجريئة التي تشعل النقاش والتعليقات وتضاعف التفاعل.',
    descEn: 'Design fiery, high-engagement comparison and versus videos that spark intense debate in comments.',
    icon: Swords,
    color: 'from-red-600 to-amber-600',
    glowColor: 'rgba(220, 38, 38, 0.4)',
    category: 'growth',
    placeholderAr: 'أدخل الطرفين المتنافسين (مثال: آيفون ضد أندرويد، العمل الحر ضد الوظيفة)...',
    placeholderEn: 'Enter competing entities (e.g., iPhone vs Android, Freelancing vs 9-to-5)...',
    systemPromptAr: 'أنت خبير بناء المواجهات والمقارنات الجريئة على يوتيوب. صمم هيكل المقارنة: 1. معايير التقييم النارية والموضوعية. 2. لحظات الصدام المباشر. 3. نقاط القوة الصادمة لكل طرف. 4. حكم نهائي حاسم وغير متوقع يشعل قسم التعليقات بالمناقشات.',
    systemPromptEn: 'You are a YouTube Showdown & Debate Architect. Design an intense versus video structure: 1. Fiery evaluation rounds. 2. Counter-intuitive testing methodologies. 3. Unbiased deep-dive arguments. 4. Definitive controversial conclusion engineered to explode comment debates.',
    suggestedPromptsAr: [
      'مقارنة نارية: الذكاء الاصطناعي ضد أفضل المبرمجين البشريين',
      'صياغة فيديو مواجهة: العيش في القرية ضد المدينة الصاخبة',
      'مقارنة حاسمة: الاستثمار في الذهب مقابل العملات الرقمية'
    ],
    suggestedPromptsEn: [
      'Design an epic showdown script: AI Coding Assistants vs Senior Engineers',
      'Structure a high-tension comparison: Minimalist Living vs Extreme Luxury',
      'Versus framework: Real Estate Investing vs Index Funds in 2026'
    ]
  },

  // 12. Eye-Tracking & Visual Heatmap (NEW)
  {
    id: 'eye_tracking_sim',
    titleAr: 'هندسة مسار نظرة العين في المصغرة',
    titleEn: 'Eye-Tracking & Visual Heatmap',
    shortTitleAr: 'مسار نظرة العين',
    shortTitleEn: 'Eye-Tracking',
    descAr: 'تحليل وتوجيه مسار نظرة المشاهد داخل المصغرة خلال 0.2 ثانية لضمان أعلى تركيز ونقر.',
    descEn: 'Simulate visual attention heatmaps, focal entry points, and visual hierarchy for sub-second clicks.',
    icon: Eye,
    color: 'from-yellow-400 to-amber-600',
    glowColor: 'rgba(234, 179, 8, 0.4)',
    category: 'content',
    placeholderAr: 'صف عناصر صورتك المصغرة لتشريح مسار بصر المشاهد وتحديد النقطة البؤرية الأقوى...',
    placeholderEn: 'Describe your thumbnail composition to analyze eye entry points, focal contrast, and scan order...',
    systemPromptAr: 'أنت مهندس الرؤية البصرية وسيكولوجية الانتباه السريع (Visual Attention & Heatmap Analyst). حلل تركيبة الصورة المصغرة: 1. نقطة الدخول الأولى لبصر المشاهد (Primary Focal Point). 2. مسار المسح البصري (Z-Pattern or F-Pattern Scan). 3. تباين الألوان وعزل العناصر المشتتة. 4. التعديل البصري الفوري لرفع النقر في الهواتف المحمولة.',
    systemPromptEn: 'You are an Eye-Tracking & Visual Hierarchy Specialist for YouTube Thumbnails. Analyze the layout: 1. Primary entry focal point. 2. Visual scan sequence (Z/F pattern). 3. Contrast separation & visual clutter elimination. 4. Mobile feed readability optimization.',
    suggestedPromptsAr: [
      'حلل مسار العين لصورة مصغرة فيها وجه مصدوم وكيس نقود متوهج',
      'كيف أوجه بصر المشاهد للعنوان في المصغرة دون استخدام نصوص كثيرة؟',
      'قواعد التباين وعزل الخلفية لجعل المصغرة تقفز أمام عين المشاهد في الهاتف'
    ],
    suggestedPromptsEn: [
      'Simulate eye-tracking scan path for a thumbnail with a shocked face and glowing object',
      'How to guide the viewer’s eye with directional lighting and contrast',
      'Mobile thumbnail optimization checklist for 0.2-second decision window'
    ]
  },

  // 13. Signature Visual Branding Director (NEW)
  {
    id: 'visual_branding',
    titleAr: 'محدد البصمة البصرية والهوية',
    titleEn: 'Signature Visual Branding Director',
    shortTitleAr: 'البصمة البصرية',
    shortTitleEn: 'Visual Branding',
    descAr: 'بناء نظام ألوان وخطوط وزوايا تصوير مميزة تجعل المشاهد يتعرف على فيديوهاتك فوراً.',
    descEn: 'Establish an unmistakable visual brand identity with signature palettes, font hierarchies, and composition rules.',
    icon: Palette,
    color: 'from-pink-500 to-purple-600',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    category: 'content',
    placeholderAr: 'أدخل مجال قناتك وأسلوبك المفضل لبناء دليل الهوية البصرية المتكامل...',
    placeholderEn: 'Enter your niche and desired aesthetic to craft a complete signature visual identity guideline...',
    systemPromptAr: 'أنت مدير الهوية البصرية والإخراج الفني لقنوات اليوتيوب العالمية. صمم دليل الهوية البصرية (Brand Style Guide): 1. لوحة الألوان المميزة (Primary, Secondary, Accent Neon/Warm). 2. طبوغرافيا الخطوط للمصغرات والشاشات. 3. زوايا الإضاءة والتصوير الموحدة. 4. عناصر البصمة المتكررة (Signature Visual Anchor) التي تميز القناة.',
    systemPromptEn: 'You are a YouTube Creative Director & Visual Identity Architect. Formulate a cohesive brand guide: 1. Signature color palette (Primary, Contrast, Accent). 2. Typography pairing for max CTR. 3. Lighting & framing composition rules. 4. Signature visual motifs that make thumbnails instantly recognizable.',
    suggestedPromptsAr: [
      'دليل هوية بصرية كامل لقناة وثائقيات تاريخية وغامضة',
      'نظام ألوان وخطوط حديث لقناة ريادة أعمال وتقنية',
      'كيف أصنع بصمة بصرية تجعل المشاهد يعرف قناتي بدون قراءة الاسم؟'
    ],
    suggestedPromptsEn: [
      'Complete signature visual branding system for a dark mystery documentary channel',
      'Modern aesthetic color and typography guide for a tech & productivity channel',
      'How to create an unmistakable thumbnail style that builds instant brand recall'
    ]
  },

  // 14. SEO Master & Viral Titles
  {
    id: 'seo_tools',
    titleAr: 'خبير السيو والعناوين المتصدرة',
    titleEn: 'SEO Master & Viral Titles',
    shortTitleAr: 'خبير السيو',
    shortTitleEn: 'SEO & Tags',
    descAr: 'توليد عناوين فيروسية لا تقاوم، أوصاف متوافقة مع محركات البحث، وحزمة تاجز منسقة بنقرة واحدة.',
    descEn: 'Generate high-CTR title variations, keyword-dense descriptions, and copyable rank tags.',
    icon: Search,
    color: 'from-cyan-500 to-blue-600',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    category: 'seo',
    placeholderAr: 'أدخل الكلمة المفتاحية أو فكرة الفيديو لاستخراج العناوين والكلمات الدلالية...',
    placeholderEn: 'Enter your core target keyword or video concept to generate ranked metadata...',
    suggestedPromptsAr: [
      'سيو لفيديو: كورس تعلم البرمجة بالذكاء الاصطناعي للمبتدئين',
      'عناوين متفجرة لفيديو عن الربح من بيع المنتجات الرقمية',
      'كلمات مفتاحية متصدرة لنيتش التغذية الصحية والدايت'
    ],
    suggestedPromptsEn: [
      'SEO package for: Full Guide to Python Programming in 2026',
      'High-CTR title variations for: How to Make Money with Notion Templates',
      'Ranked search tags for: Minimalist Desk Setup & Productivity Tech'
    ]
  },

  // 15. Global Localization & Multilingual Titles (NEW)
  {
    id: 'global_localization',
    titleAr: 'مهندس التعريب والوصول العالمي',
    titleEn: 'Global Localization & Multilingual Titles',
    shortTitleAr: 'الوصول العالمي',
    shortTitleEn: 'Localization',
    descAr: 'ترجمة ومواءمة العناوين والأوصاف للغات الأعلى ربحية (الإنجليزية، الإسبانية، الألمانية) لمضاعفة الـ RPM.',
    descEn: 'Localize titles, descriptions & keywords into high-RPM languages (EN, ES, DE, FR) for global traffic.',
    icon: Globe,
    color: 'from-blue-600 to-cyan-600',
    glowColor: 'rgba(37, 99, 235, 0.4)',
    category: 'seo',
    placeholderAr: 'أدخل عنوان الفيديو ووصفه الحالي لتعريبه ومواءمته مع أهم اللغات العالمية المربحة...',
    placeholderEn: 'Enter your video title & concept to generate culturally optimized metadata in top global languages...',
    systemPromptAr: 'أنت خبير استراتيجية يوتيوب متعدد اللغات وتوطين المحتوى (YouTube Localization & High-RPM Specialist). قم بتهيئة بيانات الفيديو إلى اللغات: الإنجليزية، الإسبانية، الألمانية، والفرنسية. لكل لغة قدم: 1. عنوان جذاب متوافق مع ثقافة البحث في تلك الدول. 2. أول سطرين من الوصف. 3. الكلمات الدلالية الأكثر بحثاً باللغة المستهدفة لرفع الـ RPM العالمي.',
    systemPromptEn: 'You are a Global YouTube Localization Specialist. Localize metadata for English (US/UK), Spanish, German, and French: 1. High-CTR culturally adapted title. 2. Optimized 2-line description hook. 3. Top ranked localized search tags to maximize global RPM.',
    suggestedPromptsAr: [
      'ترجمة ومواءمة عنوان ووصف فيديو عن الذكاء الاصطناعي للجمهور الأمريكي والأوروبي',
      'عناوين باللغة الإنجليزية والإسبانية لفيديو طبخ عربي لجلب مشاهدات أجنبية',
      'استراتيجية الدبلجة وكتابة العناوين المتعددة لمضاعفة أرباح القناة'
    ],
    suggestedPromptsEn: [
      'Translate and culturally adapt my tech tutorial for US, German, and Spanish markets',
      'High-RPM multilingual title pack for a travel & culinary documentary',
      'Step-by-step strategy to capture Tier-1 country traffic with localized metadata'
    ]
  },

  // 16. Algorithm Traffic Source Predictor (NEW)
  {
    id: 'algorithm_predictor',
    titleAr: 'محاكي خوارزمية يوتيوب ومصدر الزيارات',
    titleEn: 'Algorithm Traffic Source Predictor',
    shortTitleAr: 'محاكي الخوارزمية',
    shortTitleEn: 'Algorithm Fit',
    descAr: 'تكييف الفيديو لاستهداف مصدر الزيارات المثالي (الصفحة الرئيسية Browse، الاقتراحات Suggested، أو البحث Search).',
    descEn: 'Optimize your video structure for Browse Features, Suggested Videos, or YouTube Search algorithms.',
    icon: TrendingUp,
    color: 'from-emerald-500 to-cyan-600',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    category: 'growth',
    placeholderAr: 'أدخل فكرة الفيديو لتشخيص مصدر الزيارات الأنسب وضبط عناصره للظهور في الصفحة الرئيسية...',
    placeholderEn: 'Enter your video concept to diagnose the ideal algorithm traffic stream (Browse vs Search vs Suggested)...',
    systemPromptAr: 'أنت كبير مهندسي خوارزميات يوتيوب ونظم التوصية (YouTube Recommendation System Architect). حلل الفكرة وحدد: 1. مصدر الزيارات الأساسي المستهدف (Browse Features vs Suggested vs Search). 2. ضبط العنوان والمصغرة للتناغم مع ذلك المصدر. 3. ضبط أول 30 ثانية لتلبية إشارات الخوارزمية (Session Duration & Click-to-End ratio).',
    systemPromptEn: 'You are a YouTube Recommendation Algorithm Architect. Analyze the concept: 1. Determine optimal traffic funnel (Browse vs Suggested vs YouTube Search). 2. Calibrate title and thumbnail triggers for that specific system. 3. Optimize the first 30 seconds for algorithmic session duration signals.',
    suggestedPromptsAr: [
      'كيف أصمم فيديو ليستهدفه اليوتيوب في الصفحة الرئيسية (Browse Features) وليس فقط البحث؟',
      'تهيئة فيديو للظهور في الفيديوهات المقترحة (Suggested) بجانب القنوات الكبيرة',
      'تحليل الفارق بين عناوين البحث وعناوين التوصيات التلقائية'
    ],
    suggestedPromptsEn: [
      'How to optimize a video for Browse Feature recommendations instead of just Search',
      'Strategy to piggyback onto major competitor videos via Suggested Recommendations',
      'Detailed checklist to trigger YouTube algorithm velocity in first 48 hours'
    ]
  },

  // 17. Viral Video Idea Generator
  {
    id: 'viral_ideas',
    titleAr: 'بنك الأفكار الفيروسية وزوايا التصوير',
    titleEn: 'Viral Video Idea Generator',
    shortTitleAr: 'بنك الأفكار',
    shortTitleEn: 'Viral Ideas',
    descAr: 'توليد أفكار فيديوهات غير مسبوقة مع زوايا فضول مبتكرة واقتراح للمصغرة وطريقة التنفيذ.',
    descEn: 'Generate out-of-the-box video angles, curiosity-gap hooks, and production formats.',
    icon: Lightbulb,
    color: 'from-yellow-500 to-amber-600',
    glowColor: 'rgba(234, 179, 8, 0.4)',
    category: 'content',
    placeholderAr: 'أدخل مجال قناتك أو اهتمام جمهورك لتوليد 5 أفكار استثنائية...',
    placeholderEn: 'Enter your niche or target audience to generate 5 breakthrough concepts...',
    suggestedPromptsAr: [
      'أفكار فيديوهات مبتكرة لقناة تقنية تكسر حاجز الملل',
      'أفكار تحديات واقعية لقناة شبابية بميزانية منخفضة',
      'مواضيع فيديوهات تثقيفية وغامضة تجذب ملايين المشاهدات'
    ],
    suggestedPromptsEn: [
      'High-performing video concepts for a tech review channel',
      'Psychological thriller-style mystery topics for documentary creators',
      'Low-budget high-engagement experiment videos for YouTube'
    ]
  },

  // 18. Deep Channel Audit & Health Score
  {
    id: 'channel_audit',
    titleAr: 'فحص وتشخيص القناة الشامل',
    titleEn: 'Deep Channel Audit & Health Score',
    shortTitleAr: 'فحص القناة',
    shortTitleEn: 'Channel Audit',
    descAr: 'تحليل أداء القناة، تقييم نقاط القوة والضعف، واقتراح خطة إنقاذ ونمو مخصصة.',
    descEn: 'Evaluate channel health metrics, identify viewer dropoff causes, and get a growth roadmap.',
    icon: BarChart2,
    color: 'from-violet-500 to-purple-600',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    category: 'analytics',
    placeholderAr: 'الصق رابط أو اسم القناة، أو صف وضع قناتك الحالي ومعدل مشاهداتك...',
    placeholderEn: 'Paste YouTube Channel link or handle, or describe your current subscriber & view stats...',
    suggestedPromptsAr: [
      'قناتي فيها 50 ألف مشترك لكن المشاهدات هبطت لـ 500 مشاهدة، ما الحل؟',
      'كيف أنقل قناتي من 10k إلى 100k مشترك في 6 شهور؟',
      'تحليل استراتيجية نشر 3 فيديوهات أسبوعياً مقابل فيديو واحد احترافي'
    ],
    suggestedPromptsEn: [
      'Audit my channel strategy: 40k subs but recent videos getting under 1k views',
      'Actionable plan to scale from 10k to 100k subscribers in 180 days',
      'Evaluate short-form vs long-form content distribution ratio'
    ]
  },

  // 19. Upload Timing & Global Atlas
  {
    id: 'timing_atlas',
    titleAr: 'المجهر الزمني وأفضل أوقات النشر',
    titleEn: 'Upload Timing & Global Atlas',
    shortTitleAr: 'أفضل أوقات النشر',
    shortTitleEn: 'Timing Atlas',
    descAr: 'حساب الساعة واليوم الذهبيين لرفع الفيديو لضمان أعلى تفاعل أولي في أول 24 ساعة.',
    descEn: 'Calculate the golden publishing hour and day to maximize initial 24h algorithm push.',
    icon: Timer,
    color: 'from-teal-500 to-emerald-600',
    glowColor: 'rgba(20, 184, 166, 0.4)',
    category: 'growth',
    placeholderAr: 'أدخل بلد جمهورك المستهدف ونوع المحتوى (مثال: مصر والسعودية، محتوى شبابي)...',
    placeholderEn: 'Enter target audience country & genre (e.g., US & UK, Gaming / Tech)...',
    systemPromptAr: 'أنت خبير توقيتات نشر محتوى اليوتيوب وسلوك الجمهور العالمي. حدد بالتفصيل: 1. الساعات الذهبية للنشر بالأيام (مع فروق التوقيت للبلدان المستهدفة). 2. أفضل يوم لنشر الفيديوهات الطويلة مقابل الشورتس. 3. استراتيجية الإطلاق المبكر غير المدرج (Unlisted) قبل النشر بساعتين لتحسين معالجة الـ 4K والسيو.',
    systemPromptEn: 'You are a YouTube Publishing Timing & Global Audience Analyst. Provide: 1. Golden publishing windows by timezone. 2. Best days for Long-Form vs Shorts. 3. 2-hour pre-publish workflow (HD processing, captions, indexing) to maximize velocity.',
    suggestedPromptsAr: [
      'ما هو أفضل وقت لنشر الفيديوهات الطويلة للمشاهدين في الخليج ومصر؟',
      'أفضل توقيت لرفع يوتيوب شورتس لتحقيق انتشار سريع؟',
      'جدول النشر المثالي لقناة تقدم محتوى تعليمي وثقافي'
    ],
    suggestedPromptsEn: [
      'Best publishing times for US & European audiences in Tech niche',
      'Optimal upload schedule for YouTube Shorts to trigger the Shorts Feed',
      'Weekend vs Weekday upload strategy for long-form educational videos'
    ]
  },

  // 20. Sponsor Pitch & Media Kit Pro (NEW)
  {
    id: 'sponsor_pitch',
    titleAr: 'مولد عروض الرعايات والسبونسر',
    titleEn: 'Sponsor Pitch & Media Kit Pro',
    shortTitleAr: 'عروض الرعايات',
    shortTitleEn: 'Sponsor Pitch',
    descAr: 'صياغة إيميلات احترافية للشركات، تحديد باقات الأسعار العادلة، وطريقة التفاوض على صفقات الرعاية.',
    descEn: 'Generate compelling brand outreach emails, calculate fair sponsorship rates, and negotiation scripts.',
    icon: Briefcase,
    color: 'from-emerald-500 to-green-600',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    category: 'analytics',
    placeholderAr: 'أدخل اسم الشركة التي تريد مراسلتها، ومجال قناتك وحجم المشاهدات...',
    placeholderEn: 'Enter target brand name, your channel niche, and average view counts...',
    systemPromptAr: 'أنت خبير صفقات الرعاية وإدارة أعمال صناع المحتوى (Creator Brand Deals & Sponsorship Negotiator). صمم حزمة التواصل: 1. إيميل تواصل مباشر (Cold Pitch Email) جذاب ومقنع دون مبالغة. 2. حساب تسعير الرعاية العادل (Integration 60s vs Dedicated Video). 3. اقتراح زاوية دمج ذكية ومقنعة للعلامة التجارية في المحتوى.',
    systemPromptEn: 'You are a Senior Creator Sponsorship Agent & Brand Negotiator. Provide: 1. High-converting cold outreach pitch email tailored to the brand. 2. Fair rate calculation (Integration vs Dedicated). 3. Creative brand integration concept that protects viewer trust.',
    suggestedPromptsAr: [
      'إيميل احترافي لطلب رعاية من شركة برمجيات وتطبيقات لقناة تقنية',
      'كيف أسعر رعاية دمج 60 ثانية لقناتي التي تحصل على 50 ألف مشاهدة لكل فيديو؟',
      'طريقة التفاوض مع الشركات للحصول على عقود رعاية طويلة الأجل (3 إلى 6 أشهر)'
    ],
    suggestedPromptsEn: [
      'High-converting cold pitch email to a software/VPN brand for tech creator',
      'How to price a 60-second integrated sponsorship for 50k average views',
      'Negotiation framework to close multi-video retainer sponsorship deals'
    ]
  },

  // 21. Earnings & RPM Valuation Lab
  {
    id: 'earnings_lab',
    titleAr: 'مختبر وحاسبة الأرباح والـ RPM',
    titleEn: 'Earnings & RPM Valuation Lab',
    shortTitleAr: 'مختبر الأرباح',
    shortTitleEn: 'Earnings Lab',
    descAr: 'تقدير أرباح إعلانات أدسنس، عقود الرعايات المتوقعة، وسبل مضاعفة الـ RPM.',
    descEn: 'Estimate AdSense revenue, RPM variations by geography, and brand deal valuations.',
    icon: DollarSign,
    color: 'from-emerald-600 to-green-600',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    category: 'analytics',
    placeholderAr: 'أدخل عدد المشاهدات الشهرية ومجال قناتك ودول المشاهدين...',
    placeholderEn: 'Enter monthly views, niche, and top audience countries...',
    systemPromptAr: 'أنت مستشار مالي وخبير تحقيق الدخل من اليوتيوب (YouTube Monetization & RPM Strategist). حلل الأرباح بدقة: 1. تقدير الـ RPM و CPM حسب النيتش والدول المستهدفة. 2. استراتيجية مضاعفة الأرباح من خلال هيكلة الفيديوهات الطويلة (أكثر من 8 دقائق) ومواضع الإعلانات. 3. مصادر دخل إضافية مستقلة عن إعلانات أدسنس.',
    systemPromptEn: 'You are a YouTube Monetization & Revenue Optimization Specialist. Provide: 1. Granular RPM and CPM estimates by niche and geo-tier. 2. 8-minute+ video mid-roll placement strategy to multiply earnings. 3. Diversified revenue streams beyond AdSense.',
    suggestedPromptsAr: [
      'كم أرباح قناة تجلب 500,000 مشاهدة شهرياً في مجال التمويل والاستثمار؟',
      'كيف أرفع الـ RPM في قناتي من 1 دولار إلى 5 دولارات؟',
      'كم أطلب من الشركات مقابل رعاية دمج 60 ثانية لقناة بحجم 100k مشترك؟'
    ],
    suggestedPromptsEn: [
      'Calculate estimated earnings for 1,000,000 monthly views in Finance & SaaS',
      'How to double YouTube AdSense RPM with video structure and mid-roll placement',
      'Fair pricing rate for a 60-second dedicated sponsor integration'
    ]
  },

  // 22. Digital Product & Membership Funnel (NEW)
  {
    id: 'digital_products',
    titleAr: 'مهندس المنتجات الرقمية والعضويات',
    titleEn: 'Digital Product & Membership Funnel',
    shortTitleAr: 'المنتجات الرقمية',
    shortTitleEn: 'Digital Funnel',
    descAr: 'بناء مسار تحويل المشاهدين إلى عملاء لمشتركين مدفوعين، كورسات، أو قوالب رقمية لزيادة الدخل.',
    descEn: 'Design creator monetization funnels for digital products, paid memberships, courses, and lead magnets.',
    icon: Award,
    color: 'from-amber-500 to-yellow-600',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    category: 'analytics',
    placeholderAr: 'صف مجال قناتك وخبرتك لتصميم خطة إطلاق منتج رقمي أو اشتراك انتساب...',
    placeholderEn: 'Describe your channel niche and skills to design a high-converting digital product or membership funnel...',
    systemPromptAr: 'أنت استراتيجي اقتصاد صناع المحتوى والمنتجات الرقمية (Creator Economy Funnel Architect). صمم خطة بيع المنتجات الرقمية: 1. فكرة المنتج الرقمي الأنسب لجمهورك (كتاب إلكتروني، قالب Notion، كورس مركز). 2. صياغة العرض المجاني لجذب الإيميلات (Lead Magnet). 3. باقات عضوية القناة المدفوعة (Channel Memberships) مع المزايا الحصرية المقنعة.',
    systemPromptEn: 'You are an elite Creator Economy & Digital Product Strategist. Architect: 1. The highest-converting digital product for the niche. 2. Irresistible free lead magnet. 3. 3-tier Channel Membership perks structure.',
    suggestedPromptsAr: [
      'خطة إطلاق كورس رقمي أو كتيب تعليمي لجمهور قناة مهتمة بالإنتاجية',
      'مزايا حصرية وباقات اشتراك انتساب (Channel Memberships) تدفع المتابع للاشتراك',
      'كيف أبني مسار بيع (Funnel) يحول 1% من مشاهدي القناة لمشترين لمنتجي؟'
    ],
    suggestedPromptsEn: [
      'Launch blueprint for a digital Notion template & workbook in productivity niche',
      'High-converting 3-tier YouTube Membership perks that people actually want',
      'Automated email funnel strategy to monetize YouTube viewers'
    ]
  },

  // 23. Community Booster & Pinned Comment Strategy (NEW)
  {
    id: 'community_booster',
    titleAr: 'صائد الردود وتنشيط المجتمع',
    titleEn: 'Community Booster & Pinned Comment',
    shortTitleAr: 'تنشيط المجتمع',
    shortTitleEn: 'Community Booster',
    descAr: 'كتابة تعليق مثبت ذكي واستطلاعات رأي تفاعلية تشعل مئات التعليقات لرفع إشارات الخوارزمية.',
    descEn: 'Craft psychological pinned comments and community poll strategies that ignite hundreds of responses.',
    icon: MessageSquare,
    color: 'from-cyan-500 to-teal-600',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    category: 'growth',
    placeholderAr: 'أدخل موضوع الفيديو لتوليد تعليقات مثبتة ومنشورات مجتمع تثير تفاعل الجمهور...',
    placeholderEn: 'Enter your video topic to generate engagement-inducing pinned comments & Community tab polls...',
    systemPromptAr: 'أنت خبير بناء مجتمع اليوتيوب وتفاعل المشاهدين (YouTube Community & Engagement Strategist). صمم استراتيجية التفاعل: 1. صياغة 3 خيارات لتعليق مثبت (Pinned Comment) مثير للفضول ويدفع لكتابة تعليق. 2. فكرة استطلاع رأي (Community Poll) في علامة تبويب المنتدى يشارك فيه آلاف المتابعين. 3. طريقة ذكية للرد على التعليقات في أول ساعتين.',
    systemPromptEn: 'You are a YouTube Community & Engagement Specialist. Provide: 1. 3 high-engagement pinned comment options that compel viewers to reply. 2. Viral Community Tab poll concept with debate-inducing options. 3. First-2-hours comment management strategy.',
    suggestedPromptsAr: [
      'اكتب تعليق مثبت ذكي يشعل النقاش لفيديو عن العمل الحر والذكاء الاصطناعي',
      'استطلاع رأي لعلامة تبويب المنتدى (Community Tab) يجذب آلاف الأصوات',
      'كيف أحول المعلقين في الفيديو إلى مجتمع متفاعل ومخلص للقناة؟'
    ],
    suggestedPromptsEn: [
      '3 debate-sparking pinned comments for a video on AI replacing software jobs',
      'Viral Community Tab poll framework with witty options',
      'Comment section engagement playbook to trigger positive algorithm feedback'
    ]
  },

  // 24. Podcast & Deep Interview Strategist (NEW)
  {
    id: 'podcast_strategist',
    titleAr: 'مستشار البودكاست والمقابلات العميقة',
    titleEn: 'Podcast & Deep Interview Strategist',
    shortTitleAr: 'مستشار البودكاست',
    shortTitleEn: 'Podcast Strategist',
    descAr: 'صياغة أسئلة غير تقليدية للضيوف، تقسيم فصول الفيديو (Chapters)، وهندسة لحظات الصراحة.',
    descEn: 'Formulate piercing interview questions, chapter structures, and breakthrough conversation arcs.',
    icon: Mic,
    color: 'from-purple-500 to-indigo-600',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    category: 'content',
    placeholderAr: 'أدخل اسم أو تخصص الضيف وموضوع الحلقة لتوليد أسئلة غير تقليدية وفصول تشويقية...',
    placeholderEn: 'Enter guest background and topic to construct deep interview questions and compelling chapters...',
    systemPromptAr: 'أنت محاور بودكاست استثنائي ومعد برامج حوارية (بأسلوب Lex Fridman و Joe Rogan). صمم الحلقة: 1. أسئلة كسر الجليد والأسئلة غير التقليدية (Unconventional Questions). 2. فصول الفيديو التشويقية (Timestamped Chapters) بعناوين تجذب النقر. 3. كيفية إدارة الصمت وتوجيه الحديث للحظات الصراحة والعمق.',
    systemPromptEn: 'You are a Master Podcast Producer & Interview Strategist (inspired by Lex Fridman & Diary of a CEO). Formulate: 1. 10 unconventional, psychologically deep guest questions. 2. High-CTR YouTube Chapter timestamps. 3. Story elicitation prompts for emotional breakthroughs.',
    suggestedPromptsAr: [
      'أسئلة غير تقليدية ومفاجئة لمقابلة بودكاست مع رائد أعمال ناجح',
      'فصول وعناوين فصول تشويقية لحلقة بودكاست مدتها ساعة عن الصحة النفسية',
      'كيف تقود مقابلة وتستخرج أسراراً وتجارب لم يروها الضيف في أي لقاء سابق؟'
    ],
    suggestedPromptsEn: [
      '10 provocative interview questions for a guest who is a venture capitalist',
      'High-CTR YouTube Chapter timestamps for a 60-minute mental health episode',
      'Master interviewing techniques to pull untold stories out of your guest'
    ]
  },

  // 25. Audience DNA & Psychology
  {
    id: 'audience_dna',
    titleAr: 'تحليل سيكولوجية وهوية الجمهور',
    titleEn: 'Audience DNA & Psychology',
    shortTitleAr: 'سيكولوجية الجمهور',
    shortTitleEn: 'Audience DNA',
    descAr: 'تشريح الدوافع العاطفية والنفسية للمشاهدين وما يدفعهم للتعليق والمشاركة والاشتراك.',
    descEn: 'Dissect the cognitive triggers and emotional drivers of your viewers to maximize retention.',
    icon: Users,
    color: 'from-purple-500 to-pink-600',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    category: 'growth',
    placeholderAr: 'صف جمهورك أو قناتك لتحليل شخصية المشاهد وسلوكه النفسي...',
    placeholderEn: 'Describe your content style to decode your ideal viewer avatar and emotional triggers...',
    systemPromptAr: 'أنت محلل سيكولوجية وسلوك الجماهير على يوتيوب (Audience Psychology & Behavioral Profiler). حلل شخصية المشاهد: 1. الصورة النمطية للمشاهد المثالي (Ideal Viewer Avatar). 2. الدوافع النفسية التي تجعله ينقر ويشارك الفيديو. 3. نقاط الألم والمخاوف والآمال التي يجب لمسها في الفيديوهات القادمة.',
    systemPromptEn: 'You are a YouTube Audience Psychologist. Provide: 1. Deep Viewer Avatar profiling (fears, desires, age, psychographics). 2. Core emotional drivers behind video sharing and loyalty. 3. Content roadmap mapped to audience pain points.',
    suggestedPromptsAr: [
      'ما هي الدوافع النفسية التي تجعل المشاهد يشارك الفيديو مع أصدقائه؟',
      'تحليل شخصية المشاهد المهتم بمحتوى تطوير الذات والإنتاجية',
      'كيف أصنع ولاء عاطفي يربط المتابع بالقناة وليس فقط بموضوع الفيديو؟'
    ],
    suggestedPromptsEn: [
      'Decode the psychology of viral sharing in educational and tech content',
      'Profile the ideal viewer persona for a productivity and software channel',
      'Techniques to build an authentic personal brand connection with viewers'
    ]
  },

  // 26. Competitor Recon & Gap Exploitation
  {
    id: 'competitor_recon',
    titleAr: 'استخبارات وتحليل المنافسين',
    titleEn: 'Competitor Recon & Gap Exploitation',
    shortTitleAr: 'تحليل المنافسين',
    shortTitleEn: 'Competitor Recon',
    descAr: 'اكتشاف الثغرات والمواضيع غير المغطاة في قنوات المنافسين للاستحواذ على جمهورهم.',
    descEn: 'Uncover content gaps and unserved audience queries in competitor channels.',
    icon: Crosshair,
    color: 'from-red-500 to-rose-600',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    category: 'growth',
    placeholderAr: 'أدخل أسماء المنافسين أو روابط قنواتهم لاكتشاف الثغرات في محتواهم...',
    placeholderEn: 'Enter competitor channel names or topic to find content gaps you can dominate...',
    systemPromptAr: 'أنت محلل استخبارات المنافسة على يوتيوب (Competitive Intelligence & Gap Analyst). حدد بدقة: 1. الثغرات والمواضيع التي يتجاهلها المنافسون (Unserved Demand). 2. نقاط الضعف في جودة وتنسيق محتواهم. 3. استراتيجية إنتاج فيديوهات متفوقة بصرية ومعرفية تسحب المشاهدات منهم.',
    systemPromptEn: 'You are a YouTube Competitive Intelligence Specialist. Uncover: 1. High-demand audience questions competitors fail to answer. 2. Blindspots in their presentation and retention. 3. Superior content angles designed to outrank and capture their audience.',
    suggestedPromptsAr: [
      'كيف أنافس القنوات الكبيرة في مجالي وأتفوق عليها بفيديوهات نوعية؟',
      'استخراج الثغرات والمشاكل التي يتجاهلها صناع المحتوى في مجال التقنية',
      'تحليل استراتيجية المنافسين الناجحين في إنتاج الشورتس'
    ],
    suggestedPromptsEn: [
      'How a small creator can outperform legacy channels with niche authority',
      'Identify overlooked angles in major coding and tech review channels',
      'Framework to dissect a competitor video that gained 1M+ views'
    ]
  },

  // 27. Outlier Hunter & Viral Deconstruction
  {
    id: 'outliers_hunter',
    titleAr: 'صائد الفيديوهات المتفجرة (Outliers)',
    titleEn: 'Outlier Hunter & Viral Deconstruction',
    shortTitleAr: 'صائد المتفجرات',
    shortTitleEn: 'Outlier Hunter',
    descAr: 'تفكيك الفيديوهات التي حققت أرقاماً تفوق متوسط القناة بعشرات الأضعاف ومعرفة السر.',
    descEn: 'Reverse-engineer videos that outperformed channel averages by 10x or more.',
    icon: Gem,
    color: 'from-amber-400 to-yellow-600',
    glowColor: 'rgba(251, 191, 36, 0.4)',
    category: 'analytics',
    placeholderAr: 'أدخل فكرة أو رابط فيديو حقق قفزة غير طبيعية في المشاهدات...',
    placeholderEn: 'Enter a video concept or link that scored 10x higher views than usual...',
    systemPromptAr: 'أنت خبير تفكيك الفيديوهات المتفجرة إحصائياً (Outlier Video Reverse-Engineer). قم بتشريح الفيديو: 1. ما هو المتغير الرئيسي الذي جعل هذا الفيديو ينفجر 10x مقارنة ببقية الفيديوهات؟ 2. تحليل سيكولوجية العنوان والتغليف البصري. 3. كيف تطبق نفس المعادلة على أفكار جديدة في قناتك؟',
    systemPromptEn: 'You are an Outlier Content Reverse-Engineer. Deconstruct: 1. The exact outlier catalyst that drove 10x baseline views. 2. Packaging anomaly (title + visual dissonance). 3. Replicable formula to apply this outlier effect to future topics.',
    suggestedPromptsAr: [
      'ما هي العناصر المشتركة في الفيديوهات التي تحقق ملايين المشاهدات فجأة؟',
      'كيف أحول فيديو عادي إلى فيديو فيروسي (Outlier) بتعديل العنوان والبداية فقط؟',
      'تشريح سر نجاح الفيديوهات التي تبدأ بمواقف صادمة'
    ],
    suggestedPromptsEn: [
      'What structural traits make an outlier video explode on the YouTube homepage?',
      'How to repackage an average topic into a 10x viral packaging hook',
      'Deconstruct the thumbnail and intro psychology of top MrBeast videos'
    ]
  },

  // 28. Mastermind 360° Studio Protocol
  {
    id: 'mastermind',
    titleAr: 'بروتوكول العقل المدبر الشامل (Mastermind)',
    titleEn: 'Mastermind 360° Studio Protocol',
    shortTitleAr: 'العقل المدبر',
    shortTitleEn: 'Mastermind',
    descAr: 'تنفيذ بروتوكول فحص كامل وشامل للقناة وتوليد بطاقة استخباراتية تفاعلية قابلة للتحميل.',
    descEn: 'Execute a comprehensive 360-degree channel audit and generate an exportable dossier card.',
    icon: Brain,
    color: 'from-purple-600 to-indigo-700',
    glowColor: 'rgba(147, 51, 234, 0.4)',
    category: 'analytics',
    placeholderAr: 'أدخل رابط القناة لتشغيل بروتوكول المسح الشامل المكون من 9 مستويات...',
    placeholderEn: 'Paste YouTube channel URL to initiate the 9-layer Mastermind diagnostic protocol...',
    suggestedPromptsAr: [
      'https://www.youtube.com/@MrBeast',
      'فحص استخباراتي شامل لقناة تقنية ناشئة',
      'بروتوكول تقييم قناة وثائقيات تاريخية'
    ],
    suggestedPromptsEn: [
      'https://www.youtube.com/@MKBHD',
      'Run complete Mastermind audit on my tech channel',
      'Full 9-tier diagnostic protocol for a documentary channel'
    ]
  }
];
