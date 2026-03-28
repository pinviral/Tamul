import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Check, Loader2, Sparkles, Shield, Zap, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export const Pricing: React.FC = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      const { url, error } = await response.json();
      if (error) throw new Error(error);
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('حدث خطأ أثناء بدء عملية الدفع. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <Sparkles className="text-blue-500" />, text: "جلسات تأمل غير محدودة" },
    { icon: <Zap className="text-yellow-500" />, text: "صوت كوتش احترافي عالي الجودة" },
    { icon: <Heart className="text-red-500" />, text: "وصول كامل لجميع الفئات (مال، توتر، نوم)" },
    { icon: <Shield className="text-green-500" />, text: "تحليلات متقدمة لتقدمك النفسي" },
  ];

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black pt-safe pb-24 px-6">
      <div className="max-w-md mx-auto pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-[#1C1C1E] dark:text-white mb-4 tracking-tight">اختر خطتك</h1>
          <p className="text-[#8E8E93] text-lg">استثمر في سلامك الداخلي وصحتك النفسية</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-8 shadow-xl border-2 border-blue-500 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-2xl text-sm font-bold">
            الأكثر شعبية
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1C1C1E] dark:text-white mb-2">الخطة الاحترافية</h2>
            <div className="flex items-baseline">
              <span className="text-5xl font-bold text-[#1C1C1E] dark:text-white">$5</span>
              <span className="text-[#8E8E93] mr-2">/ شهرياً</span>
            </div>
          </div>

          <div className="space-y-4 mb-10">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 space-x-reverse">
                <div className="w-6 h-6 flex-shrink-0">{feature.icon}</div>
                <span className="text-[#1C1C1E] dark:text-gray-300">{feature.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleUpgrade}
            disabled={loading || profile?.plan === 'pro'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : profile?.plan === 'pro' ? (
              "أنت مشترك بالفعل"
            ) : (
              "اشترك الآن"
            )}
          </button>
          
          <p className="text-center text-[12px] text-[#8E8E93] mt-4">
            يمكنك الإلغاء في أي وقت من إعدادات حسابك.
          </p>
        </motion.div>

        <button
          onClick={() => navigate(-1)}
          className="w-full mt-8 text-[#8E8E93] font-medium active:scale-95 transition-transform"
        >
          ربما لاحقاً
        </button>
      </div>
    </div>
  );
};
