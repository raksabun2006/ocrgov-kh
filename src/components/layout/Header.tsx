'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { useLanguage } from '../../lib/i18n';
import { LanguageFlagSwitcher } from './LanguageFlagSwitcher';

interface HeaderProps {
  onMobileMenuClick: () => void;
  collapsed: boolean;
}

export function Header({ onMobileMenuClick }: HeaderProps) {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 sm:h-20 px-3 sm:px-6 lg:px-8 bg-white border-b border-[#E5EAF0] shadow-[0_1px_2px_rgba(9,30,66,0.03)]">
      {/* Left: Mobile hamburger & Clean Government Header */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden p-2 -ml-1 text-[#5E6C84] hover:bg-[#F5F7FA] rounded-lg transition-colors focus:outline-hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" strokeWidth={2} />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-semibold text-[#2457A7] uppercase tracking-wide font-khmer hidden sm:inline">
              ព្រះរាជាណាចក្រកម្ពុជា
            </span>
            <span className="hidden sm:inline text-[#C1C7D0]">•</span>
            <span className="text-[10px] sm:text-xs text-[#5E6C84] hidden md:inline">
              Kingdom of Cambodia
            </span>
          </div>
          <h1 className="text-xs sm:text-base lg:text-lg font-bold text-[#172B4D] tracking-tight font-khmer truncate">
            {t.systemTitle}
          </h1>
        </div>
      </div>

      {/* Right: National Flag Country Switcher (Only 1 flag when no hover, 2 flags on hover to switch) */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <LanguageFlagSwitcher />
      </div>
    </header>
  );
}
