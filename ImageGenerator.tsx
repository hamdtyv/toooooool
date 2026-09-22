
import React, { useState, useRef, useEffect } from 'react';
import { useLang } from '../index';
import { motion } from 'motion/react';
import { Loader2, Download, Image as ImageIcon, Camera, Sparkles, Smartphone, Maximize, Square, Upload, Wand2, Plus, Trash2, ChevronDown, Monitor, Tv, ScanFace, Eye, Palette, AlertTriangle, CheckCircle, Brain, Zap, X, Search } from 'lucide-react';
import { saveToStorage, loadFromStorage, StorageKeys } from '../services/storageService';
import { useLocation } from 'react-router-dom';
import { analyzeImageDeeply } from '../services/geminiService';
import { useAppState } from '../contexts/AppStateContext';
import { useJobs } from '../contexts/JobContext';
import { logToolActivity } from '../services/firebase';

// Custom Banana Icon for the Page Title (Rebranded to Emerald Identity)
const BananaIcon3D = ({ className }: { className?: string }) => (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M4 13c3.5-2 8-2 10 2a5.5 5.5 0 0 1 8 5" fill="#10b981" stroke="#047857"/>
      <path d="M5.15 17a9 9 0 0 1 12.05-9" stroke="#6ee7b7"/>
      <path d="M6 9a2 2 0 0 1 0-4" fill="#064e3b"/>
      <path d="M4 13a2 2 0 0 0-1 4 6 6 0 0 0 6 6 1.5 1.5 0 0 0 2-2" fill="#059669"/>
    </svg>
);

const AspectRatioButton = ({ ratio, label, current, onClick, icon: Icon }: any) => (
    <button
        type="button"
        onClick={() => onClick(ratio)}
        className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${
            current === ratio 
            ? 'bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
        }`}
    >
        {Icon && <Icon size={14} />}
        {label}
    </button>
);

const StyleChip = ({ label, value, selected, onClick }: any) => (
    <button
        type="button"
        onClick={() => onClick(value)}
        className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap ${
            selected 
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' 
            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
        }`}
    >
        {label}
    </button>
);

const ImageGenerator: React.FC = () => {
  const { t, lang, resultLang } = useLang();
  const { addToArchive } = useAppState();
  const location = useLocation();
  const { jobs, startJob } = useJobs();
  
  // Tabs: 'generate', 'edit', 'analyze'
  const [activeTab, setActiveTab] = useState<'generate' | 'edit' | 'analyze'>('generate');

  // Generator State
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'normal' | 'thumbnail'>('thumbnail');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  
  // Editor State
  const [editImage, setEditImage] = useState<string | null>(null);
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [overlayImage2, setOverlayImage2] = useState<string | null>(null);
  
  // Analyze State
  const [analyzeImage, setAnalyzeImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Common State
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  
  // Text Overlay State
  const [overlayText, setOverlayText] = useState('');
  const [overlayFontSize, setOverlayFontSize] = useState(60);
  const [overlayColor, setOverlayColor] = useState('#ffffff');
  const [overlayPositionX, setOverlayPositionX] = useState(50); // percentage
  const [overlayPositionY, setOverlayPositionY] = useState(80); // percentage
  const [overlayFont, setOverlayFont] = useState('Inter');
  const [overlayTextImage, setOverlayTextImage] = useState<string | null>(null);
  
  // Export State
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'enhancing' | 'ready'>('idle');
  const [exportProgress, setExportProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayInputRef = useRef<HTMLInputElement>(null);
  const overlayInputRef2 = useRef<HTMLInputElement>(null);
  const textImageInputRef = useRef<HTMLInputElement>(null);
  const analyzeInputRef = useRef<HTMLInputElement>(null);
  const refImageInputRef = useRef<HTMLInputElement>(null);

  // Styles List
  const styles = [
      { label: "MrBeast (High Saturation)", value: "High saturation, wide angle, shocked expression, high contrast, vibrant colors, youtube thumbnail aesthetic" },
      { label: "Cinematic", value: "Cinematic lighting, depth of field, 8k resolution, dramatic atmosphere" },
      { label: "Minimalist", value: "Clean background, bold text, simple composition, minimal clutter" },
      { label: "Gaming", value: "Neon lights, dynamic action, game character, esports style, glowing effects" },
      { label: "3D Render", value: "Pixar style 3D render, smooth textures, clay style, cute" },
      { label: "Dark/Horror", value: "Dark atmosphere, scary, mysterious, shadowy, high contrast" },
      { label: "Comic Book", value: "Comic book style, thick outlines, halftone pattern, vibrant" }
  ];

  const loadData = () => {
      const cached = loadFromStorage<any>(StorageKeys.LAST_GEN_IMAGE);
      if (cached) {
          setGeneratedImage(cached.image);
          setPrompt(cached.prompt || '');
          if (cached.mode) setMode(cached.mode);
          if (cached.aspectRatio) setAspectRatio(cached.aspectRatio);
      }
  };

  useEffect(() => {
      loadData();
  }, []);

  // Listen for Background Job Completion (Generation/Edit)
  useEffect(() => {
      const job = jobs.image;
      if (job.status === 'success') {
          const cached = loadFromStorage<any>(StorageKeys.LAST_GEN_IMAGE);
          if (cached) {
              setGeneratedImage(cached.image);
              setPrompt(cached.prompt || '');
              if (cached.mode) setMode(cached.mode);
              if (cached.aspectRatio) setAspectRatio(cached.aspectRatio);
              
              // Save discrete result to Strategic Archive
              addToArchive({
                  type: 'image',
                  title: (cached.prompt || 'Strategic Output').substring(0, 50),
                  payload: {
                      image: cached.image,
                      prompt: cached.prompt,
                      settings: { mode: cached.mode, aspectRatio: cached.aspectRatio }
                  }
              });

              logToolActivity('image_generator', t.imageGenerator, 'generated_image', {
                  prompt: cached.prompt,
                  settings: { mode: cached.mode, aspectRatio: cached.aspectRatio }
              }, lang === 'ar' ? `توليد صورة لـ: ${cached.prompt?.substring(0, 30)}...` : `Generated image for: ${cached.prompt?.substring(0, 30)}...`);
          }
      }
  }, [jobs.image.status]);

  const handleModeChange = (newMode: 'normal' | 'thumbnail') => {
      setMode(newMode);
      if (newMode === 'thumbnail') setAspectRatio('16:9');
      else setAspectRatio('1:1');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'base' | 'overlay1' | 'overlay2' | 'analyze' | 'textImage' | 'referenceImage') => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              if (type === 'overlay1') setOverlayImage(reader.result as string);
              else if (type === 'overlay2') setOverlayImage2(reader.result as string);
              else if (type === 'textImage') setOverlayTextImage(reader.result as string);
              else if (type === 'referenceImage') setReferenceImage(reader.result as string);
              else if (type === 'analyze') {
                  setAnalyzeImage(reader.result as string);
                  setAnalysisResult(null); // Clear previous analysis
              }
              else {
                  setEditImage(reader.result as string);
                  setGeneratedImage(null);
              }
          };
          reader.readAsDataURL(file);
      }
      e.target.value = '';
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !editImage) return;

    setGeneratedImage(null);
    setExportStatus('idle');

    // Append style to prompt if selected
    let finalPrompt = prompt;
    if (selectedStyle) {
        finalPrompt += `, ${selectedStyle}`;
    }

    await startJob('image', finalPrompt, lang, resultLang, {
        activeTab: activeTab === 'edit' ? 'edit' : 'generate',
        mode,
        aspectRatio,
        editImage,
        overlayImage,
        overlayImage2,
        referenceImage
    });
  };

  const handleAnalyze = async () => {
      if (!analyzeImage) return;
      setIsAnalyzing(true);
      const result = await analyzeImageDeeply(analyzeImage, lang);
      setAnalysisResult(result);
      setIsAnalyzing(false);
      
      await logToolActivity('image_generator', t.imageGenerator, 'analyzed_image', {
          hasImage: true
      }, lang === 'ar' ? 'تحليل سيكولوجية الصورة المصغرة' : 'Analyzed thumbnail psychology');
  };

  const isGlobalLoading = jobs.image.status === 'loading';

  // ... (Export Logic remains same) ...
  const handleExport = async (resolution: 'original' | '2k' | '4k') => {
      if (!generatedImage) return;
      setShowExportMenu(false);
      if (resolution === 'original') {
          const link = document.createElement('a');
          link.href = generatedImage;
          link.download = `nano-banana-original-${Date.now()}.png`;
          link.click();
          return;
      }
      setExportStatus('enhancing');
      setExportProgress(0);
      const duration = 15000;
      const interval = 100;
      const steps = duration / interval;
      let currentStep = 0;
      const timer = setInterval(() => {
          currentStep++;
          const percentage = Math.min(100, Math.round((currentStep / steps) * 100));
          setExportProgress(percentage);
          if (currentStep >= steps) {
              clearInterval(timer);
              finalizeExport(resolution);
          }
      }, interval);
  };

  const finalizeExport = async (resolution: '2k' | '4k') => {
      const img = new Image();
      img.src = generatedImage!;
      await new Promise((resolve) => {
          img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
              let targetWidth = img.width;
              if (resolution === '2k') targetWidth = 2560;
              if (resolution === '4k') targetWidth = 3840;
              const scaleFactor = targetWidth / img.width;
              const targetHeight = img.height * scaleFactor;
              canvas.width = targetWidth;
              canvas.height = targetHeight;
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

              // Draw Text Overlay
              if (overlayTextImage) {
                  const overlayImg = new Image();
                  overlayImg.src = overlayTextImage;
                  await new Promise((resolve) => {
                      overlayImg.onload = () => {
                          const overlayWidth = (overlayFontSize / 100) * targetWidth;
                          const overlayHeight = (overlayImg.height / overlayImg.width) * overlayWidth;
                          const x = (overlayPositionX / 100) * targetWidth;
                          const y = (overlayPositionY / 100) * targetHeight;
                          
                          ctx.shadowColor = 'rgba(0,0,0,0.5)';
                          ctx.shadowBlur = 15;
                          ctx.drawImage(overlayImg, x - overlayWidth / 2, y - overlayHeight / 2, overlayWidth, overlayHeight);
                          resolve(null);
                      };
                  });
              } else if (overlayText) {
                  const finalFontSize = (overlayFontSize * scaleFactor);
                  ctx.font = `900 ${finalFontSize}px ${overlayFont}`;
                  ctx.fillStyle = overlayColor;
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  
                  // Add Shadow for readability
                  ctx.shadowColor = 'rgba(0,0,0,0.5)';
                  ctx.shadowBlur = 15;
                  ctx.shadowOffsetX = 5;
                  ctx.shadowOffsetY = 5;

                  const x = (overlayPositionX / 100) * targetWidth;
                  const y = (overlayPositionY / 100) * targetHeight;
                  
                  ctx.fillText(overlayText, x, y);
              }

              canvas.toBlob((blob) => {
                  if (blob) {
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `nano-banana-${resolution}-${Date.now()}.png`;
                      link.click();
                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                      setExportStatus('ready');
                      setTimeout(() => setExportStatus('idle'), 2000);
                  }
              }, 'image/png', 1.0);
          }
  };

  const isAr = lang === 'ar';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto pb-24 font-sans"
    >
        {/* Header */}
        <div className="mb-16 text-center md:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 mb-4"
            >
              <ImageIcon size={14} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{t.img_gen_title}</span>
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-sm flex items-center justify-center md:justify-start gap-3">
                <BananaIcon3D className="w-10 h-10 shrink-0 text-emerald-400" />
                {t.img_gen_title}
            </h2>
            <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed font-normal">
                {t.img_gen_desc}
            </p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
            <div className="bg-white/5 p-1 rounded-full border border-white/10 flex gap-1">
                <button 
                    onClick={() => setActiveTab('generate')}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'generate' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    <Sparkles size={16} /> {t.img_tab_generate}
                </button>
                <button 
                    onClick={() => setActiveTab('edit')}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'edit' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    <Wand2 size={16} /> {t.img_tab_edit}
                </button>
                <button 
                    onClick={() => setActiveTab('analyze')}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'analyze' ? 'bg-teal-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    <ScanFace size={16} /> {lang === 'ar' ? 'تحليل عميق' : 'Deep Analyze'}
                </button>
            </div>
        </div>

        {/* ANALYZE TAB CONTENT (FULL WIDTH) */}
        {activeTab === 'analyze' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-in">
                
                {/* Upload Section */}
                <div className="glass-panel p-8 rounded-3xl border border-dashed border-teal-500/30 hover:border-teal-500/60 transition-colors flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden group">
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={analyzeInputRef}
                        onChange={(e) => handleFileUpload(e, 'analyze')} 
                    />
                    
                    {analyzeImage ? (
                        <div className="relative w-full h-full flex flex-col items-center">
                            <img src={analyzeImage} alt="Analysis Target" className="max-h-[350px] rounded-xl shadow-2xl object-contain mb-6" />
                            <button 
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-teal-600/30 transition-all disabled:opacity-50"
                            >
                                {isAnalyzing ? <Loader2 className="animate-spin"/> : <Brain size={20}/>}
                                {isAnalyzing ? (lang === 'ar' ? 'جاري الفحص الدقيق...' : 'Scanning Pixels...') : (lang === 'ar' ? 'فحص شامل' : 'Deep Scan')}
                            </button>
                            <button onClick={() => analyzeInputRef.current?.click()} className="mt-4 text-xs text-gray-500 hover:text-white">Change Image</button>
                        </div>
                    ) : (
                        <div onClick={() => analyzeInputRef.current?.click()} className="cursor-pointer text-center">
                            <div className="w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform text-teal-500 border border-teal-500/20">
                                <ScanFace size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{lang === 'ar' ? 'ارفع الصورة للفحص' : 'Upload Image to Inspect'}</h3>
                            <p className="text-sm text-gray-400 max-w-xs mx-auto">
                                {lang === 'ar' ? 'سيقوم الذكاء الاصطناعي بتحليل الألوان، المشاعر، وتوزيع العناصر.' : 'AI will analyze CTR potential, emotional hooks, color psychology, and composition.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Report Section */}
                <div className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden bg-[#0a0a0a]">
                    {analysisResult ? (
                        <div className="space-y-6 animate-slide-in">
                            {/* Score Header */}
                            <div className="flex items-center justify-between border-b border-white/10 pb-6">
                                <div>
                                    <div className="text-[10px] text-teal-400 font-bold uppercase tracking-widest mb-1">CTR Potential</div>
                                    <div className="text-5xl font-black text-white">{analysisResult.ctr_score}/100</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{lang === 'ar' ? 'الحكم النهائي' : 'Verdict'}</div>
                                    <div className="text-lg font-bold text-white">{analysisResult.verdict}</div>
                                </div>
                            </div>

                            {/* Emotion & Visual Path */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-xl">
                                    <div className="text-[10px] text-emerald-500 font-bold uppercase mb-2 flex items-center gap-1"><Eye size={12}/> Visual Path</div>
                                    <div className="text-sm text-gray-300">{analysisResult.visual_hierarchy}</div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl">
                                    <div className="text-[10px] text-red-500 font-bold uppercase mb-2 flex items-center gap-1"><Brain size={12}/> Emotion</div>
                                    <div className="text-sm text-gray-300">{analysisResult.primary_emotion}</div>
                                </div>
                            </div>

                            {/* Micro Analysis Section */}
                            {analysisResult.micro_analysis && (
                                <div className="space-y-3">
                                    <div className="text-[10px] text-teal-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                        <ScanFace size={12}/> {lang === 'ar' ? 'الفحص المجهري' : 'Microscopic Scan'}
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {analysisResult.micro_analysis.map((item: any, i: number) => (
                                            <div key={i} className="bg-white/5 p-3 rounded-lg border border-white/5">
                                                <div className="text-xs font-bold text-teal-500 mb-1">{item.element}</div>
                                                <div className="text-[11px] text-gray-400 leading-relaxed">{item.analysis}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Colors */}
                            <div>
                                <div className="text-[10px] text-gray-500 font-bold uppercase mb-2 flex items-center gap-1"><Palette size={12}/> Palette Psychology</div>
                                <div className="flex gap-2">
                                    {analysisResult.color_palette?.map((color: string, i: number) => (
                                        <div key={i} className="h-8 w-full rounded-lg border border-white/10" style={{backgroundColor: color}}></div>
                                    ))}
                                </div>
                            </div>

                            {/* SEO Tags */}
                            {analysisResult.seo_tags && (
                                <div>
                                    <div className="text-[10px] text-blue-400 font-bold uppercase mb-2 flex items-center gap-1"><Search size={12}/> Visual SEO Tags</div>
                                    <div className="flex flex-wrap gap-2">
                                        {analysisResult.seo_tags.map((tag: string, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] rounded-md border border-blue-500/20">#{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actionable Advice */}
                            <div className="bg-green-500/10 p-5 rounded-xl border border-green-500/20">
                                <h4 className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2"><CheckCircle size={16}/> {lang === 'ar' ? 'خطوات التحسين' : 'Actionable Fixes'}</h4>
                                <ul className="space-y-2">
                                    {analysisResult.actionable_fixes?.map((fix: string, i: number) => (
                                        <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5">•</span> {fix}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full opacity-30 text-center">
                            <Brain size={60} className="mb-4 text-teal-500"/>
                            <p className="text-sm font-mono uppercase tracking-widest">{lang === 'ar' ? 'بانتظار البيانات...' : 'Awaiting Visual Input...'}</p>
                        </div>
                    )}
                </div>
            </div>
        ) : (
            // GENERATE & EDIT TABS (Original Layout Enhanced)
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Control Panel */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* GENERATOR MODE CONTROLS */}
                    {activeTab === 'generate' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => handleModeChange('thumbnail')}
                                    className={`p-3 rounded-xl border transition-all text-center relative overflow-hidden group ${mode === 'thumbnail' ? 'bg-emerald-500/10 border-emerald-500' : 'bg-[#151515] border-white/10 hover:border-emerald-500/30'}`}
                                >
                                    <Camera size={24} className={`mx-auto mb-2 ${mode === 'thumbnail' ? 'text-emerald-500' : 'text-gray-500'}`} />
                                    <div className="text-xs font-bold text-white">{t.chat_img_thumbnail}</div>
                                </button>

                                <button 
                                    onClick={() => handleModeChange('normal')}
                                    className={`p-3 rounded-xl border transition-all text-center relative overflow-hidden group ${mode === 'normal' ? 'bg-emerald-500/10 border-emerald-500' : 'bg-[#151515] border-white/10 hover:border-emerald-500/30'}`}
                                >
                                    <ImageIcon size={24} className={`mx-auto mb-2 ${mode === 'normal' ? 'text-emerald-500' : 'text-gray-500'}`} />
                                    <div className="text-xs font-bold text-white">{t.chat_img_normal}</div>
                                </button>
                            </div>

                            {/* Style Chips */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">
                                    {lang === 'ar' ? 'أنماط جاهزة' : 'Quick Styles'}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {styles.map((s, i) => (
                                        <StyleChip 
                                            key={i} 
                                            label={s.label} 
                                            value={s.value} 
                                            selected={selectedStyle === s.value} 
                                            onClick={(val: string) => setSelectedStyle(selectedStyle === val ? null : val)} 
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Reference Image Uploader */}
                            <div className="glass-panel p-4 rounded-xl border border-dashed border-white/20 hover:border-emerald-500/50 transition-colors text-center relative group">
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest text-start px-2">
                                    {lang === 'ar' ? 'صورة مرجعية (اختياري)' : 'Reference Image (Optional)'}
                                </label>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    ref={refImageInputRef}
                                    onChange={(e) => handleFileUpload(e, 'referenceImage')} 
                                />
                                {referenceImage ? (
                                    <div className="flex items-center gap-4 bg-black/20 p-2 rounded-lg">
                                        <div className="w-16 h-16 bg-black/50 rounded-lg overflow-hidden shrink-0 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                            <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 text-start min-w-0">
                                            <div className="text-xs font-bold text-emerald-400 mb-1">{lang === 'ar' ? 'تم رفع المرجع بنجاح' : 'Reference Loaded'}</div>
                                            <div className="text-[10px] text-gray-400 truncate">{lang === 'ar' ? 'سيتم إنشاء الصورة بناءً عليه' : 'Generation will use this structure'}</div>
                                        </div>
                                        <button 
                                            onClick={() => setReferenceImage(null)}
                                            className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div onClick={() => refImageInputRef.current?.click()} className="cursor-pointer flex items-center justify-center gap-3 py-2">
                                        <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                            <Plus size={16} />
                                        </div>
                                        <div className="text-start">
                                            <h3 className="font-bold text-gray-300 text-xs">{lang === 'ar' ? 'إضافة صورة مرجعية' : 'Add Reference'}</h3>
                                            <p className="text-[10px] text-gray-500">{lang === 'ar' ? 'قم برفع صورة لتكون أساس التصميم الجديد' : 'Upload an image to base the new generation on'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* EDITOR MODE CONTROLS */}
                    {activeTab === 'edit' && (
                        <div className="space-y-4">
                            {/* 1. Base Image Uploader */}
                            <div className="glass-panel p-6 rounded-2xl border border-dashed border-white/20 hover:border-emerald-500/50 transition-colors text-center relative group"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const file = e.dataTransfer.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => setEditImage(reader.result as string);
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            >
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    ref={fileInputRef}
                                    onChange={(e) => handleFileUpload(e, 'base')} 
                                />
                                
                                {editImage ? (
                                    <div className="relative group/img">
                                        <img src={editImage} alt="To Edit" className="w-full h-48 object-contain rounded-lg shadow-lg bg-black/50" />
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center font-bold text-white gap-2"
                                        >
                                            <Upload size={20} /> Change Base
                                        </button>
                                    </div>
                                ) : (
                                    <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer py-4">
                                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-500/20 text-gray-400 group-hover:text-emerald-500 transition-colors">
                                            <Upload size={24} />
                                        </div>
                                        <h3 className="font-bold text-white mb-1 text-sm">{t.img_upload_label}</h3>
                                        <p className="text-xs text-gray-400">{t.img_upload_desc}</p>
                                    </div>
                                )}
                            </div>

                            {/* 2. Optional Asset/Overlay Uploader 1 */}
                            <div className="glass-panel p-4 rounded-xl border border-dashed border-white/20 hover:border-blue-500/50 transition-colors text-center relative group">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    ref={overlayInputRef}
                                    onChange={(e) => handleFileUpload(e, 'overlay1')} 
                                />
                                {overlayImage ? (
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-black/50 rounded-lg overflow-hidden shrink-0 border border-white/10">
                                            <img src={overlayImage} alt="Asset" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 text-start min-w-0">
                                            <div className="text-xs font-bold text-white mb-1">Asset Loaded</div>
                                            <div className="text-[10px] text-gray-500 truncate">Ready to blend</div>
                                        </div>
                                        <button 
                                            onClick={() => setOverlayImage(null)}
                                            className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div onClick={() => overlayInputRef.current?.click()} className="cursor-pointer flex items-center justify-center gap-3 py-2">
                                        <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                            <Plus size={16} />
                                        </div>
                                        <div className="text-start">
                                            <h3 className="font-bold text-gray-300 text-xs">{t.img_add_asset}</h3>
                                            <p className="text-[10px] text-gray-500">{t.img_add_asset_desc}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 3. Text Overlay Studio */}
                            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                    <Zap size={18} />
                                    <h3 className="font-bold text-sm uppercase tracking-widest">{lang === 'ar' ? 'استوديو النصوص' : 'Text Studio'}</h3>
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">{lang === 'ar' ? 'رفع نص مفرغ (PNG)' : 'Upload Transparent Text (PNG)'}</label>
                                    <input 
                                        type="file"
                                        accept="image/png"
                                        ref={textImageInputRef}
                                        onChange={(e) => handleFileUpload(e, 'textImage')}
                                        className="hidden"
                                    />
                                    {!overlayTextImage ? (
                                        <button 
                                            onClick={() => textImageInputRef.current?.click()}
                                            className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-emerald-500/50 transition-all flex flex-col items-center gap-2"
                                        >
                                            <ImageIcon size={24} />
                                            <span className="text-xs">{lang === 'ar' ? 'اختر صورة النص' : 'Choose Text Image'}</span>
                                        </button>
                                    ) : (
                                        <div className="relative group">
                                            <img src={overlayTextImage} className="h-20 w-full object-contain rounded-lg bg-white/5 border border-white/10" alt="overlay" />
                                            <button 
                                                onClick={() => setOverlayTextImage(null)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">{lang === 'ar' ? 'حجم النص' : 'Text Size'}</label>
                                        <input 
                                            type="range" min="10" max="100" 
                                            value={overlayFontSize}
                                            onChange={(e) => setOverlayFontSize(parseInt(e.target.value))}
                                            className="w-full accent-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">{lang === 'ar' ? 'الموقع الأفقي (X)' : 'X Position'}</label>
                                        <input 
                                            type="range" min="0" max="100" 
                                            value={overlayPositionX}
                                            onChange={(e) => setOverlayPositionX(parseInt(e.target.value))}
                                            className="w-full accent-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">{lang === 'ar' ? 'الموقع الرأسي (Y)' : 'Y Position'}</label>
                                        <input 
                                            type="range" min="0" max="100" 
                                            value={overlayPositionY}
                                            onChange={(e) => setOverlayPositionY(parseInt(e.target.value))}
                                            className="w-full accent-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Aspect Ratio Selector (Common) */}
                    <div className="glass-panel p-4 rounded-2xl border border-white/10">
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                            <Maximize size={12}/> {t.select_ratio}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <AspectRatioButton ratio="16:9" label="16:9" icon={Maximize} current={aspectRatio} onClick={setAspectRatio} />
                            <AspectRatioButton ratio="9:16" label="9:16" icon={Smartphone} current={aspectRatio} onClick={setAspectRatio} />
                            <AspectRatioButton ratio="1:1" label="1:1" icon={Square} current={aspectRatio} onClick={setAspectRatio} />
                        </div>
                    </div>

                    {/* Prompt Input (Common) */}
                    <form onSubmit={handleGenerate} className="glass-panel p-6 rounded-2xl border border-white/10">
                        <label className="block text-sm font-bold text-gray-300 mb-3 ml-1">
                            {lang === 'ar' ? 'الوصف / التعديل المطلوب' : 'Prompt / Desired Edit'}
                        </label>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={activeTab === 'edit' 
                                ? (lang === 'ar' ? "مثال: اجعل الخلفية في الفضاء..." : "e.g., Make the background space themed...")
                                : t.chat_img_placeholder}
                            className={`w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none h-32 ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                        />
                        <button 
                            type="submit"
                            disabled={isGlobalLoading || (!prompt.trim() && !editImage)}
                            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {isGlobalLoading ? <Loader2 size={20} className="animate-spin" /> : activeTab === 'edit' ? <Wand2 size={20} /> : <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />}
                            {isGlobalLoading ? t.chat_img_generating : t.generate}
                        </button>
                    </form>
                </div>

                {/* Output Display */}
                <div className="lg:col-span-3 flex items-center justify-center">
                    <div 
                        className={`w-full h-full min-h-[600px] bg-[#0f0f0f] rounded-3xl border border-white/5 flex items-center justify-center relative overflow-hidden shadow-2xl transition-all duration-500`}
                    >
                        {activeTab === 'edit' && editImage && !generatedImage && !isGlobalLoading && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-30 blur-sm pointer-events-none">
                                <img src={editImage} className="w-full h-full object-cover" alt="bg"/>
                            </div>
                        )}

                        {generatedImage ? (
                            <div className="relative w-full h-full flex flex-col group p-4 animate-slide-in">
                                <img 
                                    src={generatedImage} 
                                    alt="Generated" 
                                    className={`w-full h-full object-contain rounded-lg shadow-2xl ${aspectRatio === '9:16' || aspectRatio === '3:4' ? 'max-w-[60%] mx-auto' : ''}`} 
                                />

                                {/* Real-time Text Overlay Preview */}
                                {overlayTextImage && (
                                    <div 
                                        className="absolute pointer-events-none select-none text-center drop-shadow-lg"
                                        style={{
                                            left: `${overlayPositionX}%`,
                                            top: `${overlayPositionY}%`,
                                            transform: 'translate(-50%, -50%)',
                                            width: `${overlayFontSize}%`,
                                            maxWidth: '95%',
                                        }}
                                    >
                                        <img src={overlayTextImage} className="w-full h-auto" alt="text overlay" />
                                    </div>
                                )}

                                {overlayText && !overlayTextImage && (
                                    <div 
                                        className="absolute pointer-events-none select-none text-center whitespace-pre-wrap drop-shadow-lg"
                                        style={{
                                            left: `${overlayPositionX}%`,
                                            top: `${overlayPositionY}%`,
                                            transform: 'translate(-50%, -50%)',
                                            fontSize: `${overlayFontSize}px`,
                                            color: overlayColor,
                                            fontFamily: overlayFont,
                                            fontWeight: '900',
                                            lineHeight: '1',
                                            maxWidth: '90%',
                                            textShadow: '2px 2px 10px rgba(0,0,0,0.5)'
                                        }}
                                    >
                                        {overlayText}
                                    </div>
                                )}
                                
                                {/* Upscaling Overlay */}
                                {exportStatus === 'enhancing' && (
                                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex flex-col items-center justify-center rounded-lg">
                                        <div className="relative w-24 h-24 mb-6">
                                            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/30"></div>
                                            <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin"></div>
                                            <Sparkles className="absolute inset-0 m-auto text-emerald-400 animate-pulse" size={32}/>
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">{t.enhancing_label}</h3>
                                        <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden mt-2">
                                            <div className="h-full bg-emerald-500 transition-all duration-100 ease-linear" style={{width: `${exportProgress}%`}}></div>
                                        </div>
                                        <div className="mt-2 text-emerald-500 font-mono text-sm">{exportProgress}%</div>
                                    </div>
                                )}

                                {/* Success Overlay */}
                                {exportStatus === 'ready' && (
                                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex flex-col items-center justify-center rounded-lg animate-slide-in">
                                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 shadow-[0_0_30px_lime]">
                                            <Download size={40} />
                                        </div>
                                        <h3 className="text-2xl font-black text-white">{t.download_ready}</h3>
                                    </div>
                                )}
                                
                                {/* Download / Export Studio Overlay */}
                                <div className={`absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm ${exportStatus !== 'idle' ? 'hidden' : ''}`}>
                                    <div className="relative">
                                        <button 
                                            onClick={() => setShowExportMenu(!showExportMenu)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.4)] text-lg"
                                        >
                                            <Download size={24} />
                                            {t.download_image}
                                            <ChevronDown size={20} className={`transition-transform duration-300 ${showExportMenu ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* Export Menu Dropdown */}
                                        {showExportMenu && (
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 glass-dropdown rounded-xl shadow-2xl overflow-hidden animate-slide-in z-20">
                                                <div className="p-3 border-b border-white/10 text-xs text-gray-400 uppercase tracking-widest font-bold text-center bg-black/20">
                                                    {t.export_options}
                                                </div>
                                                <div className="p-1">
                                                    <button onClick={() => handleExport('original')} className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-lg flex items-center gap-3 text-white transition-colors">
                                                        <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-gray-300"><ImageIcon size={16}/></div>
                                                        <div>
                                                            <div className="font-bold text-sm">Original</div>
                                                            <div className="text-[10px] text-gray-500">Standard Resolution</div>
                                                        </div>
                                                    </button>
                                                    <button onClick={() => handleExport('2k')} className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-lg flex items-center gap-3 text-white transition-colors group/item">
                                                        <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover/item:bg-blue-500 group-hover/item:text-white transition-colors"><Monitor size={16}/></div>
                                                        <div>
                                                            <div className="font-bold text-sm">2K QHD</div>
                                                            <div className="text-[10px] text-gray-500">{t.export_2k}</div>
                                                        </div>
                                                    </button>
                                                    <button onClick={() => handleExport('4k')} className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-lg flex items-center gap-3 text-white transition-colors group/item">
                                                        <div className="w-8 h-8 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover/item:bg-purple-500 group-hover/item:text-white transition-colors"><Tv size={16}/></div>
                                                        <div>
                                                            <div className="font-bold text-sm">4K UHD</div>
                                                            <div className="text-[10px] text-gray-500">{t.export_4k}</div>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center opacity-30 pointer-events-none p-10 relative z-10">
                                {isGlobalLoading ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative">
                                            <div className="w-24 h-24 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <BananaIcon3D className="w-10 h-10 opacity-50" />
                                            </div>
                                        </div>
                                        <p className="text-emerald-500 font-bold animate-pulse text-lg">
                                            {lang === 'ar' ? 'جاري الرسم في الخلفية...' : 'Painting in background...'}
                                        </p>
                                        <p className="text-xs text-gray-500">{t.chat_img_generating}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                                            <BananaIcon3D className="w-16 h-16 text-gray-500" />
                                        </div>
                                        <p className="text-xl font-bold text-gray-500">{activeTab === 'edit' ? t.img_upload_label : t.chat_img_placeholder}</p>
                                        <p className="text-sm text-gray-600 mt-2">Gemini 2.5 Flash Image Model</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </motion.div>
  );
};

export default ImageGenerator;
