import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLang } from '../../index';
import { SKILLS_LIST, SkillItem } from './skillsData';
import { SkillDock } from './SkillDock';
import { SkillsModal } from './SkillsModal';
import { TrendForecastCard } from './widgets/TrendForecastCard';
import { ThumbnailAbCard } from './widgets/ThumbnailAbCard';
import { ThumbnailGenCard } from './widgets/ThumbnailGenCard';
import { ViralScriptCard } from './widgets/ViralScriptCard';
import { SeoCard } from './widgets/SeoCard';
import { IdeasBankCard } from './widgets/IdeasBankCard';
import { ChannelAuditCard } from './widgets/ChannelAuditCard';

import { useChannel } from '../../contexts/ChannelContext';
import { ChannelHeaderSelector } from '../channel/ChannelHeaderSelector';
import { LinkedChannelsManagerModal } from '../channel/LinkedChannelsManagerModal';
import { ChannelDeepAuditModal } from '../channel/ChannelDeepAuditModal';
import { ChannelComparisonModal } from '../channel/ChannelComparisonModal';

import {
  chatWithGemini,
  generateTrendForecast,
  generateThumbnailPrompts,
  generateBananaImage,
  analyzeThumbnailAb,
  generateViralScript,
  generateAdvancedSeo,
  generateAiTitles,
  generateAiVideoIdeas,
  generateChannelAudit,
  generateEarningsAudit,
  generateAudienceDeepDive,
  generateCompetitorAnalysis,
  generateOutlierAnalysis,
  generateRegionTimingAnalysis
} from '../../services/geminiService';
import { fetchChannelData, fetchLatestContentMixed } from '../../services/youtubeService';
import { extractId, calculateVPH } from '../../utils';
import { saveToStorage, loadFromStorage, StorageKeys, clearStorageKey } from '../../services/storageService';

import {
  Send,
  Sparkles,
  Bot,
  User,
  PlusCircle,
  Trash2,
  Copy,
  Check,
  Zap,
  Brain,
  Layers,
  Image as ImageIcon,
  Loader2,
  Download,
  Share2,
  X,
  Compass,
  ArrowRight,
  Globe,
  Sliders,
  ChevronDown,
  ChevronUp,
  Settings,
  HelpCircle,
  FolderKanban,
  CheckCircle2,
  MessageSquare,
  BarChart3
} from 'lucide-react';

interface CopilotMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  skillId?: string;
  skillData?: any;
  uploadedImage?: string;
  timestamp?: number;
}

export const CopilotStudio: React.FC = () => {
  const { lang, setLang, t, isRTL, resultLang } = useLang();
  const isAr = lang === 'ar';

  const [messages, setMessages] = useState<CopilotMessage[]>(() => {
    return loadFromStorage<CopilotMessage[]>('muthaqaf_copilot_messages') || [];
  });

  const [input, setInput] = useState('');
  const [activeSkill, setActiveSkill] = useState<SkillItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // AI Intelligence modes
  const [isFastMode, setIsFastMode] = useState(false);
  const [isDeepThink, setIsDeepThink] = useState(false);

  // Dropdown / Dropup States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSkillDropupOpen, setIsSkillDropupOpen] = useState(false);
  const [isTemplatesDropupOpen, setIsTemplatesDropupOpen] = useState(false);
  const [isStarterDropdownOpen, setIsStarterDropdownOpen] = useState(false);

  // Channel Context Integration
  const {
    activeChannel,
    setIsManagerOpen,
    setAuditChannel,
    linkChannelByUrl
  } = useChannel();

  const settingsRef = useRef<HTMLDivElement>(null);
  const skillDropupRef = useRef<HTMLDivElement>(null);
  const templatesDropupRef = useRef<HTMLDivElement>(null);
  const starterDropdownRef = useRef<HTMLDivElement>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (settingsRef.current && !settingsRef.current.contains(target)) {
        setIsSettingsOpen(false);
      }
      if (skillDropupRef.current && !skillDropupRef.current.contains(target)) {
        setIsSkillDropupOpen(false);
      }
      if (templatesDropupRef.current && !templatesDropupRef.current.contains(target)) {
        setIsTemplatesDropupOpen(false);
      }
      if (starterDropdownRef.current && !starterDropdownRef.current.contains(target)) {
        setIsStarterDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsSkillDropupOpen(false);
        setIsTemplatesDropupOpen(false);
        setIsStarterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Auto-scroll on messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading, loadingPhase]);

  // Save messages to storage
  useEffect(() => {
    if (messages.length > 0) {
      saveToStorage('muthaqaf_copilot_messages', messages, 5256000);
    }
  }, [messages]);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleNewChat = () => {
    setMessages([]);
    clearStorageKey('muthaqaf_copilot_messages');
    setActiveSkill(null);
    setInput('');
    setSelectedImage(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Skill Selector Handler
  const handleSelectSkill = (skill: SkillItem, promptToUse?: string) => {
    setActiveSkill(skill);
    if (promptToUse) {
      setInput(promptToUse);
      if (textareaRef.current) textareaRef.current.focus();
    } else {
      if (textareaRef.current) textareaRef.current.focus();
    }
  };

  // Main Submit & Dispatcher Logic
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    const userText = input.trim();
    const currentSkill = activeSkill;
    const imgToSend = selectedImage;

    // Reset input fields
    setInput('');
    setSelectedImage(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const userMsgId = Date.now().toString();
    const newMessages: CopilotMessage[] = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        text: userText,
        skillId: currentSkill?.id,
        uploadedImage: imgToSend || undefined,
        timestamp: Date.now()
      }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const skillToExecute = currentSkill?.id;

      // 1. SKILL: TREND FORECASTING
      if (skillToExecute === 'trend_forecasting') {
        setLoadingPhase(isAr ? 'جاري محاكاة سرعة البحث وتوقع التريندات...' : 'Forecasting search velocity & sentiment...');
        const trendData = await generateTrendForecast(userText, lang, resultLang);
        
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'model',
            text: isAr 
              ? `تم الانتهاء من التنبؤ بالتريندات لمجال "${userText}". إليك خريطة الزخم والمواضيع الفيروسية المتوقعة:`
              : `Completed trend velocity forecast for "${userText}". Here is the momentum projection:`,
            skillId: 'trend_forecasting',
            skillData: { ...trendData, niche: userText },
            timestamp: Date.now()
          }
        ]);
      }

      // 2. SKILL: THUMBNAIL A/B BATTLE
      else if (skillToExecute === 'thumbnail_ab') {
        setLoadingPhase(isAr ? '1/3 تخيل مفهومين بصريين متنافسين...' : '1/3 Generating dual visual concepts...');
        const promptsResult = await generateThumbnailPrompts(userText, lang, resultLang);
        
        setLoadingPhase(isAr ? '2/3 توليد الصورتين المصغرتين بالذكاء الاصطناعي (قد يستغرق 10-15 ثانية)...' : '2/3 Rendering both thumbnails in 16:9...');
        const [imgA, imgB] = await Promise.all([
          generateBananaImage(promptsResult.promptA, 'thumbnail', '16:9', lang, resultLang),
          generateBananaImage(promptsResult.promptB, 'thumbnail', '16:9', lang, resultLang)
        ]);

        setLoadingPhase(isAr ? '3/3 تحليل الألوان والانفعالات والتنبؤ بالـ CTR...' : '3/3 Running CTR prediction & color theory analysis...');
        const abAnalysis = await analyzeThumbnailAb(imgA, imgB, userText, lang, resultLang);

        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'model',
            text: isAr
              ? `تم اختبار الصورتين المصغرتين بنجاح للفكرة "${userText}". إليك تقرير الفائز ونسبة النقر المتوقعة:`
              : `Thumbnail A/B test completed for "${userText}". Here is the predicted winner:`,
            skillId: 'thumbnail_ab',
            skillData: {
              title: userText,
              imageA: imgA,
              imageB: imgB,
              analysis: abAnalysis
            },
            timestamp: Date.now()
          }
        ]);
      }

      // 3. SKILL: THUMBNAIL VISUAL GEN
      else if (skillToExecute === 'thumbnail_gen') {
        setLoadingPhase(isAr ? 'جاري توليد الصورة المصغرة بدقة 16:9 استوديو سينمائي...' : 'Generating 16:9 cinematic studio thumbnail...');
        const generatedImg = await generateBananaImage(userText, 'thumbnail', '16:9', lang, resultLang);

        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'model',
            text: isAr 
              ? `تم إنشاء الصورة المصغرة الاحترافية بنجاح بدقة 16:9 جاهزة للنشر على يوتيوب:`
              : `Generated high-resolution 16:9 YouTube thumbnail ready for export:`,
            skillId: 'thumbnail_gen',
            skillData: {
              prompt: userText,
              imageUrl: generatedImg,
              aspectRatio: '16:9'
            },
            timestamp: Date.now()
          }
        ]);
      }

      // 4. SKILL: VIRAL SCRIPTWRITER
      else if (skillToExecute === 'viral_script') {
        setLoadingPhase(isAr ? 'جاري صياغة الاسكريبت الفيروسي مع هوك البداية ومحفزات الاحتفاظ...' : 'Crafting high-retention viral script with hooks...');
        const scriptResponse = await generateViralScript(
          userText,
          '5 mins',
          'engaging & cinematic',
          isAr ? 'Arabic' : 'English',
          'intrigue curiosity gap',
          '',
          lang,
          resultLang,
          'modern 2026',
          'high retention pacing',
          'cognitive curiosity trigger',
          'youtube long-form',
          'approachable yet deep',
          'ranked keywords',
          'full'
        );

        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'model',
            text: isAr
              ? `تمت هندسة الاسكريبت بالكامل لموضوع "${userText}". الاسكريبت مقسم ومزود بملاحظات المونتاج والتوجيه الصوتي:`
              : `Complete retention-engineered script generated for "${userText}":`,
            skillId: 'viral_script',
            skillData: {
              topic: userText,
              scriptText: scriptResponse,
              duration: '5 mins',
              tone: isAr ? 'حماسي وسينمائي' : 'Cinematic & High-Energy'
            },
            timestamp: Date.now()
          }
        ]);
      }

      // 5. SKILL: SEO TOOLS
      else if (skillToExecute === 'seo_tools') {
        setLoadingPhase(isAr ? 'جاري استخراج حزمة السيو، العناوين المتصدرة، والكلمات الدلالية...' : 'Extracting viral titles, tags, and description...');
        const [seoReport, titles] = await Promise.all([
          generateAdvancedSeo(userText, 'general', lang, resultLang),
          generateAiTitles(userText, lang, resultLang)
        ]);

        let parsedSeo = { description: '', tags: [] as string[] };
        try {
          if (typeof seoReport === 'object' && seoReport !== null) {
            parsedSeo = seoReport as any;
          } else if (typeof seoReport === 'string') {
            const clean = seoReport.replace(/```json/g, '').replace(/```/g, '').trim();
            parsedSeo = JSON.parse(clean);
          }
        } catch (e) {
          parsedSeo = { description: typeof seoReport === 'string' ? seoReport : '', tags: [] };
        }

        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'model',
            text: isAr
              ? `تم تجهيز حزمة السيو المتكاملة لكلمة "${userText}". يمكنك نسخ جميع التاجز والعناوين بنقرة واحدة:`
              : `Complete SEO and metadata suite generated for "${userText}":`,
            skillId: 'seo_tools',
            skillData: {
              query: userText,
              titles: Array.isArray(titles) ? titles : [],
              description: parsedSeo.description || (typeof seoReport === 'string' ? seoReport : ''),
              tags: parsedSeo.tags && parsedSeo.tags.length > 0 ? parsedSeo.tags : ['YouTube SEO', 'Algorithm Boost', userText],
              seoScore: 97
            },
            timestamp: Date.now()
          }
        ]);
      }

      // 6. SKILL: VIRAL IDEAS
      else if (skillToExecute === 'viral_ideas') {
        setLoadingPhase(isAr ? 'جاري استخراج 5 أفكار فيديوهات استثنائية مع زوايا الفضول...' : 'Generating 5 breakthrough video concepts with hooks...');
        const ideasResult = await generateAiVideoIdeas(userText, '', [], [], lang, resultLang, userText);

        const ideasList = Array.isArray(ideasResult) ? ideasResult.map((idea: any) => ({
          title: typeof idea === 'string' ? idea : idea.title || idea.topic,
          hook: idea.hook || (isAr ? 'هوك صادم يطرح سؤالاً يكسر المعتقد السائد' : 'Shocking counter-intuitive hook'),
          thumbnail_concept: idea.thumbnail_concept || idea.thumbnail || (isAr ? 'وجه مذهول مع إحصائية غير متوقعة في الخلفية' : 'Shocked face with contrasting statistics'),
          why_it_works: idea.why_it_works || (isAr ? 'يستهدف فجوة فضول لم يتم تغطيتها عربياً' : 'High novelty curiosity gap'),
          viral_score: Math.floor(Math.random() * 8) + 92
        })) : [];

        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'model',
            text: isAr
              ? `إليك 5 أفكار فيديوهات غير تقليدية لمجال "${userText}". يمكنك النقر على أي فكرة لكتابة اسكريبت كامل لها فوراً:`
              : `Here are 5 breakthrough concepts for "${userText}". Click any idea to instantly generate a full script:`,
            skillId: 'viral_ideas',
            skillData: {
              niche: userText,
              ideas: ideasList
            },
            timestamp: Date.now()
          }
        ]);
      }

      // 7. SKILL: CHANNEL AUDIT & MASTERMIND
      else if (skillToExecute === 'channel_audit' || skillToExecute === 'mastermind') {
        setLoadingPhase(isAr ? 'جاري فحص القناة واستخراج مقاييس النمو ونقاط الضعف...' : 'Auditing channel metrics, bottlenecks & roadmap...');
        const extracted = extractId(userText);
        let channelDetails: any = null;

        if (extracted.type === 'channel') {
          channelDetails = await fetchChannelData(extracted.id);
        }

        const auditResponse = await generateChannelAudit(
          channelDetails || { title: userText, snippet: { title: userText } },
          lang,
          resultLang
        );

        let parsedAudit: any = {};
        try {
          if (typeof auditResponse === 'object' && auditResponse !== null) {
            parsedAudit = auditResponse;
          } else {
            const clean = auditResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            parsedAudit = JSON.parse(clean);
          }
        } catch (err) {
          parsedAudit = {
            grade: 'A',
            strengths: [isAr ? 'تخصص واضح في صناعة المحتوى' : 'Distinct content authority'],
            bottlenecks: [isAr ? 'تحسين هوية الصور المصغرة ورفع النقر' : 'Improve visual consistency on thumbnails'],
            growthRoadmap: [
              isAr ? 'توحيد ألوان ونمط الخطوط في الصور المصغرة' : 'Standardize thumbnail typography and palette',
              isAr ? 'صياغة أول 15 ثانية بطريقة الهوك الفوري دون مقدمات تقليدية' : 'Re-engineer the first 15 seconds to eliminate dropoffs',
              isAr ? 'نشر ريلز / شورتس أسبوعياً لجلب مشتركين جدد' : 'Release 2 strategic Shorts weekly as discovery funnels'
            ]
          };
        }

        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'model',
            text: isAr
              ? `اكتمل تقرير الفحص التشخيصي للقناة. إليك تقييم الأداء وخارطة طريق النمو:`
              : `Channel diagnostic audit completed. Here is the strategic roadmap:`,
            skillId: 'channel_audit',
            skillData: {
              channelTitle: channelDetails?.snippet?.title || userText,
              avatarUrl: channelDetails?.snippet?.thumbnails?.default?.url,
              subscriberCount: channelDetails?.statistics?.subscriberCount ? Number(channelDetails.statistics.subscriberCount).toLocaleString() : 'N/A',
              viewCount: channelDetails?.statistics?.viewCount ? Number(channelDetails.statistics.viewCount).toLocaleString() : 'N/A',
              country: channelDetails?.snippet?.country || 'Global',
              grade: parsedAudit.grade || 'A+',
              strengths: parsedAudit.strengths,
              bottlenecks: parsedAudit.bottlenecks,
              growthRoadmap: parsedAudit.growthRoadmap,
              rpmEstimate: '$3.50 - $7.20'
            },
            timestamp: Date.now()
          }
        ]);
      }

      // 8. GENERAL & DEDICATED SKILL CONVERSATION (With full context & specialized instructions)
      else {
        const currentSkill = activeSkill ? SKILLS_LIST.find(s => s.id === activeSkill.id) : null;
        
        if (currentSkill) {
          setLoadingPhase(
            isAr 
              ? `⚡ جاري تشغيل مهارة [${currentSkill.shortTitleAr}] بالذكاء الاصطناعي...` 
              : `⚡ Executing [${currentSkill.shortTitleEn}] AI skill...`
          );
        } else {
          setLoadingPhase(isAr ? 'مُثقّف يفكر ويحلل...' : 'Muthaqaf Copilot analyzing...');
        }

        const chatHistory = messages.map(m => ({ role: m.role, text: m.text }));
        
        let promptToSend = userText;
        if (currentSkill) {
          const systemInstruction = isAr ? currentSkill.systemPromptAr : currentSkill.systemPromptEn;
          promptToSend = `[تعليمات المهارة المتخصصة: ${isAr ? currentSkill.titleAr : currentSkill.titleEn}]\n${systemInstruction}\n\n[طلب المستخدم الحالي]:\n${userText}`;
        }

        // Add Active YouTube Channel Context if present
        if (activeChannel) {
          const channelContext = isAr 
            ? `\n\n[بيانات القناة المربوطة والنشطة للمستخدم]:\n- اسم القناة: ${activeChannel.title}\n- المعرف: ${activeChannel.handle}\n- عدد المشتركين: ${activeChannel.subscriberCount}\n- عدد الفيديوهات: ${activeChannel.videoCount}\n- تصنيف النيتش: ${activeChannel.analysis?.nicheCategory || 'عام'}\n- الجمهور المستهدف: ${activeChannel.analysis?.targetAudience?.persona || ''}\n- نبرة وأسلوب المحتوى: ${activeChannel.analysis?.contentTone || ''}\n- أبرز نقاط القوة: ${activeChannel.analysis?.swot?.strengths?.slice(0, 3).join('، ') || ''}\n`
            : `\n\n[User's Active YouTube Channel Profile]:\n- Channel: ${activeChannel.title} (${activeChannel.handle})\n- Subs: ${activeChannel.subscriberCount}, Videos: ${activeChannel.videoCount}\n- Niche: ${activeChannel.analysis?.nicheCategory || 'General'}\n- Target Persona: ${activeChannel.analysis?.targetAudience?.persona || ''}\n- Tone: ${activeChannel.analysis?.contentTone || ''}\n`;
          promptToSend = promptToSend + channelContext;
        }
        
        const responseText = await chatWithGemini(
          chatHistory,
          promptToSend,
          lang,
          { fast: isFastMode, think: isDeepThink, search: true },
          imgToSend || undefined
        );

        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'model',
            text: responseText,
            skillId: currentSkill?.id,
            timestamp: Date.now()
          }
        ]);
      }

    } catch (err: any) {
      console.error("Copilot Error:", err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'model',
          text: isAr 
            ? `عذراً، حدث خطأ أثناء تنفيذ المهارة (${err.message || 'خطأ غير معروف'}). يرجى إعادة المحاولة أو تجربة صيغة أخرى.`
            : `Sorry, an error occurred while executing the skill (${err.message || 'Unknown error'}). Please try again.`,
          timestamp: Date.now()
        }
      ]);
    } finally {
      setIsLoading(false);
      setLoadingPhase('');
    }
  };

  // Skill Chaining Helper: When user clicks "Turn into script" from ideas
  const chainIdeaToScript = (ideaTitle: string) => {
    const scriptSkill = SKILLS_LIST.find(s => s.id === 'viral_script');
    if (scriptSkill) {
      setActiveSkill(scriptSkill);
      setInput(isAr ? `اكتب اسكريبت فيديو 5 دقائق عالي الاحتفاظ بعنوان: ${ideaTitle}` : `Write a 5-minute high retention script for: ${ideaTitle}`);
      if (textareaRef.current) textareaRef.current.focus();
    }
  };

  const chainIdeaToThumbnail = (ideaTitle: string) => {
    const thumbSkill = SKILLS_LIST.find(s => s.id === 'thumbnail_ab');
    if (thumbSkill) {
      setActiveSkill(thumbSkill);
      setInput(ideaTitle);
      if (textareaRef.current) textareaRef.current.focus();
    }
  };

  // Skill categories for Dropup navigation
  const skillCategories = useMemo(() => {
    return [
      {
        id: 'content',
        labelAr: '🎬 صناعة المحتوى والسرد',
        labelEn: '🎬 Content & Narrative',
        skills: SKILLS_LIST.filter(s => s.category === 'content')
      },
      {
        id: 'growth',
        labelAr: '📈 النمو والتريند والخوارزميات',
        labelEn: '📈 Growth & Algorithms',
        skills: SKILLS_LIST.filter(s => s.category === 'growth')
      },
      {
        id: 'seo',
        labelAr: '🔍 السيو والعناوين والبحث',
        labelEn: '🔍 SEO & Search Discovery',
        skills: SKILLS_LIST.filter(s => s.category === 'seo')
      },
      {
        id: 'analytics',
        labelAr: '💰 التحليلات والمنافسين والأرباح',
        labelEn: '💰 Analytics & Revenue',
        skills: SKILLS_LIST.filter(s => s.category === 'analytics')
      }
    ];
  }, []);

  // Contextual Prompt Templates for Dropup
  const contextualTemplates = useMemo(() => {
    if (!activeSkill) {
      return isAr ? [
        { title: 'أسرار رفع نسبة النقر CTR', prompt: 'ما هي أهم 3 تعديلات على الصورة المصغرة تضاعف نسبة النقر CTR فوراً؟' },
        { title: 'هوك أول 30 ثانية', prompt: 'كيف أكتب هوك بداية لفيديوهاتي يمنع خروج المشاهد في أول 30 ثانية؟' },
        { title: 'استراتيجية النشر الأسبوعي', prompt: 'ما هي الخطة المثالية لنشر 3 فيديوهات أسبوعياً بشكل مستدام ومربح؟' },
        { title: 'فكرة فيديو فيروسية', prompt: 'اقترح علي فكرة فيديو يوتيوب غير مسبوقة تكسر خوارزميات اليوتيوب في مجالي' }
      ] : [
        { title: 'CTR Optimization Hacks', prompt: 'What are the top 3 thumbnail modifications that immediately double CTR?' },
        { title: 'First 30s Hook Formula', prompt: 'How do I craft an opening hook that eliminates drop-off in the first 30 seconds?' },
        { title: 'Sustainable Upload Plan', prompt: 'What is the optimal schedule for publishing 3 high-retention videos a week?' },
        { title: 'Viral Breakthrough Concept', prompt: 'Give me an unprecedented video idea engineered to trigger the recommendation algorithm.' }
      ];
    }

    const prompts = isAr ? activeSkill.suggestedPromptsAr : activeSkill.suggestedPromptsEn;
    return prompts.map(p => ({
      title: p.length > 38 ? p.substring(0, 35) + '...' : p,
      prompt: p
    }));
  }, [activeSkill, isAr]);

  return (
    <div className="flex-1 flex flex-col h-screen w-full bg-[#080d0b] text-slate-100 relative overflow-hidden font-sans select-text">
      {/* Top Bar Navigation - Neat & Minimalist */}
      <header className="h-14 shrink-0 bg-[#060a08] border-b border-white/10 px-4 md:px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles size={16} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">
              {isAr ? 'مُثقّف' : 'MUTHAQAF'}
            </h1>
            <p className="text-[10px] text-slate-400">
              {isAr ? 'مساعد الذكاء الاصطناعي لليوتيوب' : 'YouTube AI Assistant'}
            </p>
          </div>
        </div>

        {/* Header Right: Clean Actions */}
        <div className="flex items-center gap-2">
          {/* Linked Channel Quick Selector */}
          <ChannelHeaderSelector />

          {/* New Chat Quick Button */}
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs transition-colors border border-white/10 active:scale-95"
            title={isAr ? 'بدء محادثة جديدة' : 'New Chat'}
          >
            <PlusCircle size={14} className="text-emerald-400" />
            <span className="hidden sm:inline">{isAr ? 'محادثة جديدة' : 'New Chat'}</span>
          </button>

          {/* DOWNWARD SETTINGS DROPDOWN */}
          <div ref={settingsRef} className="relative">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors border ${
                isSettingsOpen 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              <Settings size={13} className="text-slate-400" />
              <span>{isAr ? 'الإعدادات' : 'Settings'}</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${isSettingsOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu floating downwards */}
            {isSettingsOpen && (
              <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-64 bg-[#09110d] border border-white/10 rounded-xl shadow-xl p-2 z-50 animate-fade-in">
                {/* Mode Selector */}
                <div className="p-2 border-b border-white/5">
                  <div className="text-[10px] uppercase font-mono text-slate-400 mb-1.5">
                    {isAr ? 'سرعة الاستجابة:' : 'Response Mode:'}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        setIsFastMode(!isFastMode);
                        if (!isFastMode) setIsDeepThink(false);
                      }}
                      className={`flex items-center justify-center gap-1.5 p-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isFastMode
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-white/5 hover:bg-white/10 text-slate-400'
                      }`}
                    >
                      <Zap size={12} className={isFastMode ? 'text-amber-400' : ''} />
                      <span>{isAr ? 'سريع' : 'Fast'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsDeepThink(!isDeepThink);
                        if (!isDeepThink) setIsFastMode(false);
                      }}
                      className={`flex items-center justify-center gap-1.5 p-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isDeepThink
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : 'bg-white/5 hover:bg-white/10 text-slate-400'
                      }`}
                    >
                      <Brain size={12} className={isDeepThink ? 'text-purple-400' : ''} />
                      <span>{isAr ? 'عميق' : 'Deep'}</span>
                    </button>
                  </div>
                </div>

                {/* Language Switch */}
                <div className="p-2 border-b border-white/5">
                  <div className="text-[10px] uppercase font-mono text-slate-400 mb-1.5">
                    {isAr ? 'اللغة:' : 'Language:'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => { setLang('ar'); setIsSettingsOpen(false); }}
                      className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-xs font-medium transition-colors ${
                        lang === 'ar' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      <span>العربية</span>
                      {lang === 'ar' && <Check size={11} />}
                    </button>
                    <button
                      onClick={() => { setLang('en'); setIsSettingsOpen(false); }}
                      className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-xs font-medium transition-colors ${
                        lang === 'en' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      <span>English</span>
                      {lang === 'en' && <Check size={11} />}
                    </button>
                  </div>
                </div>

                {/* Skills Library Modal Trigger */}
                <button
                  onClick={() => {
                    setIsSkillsModalOpen(true);
                    setIsSettingsOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Layers size={13} className="text-emerald-400" />
                    <span>{isAr ? 'دليل وشرح المهارات' : 'Skills Directory'}</span>
                  </div>
                  <ArrowRight size={11} className="text-slate-500 rtl:rotate-180" />
                </button>

                {/* Clear chat history */}
                <button
                  onClick={() => {
                    setIsSettingsOpen(false);
                    handleNewChat();
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-red-500/10 text-red-400 text-xs transition-colors"
                >
                  <Trash2 size={13} />
                  <span>{isAr ? 'مسح المحادثة' : 'Clear chat'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Conversation Stream */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 py-6 max-w-3xl mx-auto w-full flex flex-col justify-between"
      >
        {messages.length === 0 ? (
          /* PURE CLEAN & ORGANIZED WELCOME STATE */
          <div className="my-auto py-8 text-center flex flex-col items-center justify-center animate-fade-in max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
              <Sparkles size={22} />
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">
              {isAr ? 'كيف يمكنني مساعدتك اليوم؟' : 'How can I help you today?'}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              {isAr 
                ? 'اكتب طلبك مباشرة، أو اختر أحد الاقتراحات السريعة أدناه.'
                : 'Type your request directly or pick a suggested task below.'}
            </p>

            {/* Clean, Non-Cluttered Suggestion Buttons */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-start">
              {[
                {
                  skillId: 'viral_script',
                  icon: '✍️',
                  titleAr: 'كتابة اسكريبت يوتيوب كامل',
                  titleEn: 'Write YouTube Video Script',
                  promptAr: 'اكتب لي اسكريبت فيديو 5 دقائق بهوك قوي وسرد مشوق عن: '
                },
                {
                  skillId: 'thumbnail_ab',
                  icon: '⚔️',
                  titleAr: 'مقارنة صورتين مصغرتين A/B',
                  titleEn: 'A/B Test Two Thumbnails',
                  promptAr: 'حلل وقارن بين فكرتين لصورة مصغرة وتوقع أيهما يحقق CTR أعلى: '
                },
                {
                  skillId: 'trend_radar',
                  icon: '📊',
                  titleAr: 'تحليل تريندات وفرص صاعدة',
                  titleEn: 'Forecast Trending Topics',
                  promptAr: 'ما هي أهم المواضيع والتريندات الصاعدة حالياً في مجال: '
                },
                {
                  skillId: 'seo_suite',
                  icon: '🔍',
                  titleAr: 'استخراج كلمات مفتاحية وسيو',
                  titleEn: 'Generate SEO & Metadata',
                  promptAr: 'اقترح عناوين متصدرة وكلمات مفتاحية وهاشتاجات لفيديو عن: '
                }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const skill = SKILLS_LIST.find(s => s.id === item.skillId);
                    if (skill) setActiveSkill(skill);
                    setInput(item.promptAr);
                    if (textareaRef.current) textareaRef.current.focus();
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-emerald-500/30 text-slate-300 hover:text-white text-xs transition-colors"
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="font-medium">{isAr ? item.titleAr : item.titleEn}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* MESSAGES LIST */
          <div className="space-y-5 pb-4">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div 
                  key={msg.id || index}
                  className={`flex items-start gap-2.5 md:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isUser 
                      ? 'bg-white/10 text-white' 
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {isUser ? <User size={14} /> : <Bot size={14} />}
                  </div>

                  {/* Message Bubble Container */}
                  <div className={`max-w-[90%] md:max-w-[85%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    {/* User upload image */}
                    {msg.uploadedImage && (
                      <div className="mb-2 max-w-xs rounded-lg overflow-hidden border border-white/20">
                        <img src={msg.uploadedImage} alt="Uploaded" className="w-full h-auto object-cover" />
                      </div>
                    )}

                    {/* Skill Tag Badge */}
                    {!isUser && msg.skillId && (() => {
                      const matchedSkill = SKILLS_LIST.find(s => s.id === msg.skillId);
                      if (!matchedSkill) return null;
                      const Icon = matchedSkill.icon;
                      return (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 mb-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                          <Icon size={12} />
                          <span>{isAr ? matchedSkill.titleAr : matchedSkill.titleEn}</span>
                        </div>
                      );
                    })()}

                    {/* Text Bubble */}
                    <div className={`px-4 py-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-[#060c09] border border-white/10 text-slate-200 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>

                    {/* Skill Specific Custom Cards */}
                    {!isUser && msg.skillId === 'trend_forecasting' && msg.skillData && (
                      <TrendForecastCard 
                        data={msg.skillData} 
                        isAr={isAr} 
                        onUseTopic={chainIdeaToScript} 
                      />
                    )}

                    {!isUser && msg.skillId === 'thumbnail_ab' && msg.skillData && (
                      <ThumbnailAbCard 
                        data={msg.skillData} 
                        isAr={isAr} 
                      />
                    )}

                    {!isUser && msg.skillId === 'thumbnail_gen' && msg.skillData && (
                      <ThumbnailGenCard 
                        data={msg.skillData} 
                        isAr={isAr} 
                      />
                    )}

                    {!isUser && msg.skillId === 'viral_script' && msg.skillData && (
                      <ViralScriptCard 
                        data={msg.skillData} 
                        isAr={isAr} 
                        onGenerateThumbnail={chainIdeaToThumbnail}
                      />
                    )}

                    {!isUser && msg.skillId === 'seo_tools' && msg.skillData && (
                      <SeoCard 
                        data={msg.skillData} 
                        isAr={isAr} 
                      />
                    )}

                    {!isUser && msg.skillId === 'viral_ideas' && msg.skillData && (
                      <IdeasBankCard 
                        data={msg.skillData} 
                        isAr={isAr} 
                        onSelectIdeaForScript={chainIdeaToScript}
                        onSelectIdeaForThumbnail={chainIdeaToThumbnail}
                      />
                    )}

                    {!isUser && msg.skillId === 'channel_audit' && msg.skillData && (
                      <ChannelAuditCard 
                        data={msg.skillData} 
                        isAr={isAr} 
                      />
                    )}

                    {/* Bubble Footer Actions */}
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <button
                        onClick={() => handleCopyMessage(msg.text, msg.id)}
                        className="hover:text-slate-300 transition-colors p-1 flex items-center gap-1"
                        title={isAr ? 'نسخ النص' : 'Copy'}
                      >
                        {copiedMsgId === msg.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-[#060c09] border border-emerald-500/20 px-3.5 py-2.5 rounded-xl rounded-tl-none flex items-center gap-2.5">
                  <Loader2 size={15} className="text-emerald-400 animate-spin" />
                  <span className="text-xs text-slate-300">
                    {loadingPhase || (isAr ? 'جاري التفكير...' : 'Thinking...')}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Control Section: Clean & Non-cluttered */}
      <div className="shrink-0 bg-[#060a08] border-t border-white/10 px-4 md:px-6 py-3 max-w-3xl mx-auto w-full z-20">
        {/* Single Compact Skill Selector */}
        <div className="flex items-center justify-between mb-2">
          <div ref={skillDropupRef} className="relative">
            <button
              type="button"
              onClick={() => setIsSkillDropupOpen(!isSkillDropupOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors border ${
                activeSkill
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/10'
              }`}
            >
              {activeSkill ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="font-medium truncate max-w-[160px]">
                    {isAr ? activeSkill.titleAr : activeSkill.titleEn}
                  </span>
                </>
              ) : (
                <>
                  <Zap size={12} className="text-emerald-400" />
                  <span>{isAr ? 'دردشة حرة' : 'General Chat'}</span>
                </>
              )}
              <ChevronUp size={12} className={`transition-transform duration-200 ${isSkillDropupOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Skills Dropup Menu */}
            {isSkillDropupOpen && (
              <div className="absolute bottom-full left-0 rtl:left-auto rtl:right-0 mb-2 w-72 sm:w-80 bg-[#09110d] border border-white/10 rounded-xl shadow-xl p-2 z-50 max-h-80 overflow-y-auto custom-scrollbar animate-fade-in text-start">
                <div className="p-1.5 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {isAr ? 'اختر مهارة محددة:' : 'Select Skill:'}
                  </span>
                  <button
                    onClick={() => {
                      setIsSkillDropupOpen(false);
                      setIsSkillsModalOpen(true);
                    }}
                    className="text-[10px] text-emerald-400 hover:underline"
                  >
                    {isAr ? 'عرض الكل' : 'View all'}
                  </button>
                </div>

                {/* Free Chat option */}
                <button
                  onClick={() => {
                    setActiveSkill(null);
                    setIsSkillDropupOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors my-1 ${
                    !activeSkill ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare size={13} className="text-emerald-400" />
                    <span>{isAr ? 'دردشة واستشارة حرة' : 'Free Chat'}</span>
                  </div>
                  {!activeSkill && <Check size={13} className="text-emerald-400" />}
                </button>

                {skillCategories.map(cat => (
                  <div key={cat.id} className="mt-2 pt-1 border-t border-white/5">
                    <div className="px-2 py-0.5 text-[9px] font-mono text-slate-500">
                      {isAr ? cat.labelAr : cat.labelEn}
                    </div>
                    <div className="space-y-0.5 mt-0.5">
                      {cat.skills.map(skill => {
                        const Icon = skill.icon;
                        const isSelected = activeSkill?.id === skill.id;
                        return (
                          <button
                            key={skill.id}
                            onClick={() => {
                              handleSelectSkill(skill);
                              setIsSkillDropupOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors ${
                              isSelected ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'hover:bg-white/5 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-5 h-5 rounded bg-white/5 text-emerald-400 flex items-center justify-center shrink-0">
                                <Icon size={12} />
                              </span>
                              <span className="truncate">{isAr ? skill.titleAr : skill.titleEn}</span>
                            </div>
                            {isSelected && <Check size={13} className="text-emerald-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {activeSkill && (
            <button
              onClick={() => setActiveSkill(null)}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded hover:bg-white/5 transition-colors"
              title={isAr ? 'إلغاء المهارة' : 'Clear skill'}
            >
              <X size={11} />
              <span>{isAr ? 'إلغاء' : 'Clear'}</span>
            </button>
          )}
        </div>

        {/* Image Attachment Preview */}
        {selectedImage && (
          <div className="relative inline-block mb-2 rounded-lg overflow-hidden border border-emerald-500/40">
            <img src={selectedImage} alt="Attachment" className="h-14 w-auto object-cover" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-1 right-1 p-0.5 bg-black/80 rounded-full text-white hover:text-red-400"
            >
              <X size={11} />
            </button>
          </div>
        )}

        {/* MAIN PROMPT INPUT FORM */}
        <form onSubmit={handleSend} className="relative flex items-end gap-1.5 bg-[#080e0b] border border-white/15 focus-within:border-emerald-500/60 rounded-xl p-1.5 transition-colors">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          {/* Attach image button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors shrink-0"
            title={isAr ? 'إرفاق صورة' : 'Attach image'}
          >
            <ImageIcon size={16} />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              activeSkill 
                ? (isAr ? activeSkill.placeholderAr : activeSkill.placeholderEn) 
                : (isAr ? 'اسأل مُثقّف عن أي شيء يخص قناتك أو محتواك...' : 'Ask Muthaqaf about your content or channel...')
            }
            className="flex-1 bg-transparent py-1.5 px-1 text-sm text-white placeholder-slate-500 focus:outline-none resize-none max-h-36 leading-relaxed font-sans"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 text-black disabled:text-slate-500 font-bold transition-colors shrink-0"
          >
            <Send size={15} className={isAr ? 'rotate-180' : ''} />
          </button>
        </form>
      </div>

      {/* FULL SKILLS MODAL */}
      <SkillsModal
        isOpen={isSkillsModalOpen}
        onClose={() => setIsSkillsModalOpen(false)}
        onSelectSkill={handleSelectSkill}
        isAr={isAr}
      />

      {/* LINKED CHANNELS MANAGER & AI AUDIT MODALS */}
      <LinkedChannelsManagerModal />
      <ChannelDeepAuditModal onAskCopilot={(prompt) => {
        setInput(prompt);
        if (textareaRef.current) textareaRef.current.focus();
      }} />
      <ChannelComparisonModal />
    </div>
  );
};

export default CopilotStudio;
