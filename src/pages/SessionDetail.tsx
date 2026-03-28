import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { meditations } from '../data/meditations';
import { useAuth } from '../contexts/AuthContext';
import { Play, Pause, Share2, ArrowRight, CheckCircle, Loader2, Heart, ChevronRight, Volume2 } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { ShareModal } from '../components/ShareModal';
import { motion } from 'motion/react';

const getAi = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

const BACKGROUND_MUSIC: Record<string, string> = {
  money: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
  stress: 'https://actions.google.com/sounds/v1/water/brook_babbling.ogg',
  self: 'https://actions.google.com/sounds/v1/water/water_sloshing.ogg',
  sleep: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg',
  energy: 'https://actions.google.com/sounds/v1/birds/birds_in_forest.ogg'
};

const CATEGORY_BG_CLASSES: Record<string, string> = {
  money: 'from-[#E5F0FF] to-[#F2F2F7] dark:from-[#0A84FF]/20 dark:to-black',
  stress: 'from-[#E5F9E0] to-[#F2F2F7] dark:from-[#34C759]/20 dark:to-black',
  self: 'from-[#FFF0F5] to-[#F2F2F7] dark:from-[#FF2D55]/20 dark:to-black',
  sleep: 'from-[#EBE5FF] to-[#F2F2F7] dark:from-[#5E5CE6]/20 dark:to-black',
  energy: 'from-[#FFF5E5] to-[#F2F2F7] dark:from-[#FF9F0A]/20 dark:to-black'
};

const CATEGORY_BLOB_CLASSES: Record<string, string> = {
  money: 'bg-[#007AFF]/20 dark:bg-[#0A84FF]/20',
  stress: 'bg-[#34C759]/20 dark:bg-[#30D158]/20',
  self: 'bg-[#FF2D55]/20 dark:bg-[#FF375F]/20',
  sleep: 'bg-[#5E5CE6]/20 dark:bg-[#5E5CE6]/20',
  energy: 'bg-[#FF9F0A]/20 dark:bg-[#FF9F0A]/20'
};

const CATEGORY_TEXT_CLASSES: Record<string, string> = {
  money: 'text-[#007AFF] dark:text-[#0A84FF]',
  stress: 'text-[#34C759] dark:text-[#30D158]',
  self: 'text-[#FF2D55] dark:text-[#FF375F]',
  sleep: 'text-[#5E5CE6] dark:text-[#5E5CE6]',
  energy: 'text-[#FF9F0A] dark:text-[#FF9F0A]'
};

const CATEGORY_BORDER_CLASSES: Record<string, string> = {
  money: 'border-[#007AFF] dark:border-[#0A84FF]',
  stress: 'border-[#34C759] dark:border-[#30D158]',
  self: 'border-[#FF2D55] dark:border-[#FF375F]',
  sleep: 'border-[#5E5CE6] dark:border-[#5E5CE6]',
  energy: 'border-[#FF9F0A] dark:border-[#FF9F0A]'
};

const CATEGORY_BG_SOLID_CLASSES: Record<string, string> = {
  money: 'bg-[#007AFF] dark:bg-[#0A84FF]',
  stress: 'bg-[#34C759] dark:bg-[#30D158]',
  self: 'bg-[#FF2D55] dark:bg-[#FF375F]',
  sleep: 'bg-[#5E5CE6] dark:bg-[#5E5CE6]',
  energy: 'bg-[#FF9F0A] dark:bg-[#FF9F0A]'
};

export const SessionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();
  
  const session = meditations.find(m => m.id === Number(id));
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(session ? session.duration * 60 : 0);
  const [completed, setCompleted] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sessionScript, setSessionScript] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const voiceBufferSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const ai = getAi();

  const playPcmData = async (base64Pcm: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const binaryString = atob(base64Pcm);
      const len = binaryString.length;
      const bytes = new Int16Array(len / 2);
      for (let i = 0; i < len; i += 2) {
        bytes[i / 2] = (binaryString.charCodeAt(i + 1) << 8) | binaryString.charCodeAt(i);
      }

      const audioBuffer = ctx.createBuffer(1, bytes.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < bytes.length; i++) {
        channelData[i] = bytes[i] / 32768;
      }

      if (voiceBufferSourceRef.current) {
        voiceBufferSourceRef.current.stop();
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      
      if (!gainNodeRef.current) {
        gainNodeRef.current = ctx.createGain();
        gainNodeRef.current.connect(ctx.destination);
      }
      
      source.connect(gainNodeRef.current);
      voiceBufferSourceRef.current = source;
      
      source.onended = () => {
        if (bgMusicRef.current) bgMusicRef.current.volume = 0.3;
      };

      if (isPlaying) {
        if (bgMusicRef.current) bgMusicRef.current.volume = 0.15;
        source.start(0);
      }
    } catch (err) {
      console.error("Error playing PCM data:", err);
    }
  };

  useEffect(() => {
    if (session) {
      bgMusicRef.current = new Audio(BACKGROUND_MUSIC[session.category]);
      bgMusicRef.current.loop = true;
      bgMusicRef.current.volume = 0.2;
    }
    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
      if (voiceBufferSourceRef.current) {
        voiceBufferSourceRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [session]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      handleComplete();
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  const handleComplete = async () => {
    setCompleted(true);
    if (bgMusicRef.current) bgMusicRef.current.pause();
    if (voiceBufferSourceRef.current) {
      voiceBufferSourceRef.current.stop();
    }

    if (profile) {
      await updateProfile({
        totalMeditationsCompleted: (profile.totalMeditationsCompleted || 0) + 1
      });
    }
  };

  const prepareSession = async () => {
    if (!session) return;
    if (!ai) {
      alert("عذراً، لم يتم تهيئة مفتاح API الخاص بـ Gemini. يرجى التحقق من الإعدادات.");
      setIsPreparing(false);
      return;
    }
    setIsPreparing(true);
    try {
      // 1. Generate Professional Script based on global studies and famous books
      const prompt = `أنت كوتش تأمل عالمي خبير. اكتب نص جلسة تأمل احترافية وعميقة جداً بعنوان "${session.title}".
المحتوى يجب أن يكون مستوحى من دراسات علمية وكتب شهيرة مثل (قانون الجذب، عقلية المليونير، قوة الآن، أو أسرار عقل المليونير) حسب نوع الجلسة.

هيكل الجلسة الإلزامي:
1. ترحيب دافئ: "مرحباً بك في هذه الجلسة الاحترافية لـ ${session.title}..."
2. تمرين تنفس عميق: "اختر مكاناً هادئاً... خذ زفيراً عميقاً من البطن... عد حتى 4... ثم شهيقاً طويلاً من الفم..."
3. صلب الموضوع: توكيدات قوية وعميقة مبنية على الكتب المذكورة أعلاه.
4. خاتمة هادئة.

اللغة: عربية فصحى راقية، هادئة، وبطيئة.
الطول: حوالي 200 كلمة.
ملاحظة: لا تضع أي مقدمات نصية (مثل "إليك النص")، ابدأ مباشرة بالنص الذي سيقرأه المدرب.`;

      const textResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-preview",
        contents: prompt,
      });
      
      const script = textResponse.text || session.description;
      setSessionScript(script);

      // 2. Generate Voice (TTS) with a deep professional male voice
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: script }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Charon' },
              },
          },
        },
      });

      const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        await playPcmData(base64Audio);
      }
    } catch (error) {
      console.error("Error preparing session:", error);
      setSessionScript(session.description);
    } finally {
      setIsPreparing(false);
      startPlayback();
    }
  };

  const startPlayback = () => {
    setIsPlaying(true);
    if (bgMusicRef.current) {
      bgMusicRef.current.play().catch(e => console.error("Audio play error:", e));
    }
    if (voiceBufferSourceRef.current && audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const pausePlayback = () => {
    setIsPlaying(false);
    if (bgMusicRef.current) bgMusicRef.current.pause();
    if (audioContextRef.current?.state === 'running') {
      audioContextRef.current.suspend();
    }
  };

  const togglePlay = () => {
    if (completed) {
      setTimeLeft(session!.duration * 60);
      setCompleted(false);
      setSessionScript('');
      if (bgMusicRef.current) {
        bgMusicRef.current.currentTime = 0;
      }
    }

    if (isPlaying) {
      pausePlayback();
    } else {
      if (!sessionScript) {
        // Unlock audio context
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        
        if (bgMusicRef.current) {
          bgMusicRef.current.play().then(() => bgMusicRef.current?.pause()).catch(() => {});
        }
        
        prepareSession();
      } else {
        startPlayback();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!session) return <div className="p-5 text-center pt-safe">جلسة غير موجودة</div>;

  const progress = session ? 100 - (timeLeft / (session.duration * 60)) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black relative overflow-hidden flex flex-col">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 bg-gradient-to-b ${CATEGORY_BG_CLASSES[session.category]} opacity-80`} />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[120vw] h-[120vw] max-w-[600px] max-h-[600px] ${CATEGORY_BLOB_CLASSES[session.category]} rounded-full blur-[80px]`}
        />
      </div>

      <div className="relative z-10 flex flex-col h-full flex-1 pt-safe pb-8">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center p-5"
        >
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 flex items-center justify-center glass-panel rounded-full text-[#1C1C1E] dark:text-white active:scale-95 transition-transform"
          >
            <ChevronRight size={24} />
          </button>
          <div className="flex space-x-3 space-x-reverse">
            <button 
              onClick={() => setIsLiked(!isLiked)} 
              className="w-10 h-10 flex items-center justify-center glass-panel rounded-full active:scale-95 transition-transform"
            >
              <Heart size={22} className={isLiked ? "fill-[#FF2D55] text-[#FF2D55]" : "text-[#1C1C1E] dark:text-white"} />
            </button>
            <button 
              onClick={() => setShowShareModal(true)}
              className="w-10 h-10 flex items-center justify-center glass-panel rounded-full text-[#1C1C1E] dark:text-white active:scale-95 transition-transform"
            >
              <Share2 size={22} />
            </button>
          </div>
        </motion.header>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className="text-[32px] font-bold text-[#1C1C1E] dark:text-white mb-4 tracking-tight leading-tight px-4">{session.title}</h1>
            <p className="text-[16px] text-[#8E8E93] leading-relaxed max-w-[340px] mx-auto line-clamp-3 opacity-90">
              {sessionScript || session.description}
            </p>
          </motion.div>

          <div className="relative flex flex-col items-center justify-center scale-110">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
              className="w-80 h-80 relative flex items-center justify-center"
            >
              {/* Background Blob Animation */}
              {isPlaying && (
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 90, 180, 270, 360],
                    borderRadius: ["50%", "40% 60% 70% 30% / 40% 50% 60% 50%", "50%"]
                  }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className={`absolute inset-0 ${CATEGORY_BLOB_CLASSES[session.category]} blur-3xl opacity-40`}
                />
              )}

              {/* Circular Progress SVG */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Track */}
                <circle 
                  cx="50" cy="50" r="46" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  className="text-black/5 dark:text-white/5"
                />
                {/* Progress */}
                <circle 
                  cx="50" cy="50" r="46" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  strokeDasharray="289.02"
                  strokeDashoffset={(progress / 100) * 289.02}
                  className={`${CATEGORY_TEXT_CLASSES[session.category]} transition-all duration-1000 ease-linear`}
                />
              </svg>

              {/* Timer Text & Play Button inside */}
              <div className="relative z-10 text-center flex flex-col items-center justify-center">
                <span className={`text-6xl font-extralight ${CATEGORY_TEXT_CLASSES[session.category]} tracking-tighter mb-4`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatTime(timeLeft)}
                </span>
                
                <button 
                  onClick={togglePlay}
                  disabled={isPreparing}
                  className={`w-24 h-24 ${CATEGORY_BG_SOLID_CLASSES[session.category]} text-white rounded-full flex items-center justify-center shadow-[0_15px_35px_rgba(0,0,0,0.2)] active:scale-90 transition-all disabled:opacity-50 group relative overflow-hidden`}
                >
                  {isPreparing ? (
                    <Loader2 size={36} className="animate-spin" />
                  ) : completed ? (
                    <CheckCircle size={36} className="fill-current" />
                  ) : isPlaying ? (
                    <Pause size={36} className="fill-current" />
                  ) : (
                    <Play size={36} className="fill-current ml-2" />
                  )}
                  
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="px-8 mt-auto pb-10"
        >
          <div className="mb-8 max-w-xs mx-auto">
            <div className="flex justify-between mb-2 text-[12px] font-medium text-[#8E8E93] opacity-60">
              <span>{formatTime((session.duration * 60) - timeLeft)}</span>
              <span>{formatTime(session.duration * 60)}</span>
            </div>
            <div className="h-1 bg-[#E5E5EA] dark:bg-[#3A3A3C] rounded-full overflow-hidden">
              <div 
                className={`h-full ${CATEGORY_BG_SOLID_CLASSES[session.category]} rounded-full transition-all duration-1000 ease-linear`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex justify-center items-center space-x-12 space-x-reverse">
            <button className="text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white transition-colors active:scale-95 p-2">
              <Volume2 size={24} />
            </button>
            <button onClick={() => setShowShareModal(true)} className="text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white transition-colors active:scale-95 p-2">
              <Share2 size={24} />
            </button>
          </div>
          
          <div className="h-8 flex items-center justify-center mt-4">
            {isPreparing && (
              <p className={`${CATEGORY_TEXT_CLASSES[session.category]} font-medium animate-pulse text-[13px]`}>جاري تحضير جلستك المخصصة بصوت الكوتش...</p>
            )}
            {completed && (
              <p className="text-[#34C759] font-medium animate-pulse text-[13px]">أحسنت! لقد أكملت الجلسة بنجاح.</p>
            )}
          </div>
        </motion.div>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={session.title}
        description={sessionScript || session.description}
        appUrl={`https://taamul.app/sessions/${session.id}`}
      />
    </div>
  );
};
