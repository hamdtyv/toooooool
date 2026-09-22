
import React, { useState } from 'react';
import { useLang } from '../index';
import { motion } from 'motion/react';
import { fetchChannelData, fetchYoutubeData } from '../services/youtubeService';
import { extractId } from '../utils';
import { analyzeAdvancedAudienceTiming, generateWeeklySchedule, analyzeChannelUploadPattern } from '../services/algoService';
import { 
  Users, 
  Clock, 
  Globe, 
  Zap, 
  Calendar, 
  Loader2, 
  Video, 
  BarChart2, 
  Rocket,
  PenTool,
  BookOpen,
  MessageCircle,
  Coffee
} from 'lucide-react';
import { VideoData, ScheduleAnalysis, WeeklyScheduleItem } from '../types';
import Tooltip from './Tooltip';

const AudienceInsights: React.FC = () => {
  const { t, lang } = useLang();
  const [input, setInput] = useState('');
  const [bestTime, setBestTime] = useState<{day: string, hour: number, timeStr: string, timeZone: string, country?: string} | null>(null);
  const [scheduleAnalysis, setScheduleAnalysis] = useState<ScheduleAnalysis | null>(null);
  const [schedule, setSchedule] = useState<WeeklyScheduleItem[]>([]);
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;
    setLoading(true);
    setLoadingStatus(lang === 'ar' ? 'جاري الاتصال...' : 'Connecting...');
    
    try {
      const { id } = extractId(input);
      const ch = await fetchChannelData(id);
      
      if (ch) {
          setChannel(ch);
          // FIX: Use reliable Uploads ID from contentDetails
          const playlistId = ch.contentDetails?.relatedPlaylists?.uploads || ch.id.replace('UC', 'UU');
          
          let allVideos: VideoData[] = [];
          let nextPageToken: string | undefined = '';
          let pageCount = 0;
          const MAX_PAGES = 4;

          while (pageCount < MAX_PAGES && nextPageToken !== undefined) {
              setLoadingStatus(lang === 'ar' 
                  ? `جاري تحليل الصفحة ${pageCount + 1}... (${allVideos.length} فيديو)` 
                  : `Analyzing Page ${pageCount + 1}... (${allVideos.length} videos)`);

              const data = await fetchYoutubeData('playlistItems', `part=snippet&playlistId=${playlistId}&maxResults=50&pageToken=${nextPageToken}`);
              
              if (data && data.items && data.items.length > 0) {
                  const videoIds = data.items.map((i: any) => i.snippet.resourceId.videoId).join(',');
                  const statsData = await fetchYoutubeData('videos', `part=statistics,snippet&id=${videoIds}`);
                  
                  if (statsData && statsData.items) {
                      allVideos = [...allVideos, ...statsData.items];
                  }
              }

              nextPageToken = data?.nextPageToken;
              pageCount++;
              if (!data?.items || data.items.length < 50) break;
          }
          
          if (allVideos.length > 0) {
               const country = ch.snippet.country;
               const channelTitle = ch.snippet.title;
               const analysis = analyzeAdvancedAudienceTiming(allVideos, country, lang);
               setBestTime(analysis);
               const scheduleData = analyzeChannelUploadPattern(allVideos, country, lang);
               setScheduleAnalysis(scheduleData);
               const weekly = generateWeeklySchedule(allVideos, country, lang, channelTitle);
               setSchedule(weekly);
          }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
    setLoadingStatus('');
  };

  const getDayStyle = (item: WeeklyScheduleItem) => {
      if (item.isTopDay) {
          return 'bg-gradient-to-br from-emerald-600/20 to-emerald-600/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400/50';
      }
      return 'bg-white/5 border-white/5 hover:bg-white/10';
  };

  const isAr = lang === 'ar';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto pb-20 px-4 md:px-0 font-sans"
    >
        {/* Header */}
        <div className="mb-16 text-center md:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 mb-4"
            >
              <Calendar size={14} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{t.audienceInsights}</span>
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-sm flex items-center justify-center md:justify-start gap-4">
                <Calendar className="text-emerald-400 shrink-0" size={36} />
                {t.audienceInsights}
            </h2>
            <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed font-normal">
                {t.audienceDesc}
            </p>
        </div>

      <div className="max-w-3xl mx-auto mb-12">
        <form onSubmit={handleAnalyze} className="relative group z-20">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 to-transparent rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            
            <div className="relative flex flex-col md:flex-row items-center bg-[#051a16]/80 backdrop-blur-xl border border-emerald-950/50 rounded-2xl p-2 shadow-2xl overflow-hidden">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className={`w-full md:flex-1 bg-transparent border-none py-3 md:py-4 px-4 md:px-6 text-white text-base md:text-lg focus:outline-none placeholder-gray-600 font-medium ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                />
                
                <div className="hidden md:block px-3">
                    <Tooltip content={t.audienceDesc} />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 md:px-10 py-3 md:py-4 rounded-xl font-black text-base md:text-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap mt-2 md:mt-0`}
                >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : t.analyze}
                </button>
            </div>
            {loading && <p className="text-center text-[10px] md:text-xs text-gray-500 mt-2 animate-pulse">{loadingStatus}</p>}
        </form>
      </div>

      {channel && bestTime && scheduleAnalysis && (
          <div className="space-y-8 animate-slide-in">
              <div className="glass-panel p-5 md:p-8 rounded-2xl border-l-4 border-emerald-500">
                   <h3 className="font-bold text-lg md:text-xl mb-6 flex items-center gap-2 text-white">
                      <Video className="text-emerald-400"/> {t.scheduleTracker}
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="bg-white/5 p-4 rounded-xl text-center">
                           <div className="text-gray-400 text-xs md:text-sm mb-2">{t.consistencyScore}</div>
                           <div className="text-2xl md:text-3xl font-bold text-white mb-2">{scheduleAnalysis.consistencyScore}%</div>
                           <div className={`text-[10px] md:text-xs px-2 py-1 rounded inline-block ${scheduleAnalysis.isConsistent ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                               {scheduleAnalysis.isConsistent ? t.consistent : t.random}
                           </div>
                       </div>
                       <div className="bg-white/5 p-4 rounded-xl md:col-span-2">
                           <div className="flex justify-between items-start mb-4">
                               <div className="text-gray-400 text-xs md:text-sm">{t.uploadHabits}</div>
                               <div className="text-[8px] md:text-[10px] text-gray-500 flex items-center gap-1 bg-black/30 px-2 py-1 rounded">
                                   <Globe size={10}/> {scheduleAnalysis.timezone}
                               </div>
                           </div>
                           <div className="flex flex-wrap gap-2 mb-3">
                               {scheduleAnalysis.frequentDays.map((d, i) => (
                                   <span key={i} className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-lg text-xs md:text-sm border border-emerald-500/30">{d}</span>
                               ))}
                           </div>
                       </div>
                   </div>
              </div>
          </div>
      )}
    </motion.div>
  );
};

export default AudienceInsights;
