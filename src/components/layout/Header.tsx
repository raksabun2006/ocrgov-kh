'use client';

import React, { useEffect, useState } from 'react';
import { Menu, Activity } from 'lucide-react';
import { useLanguage } from '../../lib/i18n';
import { getHealthStatus } from '../../lib/api/ocr';
import { HealthResponse } from '../../types/api';

interface HeaderProps {
  onMobileMenuClick: () => void;
  collapsed: boolean;
}

export function Header({ onMobileMenuClick, collapsed }: HeaderProps) {
  const { t, language, setLanguage } = useLanguage();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const checkSystemHealth = async () => {
      try {
        const res = await getHealthStatus();
        if (isMounted) {
          setHealth(res);
          setIsOnline(res.status === 'online');
        }
      } catch {
        if (isMounted) {
          setIsOnline(false);
        }
      }
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 sm:h-20 px-3 sm:px-6 lg:px-8 bg-white border-b border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left: Hamburger button for mobile & Clean Institutional Header */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden p-2 -ml-1 text-[#475569] hover:bg-[#F1F5F9] rounded-lg transition-colors focus:outline-hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" strokeWidth={2} />
        </button>

        <div className="flex flex-col min-w-0">
          <h1 className="text-xs sm:text-base lg:text-lg font-bold text-[#17365D] tracking-tight font-khmer truncate">
            ប្រព័ន្ធឌីជីថលសម្រាប់សម្គាល់អត្ថបទក្នុងឯកសារ
          </h1>
          <span className="hidden sm:inline-block text-[11px] lg:text-xs text-[#64748B] font-medium tracking-normal truncate">
            Government Document Intelligence System
          </span>
        </div>
      </div>

      {/* Right: Live health badge & Touch-friendly language switcher */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Backend Online status badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isOnline
              ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
              : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
          }`}
          title={
            health?.ocr_engine
              ? `OCR Engine: Ready (${health.ocr_engine.languages.join(', ')})`
              : 'Backend connection status'
          }
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isOnline ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isOnline ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
              }`}
            />
          </span>
          <span className="hidden md:inline font-khmer">
            {isOnline
              ? language === 'km'
                ? 'ប្រព័ន្ធដំណើរការធម្មតា'
                : 'OCR System Online'
              : language === 'km'
              ? 'គ្មានការតភ្ជាប់'
              : 'Offline'}
          </span>
        </div>

        {/* Bilingual language switcher with comfortable mobile tap target */}
        <div className="flex items-center rounded-lg border border-[#CBD5E1] p-0.5 bg-[#F8FAFC]">
          <button
            onClick={() => setLanguage('km')}
            className={`px-2.5 py-1.5 sm:py-1 text-xs font-semibold rounded-md transition-colors ${
              language === 'km'
                ? 'bg-[#17365D] text-white shadow-xs font-khmer'
                : 'text-[#475569] hover:text-[#1E293B] font-khmer'
            }`}
            aria-label="Khmer Language"
          >
            ខ្មែរ
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1.5 sm:py-1 text-xs font-semibold rounded-md transition-colors ${
              language === 'en'
                ? 'bg-[#17365D] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#1E293B]'
            }`}
            aria-label="English Language"
          >
            English
          </button>
        </div>
      </div>
    </header>
  );
}
