import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Settings as SettingsIcon, LogOut, Moon, Sun, Crown, User as UserIcon, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { SubscriptionModal } from '../components/SubscriptionModal';

export const Settings: React.FC = () => {
  const { profile, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black pt-safe pb-[100px]">
      <SubscriptionModal 
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
      />
      
      <div className="px-5 pt-8 pb-4">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 space-x-reverse mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8E8E93] to-[#C7C7CC] flex items-center justify-center shadow-md">
              <SettingsIcon className="text-white w-5 h-5" />
            </div>
            <h1 className="text-[34px] font-bold text-[#1C1C1E] dark:text-white tracking-tight">الإعدادات</h1>
          </div>
        </motion.header>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Profile Section */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-[#1C1C1E] rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-5 flex items-center space-x-4 space-x-reverse">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center shadow-inner">
                <UserIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-[20px] font-bold text-[#1C1C1E] dark:text-white leading-tight">{profile?.displayName || 'مستخدم'}</h2>
                <p className="text-[15px] text-[#8E8E93] mt-0.5">{profile?.email}</p>
              </div>
            </div>
          </motion.div>

          {/* Preferences Section */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-[#1C1C1E] rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <button 
              onClick={() => {
                if (profile?.plan === 'free') {
                  navigate('/pricing');
                }
              }}
              className="w-full p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/50 active:bg-gray-50 dark:active:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 rounded-full bg-[#FFCC00]/10 flex items-center justify-center">
                  <Crown className="w-4 h-4 text-[#FFCC00]" />
                </div>
                <span className="text-[17px] font-medium text-[#1C1C1E] dark:text-white">نوع الحساب</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className={`px-3 py-1 rounded-full text-[13px] font-semibold ${profile?.plan === 'pro' ? 'bg-[#FFCC00]/20 text-[#FF9500]' : 'bg-gray-100 dark:bg-gray-800 text-[#8E8E93]'}`}>
                  {profile?.plan === 'pro' ? 'Pro' : 'مجاني'}
                </span>
                {profile?.plan === 'free' && <ChevronLeft className="w-5 h-5 text-[#C7C7CC]" />}
              </div>
            </button>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 rounded-full bg-[#007AFF]/10 flex items-center justify-center">
                  {darkMode ? <Moon className="w-4 h-4 text-[#007AFF]" /> : <Sun className="w-4 h-4 text-[#FF9500]" />}
                </div>
                <span className="text-[17px] font-medium text-[#1C1C1E] dark:text-white">الوضع الليلي</span>
              </div>
              <button 
                onClick={toggleDarkMode}
                className={`w-[51px] h-[31px] rounded-full transition-colors duration-300 relative shadow-inner ${darkMode ? 'bg-[#34C759]' : 'bg-[#E5E5EA] dark:bg-[#3A3A3C]'}`}
              >
                <div className={`w-[27px] h-[27px] bg-white rounded-full absolute top-[2px] right-[2px] transition-transform duration-300 ease-in-out shadow-[0_3px_8px_rgba(0,0,0,0.15)] ${darkMode ? '-translate-x-[20px]' : 'translate-x-0'}`} />
              </button>
            </div>
          </motion.div>

          {/* Actions Section */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-[#1C1C1E] rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <button 
              onClick={logout}
              className="w-full p-4 flex items-center justify-between text-[#FF3B30] hover:bg-[#FF3B30]/5 transition-colors active:bg-[#FF3B30]/10"
            >
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 rounded-full bg-[#FF3B30]/10 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-[#FF3B30]" />
                </div>
                <span className="text-[17px] font-medium">تسجيل الخروج</span>
              </div>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
