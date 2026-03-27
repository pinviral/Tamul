import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Share2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  appUrl?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  appUrl = 'https://taamul.app',
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      generateImage();
    } else {
      setImageUrl(null);
    }
  }, [isOpen, title, description, appUrl]);

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  };

  const getQRCodeDataURL = (text: string, size = 150) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
      text
    )}&margin=0`;
  };

  const generateImage = async () => {
    setIsGenerating(true);
    try {
      await document.fonts.ready;
      
      const width = 1080;
      const height = 1080;
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background gradient (iOS style)
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#E5F0FF');
      grad.addColorStop(1, '#F2F2F7');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Decorative blur circles
      ctx.fillStyle = 'rgba(0, 122, 255, 0.1)';
      ctx.beginPath();
      ctx.arc(width * 0.8, height * 0.2, 300, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(94, 92, 230, 0.1)';
      ctx.beginPath();
      ctx.arc(width * 0.2, height * 0.8, 400, 0, Math.PI * 2);
      ctx.fill();

      // Inner glass frame
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.05)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 20;
      ctx.beginPath();
      ctx.roundRect(60, 60, width - 120, height - 120, 48);
      ctx.fill();
      
      // Reset shadow
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Inner border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.direction = 'rtl';

      // Title
      ctx.font = `bold ${Math.floor(width / 14)}px 'Inter', sans-serif`;
      ctx.fillStyle = '#1C1C1E';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      wrapText(ctx, title, width / 2, 150, width - 200, 90);

      // Description (truncate to ~150 chars)
      let shortDesc = description.replace(/\n/g, ' ').trim();
      if (shortDesc.length > 150) {
        shortDesc = shortDesc.substring(0, 147) + '...';
      }
      
      ctx.font = `${Math.floor(width / 24)}px 'Inter', sans-serif`;
      ctx.fillStyle = '#8E8E93';
      wrapText(ctx, shortDesc, width / 2, 350, width - 240, 60);

      // App Logo / Name
      ctx.font = `900 ${Math.floor(width / 16)}px 'Inter', sans-serif`;
      ctx.fillStyle = '#007AFF';
      ctx.textAlign = 'right';
      ctx.fillText('تأمل', width - 100, height - 150);
      
      ctx.font = `500 ${Math.floor(width / 35)}px 'Inter', sans-serif`;
      ctx.fillStyle = '#8E8E93';
      ctx.fillText('رحلتك نحو السلام الداخلي', width - 100, height - 80);

      // QR Code
      const qrDataUrl = getQRCodeDataURL(appUrl, 160);
      const qrImg = new Image();
      qrImg.crossOrigin = 'Anonymous';
      
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
        qrImg.src = qrDataUrl;
      });
      
      // Draw QR Code with a rounded white background
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(90, height - 260, 180, 180, 24);
      ctx.fill();
      
      // Subtle shadow for QR
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      ctx.drawImage(qrImg, 100, height - 250, 160, 160);

      setImageUrl(canvas.toDataURL('image/png'));
    } catch (error) {
      console.error('Error generating share image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.download = `taamul-share-${Date.now()}.png`;
    link.href = imageUrl;
    link.click();
  };

  const handleShare = async () => {
    if (!imageUrl) return;
    
    try {
      const blob = await (await fetch(imageUrl)).blob();
      const file = new File([blob], 'taamul-share.png', { type: 'image/png' });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'تطبيق تأمل',
          text: title,
          files: [file],
        });
      } else {
        alert('عذراً، متصفحك لا يدعم المشاركة المباشرة للصور. يرجى تحميل الصورة ومشاركتها يدوياً.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-sm glass-panel bg-white/90 dark:bg-[#1C1C1E]/90 shadow-[0_40px_80px_rgba(0,0,0,0.2)] dark:shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-200/50 dark:border-gray-800/50">
              <h3 className="text-[17px] font-bold text-[#1C1C1E] dark:text-white">مشاركة</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-[#8E8E93] rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors active:scale-95"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto flex flex-col items-center justify-center min-h-[320px]">
              {isGenerating ? (
                <div className="flex flex-col items-center text-[#8E8E93]">
                  <Loader2 size={40} className="animate-spin mb-4 text-[#007AFF]" />
                  <p className="text-[15px] font-medium">جاري تجهيز الصورة...</p>
                </div>
              ) : imageUrl ? (
                <motion.img
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  src={imageUrl}
                  alt="Share preview"
                  className="w-full max-w-[280px] rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-gray-200/50 dark:border-gray-700/50"
                />
              ) : (
                <p className="text-[#FF3B30] text-[15px] font-medium">حدث خطأ أثناء إنشاء الصورة.</p>
              )}
            </div>

            <div className="p-5 bg-gray-50/80 dark:bg-[#1C1C1E]/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-800/50 flex gap-3">
              <button
                onClick={handleDownload}
                disabled={!imageUrl || isGenerating}
                className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-gray-700 text-[#1C1C1E] dark:text-white py-3.5 px-4 rounded-[16px] text-[15px] font-semibold hover:bg-gray-50 dark:hover:bg-[#3A3A3C] transition-colors disabled:opacity-50 active:scale-95 shadow-sm"
              >
                <Download size={18} />
                <span>حفظ</span>
              </button>
              <button
                onClick={handleShare}
                disabled={!imageUrl || isGenerating}
                className="flex-1 flex items-center justify-center gap-2 bg-[#007AFF] text-white py-3.5 px-4 rounded-[16px] text-[15px] font-semibold hover:bg-[#0062CC] transition-colors disabled:opacity-50 shadow-[0_4px_14px_rgba(0,122,255,0.3)] active:scale-95"
              >
                <Share2 size={18} />
                <span>مشاركة</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Hidden canvas for generation */}
      <canvas ref={canvasRef} className="hidden" />
    </AnimatePresence>
  );
};
