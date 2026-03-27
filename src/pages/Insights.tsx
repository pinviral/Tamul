import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart2, Flame, CheckCircle, MessageCircle, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const Insights: React.FC = () => {
  const { profile } = useAuth();

  const stats = [
    {
      id: 'streak',
      label: 'أيام متتالية',
      value: profile?.streak || 0,
      icon: Flame,
      color: 'text-[#FF9500]',
      bg: 'bg-[#FF9500]/10'
    },
    {
      id: 'meditations',
      label: 'جلسات مكتملة',
      value: profile?.totalMeditationsCompleted || 0,
      icon: CheckCircle,
      color: 'text-[#34C759]',
      bg: 'bg-[#34C759]/10'
    },
    {
      id: 'coach',
      label: 'محادثات المدرب',
      value: profile?.totalCoachMessages || 0,
      icon: MessageCircle,
      color: 'text-[#007AFF]',
      bg: 'bg-[#007AFF]/10'
    },
    {
      id: 'active',
      label: 'آخر نشاط',
      value: profile?.lastActive || 'اليوم',
      icon: Calendar,
      color: 'text-[#AF52DE]',
      bg: 'bg-[#AF52DE]/10'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black pt-safe pb-[100px]">
      <div className="px-5 pt-8 pb-4">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 space-x-reverse mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5E5CE6] flex items-center justify-center shadow-md">
              <BarChart2 className="text-white w-5 h-5" />
            </div>
            <h1 className="text-[34px] font-bold text-[#1C1C1E] dark:text-white tracking-tight">إحصائياتي</h1>
          </div>
          <p className="text-[15px] text-[#8E8E93] font-medium">تتبع تقدمك في رحلة التأمل</p>
        </motion.header>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-4 mb-8"
        >
          {stats.map((stat) => (
            <motion.div 
              key={stat.id} 
              variants={itemVariants}
              className="bg-white dark:bg-[#1C1C1E] p-5 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center space-y-3"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[28px] font-bold text-[#1C1C1E] dark:text-white leading-tight">{stat.value}</p>
                <p className="text-[13px] text-[#8E8E93] font-medium mt-1">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 24 }}
          className="bg-gradient-to-br from-[#007AFF] to-[#5E5CE6] rounded-[24px] p-6 text-white shadow-md relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex items-center space-x-2 space-x-reverse mb-2">
              <Sparkles className="w-5 h-5 text-white/80" />
              <h3 className="text-[20px] font-bold">استمر في التقدم!</h3>
            </div>
            <p className="text-white/80 text-[15px] leading-relaxed">
              كل دقيقة تقضيها في التأمل هي استثمار في صحتك النفسية. نحن فخورون بك.
            </p>
          </div>
          <div className="absolute -left-4 -bottom-4 opacity-10">
            <Flame size={120} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
