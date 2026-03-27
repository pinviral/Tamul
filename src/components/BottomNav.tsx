import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Headphones, MessageCircle, BookOpen, BarChart2, Settings } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'الرئيسية' },
    { to: '/sessions', icon: Headphones, label: 'الجلسات' },
    { to: '/coach', icon: MessageCircle, label: 'المدرب' },
    { to: '/journal', icon: BookOpen, label: 'المذكرة' },
    { to: '/insights', icon: BarChart2, label: 'إحصائيات' },
    { to: '/settings', icon: Settings, label: 'إعدادات' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass-panel border-t border-gray-200/50 dark:border-gray-800/50 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.2)] pb-safe">
        <div className="flex justify-around items-center h-[68px] px-2 max-w-md mx-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-[#007AFF] dark:text-[#0A84FF]' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#E5E5EA]'
                }`
              }
            >
              <item.icon size={24} strokeWidth={2} />
              <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};
