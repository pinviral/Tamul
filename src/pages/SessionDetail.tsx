import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { meditations } from '../data/meditations';
import { useAuth } from '../contexts/AuthContext';
import { Play, Pause, Share2, ArrowRight, CheckCircle, Loader2, Heart, ChevronRight, Volume2 } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { ShareModal } from '../components/ShareModal';
import { motion } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const BACKGROUND_MUSIC: Record<string, string> = {
  money: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
  stress: 'https://actions.google.com/sounds/v1/water/brook_babbling.ogg',
  self: 'https://actions.google.com/sounds/v1/water/water_sloshing.ogg',
  sleep: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg',
  energy: 'https://actions.google.com/sounds/v1/birds/birds_in_forest.ogg'
};

function pcmToWavUrl(base64Pcm: string): string {
  const binaryString = atob(base64Pcm);
  const pcmData = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    pcmData[i] = binaryString.charCodeAt(i);
  }

  const numChannels = 1;
  const sampleRate = 24000;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmData.length;
  const chunkSize = 36 + dataSize;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, chunkSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const pcmBytes = new Uint8Array(buffer, 44);
  pcmBytes.set(pcmData);

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

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
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (session) {
      bgMusicRef.current = new Audio(BACKGROUND_MUSIC[session.category]);
      bgMusicRef.current.loop = true;
      bgMusicRef.current.volume = 0.2; // Background music should be quiet
    }
    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
        voiceAudioRef.current = null;
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
    if (voiceAudioRef.current) voiceAudioRef.current.pause();

    if (profile) {
      await updateProfile({
        totalMeditationsCompleted: (profile.totalMeditationsCompleted || 0) + 1
      });
    }
  };

  const prepareSession = async () => {
    if (!session) return;
    setIsPreparing(true);
    try {
      // 1. Generate Script
      const prompt = `أنت كوتش تأمل محترف بخبرة تزيد عن 20 عاماً. بناءً على أحدث الأبحاث والمحتوى الرائج في محركات البحث ووسائل التواصل الاجتماعي حول "${session.title}"، اكتب نص جلسة تأمل احترافية وعميقة باللغة العربية الفصحى.
الهدف: ${session.description}
يجب أن يكون النص هادئاً، مريحاً، ومليئاً بالتوكيدات الإيجابية العميقة التي تلامس الروح.
الطول: حوالي 150 كلمة.
لا تضع أي مقدمات أو ملاحظات، فقط النص الذي سيتم قراءته ببطء بصوت رجولي هادئ.`;

      const textResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-preview",
        contents: prompt,
      });
      
      const script = textResponse.text || session.description;
      setSessionScript(script);

      // 2. Generate Voice (TTS)
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: script }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Zephyr' }, // Zephyr is a deep male voice
              },
          },
        },
      });

      const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        console.log("TTS Audio generated successfully, length:", base64Audio.length);
        const audioUrl = pcmToWavUrl(base64Audio);
        if (!voiceAudioRef.current) {
          voiceAudioRef.current = new Audio();
        }
        voiceAudioRef.current.src = audioUrl;
        voiceAudioRef.current.load(); // Ensure it loads
        voiceAudioRef.current.volume = 1.0;
        
        // When voice ends, let the background music continue until the timer finishes
        voiceAudioRef.current.onended = () => {
          console.log("Voice playback ended");
        };
        
        voiceAudioRef.current.onerror = (e) => {
          console.error("Voice audio playback error:", e);
        };
      } else {
        console.error("No audio data received from TTS API");
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
    if (voiceAudioRef.current) {
      voiceAudioRef.current.play().catch(e => console.error("Voice play error:", e));
    }
  };

  const pausePlayback = () => {
    setIsPlaying(false);
    if (bgMusicRef.current) bgMusicRef.current.pause();
    if (voiceAudioRef.current) voiceAudioRef.current.pause();
  };

  const togglePlay = () => {
    if (completed) {
      setTimeLeft(session!.duration * 60);
      setCompleted(false);
      setSessionScript('');
      if (voiceAudioRef.current) {
        voiceAudioRef.current.currentTime = 0;
      }
      if (bgMusicRef.current) {
        bgMusicRef.current.currentTime = 0;
      }
    }

    if (isPlaying) {
      pausePlayback();
    } else {
      if (!voiceAudioRef.current && !sessionScript) {
        // Unlock audio on iOS by playing/pausing synchronously in the click handler
        if (!voiceAudioRef.current) {
          voiceAudioRef.current = new Audio();
        }
        voiceAudioRef.current.play().catch(() => {});
        voiceAudioRef.current.pause();

        if (bgMusicRef.current) {
          bgMusicRef.current.play().catch(() => {});
          bgMusicRef.current.pause();
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
            <h1 className="text-[32px] font-bold text-[#1C1C1E] dark:text-white mb-4 tracking-tight leading-tight">{session.title}</h1>
            <p className="text-[16px] text-[#8E8E93] leading-relaxed max-w-[300px] mx-auto line-clamp-3">
              {sessionScript || session.description}
            </p>
          </motion.div>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="w-72 h-72 relative flex items-center justify-center mb-8"
          >
            {/* Background Blob Animation */}
            {isPlaying && (
              <motion.div 
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 90, 180, 270, 360],
                  borderRadius: ["50%", "40% 60% 70% 30% / 40% 50% 60% 50%", "50%"]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className={`absolute inset-0 ${CATEGORY_BLOB_CLASSES[session.category]} blur-2xl opacity-50`}
              />
            )}

            {/* Circular Progress SVG */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Track */}
              <circle 
                cx="50" cy="50" r="48" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                className="text-black/5 dark:text-white/5"
              />
              {/* Progress */}
              <circle 
                cx="50" cy="50" r="48" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="4" 
                strokeLinecap="round"
                strokeDasharray="301.59"
                strokeDashoffset={(progress / 100) * 301.59}
                className={`${CATEGORY_TEXT_CLASSES[session.category]} transition-all duration-1000 ease-linear`}
              />
            </svg>

            {/* Timer Text */}
            <div className="relative z-10 text-center flex flex-col items-center justify-center">
              <span className={`text-7xl font-light ${CATEGORY_TEXT_CLASSES[session.category]} tracking-tight`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="px-8 mt-auto"
        >
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-2 bg-[#E5E5EA] dark:bg-[#3A3A3C] rounded-full overflow-hidden">
              <div 
                className={`h-full ${CATEGORY_BG_SOLID_CLASSES[session.category]} rounded-full transition-all duration-1000 ease-linear`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-3 text-[13px] font-medium text-[#8E8E93]">
              <span>{formatTime((session.duration * 60) - timeLeft)}</span>
              <span>{formatTime(session.duration * 60)}</span>
            </div>
          </div>

          {/* Play Button */}
          <div className="flex justify-center items-center space-x-8 space-x-reverse mb-4">
            <button className="text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white transition-colors active:scale-95">
              <Volume2 size={26} />
            </button>
            <button 
              onClick={togglePlay}
              disabled={isPreparing}
              className={`w-20 h-20 ${CATEGORY_BG_SOLID_CLASSES[session.category]} text-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.15)] active:scale-95 transition-transform disabled:opacity-50`}
            >
              {isPreparing ? (
                <Loader2 size={32} className="animate-spin" />
              ) : completed ? (
                <CheckCircle size={32} className="fill-current" />
              ) : isPlaying ? (
                <Pause size={32} className="fill-current" />
              ) : (
                <Play size={32} className="fill-current ml-2" />
              )}
            </button>
            <button onClick={() => setShowShareModal(true)} className="text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white transition-colors active:scale-95">
              <Share2 size={26} />
            </button>
          </div>
          
          <div className="h-6 flex items-center justify-center">
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
