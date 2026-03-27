import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black relative flex flex-col items-center justify-center p-5 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#E5F0FF] to-[#F2F2F7] dark:from-[#0A84FF]/20 dark:to-black opacity-80" />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 90, 0]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[120vw] h-[120vw] max-w-[600px] max-h-[600px] bg-gradient-to-br from-[#007AFF]/30 to-[#5E5CE6]/30 dark:from-[#0A84FF]/20 dark:to-[#5E5CE6]/20 rounded-full blur-[80px]"
        />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="w-28 h-28 bg-gradient-to-br from-[#007AFF] to-[#5E5CE6] rounded-[32px] flex items-center justify-center shadow-[0_20px_40px_rgba(0,122,255,0.3)] mb-8"
        >
          <Sparkles className="w-14 h-14 text-white" />
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-[42px] font-extrabold text-[#1C1C1E] dark:text-white mb-3 tracking-tight">تأمل</h1>
          <p className="text-[17px] text-[#8E8E93] max-w-[280px] mx-auto leading-relaxed">
            رحلتك نحو الهدوء والسلام الداخلي تبدأ هنا.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-full"
        >
          <button
            onClick={signInWithGoogle}
            className="w-full glass-panel bg-white/80 dark:bg-[#1C1C1E]/80 text-[#1C1C1E] dark:text-white px-6 py-4 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-white/50 dark:border-white/10 font-semibold text-[17px] flex items-center justify-center space-x-3 space-x-reverse active:scale-95 transition-all"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            <span>المتابعة باستخدام حساب جوجل</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};
