import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { meditations, Meditation } from '../data/meditations';
import { Search, Filter, Share2 } from 'lucide-react';
import { ShareModal } from '../components/ShareModal';
import { motion } from 'motion/react';
import { AdBanner } from '../components/AdBanner';
import { useAuth } from '../contexts/AuthContext';

export const Sessions: React.FC = () => {
  const { profile } = useAuth();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [shareSession, setShareSession] = useState<Meditation | null>(null);

  const categories = [
    { id: 'all', label: 'الكل' },
    { id: 'money', label: 'جذب المال' },
    { id: 'stress', label: 'تخفيف التوتر' },
    { id: 'self', label: 'التصالح مع الذات' },
    { id: 'sleep', label: 'تحسين النوم' },
    { id: 'energy', label: 'الطاقة والتركيز' },
  ];

  const filteredSessions = meditations.filter((session) => {
    const matchesFilter = filter === 'all' || session.category === filter;
    const matchesSearch = session.title.includes(search) || session.description.includes(search);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-5 pb-32 space-y-6 max-w-md mx-auto pt-safe">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="mt-4"
      >
        <h1 className="text-3xl font-extrabold text-[#1C1C1E] dark:text-white tracking-tight mb-1">جلسات التأمل</h1>
        <p className="text-[17px] text-[#8E8E93] font-medium">اختر الجلسة التي تناسبك اليوم</p>
      </motion.header>

      {/* Search */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative"
      >
        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8E8E93] w-5 h-5" />
        <input
          type="text"
          placeholder="ابحث عن جلسة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-4 pr-12 py-3.5 bg-[#E5E5EA] dark:bg-[#2C2C2E] border-none rounded-[14px] focus:ring-2 focus:ring-[#007AFF] text-[17px] text-[#1C1C1E] dark:text-white placeholder-[#8E8E93] transition-shadow"
        />
      </motion.div>

      {/* Categories (Segmented Control Style) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        className="flex space-x-2 space-x-reverse overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5"
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[15px] font-semibold transition-all duration-300 ${
              filter === cat.id
                ? 'bg-[#1C1C1E] dark:bg-white text-white dark:text-[#1C1C1E] shadow-md'
                : 'bg-[#E5E5EA] dark:bg-[#2C2C2E] text-[#8E8E93] hover:bg-[#D1D1D6] dark:hover:bg-[#3A3A3C]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Sessions List */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid gap-4"
      >
        {filteredSessions.map((session, index) => (
          <React.Fragment key={session.id}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              className="relative group"
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
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShareSession(session);
                }}
                className="absolute top-1/2 left-4 -translate-y-1/2 p-2.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#8E8E93] rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-[#E5F0FF] hover:text-[#007AFF] dark:hover:bg-[#3A3A3C]"
                aria-label="مشاركة الجلسة"
              >
                <Share2 size={18} />
              </button>
            </motion.div>
            {/* Show ad after every 3 sessions for free users */}
            {profile?.plan === 'free' && (index + 1) % 3 === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <AdBanner />
              </motion.div>
            )}
          </React.Fragment>
        ))}
        {filteredSessions.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-[#8E8E93]"
          >
            <p className="text-[17px] font-medium">لا توجد جلسات تطابق بحثك.</p>
          </motion.div>
        )}
      </motion.div>

      {shareSession && (
        <ShareModal
          isOpen={!!shareSession}
          onClose={() => setShareSession(null)}
          title={shareSession.title}
          description={shareSession.description}
          appUrl={`https://taamul.app/sessions/${shareSession.id}`}
        />
      )}
    </div>
  );
};
