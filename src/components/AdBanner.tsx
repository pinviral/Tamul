import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Adsterra integration
    // Note: In a real environment, you would use the actual ad code provided by Adsterra.
    // This is a placeholder implementation that simulates an ad banner.
    
    const container = containerRef.current;
    if (!container) return;

    // Clear previous content
    container.innerHTML = '';

    // Create a placeholder ad
    const adPlaceholder = document.createElement('div');
    adPlaceholder.className = 'w-full h-[50px] bg-gray-200 dark:bg-gray-800 rounded-[12px] flex items-center justify-center border border-gray-300 dark:border-gray-700 overflow-hidden relative';
    
    adPlaceholder.innerHTML = `
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
      <span class="text-[12px] font-medium text-gray-400 dark:text-gray-500">مساحة إعلانية</span>
    `;

    container.appendChild(adPlaceholder);

    // If you had a real Adsterra script, you would inject it like this:
    /*
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//www.highperformanceformat.com/YOUR_ADSTERRA_ID/invoke.js';
    script.async = true;
    container.appendChild(script);
    */

  }, []);

  return (
    <div className={`w-full flex justify-center my-4 ${className}`}>
      <div ref={containerRef} className="w-full max-w-[320px] min-h-[50px]" />
    </div>
  );
};
