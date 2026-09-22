
import React, { useState } from 'react';
import { useLang } from '../index';
import { motion } from 'motion/react';
import { 
  Activity, BarChart2, Zap, Search, DollarSign, 
  Users, TrendingUp, Lightbulb, Swords, Gem, 
  CheckCircle, BookOpen, Cpu, Target, Info, Layers, FileText,
  AlertTriangle, MousePointer2, Brain, Timer, Compass, Image as ImageIcon, Feather, Clock, Calendar, History
} from 'lucide-react';

interface DocContent {
  philosophy: string;
  importance: string;
  howToUse: string[];
  interpretingData: { label: string, desc: string }[];
  proStrategy: string;
  technicalSpecs: string;
  commonPitfalls: string[];
}

interface DocSection {
  id: string;
  icon: any;
  title: Record<'en' | 'ar', string>;
  content: Record<'en' | 'ar', DocContent>;
}

const DETAILED_DOCS: DocSection[] = [
  {
    id: 'idea_generator',
    icon: Lightbulb,
    title: { ar: 'مولد الأفكار الاستراتيجي (مزرعة الفيروسية)', en: 'Strategic Idea Generator' },
    content: {
      ar: {
        philosophy: "الأفكار ليست مجرد شرارات إبداعية عشوائية، بل هي هندسة مبنية على تحليل السوق وفهم عميق للجمهور. مولد الأفكار لدينا يعتمد على ربط الاتجاهات الحالية باهتمامات الناس لإنتاج أفكار فيديوهات تمتلك فرصة كبيرة للنجاح والانتشار.",
        importance: "بداية أي فيديو ناجح تعتمد على فاعلية الفكرة. إذا كانت الفكرة ضعيفة، فلن ينقذها أفضل مونتاج أو سيناريو. هذه الأداة تضمن لك البدء بأساس قوي لا يقبل الكسر.",
        howToUse: [
            "أدخل الكلمات المفتاحية أو الموضوع الأساسي الذي ترغب في التحدث عنه.",
            "حدد مستوى الإبداع (عالي للأفكار المجنونة، أو منخفض للأفكار التقليدية والمضمونة).",
            "حدد الجمهور المستهدف بدقة للحصول على محتوى مخصص لهم.",
            "اختر شكل الفيديو (طويل للتعمق، أو قصير Short لسرعة الانتشار).",
            "اضغط على زر التوليد وانتظر بناء خريطة الأفكار الكلية."
        ],
        interpretingData: [
            { label: "زوايا التناول (Angles)", desc: "الطرق المتعددة التي يمكن من خلالها شرح نفس الفكرة لتناسب جماهير مختلفة." },
            { label: "الجاذبية الجماهيرية", desc: "مدى قدرة الفكرة على جذب المشاهد العادي وليس فقط المهتم بالمجال." }
        ],
        proStrategy: "استخدم مستوى إبداع 'عالي' مع مجالات أو موضوعات تبدو مملة. الذكاء الاصطناعي سيجد لك زاوية غريبة (مثل ربط التاريخ بالذكاء الاصطناعي) مما يصنع فجوة فضول جبارة (Curiosity Gap).",
        technicalSpecs: "Engine: Gemini Pro - Semantic Ideation. Framework: Market Gap Analysis Architecture.",
        commonPitfalls: ["استخدام كلمات مفتاحية واسعة جداً (مثل: رياضة). حدد أكثر (مثل: تمارين منزلية للمبتدئين فوق الأربعين).", "تجاهل تحديد الجمهور المستهدف بدقة."]
      },
      en: {
        philosophy: "Ideas aren't just random sparks; they are engineered based on market analysis. Our Idea Generator connects current trends with human psychology to produce viral concepts.",
        importance: "The foundation of a successful video is its idea. A weak concept cannot be saved by great editing. This tool ensures you build on an unbreakable foundation.",
        howToUse: [
            "Enter keywords or the main topic.",
            "Set the creativity level (High for viral/crazy ideas, Law for stable/proven ones).",
            "Define your target audience accurately.",
            "Choose the video format (Long-form or Shorts).",
            "Generate your idea map."
        ],
        interpretingData: [
            { label: "Angles", desc: "Different perspectives to approach the same concept." },
            { label: "Mass Appeal", desc: "The potential of the idea to capture casual viewers." }
        ],
        proStrategy: "Use 'High' creativity for seemingly boring niches. Connecting mundane topics with high-energy concepts creates massive curiosity gaps.",
        technicalSpecs: "Engine: Gemini Pro - Semantic Ideation. Framework: Market Gap Analysis.",
        commonPitfalls: ["Using very broad keywords.", "Ignoring specific audience targeting."]
      }
    }
  },
  {
    id: 'script_writer',
    icon: Feather,
    title: { ar: 'كاتب السيناريو (مهندس الانتباه العاطفي)', en: 'Script Writer (Attention Engineer)' },
    content: {
      ar: {
        philosophy: "هذا ليس مجرد كاتب نصوص، بل هو 'مهندس انتباه'. بُني على أسس السيكولوجية البشرية لضمان بقاء المشاهد حتى الثانية الأخيرة. السكريبت الناجح هو رحلة عاطفية قبل أن يكون رحلة معلوماتية.",
        importance: "في عصر تشتت الانتباه، السكريبت هو الملك. إذا لم تخطف المشاهد في أول 3 ثوانٍ (الخطاف)، فقد خسرته للأبد. أداتنا تقوم بهندسة 'خطافات' لا تقاوم وبناء درامي متصاعد يكسر الملل.",
        howToUse: [
            "أدخل الموضوع الأساسي بدقة مع أي تفاصيل فرعية تريد توضيحها.",
            "حدد مدة الفيديو التقريبية لتنظيم كثافة الكلمات.",
            "اختر النبرة (Tone) سواء كانت تعليمية، كوميدية، أو درامية.",
            "حدد المنصة (YouTube، TikTok، Reels) لتكييف أسلوب العرض.",
            "حدد نوع الخطاف (علمي، عاطفي، صادم) للحصول على أفضل بداية."
        ],
        interpretingData: [
            { label: "Hook (الخطاف)", desc: "أول 3 إلى 5 ثوانٍ من الفيديو. وظيفتها الوحيدة هي منع المشاهد من التمرير." },
            { label: "Retention Structure", desc: "هيكلية تبديل وتيرة الحديث كل 30-45 ثانية لمنع الملل (B-roll cues)." }
        ],
        proStrategy: "اطلب دائماً توجيهات بصرية (B-Roll) مع السكريبت. كلام بدون توجيه بصري يقلل الاحتفاظ بالجمهور (Retention) بنسبة 40%. دع الذكاء الاصطناعي يقترح عليك ماذا تعرض على الشاشة.",
        technicalSpecs: "Engine: Gemini Pro. NLP Framework: High-Retention Video Scripting Blueprint v3.",
        commonPitfalls: ["تجاهل الخطاف أو جعله بطيئاً جداً.", "عدم استخدام النبرة المناسبة لجمهورك المستهدف (استخدام نبرة أكاديمية لجمهور مراهقين)."]
      },
      en: {
        philosophy: "Not just a text generator, but an 'Attention Engineer'. Built on human psychology to ensure viewers stay until the last second. A script is an emotional journey.",
        importance: "In an era of short attention spans, the script is king. If you don't hook the viewer in 3 seconds, they are gone. Our tool engineers irresistible hooks.",
        howToUse: [
            "Enter the core topic with detailed sub-points.",
            "Select the estimated length to adjust word density.",
            "Choose the Tone (Educational, Comedy, Dramatic).",
            "Select the target platform (YouTube, TikTok, Reels).",
            "Choose the Hook type (Scientific, Emotional, Shocking)."
        ],
        interpretingData: [
            { label: "The Hook", desc: "The first 3 seconds designed explicitly to stop the scroll." },
            { label: "Retention Pattern", desc: "Changing pace every 30-45s with B-roll cues to reset attention." }
        ],
        proStrategy: "Always follow the visual B-roll cues provided in the script. Talking heads without visual pauses drop retention by 40%.",
        technicalSpecs: "Engine: Gemini Pro. NLP Framework: High-Retention Blueprint.",
        commonPitfalls: ["Weak or slow hooks.", "Mismatching the tone with your target demographic."]
      }
    }
  },
  {
    id: 'seo_tools',
    icon: Search,
    title: { ar: 'أدوات السيو (مخترق خوارزميات الاقتراح)', en: 'SEO Tools (Algorithm Hacker)' },
    content: {
      ar: {
        philosophy: "السيو لم يعد مجرد حشو كلمات مفتاحية. هو فهم 'لنية المستخدم' (User Intent) والتحدث بلغة الخوارزمية ولغة المتلقي في نفس الوقت.",
        importance: "أفضل فيديو في العالم لن يحصل على مشاهدات إذا لم تستطع الخوارزمية فهم محتواه. أدوات السيو لدينا تبني 'جسراً' بين محتواك وبين محركات بحث يوتيوب وجوجل.",
        howToUse: [
            "أدخل فكرة أو عنوان الفيديو.",
            "حدد تركيز السيو (هل تستهدف الصدارة في البحث أم الظهور في الاقتراحات؟).",
            "حدد المنطقة الجغرافية لتحسين الكلمات المفتاحية المحلية.",
            "احصل على عنوان جذاب، وصف محسن بالكامل، וعلامات (Tags) دقيقة."
        ],
        interpretingData: [
            { label: "CTR Titles", desc: "عناوين مصممة لرفع نسبة الدخول (Click-Through Rate) بدمج الكلمة المفتاحية مع الإثارة." },
            { label: "Semantic Description", desc: "وصف منظم يشمل روابط الـ Timestamp والكلمات المرادفة لمساعدة الذكاء الاصطناعي لليوتيوب." }
        ],
        proStrategy: "استخدم أول سطرين من الوصف بذكاء. يوتيوب يعيرهما أهمية قصوى في البحث. اجعلهما مزيجاً بين الجملة الخاطفة والكلمة المفتاحية الرئيسية دون حشو مبالغ فيه.",
        technicalSpecs: "Engine: Multi-layer SEO Optimization. Metrics Target: Search & Discoverability Indexing.",
        commonPitfalls: ["استخدام كلمات مفتاحية لا علاقة لها بالفيديو (يؤدي لعقاب الخوارزمية).", "كتابة عناوين مملة بحجة 'السيو'."]
      },
      en: {
        philosophy: "SEO is no longer keyword stuffing. It revolves around understanding 'User Intent' and speaking the language of both the algorithm and human curiosity.",
        importance: "The best video goes unseen if the algorithm cannot categorize it. Our SEO tools build a bridge between your content and YouTube's search engine.",
        howToUse: [
            "Enter the video idea or raw title.",
            "Select the SEO Focus (Search Ranking vs Suggested Videos).",
            "Pick the target geographical region for localized meta-data.",
            "Generate Click-Through-Rate optimized titles, descriptions, and tags."
        ],
        interpretingData: [
            { label: "CTR Titles", desc: "Titles balancing high volume keywords with psychological click-triggers." },
            { label: "Semantic Description", desc: "Structured data including timestamps and LSI keywords to feed the algorithm." }
        ],
        proStrategy: "The first two lines of your description are critical. Make them a blend of a hook and your primary keyword. Avoid unreadable keyword lists.",
        technicalSpecs: "Engine: Multi-layer SEO Optimization. Metrics: Search & Discoverability.",
        commonPitfalls: ["Using misleading tags (bannable offense).", "Writing robotic, boring titles for the sake of SEO."]
      }
    }
  },
  {
    id: 'planner',
    icon: Calendar,
    title: { ar: 'المخطط الاستراتيجي (عقل النشر المسبق)', en: 'Strategic Planner' },
    content: {
      ar: {
        philosophy: "صناعة المحتوى بشكل عشوائي تؤدي للاحتراق الوظيفي. التخطيط السليم هو ما يحول 'الهاوي' إلى 'مؤسسة إعلامية متكاملة'.",
        importance: "المخطط يضع لك مساراً واضحاً يضمن استمرارية النشر (Consistency) دون التضحية بالجودة، وهو العامل الأهم الذي يحبه يوتيوب.",
        howToUse: [
            "اختر عدد الأيام (أسبوع، شهر، الخ).",
            "حدد المنصات المستهدفة للنشر.",
            "أدخل أهدافك الاستراتيجية (زيادة المشاهدات، رفع المبيعات).",
            "قم بمراجعة جدول المواعيد والمحتوى المقترح للالتزام به."
        ],
        interpretingData: [
            { label: "Content Pillars", desc: "الأعمدة الأساسية للمحتوى (مثل: تعليمي، ترفيهي، ترويجي) وكيفية توزيعها على الأيام." },
            { label: "Batch Production", desc: "استراتيجية إنتاج المحتوى دفعة واحدة لتقليل المجهود اليومي." }
        ],
        proStrategy: "قم بتفعيل مبدأ (إنشاء مرة واحدة، التوزيع في كل مكان). فكرة فيديو يوتيوب يجب أن تتحول في خطتك إلى 3 ريلز، بوست انستجرام، وتغريدة على إكس.",
        technicalSpecs: "Engine: Scheduling & Resource Allocation Logic.",
        commonPitfalls: ["التخطيط لأكثر مما يمكنك إنتاجه (Over-promising).", "تجاهل أيام الراحة في المخطط."]
      },
      en: {
        philosophy: "Random content creation leads to burnout. Proper planning turns an amateur into a fully functioning media company.",
        importance: "A planner ensures consistency without sacrificing quality—the highest-valued metric by YouTube's algorithm.",
        howToUse: [
            "Select the timeframe (Week, Month).",
            "Select the target social media platforms.",
            "Enter your goals (Views, Sales, Leads).",
            "Review the generated schedule and stick to the routine."
        ],
        interpretingData: [
            { label: "Content Pillars", desc: "Main categories (Edu, Ent, Promo) perfectly distributed." },
            { label: "Batching", desc: "Recording 4 videos in one day to free up the rest of the month." }
        ],
        proStrategy: "Adopt the 'Create Once, Distribute Everywhere' methodology. A long YouTube video must be planned to break down into 3 Reels, a tweet thread, and an IG post.",
        technicalSpecs: "Engine: Resource Allocation Engine.",
        commonPitfalls: ["Planning an unrealistic volume of content.", "Not scheduling rest days."]
      }
    }
  },
  {
    id: 'image_generator',
    icon: ImageIcon,
    title: { ar: 'مولد الصور (مهندس الأصول البصرية)', en: 'Image Generator (Visual Designer)' },
    content: {
      ar: {
        philosophy: "الصورة المصغرة (Thumbnail) هي البوابة لمشروعك. مهما كان المحتوى عظيماً، الصورة الجذابة هي التي تقرر ما إذا كان المشاهد سيدخل من هذه البوابة أم سيكمل التمرير.",
        importance: "يستهلك الناس المحتوى بصرياً قبل أن يقرأوا أي عنوان. توليد صور عالية الجودة مبنية على التباين والألوان السيكولوجية يرفع نسبة النقر (CTR) بشكل رهيب.",
        howToUse: [
            "أدخل وصفاً تفصيلياً (Prompt) للصورة التي تتخيلها بسطور واضحة.",
            "يفضل توضيح الحالة المزاجية، الإضاءة (سينمائية، ضبابية)، وزاوية الكاميرا.",
            "انتظر التوليد الآمن. يمكنك تحميل الصورة لحفظها فوراً للاستخدام."
        ],
        interpretingData: [
            { label: "Visual Contrast (التباين)", desc: "مدى وضوح العنصر الأساسي في الصورة مقارنة بالخلفية." },
            { label: "Color Psychology", desc: "استخدام الألوان الدافئة (الأحمر/البرتقالي) للإثارة والفضول، أو الباردة للعمق التقني." }
        ],
        proStrategy: "الصور المولدة بالذكاء الاصطناعي تكون ممتازة كخلفيات للصور المصغرة. أضف فوقها نصاً كبيراً وواضحاً بخط سميك باستخدام برامج التعديل للحصول على أقصى أداء ثاقب.",
        technicalSpecs: "Engine: Imagen on Gemini Integration - High Fidelity Visual Network.",
        commonPitfalls: ["كتابة وصف قصير جداً (مثل: 'صورة قطة'). يجب أن تكون مفصلاً (مثل: 'قطة سيامية تنظر لليزر أحمر في غرفة مظلمة، إضاءة سينمائية')."]
      },
      en: {
        philosophy: "The Thumbnail is the gateway. No matter how great the content is, the visual hook dictates if a user stops scrolling or passes you by.",
        importance: "People consume content visually before reading text. Generating high-contrast, psychological imagery boosts CTR immensely.",
        howToUse: [
            "Write a highly detailed prompt outlining your vision.",
            "Specify mood, lighting (Cinematic, volumetric), and camera angle.",
            "Generate and download to use in your marketing."
        ],
        interpretingData: [
            { label: "Visual Contrast", desc: "Subject isolation from the background for high legibility." },
            { label: "Color Psychology", desc: "Using Neon/Blue for tech, Warm tones for entertainment and shock value." }
        ],
        proStrategy: "Use AI graphics as pristine base layers, then overlay large, bold display text in an editor to create world-class YouTube thumbnails.",
        technicalSpecs: "Engine: Advanced Generative Diffusion Model.",
        commonPitfalls: ["Using lazy 2-word prompts.", "Expecting the AI to put perfect text inside the image."]
      }
    }
  },
  {
    id: 'vph_tool',
    icon: TrendingUp,
    title: { ar: 'مقياس تسارع الفيديو (VPH Velocity)', en: 'VPH Velocity Predictor' },
    content: {
      ar: {
        philosophy: "المشاهدات الكلية خدعة صامتة؛ الأرقام الحقيقية المعبّرة هي تسارع المشاهدات في الساعة الواحدة (Views Per Hour). هي ترمومتر نفوذ الفيديو الحالي.",
        importance: "معرفة ما إذا كان الفيديو ينتقل فيروسياً حالياً أم مات تماماً. إذا تجاوز الـ VPH المعامل الطبيعي، فهذا يعني أن يوتيوب يروّج له بقوة الآن.",
        howToUse: [
            "أدخل رابط فيديو يوتيوب أو المعرّف الخاص به.",
            "اضغط تحليل لحساب معدل المشاهدات اللحظي لكل ساعة منذ لحظة رفعه.",
            "اقرأ إرشادات الذكاء الاستراتيجي لترشيح الاستنتاجات الفورية."
        ],
        interpretingData: [
            { label: "VPH Score", desc: "متوسط عدد المشاهدات التي يحصدها الفيديو بالدقيقة والساعة حالياً." },
            { label: "Performance Multiple", desc: "مقارنة أداء هذا الفيديو بأداء القناة ككل وتحديد الشذوذ الفيروسي." }
        ],
        proStrategy: "راقب الـ VPH للفيديوهات الجديدة لمنافسيك. إذا حصد فيديو VPH عالي جداً بعد ساعتين فقط من نشره، أوقف كل جدولك فوراً واصنع فيديو يدور حول نفس الموضوع لركوب الموجة الرائجة.",
        technicalSpecs: "Algorithmic Model: Time-decay weighted subscriber velocity standard mapping.",
        commonPitfalls: ["الحكم على الفيديو بعد ساعة واحدة فقط؛ دع النظام يراقب 24 ساعة ليكافئ الهيكل الإحصائي."]
      },
      en: {
        philosophy: "Total views are static and deceptive. The real gold is Views Per Hour (VPH), which acts as the real-time thermal sensor of content velocity.",
        importance: "It helps pinpoint when a video starts going viral so you can capitalize on current trends.",
        howToUse: [
            "Enter any YouTube video link or ID.",
            "Click analyze to calculate VPH since publication.",
            "Read AI strategic tips based on high velocity triggers."
        ],
        interpretingData: [
            { label: "VPH Velocity", desc: "Real-time views gathered in the last hourly window." },
            { label: "Performance Metric", desc: "Visual comparison score against the publisher average." }
        ],
        proStrategy: "Monitor competitor VPH. If a video breaks their standard VPH baseline, pivot your production immediately to release a response video on the same keyword.",
        technicalSpecs: "System: Time-decay weighted logarithmic growth analyzer.",
        commonPitfalls: ["Judging the video velocity too early without checking the daily plateau pattern."]
      }
    }
  },
  {
    id: 'earnings_lab',
    icon: DollarSign,
    title: { ar: 'مختبر العوائد والاستثمار (ROI Lab)', en: 'Earnings & ROI Lab' },
    content: {
      ar: {
        philosophy: "صناعة المحتوى عمل تجاري استثماري كامل. الـ RPM والـ CPM هما الحاكمان الحقيقيان لربحية قنوات اليوتيوب، وليس فقط المشاهدات.",
        importance: "تحديد القيمة المالية الفعلية للمشاهدات بناءً على المنطقة الجغرافية ومجال قناتك، مما يجنبك إهدار ميزانياتك في مجالات منخفضة العائد.",
        howToUse: [
            "أدخل المشاهدات المتوقعة أو الحالية لقناتك.",
            "اختر التخصص والمجال (تكنولوجيا، مال وأعمال، ترفيه) لتحديد قيمة CPM المتوقعة لدول الخليج بذكاء.",
            "راجع تحليلات العائد المباشر وغير المباشر (رعايات، أفلييت) المقترحة."
        ],
        interpretingData: [
            { label: "RPM", desc: "العائد لكل ألف مشاهدة للمعلنين (Revenue Per Mille) بعد خصم حصة يوتيوب." },
            { label: "Lifetime Value (LTV)", desc: "القيمة الربحية الكلية للفيديو الواحد على المدى الطويل كأصل مدر للأرباح." }
        ],
        proStrategy: "استهدف جمهوراً من دول الخليج العربي أو الدول الغربية باستخدام كلمات بحثية بصرية دقيقة لرفع الـ RPM إلى 10 أضعاف مقارنة بالدول ذات العائد المنخفض.",
        technicalSpecs: "Database: Region-based CPM dynamic dataset v3.0.",
        commonPitfalls: ["التركيز على كمية المشاهدات وتجاهل ديموغرافية وهوية المشاهد ونبرتها المالية الكبرى."]
      },
      en: {
        philosophy: "Content is a major financial asset. RPM and CPM, not just viewer volume, govern the underlying business viability.",
        importance: "Provides meticulous projections on revenue to stop content creators from wasting money on low-yield niches.",
        howToUse: [
            "Provide current/projected video view counts.",
            "Choose your Niche category to fetch industry-accurate CPM parameters.",
            "Review full revenue distribution charts (Direct Ads, Sponsorships, Affiliates)."
        ],
        interpretingData: [
            { label: "RPM", desc: "Revenue Per Mille—your actual earnings per 1,000 views in your pocket." },
            { label: "Indirect Streams", desc: "Secondary monetization methods projected from engagement ratios." }
        ],
        proStrategy: "Target high-CPM countries like GCC, USA, or Europe. A niche video with 1,000 views there can earn more than 100k views in low-tier regions.",
        technicalSpecs: "Dynamic Engine: Real-time region-by-sector bidding matrix proxy.",
        commonPitfalls: ["Expecting fixed RPM across generic topics without narrowing down high-value niches."]
      }
    }
  },
  {
    id: 'live_counter',
    icon: Activity,
    title: { ar: 'عداد المشتركين اللحظي (نبض القناة)', en: 'Live Subscriber Counter' },
    content: {
      ar: {
        philosophy: "الأرقام تتغير بالثانية. عداد المشتركين اللحظي هو النبض الحي لقناتك يعكس عواطف وتفاعل الجماهير فور بث أي جديد.",
        importance: "رصد فوري لنتائج الحملات الإعلانية وموجات الانتشار الفيروسي أو الفضائح الرقمية، مما يمنحك سرعة استجابة فورية لتوجيه دفة مركبك البصري.",
        howToUse: [
            "أدخل معرف القناة التي تريد مراقبتها بالثانية.",
            "فعّل ذكاء استشعار التسارع (AI Velocity Monitor) للتنبؤ باتجاه النمو القادم.",
            "راقب صعود الخط الإحصائي المباشر مع ميزان النمو الإيجابي الصافي."
        ],
        interpretingData: [
            { label: "Net Gained Subs", desc: "صافي المشتركين المكتسبين منذ لحظة تفعيل التتبع ومراقبة الجلسة الحالية." },
            { label: "Growth Velocity", desc: "سرعة الانقسام والانضمام الرقمي لكل دقيقة من البث المباشر المتاح." }
        ],
        proStrategy: "افتح هذه الشاشة في بث مباشر أو شاشتك الرئيسية بمجرد نشر فيديو استراتيجي هام لمراقبة ردة الفعل الفورية وتحديث الصورة المصغرة فوراً إذا انحدر مؤشر السرعة.",
        technicalSpecs: "Protocol: High-frequency API polling tracker coupled with client event synchronization.",
        commonPitfalls: ["اعتقاد أن تعليق التحديث من سيرفرات يوتيوب مرضه عيب فني بالنظام; يوتيوب يقوم بفلترة المشتركين بانتظام."]
      },
      en: {
        philosophy: "Subscribers are live heartbeats. The Live Counter gives you real-time feedback on user behavior and campaign outcomes.",
        importance: "Enables instant strategy pivoting in response to major viral trends, live streams, or brand shifts.",
        howToUse: [
            "Supply any channel ID/URL.",
            "Toggle AI Velocity on to run strategic projections.",
            "Keep the dashboard active to monitor raw subscriber flow patterns."
        ],
        interpretingData: [
            { label: "Session Gained", desc: "Net growth of subscribers logged since you started monitoring." },
            { label: "Velocity Trend", desc: "Real-time derivative of user conversions per minute." }
        ],
        proStrategy: "Unveil this tracker during launch hours. If subscription rate dips suddenly, it calls for an immediate title/thumbnail alteration.",
        technicalSpecs: "Engine: Adaptive polling client with predictive delta analysis.",
        commonPitfalls: ["Assuming API delays are application bugs—YouTube aggregates subscriber numbers dynamically."]
      }
    }
  },
  {
    id: 'competitor_analysis',
    icon: Swords,
    title: { ar: 'مبارزة المنافسين (غرفة استخبارات الحرب الرقمية)', en: 'Competitor Intelligence Swords' },
    content: {
      ar: {
        philosophy: "المنافسة ليست صراعاً همجياً، بل هي مبارزة شطرنج تفاعلية. دراسة حركة جيرانك بالمجال تكشف لك الثغرات التي تركوها بدون حماية لتستولي عليها.",
        importance: "معرفة نقاط الضعف والقوة عند أقوى قنوات مجالك وتحديد نسبة احتمالية ربحك (Win Probability) للمنافسة المباشرة معهم.",
        howToUse: [
            "أدخل رابط قناة المنافس المباشر بمجالك.",
            "دع الذكاء الاصطناعي يستنبط معدل التفاعل الفعلي وأوقات النشر المفضلة لديه.",
            "استكشف خوارزمية مبارزة الفئتين لمقارنة قناتك بقناته ونمذجة التفوق."
        ],
        interpretingData: [
            { label: "Win Probability", desc: "احتمالية صعود محتواك فوق محتوى المنافس في الاقتراحات بناءً على خوارزمية مقارنة الكثافة البصرية والسرعة." },
            { label: "Engagement Ratio", desc: "مقارنة حقيقية لتفاعل جمهوره مع مشاهداته الفعلية بدون تزييف مضلل للأرقام." }
        ],
        proStrategy: "صنف المنافسين لثلاثة مستويات: قمة متوسط وقاع. خذ الأفكار التي نجحت بقوة عند 'المتوسط' وأعد صياغتها بجودة 'القمة' لضمان التفوق المطلق والسلس بالنتائج.",
        technicalSpecs: "Engine: Muthaqaf Adaptive Comparison Logic. Matrix: Engagement-to-subscriber density.",
        commonPitfalls: ["تقليد المنافس الأكبر بشكل حرفي أعمى; ميزة تفوقك تكمن في تقديم شيء فريد عجز عن تقديمه هو."]
      },
      en: {
        philosophy: "Competition is chess, not warfare. Studying your rivals reveals undefended gaps in the market that you can conquer.",
        importance: "Empowers you with tactical win probabilities and advanced engagement matrices against domain rivals.",
        howToUse: [
            "Input your direct competitor's channel URL.",
            "Observe advanced statistics generated: Engagement rate, frequency, views velocity.",
            "Compare state-of-the-art parameters directly with your channel index."
        ],
        interpretingData: [
            { label: "Win Probability", desc: "Mathematical odds of your video outranking the rival based on density & publishing intervals." },
            { label: "Velocity Score", desc: "Average view yield divided by raw subscriber base, shown as percentage metrics." }
        ],
        proStrategy: "Identify 'middle-tier' rivals. Re-imagine their highest performing video ideas with 'top-tier' production values to dominate search ranking effortlessly.",
        technicalSpecs: "System: Muthaqaf Algorithmic Competitor Comparison Matrix v2.1.",
        commonPitfalls: ["Copying top creators verbatim instead of finding unique content gaps they overlooked."]
      }
    }
  },
  {
    id: 'audience_deep_dive',
    icon: Users,
    title: { ar: 'تحليل الحمض النووي للجمهور (Audience DNA Decoder)', en: 'Audience DNA Decoder' },
    content: {
      ar: {
        philosophy: "الجمهور ليس مجرد رقم مشاهدة صامت، بل هو إنسان يمتلك عادات، اهتمامات، وفضول مستمر. فك شفرة هذا الحمض البشري تضمن لك بقاءهم وولاءهم المطلق لمنصتك.",
        importance: "تحديد الشخصية الافتراضية للمشاهد الرئيسي (Persona) ونمذجة تفضيلاته السلوكية بدلاً من التخمين العشوائي.",
        howToUse: [
            "أدخل القناة أو المجال المستهدف بالتحليل الدقيق.",
            "انقر فك شفرة الجمهور لبناء ملف شخصية المشاهد الكاملة.",
            "اقرأ خريطة التموضع الجغرافي والأوقات وعادات القراءة والتلقي لديهم."
        ],
        interpretingData: [
            { label: "Audience Persona", desc: "تجسيد واقعي ذكي لنموذج المشاهد المتوسط لقناتك (العمر، الاهتمام، الحاجة الأساسية)." },
            { label: "Core Motivation", desc: "الدافع السيكولوجي الأقوى الذي يجعل المشاهد ينقر على الفيديو ويعلق عليه ويرشحه لأصدقائه." }
        ],
        proStrategy: "اكتب محتوى الفيديو القادم خصيصاً للشخصية الافتراضية (Persona) التي يرسمها لك الذكاء الاصطناعي. تحدث معه كصديق حقيقي؛ هذه الطريقة ترفع الولاء وزمن المشاهدة بنسبة 150%.",
        technicalSpecs: "Engine: Gemini Neural Network. Framework: Audience Personality Matrix Parsing.",
        commonPitfalls: ["بناء محتوى يعجبك أنت شخصياً وتجاهل شخصية المشاهد الحقيقي الذي يمول قناتك بالمشاهدات."]
      },
      en: {
        philosophy: "Audiences are humans, not numbers. Cracking their emotional DNA guarantees a bulletproof connection of long-term loyalty to your brand.",
        importance: "Constructs highly accurate target user archetypes (Portraits) to guide your messaging directly.",
        howToUse: [
            "Enter target channel or topic domain.",
            "Run DNA decoder to construct primary audience portraits.",
            "Review core motivators, geographical hotspots, and retention parameters."
        ],
        interpretingData: [
            { label: "Target Portrait", desc: "Representation of your core ideal viewer with demographic and interests metrics." },
            { label: "Retention Catalyst", desc: "The exact psychological prompt that forces this target persona to like, share and subscribe." }
        ],
        proStrategy: "Write your next script speaking directly to the generated Persona. Addressing their specific pain points directly increases connection 150%.",
        technicalSpecs: "NLP Model: Gemini Pro Persona Decoder engine.",
        commonPitfalls: ["Making videos for your own taste rather than solving your target audience's core queries."]
      }
    }
  },
  {
    id: 'outliers',
    icon: Gem,
    title: { ar: 'كاشف الفيديوهات الاستثنائية (Outlier Breakouts)', en: 'Statistical Outliers Scanner' },
    content: {
      ar: {
        philosophy: "المعجزات الإحصائية ليست صدفة بل هي مفتاح اللغز. كاشف الفيديوهات الشاذة يفصل الفيديوهات التي انفجرت فيروسياً فجأة عند القنوات الصغيرة ليعلمك السبب الدقيق.",
        importance: "اكتشاف الفيديوهات ذات معدل مشاهدة يفوق المتوسط بـ 5 إلى 30 ضعفاً لركوب الموجة الفيروسية وهي لا تزال في مهدها.",
        howToUse: [
            "أدخل القناة أو الكلمة المفتاحية المستهدفة.",
            "انقر مسح الفيديوهات الشاذة لاستخلاص أفضلها أداءً.",
            "ادرس 'مضاعف الأداء' (Performance Multiple) لترى الأرقام بدقة."
        ],
        interpretingData: [
            { label: "Performance Multiple", desc: "كم مرة تفوق هذا الفيديو تحديداً على متوسط مشاهدات القناة الكلية (مثال: 15x تفوق)." },
            { label: "Anatomy Analysis", desc: "تفكيك الذكاء الاصطناعي لعناصر نجاح الفيديو (العنوان، التصميم، الفكرة)." }
        ],
        proStrategy: "إذا لفت انتباهك فيديو له مضاعف أداء أعلى من 10x في قناة يقل عدد متابعيها عن 5000 مشترك، فاعلم أنك أمام كنز ذهبي. انسخ الفكرة على عجل ونفذها بشكل متقن.",
        technicalSpecs: "Engine: Statistical anomaly detector of standard deviation view multipliers.",
        commonPitfalls: ["تحليل القنوات الضخمة جداً؛ حيث تتأثر أرقامها بالاسم والشهرة لا بعبقرية الفكرة الفردية."]
      },
      en: {
        philosophy: "Virality is not random luck; it is a statistical anomaly. This scanner isolates low-subscriber videos that achieved outlier growth to steal their blueprint.",
        importance: "Enables discovery of hyper-viral patterns getting 5x to 30x the usual channel averages.",
        howToUse: [
            "Provide any channel handle or index term.",
            "Run scanner for outbreak outliers analysis.",
            "Deep-dive into the Performance Multiple of specific viral videos."
        ],
        interpretingData: [
            { label: "Performance Multiple", desc: "How many times this video outperformed the average baseline (e.g., 20x views)." },
            { label: "Deep Anatomy", desc: "The underlying logic why this specific video achieved explosive discovery." }
        ],
        proStrategy: "Target low-subscriber channels boasting high performance outliers. If a tiny channel achieves a 10x multiplier, replicate that exact concept immediately.",
        technicalSpecs: "Data Model: Standard deviation view velocity parsing.",
        commonPitfalls: ["Analyzing massive channels where views are driven by loyalty and brand recognition rather than the idea."]
      }
    }
  },
  {
    id: 'video_timing',
    icon: Timer,
    title: { ar: 'محاكاة أوقات النشر الدقيقة (Golden Clock Tracker)', en: 'Peak-Performance Timing' },
    content: {
      ar: {
        philosophy: "نشر المحتوى ذو صبغات كوكبية. هناك ساعات كسل وساعات نشاط استهلاكي. محاكاة التوقيت تبين لك بدقة متى يكون المتلقي مستعداً ذهنياً لمشاهدتك والتركيز معك.",
        importance: "حساب دقيق لفرق التوقيت وتفاعل الساعات الذهبية لرفع مؤشر الاحتفاظ بالجمهور من الدقائق الأولى للرفع.",
        howToUse: [
            "أدخل معرف الفيديو أو موضوعه.",
            "حدد بلد الجمهور الأكثر متابعة لك.",
            "اطلع على التوصيات المفصلة للذكاء الاصطناعي وجدول ساعتك بناء عليها."
        ],
        interpretingData: [
            { label: "Optimal Zone", desc: "النافذة الزمنية المثالية التي تمثل ذروة الاتصال الرقمي لجمهورك المتابع." },
            { label: "Geographical Offsets", desc: "فروقات التوقيت الدقيقة بين مقر إقامتك ومقر إقامة مستهلكي فيديوهاتك الثمين." }
        ],
        proStrategy: "جدول محتواك ليتم رفعه بشكل غير معلن (Unlisted) قبل وقت النشر المستهدف بـ 60 - 90 دقيقة. هذا يسمح ليوتيوب بعمل معالجة جودة HD ومعالجة السيو قبل النشر الفعلي.",
        technicalSpecs: "Model: Temporal distribution density algorithms matched with timezone indicators.",
        commonPitfalls: ["النشر في ساعات الفجر أو ذروة العمل المدرسي والمهني لجمهورك."]
      },
      en: {
        philosophy: "Publishing is a temporal craft. Every population possesses micro-habits of focus and rest. Peak simulators show you exactly when they are receptive.",
        importance: "Maximizes the crucial initial 2 hours of upload, giving the algorithm high click signals early on.",
        howToUse: [
            "Provide target video or concept identifiers.",
            "Select primary target audience regions.",
            "Analyze recommendations and schedule upload intervals."
        ],
        interpretingData: [
            { label: "Peak Retention Window", desc: "When users are calm and focused enough to consume longer narratives." },
            { label: "Timeframe Offsets", desc: "Mathematical offsets resolving the gap between your location and target territory." }
        ],
        proStrategy: "Set uploads to upload as 'Unlisted' roughly 90 mins prior to the peak. This permits server processing of HD resolution outputs prior to monetization triggers.",
        technicalSpecs: "System: Timezone lookup tables mapped to regional consumption averages.",
        commonPitfalls: ["Ignoring timezone shifts between editor studio and viewers' local clocks."]
      }
    }
  },
  {
    id: 'global_timing',
    icon: Compass,
    title: { ar: 'أطلس النشر العالمي (Global Posting Atlas)', en: 'Global Posting Atlas' },
    content: {
      ar: {
        philosophy: "العالم كبير ومتصل. أطلس النشر العالمي هو الترسكونتيننتال الذي يربط شعوب وثقافات الأرض ليوفر لك عادات وسلوكيات كل منطقة جغرافية على حدة.",
        importance: "فهم العادات الثقافية، عطلات نهاية الأسبوع، وأوقات الأعياد الخاصة بكل شعب قبل إطلاق الفيديوهات الثقيلة أو حملات الدعاية.",
        howToUse: [
            "ابحث عن أي بلد عربي أو غربي كهدف جغرافي.",
            "راجع فوراً عادات وموجات النظم الاجتماعية لمواطني هذه الدولة.",
            "اقرأ خريطة التوزيع الحراري لأوقات الذروة هناك."
        ],
        interpretingData: [
            { label: "Cultural Habits", desc: "العادات الثقافية السائدة (مثلاً: أوقات شرب القهوة المسائية أو أوقات العودة من المدارس والدوامات)." },
            { label: "Global Traffic Flow", desc: "مؤشر تدفق البيانات وحركة التصفح النشطة الخاصة بكل إقليم في العالم." }
        ],
        proStrategy: "عند استهداف الخليج على سبيل المثال، احرص على تجنب ساعات القيلولة والحر اللاهب بعد الظهيرة، وركز بشدة على النشر المسائي بعد صلاة العشاء حيث يسترخي الجميع تصفحاً.",
        technicalSpecs: "Database: Cross-cultural behavioral studies mapped dynamically via AI synthesis models.",
        commonPitfalls: ["الخلط بين عطلة السبت والأحد في الغرب، وعطلة الجمعة والسبت في معظم الدول الإسلامية."]
      },
      en: {
        philosophy: "The digital world is hyper-connected but culturally disparate. The Global Atlas maps the daily routines and socio-cultural rhythms of the human planet.",
        importance: "Deeply understand cultural habits, local sleep patterns, and regional holidays before massive global launches.",
        howToUse: [
            "Query any sovereign country or demographic realm.",
            "Study localized behavior maps generated by AI.",
            "Align publishing calendar variables with regional downtime."
        ],
        interpretingData: [
            { label: "Regional Rhythms", desc: "Specific times dedicated to commuting, school runs, or leisure hours in that country." },
            { label: "Traffic Index", desc: "Global data consumption scale mapped to geo-regions." }
        ],
        proStrategy: "In countries with long hot commutes, target early morning audio-friendly content. Conversely, target high-quality video for late-night wind-downs.",
        technicalSpecs: "Intelligence Unit: Unified geographic behavior parsing metrics v1.8.",
        commonPitfalls: ["Mismatching regional weekend schedules (e.g., Friday-Saturday vs. Saturday-Sunday)."]
      }
    }
  },
  {
    id: 'activity_logs',
    icon: History,
    title: { ar: 'سجل النشاطات (الصندوق الأسود السحابي)', en: 'Blackbox Activity Logs' },
    content: {
      ar: {
        philosophy: "من لا يوثق خطاه، لن يعلم كيف نجح أو أين عثر. سجل النشاطات هو الصندوق الأسود المتكامل الذي يحفظ كل لمسة إبداعية تقوم بها على سيرفراتنا السحابية.",
        importance: "يجنبك تماماً ضياع السكريبتات، العناوين، الأفكار المصممة والتحليلات الذهبية التي استغرقت ساعات لتوليدها.",
        howToUse: [
            "تأكد من تسجيل عبورك الآمن للنظام لتفعيل التزامن.",
            "استعمل أدوات المنصة الطبيعية لتصدير البيانات والذكاء.",
            "افتح شاشة السجل للتعامل، الفلترة واسترجاع النصوص بالكامل."
        ],
        interpretingData: [
            { label: "Cloud Snapshots", desc: "البيانات الكاملة المحفوظة بأمان لكل ورشة عمل ناجحة قمت بأدائها." },
            { label: "Audit Timeline", desc: "ترتيب زمني رائع ودقيق بالثانية لتتبع تاريخ تعاملك وسجلك مع نظامنا." }
        ],
        proStrategy: "راجع سجل النشاطات بانتظام شهرياً. قارن العناوين التي حققت لك أعلى نسب CTR بيوتيوب بالبصمة التاريخية المحفوظة لتستخلص معادلتك الشخصية السرية للنجاح.",
        technicalSpecs: "Persistence layer: Firebase Cloud Firestore database with security parameters validation.",
        commonPitfalls: ["العمل بدون تسجيل دخول كشخص غريب مجهول الهوية مما يمنع السيرفر من القدرة على حفظ صندوقك الأسود."]
      },
      en: {
        philosophy: "He who tracks his patterns, commands his destiny. Our Cloud Blackbox acts as a high-integrity vault preserving your entire system interactions.",
        importance: "Mitigates any risk of losing critical scripts, highly-optimized keywords or carefully planned agendas.",
        howToUse: [
            "Confirm Google Auth state is green.",
            "Perform standard operations on any creation tools.",
            "Navigate to Activity Logs to inspect, filter, and extract history logs easily."
        ],
        interpretingData: [
            { label: "Cloud Snapshots", desc: "Safe payload states preserved inside firestore records of past workouts." },
            { label: "Audit Trail", desc: "A linear timeline tracking each strategic move since creation." }
        ],
        proStrategy: "Review your blackbox monthly. Map successful high-view uploads back to their original logged scripts to clone successful elements.",
        technicalSpecs: "Architecture: Firebase cloud firestore integration layered on top of auth constraints.",
        commonPitfalls: ["Operating as anonymous guest, rendering cross-device sync impossible."]
      }
    }
  }
];

const Guidelines: React.FC = () => {
  const { lang, t } = useLang();
  const [activeTab, setActiveTab] = useState<string>(DETAILED_DOCS[0].id);

  const activeDoc = DETAILED_DOCS.find(d => d.id === activeTab) || DETAILED_DOCS[0];
  const isAr = lang === 'ar';

  const renderContent = (content: DocContent) => (
      <div className="space-y-10 animate-slide-in pb-10">
          {/* Philosophy & Importance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-600/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all"></div>
                  <div className="relative glass-panel p-6 rounded-2xl border border-white/5 h-full">
                      <h3 className={`text-sm font-black text-emerald-500 mb-4 flex items-center gap-2 uppercase tracking-widest ${isAr ? 'font-alex' : ''}`}>
                          <Target size={18} />
                          {isAr ? 'فلسفة الأداة' : 'Philosophy'}
                      </h3>
                      <p className={`text-gray-300 text-sm leading-loose italic ${isAr ? 'font-almarai' : ''}`}>
                          "{content.philosophy}"
                      </p>
                  </div>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-white/5">
                  <h3 className={`text-sm font-black text-yellow-500 mb-4 flex items-center gap-2 uppercase tracking-widest ${isAr ? 'font-alex' : ''}`}>
                      <Info size={18} />
                      {isAr ? 'ليه دي مهمة ليك؟' : 'Why it Matters'}
                  </h3>
                  <p className={`text-gray-400 text-sm leading-relaxed ${isAr ? 'font-almarai' : ''}`}>
                      {content.importance}
                  </p>
              </div>
          </div>

          {/* Operation Steps */}
          <div className="bg-[#121212] p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
              <h3 className={`text-lg font-black text-white mb-6 flex items-center gap-2 uppercase tracking-tighter ${isAr ? 'font-alex' : ''}`}>
                  <MousePointer2 className="text-green-500" size={20} />
                  {isAr ? 'خطوات التشغيل (الكتالوج)' : 'Operation Workflow'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {content.howToUse.map((step, i) => (
                      <div key={i} className="flex gap-4 items-start bg-black/40 p-4 rounded-xl border border-white/5 group-hover:border-green-500/30 transition-colors">
                          <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-600/20 text-green-500 flex items-center justify-center font-black border border-green-500/20 text-sm">
                              {i + 1}
                          </span>
                          <span className={`text-gray-300 text-sm pt-1 font-medium leading-relaxed ${isAr ? 'font-almarai' : ''}`}>{step}</span>
                      </div>
                  ))}
              </div>
          </div>

          {/* Interpreting Data */}
          <div>
              <h3 className={`text-lg font-black text-white mb-6 flex items-center gap-2 uppercase tracking-tighter ${isAr ? 'font-alex' : ''}`}>
                  <Layers className="text-blue-500" size={20} />
                  {isAr ? 'فهم المصطلحات' : 'Data Dictionary'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.interpretingData.map((item, i) => (
                    <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/10">
                        <div className="text-blue-400 font-bold mb-1 text-sm uppercase tracking-wider">{item.label}</div>
                        <div className={`text-gray-400 text-xs leading-relaxed ${isAr ? 'font-almarai' : ''}`}>{item.desc}</div>
                    </div>
                ))}
              </div>
          </div>

          {/* Pro Secrets & Pitfalls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-gradient-to-br from-emerald-600/10 to-purple-600/5 p-8 rounded-3xl border border-emerald-500/20 relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                  <h3 className={`text-md font-black text-emerald-500 mb-4 flex items-center gap-2 uppercase tracking-widest ${isAr ? 'font-alex' : ''}`}>
                      <Zap size={20} className="fill-current" /> {isAr ? 'سر المحترفين (روقان)' : 'Pro Secret'}
                  </h3>
                  <p className={`text-white text-lg leading-loose font-bold relative z-10 ${isAr ? 'font-almarai' : ''}`}>
                      {content.proStrategy}
                  </p>
              </div>

              <div className="space-y-6">
                  <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5">
                      <h3 className={`text-xs font-bold text-gray-500 mb-4 flex items-center gap-2 uppercase tracking-widest ${isAr ? 'font-alex' : ''}`}>
                          <Cpu size={16} /> {isAr ? 'التفاصيل التقنية' : 'Tech Specs'}
                      </h3>
                      <p className="text-gray-600 text-[11px] font-mono leading-relaxed bg-black/50 p-3 rounded-lg border border-white/5">
                          {content.technicalSpecs}
                      </p>
                  </div>
                  <div className="bg-yellow-500/5 p-6 rounded-2xl border border-yellow-500/20">
                      <h3 className={`text-xs font-bold text-yellow-500 mb-4 flex items-center gap-2 uppercase tracking-widest ${isAr ? 'font-alex' : ''}`}>
                          <AlertTriangle size={16} /> {isAr ? 'أخطاء شائعة' : 'Pitfalls'}
                      </h3>
                      <ul className="space-y-2">
                          {content.commonPitfalls.map((p, i) => (
                              <li key={i} className="text-gray-500 text-[11px] flex gap-2 items-start leading-relaxed">
                                  <span className="text-yellow-500 font-bold">•</span> {p}
                              </li>
                          ))}
                      </ul>
                  </div>
              </div>
          </div>
      </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto min-h-screen pb-20 font-sans"
    >
        {/* Page Header */}
        <div className="mb-16 text-center md:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 mb-4"
            >
              <BookOpen size={14} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{isAr ? 'كتالوج التشغيل المفصل' : 'System Documentation'}</span>
            </motion.div>
            <h2 className={`text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-sm ${isAr ? 'font-alex' : ''}`}>
                {isAr ? 'دليل النظام الشامل' : 'Master System Docs'}
            </h2>
            <p className={`text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed font-normal ${isAr ? 'font-almarai' : ''}`}>
                {isAr 
                 ? 'دليل مهندس البرمجيات وصانع المحتوى الذكي. هنا بنشرحلك كل أداة معمولة ليه وإزاي تستخدمها عشان تسيطر على الخوارزميات.' 
                 : 'The ultimate blueprint for engineers and smart creators. Learn the philosophy and technicality behind every tool to dominate the algorithms.'}
            </p>
        </div>

        {/* Layout: Sidebar + Content */}
        <div className="flex flex-col lg:flex-row gap-8 items-start relative px-4 md:px-0">
            
            {/* Navigation Sidebar */}
            <div className="lg:w-80 w-full lg:sticky lg:top-24 z-10">
                <div className="glass-panel p-4 rounded-3xl md:rounded-[2rem] border border-white/10 max-h-[40vh] lg:max-h-[80vh] overflow-y-auto custom-scrollbar shadow-2xl bg-black/60 backdrop-blur-2xl">
                    <div className={`px-4 py-4 text-xs font-black text-gray-500 uppercase tracking-[0.3em] border-b border-white/5 mb-4 flex justify-between items-center ${isAr ? 'font-alex' : ''}`}>
                        {isAr ? 'فهرس الأدوات' : 'System Index'}
                        <Layers size={16} className="text-emerald-500" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                        {DETAILED_DOCS.map((doc) => (
                            <button
                                key={doc.id}
                                onClick={() => setActiveTab(doc.id)}
                                className={`w-full flex items-center gap-4 px-5 py-3 md:py-4 rounded-2xl text-xs font-bold transition-all duration-500 group relative overflow-hidden ${
                                    activeTab === doc.id 
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-[1.03]' 
                                    : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                                }`}
                            >
                                <doc.icon size={18} className={`${activeTab === doc.id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`}/>
                                <span className={`flex-1 ${isAr ? 'text-right font-alex' : 'text-left'}`}>{doc.title[lang]}</span>
                                {activeTab === doc.id && (
                                    <div className="absolute right-0 top-0 h-full w-1 bg-white"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full">
                <div className="glass-panel p-6 md:p-16 rounded-[2rem] md:rounded-[4rem] border border-white/10 relative overflow-hidden min-h-[400px] md:min-h-[600px] shadow-2xl">
                    {/* Atmospheric Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-64 bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none"></div>
                    
                    {/* Content Header */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 mb-8 md:mb-12 border-b border-white/10 pb-8 md:pb-12 relative z-10">
                        <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[2rem] bg-gradient-to-br from-emerald-600/20 to-purple-600/20 border border-white/10 flex items-center justify-center shadow-2xl shadow-emerald-600/10">
                            <activeDoc.icon size={32} className="text-white md:w-12 md:h-12" />
                        </div>
                        <div className="text-center md:text-start flex-1">
                            <h2 className={`text-2xl md:text-5xl font-black text-white tracking-tighter mb-3 ${isAr ? 'font-alex leading-tight' : ''}`}>
                                {activeDoc.title[lang]}
                            </h2>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4">
                                <span className="text-gray-500 text-[10px] font-mono bg-black/40 px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-white/5 uppercase tracking-widest">
                                    protocol::{activeDoc.id}.v3.0
                                </span>
                                <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                                    Strategic Asset
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Content Body */}
                    {renderContent(activeDoc.content[lang] || activeDoc.content['en'])}
                </div>

                {/* Bottom Call to Action */}
                <div className="mt-12 text-center">
                    <p className="text-gray-600 text-xs italic mb-4">
                        {isAr ? 'هل ما زلت بحاجة للمساعدة؟ اسأل مساعدنا الذكي حالاً.' : 'Still need help? Ask our AI Assistant now.'}
                    </p>
                    <button 
                        onClick={() => window.dispatchEvent(new CustomEvent('open-chat'))}
                        className="bg-white/5 hover:bg-white/10 text-white px-10 py-4 rounded-full font-bold border border-white/10 transition-all flex items-center gap-3 mx-auto"
                    >
                        <Brain size={20} className="text-emerald-500" />
                        {isAr ? 'افتح مساعد الذكاء الاصطناعي' : 'Open AI Assistant'}
                    </button>
                </div>
            </div>
        </div>
    </motion.div>
  );
};

export default Guidelines;
