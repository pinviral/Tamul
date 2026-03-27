import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Smile, Meh, Frown, Angry, Heart, Zap, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { meditations } from '../data/meditations';
import { motion } from 'motion/react';
import { AdBanner } from '../components/AdBanner';

const moods = [
  { id: 'happy', icon: Smile, label: 'سعيد', color: 'text-[#34C759]', bg: 'bg-[#34C759]/10' },
  { id: 'loved', icon: Heart, label: 'محب', color: 'text-[#FF2D55]', bg: 'bg-[#FF2D55]/10' },
  { id: 'energetic', icon: Zap, label: 'نشيط', color: 'text-[#FF9500]', bg: 'bg-[#FF9500]/10' },
  { id: 'neutral', icon: Meh, label: 'عادي', color: 'text-[#8E8E93]', bg: 'bg-[#8E8E93]/10' },
  { id: 'sad', icon: Frown, label: 'حزين', color: 'text-[#007AFF]', bg: 'bg-[#007AFF]/10' },
  { id: 'angry', icon: Angry, label: 'غاضب', color: 'text-[#FF3B30]', bg: 'bg-[#FF3B30]/10' },
];

export const Home: React.FC = () => {
  const { profile } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
  };

  const recommendedSessions = selectedMood
    ? meditations.filter(m => {
        if (selectedMood === 'angry' || selectedMood === 'sad') return m.category === 'stress' || m.category === 'self';
        if (selectedMood === 'energetic') return m.category === 'energy' || m.category === 'money';
        return m.category === 'money' || m.category === 'sleep';
      }).slice(0, 3)
    : meditations.slice(0, 3);

  return (
    <div className="p-5 pb-32 space-y-8 max-w-md mx-auto pt-safe">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="mt-4"
      >
        <h1 className="text-3xl font-extrabold text-[#1C1C1E] dark:text-white tracking-tight">
          مرحباً، {profile?.displayName?.split(' ')[0] || 'صديقي'}
        </h1>
        <p className="text-[17px] text-[#8E8E93] mt-1 font-medium">كيف تشعر اليوم؟</p>
      </motion.header>

      {/* Mood Bar */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
        className="bg-white dark:bg-[#1C1C1E] rounded-[28px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
      >
        <div className="grid grid-cols-3 gap-3">
          {moods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => handleMoodSelect(mood.id)}
              className={`flex flex-col items-center justify-center space-y-2 p-3 rounded-[20px] transition-all duration-300 ${
                selectedMood === mood.id 
                  ? `${mood.bg} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#1C1C1E] ring-[${mood.color.replace('text-[', '').replace(']', '')}] scale-105` 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <mood.icon className={`w-8 h-8 ${mood.color} ${selectedMood === mood.id ? 'drop-shadow-md' : ''}`} strokeWidth={2.5} />
              <span className={`text-[13px] font-bold ${selectedMood === mood.id ? mood.color : 'text-[#8E8E93]'}`}>{mood.label}</span>
            </button>
          ))}
        </div>
      </motion.section>

      {/* Recommended Sessions */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        className="space-y-4"
      >
        <div className="flex justify-between items-end px-1">
          <h2 className="text-[22px] font-bold text-[#1C1C1E] dark:text-white tracking-tight">جلسات مقترحة</h2>
          <Link to="/sessions" className="text-[15px] font-semibold text-[#007AFF] dark:text-[#0A84FF] flex items-center">
            عرض الكل
            <ChevronLeft size={18} className="ml-1" />
          </Link>
        </div>
        <div className="grid gap-4">
          {recommendedSessions.map((session, index) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              key={session.id}
            >
              <Link
                to={`/sessions/${session.id}`}
                className="bg-white dark:bg-[#1C1C1E] p-4 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex items-center space-x-4 space-x-reverse active:scale-[0.98] transition-transform"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#E5F0FF] to-[#F2F7FF] dark:from-[#0A84FF]/20 dark:to-[#5E5CE6]/20 rounded-[18px] flex items-center justify-center flex-shrink-0 shadow-inner">
                  <span className="text-[#007AFF] dark:text-[#0A84FF] font-bold text-lg">{session.duration}m</span>
                </div>
                <div className="flex-1 pr-2">
                  <h3 className="font-bold text-[17px] text-[#1C1C1E] dark:text-white mb-1">{session.title}</h3>
                  <p className="text-[14px] text-[#8E8E93] line-clamp-1 leading-relaxed">{session.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Adsterra Banner */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        {profile?.plan === 'free' && <AdBanner />}
      </motion.section>
    </div>
  );
};
