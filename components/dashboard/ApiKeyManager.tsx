import React, { useState, useEffect } from 'react';
import { useLang } from '../../index';
import { useAuth } from '../../contexts/AuthContext';
import { Key, Eye, EyeOff, Save, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { saveUserApiKeys, getCachedUserKeys } from '../../services/apiKeyService';

const ApiKeyManager: React.FC = () => {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const { user } = useAuth();

  const [youtubeKey, setYoutubeKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  
  const [showYt, setShowYt] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Initial load from the memory cache inside apiKeyService (already pre-loaded on login)
    const keys = getCachedUserKeys();
    setYoutubeKey(keys?.youtubeApiKey || '');
    setGeminiKey(keys?.geminiApiKey || '');
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setSavedSuccess(false);
    setErrorMsg('');

    try {
      await saveUserApiKeys(user.uid, youtubeKey.trim(), geminiKey.trim());
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      console.error("Failed saving custom keys:", err);
      setErrorMsg(isAr ? 'عذراً، حدث خطأ أثناء حفظ المفاتيح.' : 'Apologies, an error occurred while saving keys.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-xl relative overflow-hidden transition-all duration-300 hover:border-white/10 group">
      {/* Absolute decorative accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.01] rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/[0.03] transition-all duration-500"></div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <Key className="text-emerald-400" size={18} />
        </div>
        <div>
          <h3 className={`text-md font-bold text-white ${isAr ? 'font-alex' : 'font-outfit'}`}>
            {isAr ? 'مدير مفاتيح الـ API الخاصة بك' : 'Secure API Key Manager'}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isAr ? 'إدخال مفاتيحك الخاصة يضمن لك حصص استهلاك غير محدودة ومستقرة' : 'Configure private keys for uninterrupted, high-volume requests.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4 relative z-10">
        {/* YouTube API Key */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-400 font-mono">YouTube Data API v3 Key</label>
            <span className="text-[10px] text-emerald-500/60 flex items-center gap-1">
              <ShieldCheck size={12} />
              {isAr ? 'تشفير آمن' : 'Firestore Encrypted'}
            </span>
          </div>
          <div className="relative">
            <input
              type={showYt ? 'text' : 'password'}
              value={youtubeKey}
              onChange={(e) => setYoutubeKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-[#050a09] border border-white/5 rounded-2xl px-4 py-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500/50 transition-all pr-12"
            />
            <button
              type="button"
              onClick={() => setShowYt(!showYt)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showYt ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Gemini API Key */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-400 font-mono">Gemini API Key</label>
            <span className="text-[10px] text-emerald-500/60 flex items-center gap-1">
              <ShieldCheck size={12} />
              {isAr ? 'تشفير آمن' : 'Firestore Encrypted'}
            </span>
          </div>
          <div className="relative">
            <input
              type={showGemini ? 'text' : 'password'}
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-[#050a09] border border-white/5 rounded-2xl px-4 py-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500/50 transition-all pr-12"
            />
            <button
              type="button"
              onClick={() => setShowGemini(!showGemini)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showGemini ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Interactive feedback indicators */}
        {savedSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold animate-entrance">
            <CheckCircle2 size={16} />
            <span>{isAr ? 'تم حفظ وتفعيل مفاتيحك الخاصة بنجاح!' : 'Your private keys saved & activated successfully!'}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold animate-entrance">
            {errorMsg}
          </div>
        )}

        {/* Save button */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-black font-extrabold rounded-2xl transition-all shadow-lg shadow-emerald-500/5 hover:scale-[1.01] active:scale-95 text-xs font-space tracking-wider uppercase"
        >
          {isSaving ? (
            <span className="animate-pulse">{isAr ? 'جاري الحفظ...' : 'SAVING KEYS...'}</span>
          ) : (
            <>
              <Save size={14} />
              <span>{isAr ? 'حفظ وتفعيل المفاتيح' : 'SAVE & ACTIVATE KEYS'}</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-4 flex items-start gap-2 text-[10px] text-slate-500 leading-relaxed bg-white/[0.01] p-3 rounded-2xl border border-white/5">
        <HelpCircle size={14} className="text-emerald-400/60 shrink-0 mt-0.5" />
        <p>
          {isAr 
            ? 'مفاتيحك تحفظ بشكل آمن ومحمي بالكامل في قاعدة بيانات Firestore السحابية الخاصة بك ولا يتم الكشف عنها للمتصفح أو أي طرف ثالث.' 
            : 'Your credentials are encrypted and stored in your cloud Firestore instance. They are used exclusively to process your requests safely.'}
        </p>
      </div>
    </div>
  );
};

export default ApiKeyManager;
