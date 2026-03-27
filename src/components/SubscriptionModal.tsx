import React, { useState } from 'react';
import { X, Check, Crown, Sparkles, Loader2, CreditCard, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { updateProfile } = useAuth();
  const [step, setStep] = useState<'plans' | 'checkout' | 'processing' | 'success'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  const handleSubscribe = async () => {
    setStep('processing');
    // Simulate payment processing delay (e.g., contacting Stripe)
    setTimeout(async () => {
      await updateProfile({ plan: 'pro' });
      setStep('success');
      setTimeout(() => {
        onClose();
        // Reset state after closing
        setTimeout(() => setStep('plans'), 500);
      }, 2000);
    }, 2500);
  };

  const features = [
    'جلسات تأمل غير محدودة',
    'محادثات غير محدودة مع المدرب الذكي',
    'تخصيص كامل للتجربة',
    'بدون إعلانات مزعجة',
    'دعم فني على مدار الساعة'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => step !== 'processing' && onClose()}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-sm glass-panel bg-white/90 dark:bg-[#1C1C1E]/90 shadow-[0_40px_80px_rgba(0,0,0,0.2)] dark:shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col min-h-[500px]"
          >
            {/* Header Background */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-[#FFD60A] to-[#FF9500] opacity-20 dark:opacity-10" />
            
            <div className="relative flex justify-between items-center p-5">
              <div className="w-10 h-10 rounded-full bg-[#FF9500]/10 flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#FF9500]" />
              </div>
              {step !== 'processing' && step !== 'success' && (
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100/50 dark:bg-gray-800/50 text-[#8E8E93] rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors active:scale-95 backdrop-blur-sm"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="relative px-6 pb-6 flex-1 overflow-y-auto flex flex-col">
              <AnimatePresence mode="wait">
                {step === 'plans' && (
                  <motion.div
                    key="plans"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="text-center mb-6">
                      <h2 className="text-[28px] font-extrabold text-[#1C1C1E] dark:text-white mb-2 tracking-tight">تأمل <span className="text-[#FF9500]">Pro</span></h2>
                      <p className="text-[15px] text-[#8E8E93] leading-relaxed">
                        ارتقِ بتجربتك وافتح جميع الميزات المتقدمة للوصول إلى أقصى درجات الهدوء.
                      </p>
                    </div>

                    <div className="space-y-3 mb-6 flex-1">
                      {features.map((feature, index) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          key={index} 
                          className="flex items-center space-x-3 space-x-reverse"
                        >
                          <div className="w-5 h-5 rounded-full bg-[#34C759]/10 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-[#34C759]" />
                          </div>
                          <span className="text-[14px] font-medium text-[#1C1C1E] dark:text-white">{feature}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="space-y-3 mb-6">
                      <button
                        onClick={() => setSelectedPlan('yearly')}
                        className={`w-full rounded-[20px] p-4 border-2 text-right transition-all ${
                          selectedPlan === 'yearly' 
                            ? 'border-[#FF9500] bg-[#FF9500]/5 dark:bg-[#FF9500]/10' 
                            : 'border-gray-200 dark:border-gray-800 bg-transparent hover:border-gray-300 dark:hover:border-gray-700'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[16px] font-bold text-[#1C1C1E] dark:text-white">سنوي</span>
                          <span className="bg-[#FF9500] text-white px-2 py-0.5 rounded-full text-[11px] font-bold">وفر 50%</span>
                        </div>
                        <div className="flex items-baseline space-x-1 space-x-reverse">
                          <span className="text-[20px] font-bold text-[#1C1C1E] dark:text-white">$29.99</span>
                          <span className="text-[13px] text-[#8E8E93]">/ سنة</span>
                        </div>
                      </button>

                      <button
                        onClick={() => setSelectedPlan('monthly')}
                        className={`w-full rounded-[20px] p-4 border-2 text-right transition-all ${
                          selectedPlan === 'monthly' 
                            ? 'border-[#FF9500] bg-[#FF9500]/5 dark:bg-[#FF9500]/10' 
                            : 'border-gray-200 dark:border-gray-800 bg-transparent hover:border-gray-300 dark:hover:border-gray-700'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[16px] font-bold text-[#1C1C1E] dark:text-white">شهري</span>
                        </div>
                        <div className="flex items-baseline space-x-1 space-x-reverse">
                          <span className="text-[20px] font-bold text-[#1C1C1E] dark:text-white">$4.99</span>
                          <span className="text-[13px] text-[#8E8E93]">/ شهر</span>
                        </div>
                      </button>
                    </div>

                    <button
                      onClick={() => setStep('checkout')}
                      className="w-full relative overflow-hidden bg-[#1C1C1E] dark:bg-white text-white dark:text-[#1C1C1E] py-4 px-4 rounded-[16px] text-[17px] font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 mt-auto"
                    >
                      متابعة
                    </button>
                  </motion.div>
                )}

                {step === 'checkout' && (
                  <motion.div
                    key="checkout"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="mb-6">
                      <button 
                        onClick={() => setStep('plans')}
                        className="text-[15px] text-[#007AFF] font-medium mb-4 inline-block"
                      >
                        &rarr; رجوع
                      </button>
                      <h2 className="text-[24px] font-bold text-[#1C1C1E] dark:text-white mb-2">الدفع الآمن</h2>
                      <p className="text-[14px] text-[#8E8E93]">
                        أنت تشترك في الخطة {selectedPlan === 'yearly' ? 'السنوية' : 'الشهرية'} بقيمة {selectedPlan === 'yearly' ? '$29.99' : '$4.99'}.
                      </p>
                    </div>

                    <div className="space-y-4 mb-8 flex-1">
                      <div className="bg-gray-50 dark:bg-[#2C2C2E] p-4 rounded-[16px] border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4 text-[#1C1C1E] dark:text-white">
                          <CreditCard className="w-5 h-5 text-[#8E8E93]" />
                          <span className="font-medium text-[15px]">البطاقة الائتمانية</span>
                        </div>
                        <div className="space-y-3">
                          <input 
                            type="text" 
                            placeholder="رقم البطاقة (وهمي للتجربة)" 
                            className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-700 rounded-[10px] px-3 py-2.5 text-[15px] text-right focus:ring-2 focus:ring-[#FF9500] outline-none transition-all"
                          />
                          <div className="flex gap-3">
                            <input 
                              type="text" 
                              placeholder="MM/YY" 
                              className="w-1/2 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-700 rounded-[10px] px-3 py-2.5 text-[15px] text-center focus:ring-2 focus:ring-[#FF9500] outline-none transition-all"
                            />
                            <input 
                              type="text" 
                              placeholder="CVC" 
                              className="w-1/2 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-700 rounded-[10px] px-3 py-2.5 text-[15px] text-center focus:ring-2 focus:ring-[#FF9500] outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-[#8E8E93] text-[12px]">
                        <ShieldCheck className="w-4 h-4" />
                        <span>مدعوم بواسطة Stripe (محاكاة)</span>
                      </div>
                    </div>

                    <button
                      onClick={handleSubscribe}
                      className="w-full relative overflow-hidden bg-gradient-to-r from-[#FFD60A] to-[#FF9500] text-white py-4 px-4 rounded-[16px] text-[17px] font-bold shadow-[0_8px_20px_rgba(255,149,0,0.3)] hover:shadow-[0_8px_25px_rgba(255,149,0,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 mt-auto"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>تأكيد الدفع</span>
                    </button>
                  </motion.div>
                )}

                {step === 'processing' && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="flex-1 flex flex-col items-center justify-center py-12"
                  >
                    <Loader2 className="w-12 h-12 text-[#FF9500] animate-spin mb-6" />
                    <h3 className="text-[20px] font-bold text-[#1C1C1E] dark:text-white mb-2">جاري معالجة الدفع...</h3>
                    <p className="text-[15px] text-[#8E8E93] text-center">يرجى الانتظار وعدم إغلاق هذه النافذة.</p>
                  </motion.div>
                )}

                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col items-center justify-center py-12"
                  >
                    <div className="w-20 h-20 bg-[#34C759]/20 rounded-full flex items-center justify-center mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                      >
                        <Check className="w-10 h-10 text-[#34C759]" strokeWidth={3} />
                      </motion.div>
                    </div>
                    <h3 className="text-[24px] font-bold text-[#1C1C1E] dark:text-white mb-2">تم التفعيل بنجاح!</h3>
                    <p className="text-[15px] text-[#8E8E93] text-center">مرحباً بك في تأمل Pro. استمتع بجميع الميزات المتقدمة.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
