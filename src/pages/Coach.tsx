import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleGenAI } from '@google/genai';
import { Send, Bot, Lock, Share2, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ShareModal } from '../components/ShareModal';
import { SubscriptionModal } from '../components/SubscriptionModal';
import { motion, AnimatePresence } from 'motion/react';

const getAi = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const Coach: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'مرحباً! أنا مدربك الشخصي للتأمل والصحة النفسية. كيف يمكنني مساعدتك اليوم؟' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shareMessage, setShareMessage] = useState<Message | null>(null);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const ai = getAi();

  const isFree = profile?.plan === 'free';
  const messagesLeft = isFree ? Math.max(0, 10 - (profile?.dailyMessagesCount || 0)) : Infinity;
  const canSendMessage = !isFree || messagesLeft > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !canSendMessage || isLoading) return;
    if (!ai) {
      alert("عذراً، لم يتم تهيئة مفتاح API الخاص بـ Gemini. يرجى التحقق من الإعدادات.");
      return;
    }

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      // Update message count for free users
      if (isFree && profile) {
        await updateProfile({
          dailyMessagesCount: (profile.dailyMessagesCount || 0) + 1,
          totalCoachMessages: (profile.totalCoachMessages || 0) + 1
        });
      }

      const chat = ai.chats.create({
        model: 'gemini-3.1-flash-preview',
        config: {
          systemInstruction: 'أنت مدرب صحة نفسية وتأمل خبير جداً، تمتلك أكثر من 20 عاماً من الخبرة في مجال التأمل والوعي الذاتي. اسمك "تأمل". قدم نصائح عملية، عميقة، ومبنية على أحدث الأبحاث العلمية والممارسات المجربة عالمياً وعربياً. إجاباتك يجب أن تكون احترافية، ملهمة، ومباشرة. شجع المستخدم على ممارسة التأمل والتنفس العميق بطرق مبتكرة.',
          temperature: 0.7,
        }
      });

      // Send previous context (simplified for this example)
      const history = messages.slice(1).map(m => `${m.role === 'user' ? 'User' : 'Model'}: ${m.text}`).join('\n');
      const prompt = history ? `History:\n${history}\n\nUser: ${userText}` : userText;

      const response = await chat.sendMessage({ message: prompt });
      
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: response.text || 'عذراً، لم أتمكن من معالجة طلبك.' 
      }]);

    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: 'عذراً، حدث خطأ أثناء الاتصال بالمدرب. يرجى المحاولة لاحقاً.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F2F2F7] dark:bg-black pt-safe pb-[68px]">
      <header className="glass-panel z-10 px-5 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5E5CE6] flex items-center justify-center shadow-md">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-[#1C1C1E] dark:text-white leading-tight">المدرب الذكي</h1>
            <p className="text-[13px] text-[#34C759] font-medium">متصل الآن</p>
          </div>
        </div>
        {isFree && (
          <div className="text-[12px] font-semibold bg-[#E5F0FF] dark:bg-[#0A84FF]/20 text-[#007AFF] dark:text-[#0A84FF] px-3 py-1.5 rounded-full">
            المتبقي: {messagesLeft}
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}
            >
              <div
                className={`max-w-[80%] rounded-[20px] px-4 py-3 relative ${
                  msg.role === 'user'
                    ? 'bg-[#007AFF] text-white rounded-br-[4px]'
                    : 'bg-white dark:bg-[#1C1C1E] text-[#1C1C1E] dark:text-white rounded-bl-[4px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-gray-800'
                }`}
              >
                <div className="text-[16px] leading-relaxed markdown-body">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
                
                {msg.role === 'model' && (
                  <button
                    onClick={() => setShareMessage(msg)}
                    className="absolute -left-10 bottom-1 p-2 text-[#8E8E93] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:text-[#007AFF]"
                    aria-label="مشاركة النصيحة"
                  >
                    <Share2 size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] rounded-bl-[4px] px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center space-x-2 space-x-reverse">
              <div className="flex space-x-1 space-x-reverse">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-[#8E8E93] rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-[#8E8E93] rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-[#8E8E93] rounded-full" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 glass-panel border-t border-gray-200/50 dark:border-gray-800/50">
        {!canSendMessage ? (
          <div className="text-center p-4 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[20px] border border-gray-200 dark:border-gray-700">
            <Lock className="w-6 h-6 text-[#8E8E93] mx-auto mb-2" />
            <p className="text-[15px] text-[#8E8E93] mb-3 font-medium">لقد استنفدت رسائلك المجانية اليوم.</p>
            <button 
              onClick={() => setSubscriptionModalOpen(true)}
              className="bg-gradient-to-r from-[#007AFF] to-[#5E5CE6] text-white px-6 py-2.5 rounded-full text-[15px] font-semibold shadow-md active:scale-95 transition-transform"
            >
              الترقية إلى Pro
            </button>
          </div>
        ) : (
          <div className="flex items-end space-x-2 space-x-reverse max-w-md mx-auto">
            <div className="flex-1 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-[24px] px-4 py-1 shadow-sm focus-within:ring-2 focus-within:ring-[#007AFF]/50 transition-shadow">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="تحدث مع مدربك..."
                className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 py-2 text-[16px] text-[#1C1C1E] dark:text-white placeholder-[#8E8E93]"
                rows={1}
                style={{ minHeight: '44px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-11 h-11 bg-[#007AFF] text-white rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:bg-[#E5E5EA] dark:disabled:bg-[#3A3A3C] disabled:text-[#8E8E93] transition-colors active:scale-95"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="mr-1" />}
            </button>
          </div>
        )}
      </div>

      {shareMessage && (
        <ShareModal
          isOpen={!!shareMessage}
          onClose={() => setShareMessage(null)}
          title="نصيحة من المدرب الذكي"
          description={shareMessage.text}
          appUrl="https://taamul.app/coach"
        />
      )}
      
      <SubscriptionModal 
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
      />
    </div>
  );
};
