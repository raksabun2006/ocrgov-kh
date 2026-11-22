'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useLanguage, Language } from '../../lib/i18n';

export function CambodiaFlag({ className = 'w-7 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 64"
      className={`${className} rounded-[4px] overflow-hidden flex-shrink-0 block`}
      aria-label="Cambodia Flag (ភាសាខ្មែរ)"
    >
      {/* Outer Blue Band */}
      <rect width="100" height="64" rx="4" fill="#032EA6" />
      {/* Center Red Band (half height) */}
      <rect y="16" width="100" height="32" fill="#ED1B24" />

      {/* High-fidelity Angkor Wat Temple Silhouette */}
      <g fill="#FFFFFF" transform="translate(23.5, 20.5) scale(0.53)">
        {/* Tier 1 Base Plinth */}
        <polygon points="0,38 100,38 97,34 3,34" />
        {/* Tier 2 Plinth */}
        <polygon points="5,34 95,34 92,30 8,30" />
        {/* Tier 3 Plinth */}
        <polygon points="10,30 90,30 87,26 13,26" />
        {/* Upper Terrace */}
        <rect x="14" y="24" width="72" height="2" />

        {/* Gallery Walls */}
        <rect x="22" y="19" width="16" height="5" />
        <rect x="62" y="19" width="16" height="5" />
        {/* Balustrade crenellations */}
        <rect x="23" y="17.5" width="2" height="1.5" />
        <rect x="27" y="17.5" width="2" height="1.5" />
        <rect x="31" y="17.5" width="2" height="1.5" />
        <rect x="35" y="17.5" width="2" height="1.5" />
        <rect x="63" y="17.5" width="2" height="1.5" />
        <rect x="67" y="17.5" width="2" height="1.5" />
        <rect x="71" y="17.5" width="2" height="1.5" />
        <rect x="75" y="17.5" width="2" height="1.5" />

        {/* Left Flank Tower */}
        <path d="M 28 24 L 28 16 C 28 12 31 7 32 4 L 32.5 0 L 33 4 C 34 7 37 12 37 16 L 37 24 Z" />
        <rect x="30" y="15" width="5" height="5" fill="#ED1B24" rx="1" />
        <line x1="29" y1="12" x2="36" y2="12" stroke="#ED1B24" strokeWidth="0.8" />
        <line x1="30.5" y1="8" x2="34.5" y2="8" stroke="#ED1B24" strokeWidth="0.8" />

        {/* Right Flank Tower */}
        <path d="M 63 24 L 63 16 C 63 12 66 7 67 4 L 67.5 0 L 68 4 C 69 7 72 12 72 16 L 72 24 Z" />
        <rect x="65" y="15" width="5" height="5" fill="#ED1B24" rx="1" />
        <line x1="64" y1="12" x2="71" y2="12" stroke="#ED1B24" strokeWidth="0.8" />
        <line x1="65.5" y1="8" x2="69.5" y2="8" stroke="#ED1B24" strokeWidth="0.8" />

        {/* Center Main Spire (Taller, grander) */}
        <path d="M 44 24 L 44 14 C 44 9 48 4 49.5 0 L 50 -3 L 50.5 0 C 52 4 56 9 56 14 L 56 24 Z" />
        <rect x="47" y="14" width="6" height="7" fill="#ED1B24" rx="1" />
        <line x1="45" y1="10" x2="55" y2="10" stroke="#ED1B24" strokeWidth="0.8" />
        <line x1="47" y1="5.5" x2="53" y2="5.5" stroke="#ED1B24" strokeWidth="0.8" />
      </g>

      {/* Subtle border outline */}
      <rect width="100" height="64" rx="4" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
    </svg>
  );
}

export function UKFlag({ className = 'w-7 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 30"
      className={`${className} rounded-[4px] overflow-hidden flex-shrink-0 block`}
      aria-label="United Kingdom Flag (English)"
    >
      <clipPath id="uk-flag-clip-clean">
        <rect width="60" height="30" rx="3" />
      </clipPath>
      <clipPath id="uk-flag-diag-clean">
        <path d="M0,0 L30,15 L0,30 z M60,0 L30,15 L60,30 z M30,15 L0,0 L60,0 z M30,15 L0,30 L60,30 z" />
      </clipPath>
      <g clipPath="url(#uk-flag-clip-clean)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6" />
        <path
          d="M0,0 L60,30 M60,0 L0,30"
          clipPath="url(#uk-flag-diag-clean)"
          stroke="#C8102E"
          strokeWidth="4"
        />
        <path d="M30,0 v30 M0,15 h60" stroke="#FFFFFF" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
      {/* Subtle border outline */}
      <rect width="60" height="30" rx="3" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />
    </svg>
  );
}

export function LanguageFlagSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  // Close on outside click (mobile friendly)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-block text-left"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 
        Single flag button in the top right:
        NO outer background and NO outer border, just the pure clean flag!
      */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-center p-1 sm:p-0 bg-transparent border-0 shadow-none hover:opacity-90 hover:scale-105 active:scale-95 transition-all focus:outline-hidden cursor-pointer touch-manipulation"
        title={language === 'km' ? 'ភាសាខ្មែរ (ចុច ឬដាក់កណ្ដុរដើម្បីប្ដូរ)' : 'English (Click or hover to switch)'}
        aria-label="Switch Language"
        aria-expanded={isOpen}
      >
        {language === 'km' ? (
          <CambodiaFlag className="w-8 h-5.5 sm:w-9 sm:h-6" />
        ) : (
          <UKFlag className="w-8 h-5.5 sm:w-9 sm:h-6" />
        )}
      </button>

      {/* 
        Dropdown card matching user image:
        White container, rounded-xl, soft shadow.
        Shows ភាសាខ្មែរ and English with flags and green checkmark.
      */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2.5 w-48 sm:w-52 bg-white rounded-2xl border border-[#E5EAF0] shadow-[0_10px_25px_-5px_rgba(9,30,66,0.12)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex flex-col space-y-1">
            {/* Khmer Option */}
            <button
              type="button"
              onClick={() => handleSelect('km')}
              className={`w-full flex items-center justify-between px-3 py-2.5 sm:py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer touch-manipulation ${
                language === 'km'
                  ? 'bg-[#E3FCEF] text-[#00875A]'
                  : 'text-[#172B4D] hover:bg-[#F5F7FA]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CambodiaFlag className="w-6 h-4 rounded-[3px]" />
                <span className="font-khmer font-medium text-sm leading-none pt-0.5">
                  ភាសាខ្មែរ
                </span>
              </div>
              {language === 'km' && (
                <Check className="w-4 h-4 text-[#00875A] stroke-[2.5] flex-shrink-0" />
              )}
            </button>

            {/* English Option */}
            <button
              type="button"
              onClick={() => handleSelect('en')}
              className={`w-full flex items-center justify-between px-3 py-2.5 sm:py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer touch-manipulation ${
                language === 'en'
                  ? 'bg-[#E3FCEF] text-[#00875A]'
                  : 'text-[#172B4D] hover:bg-[#F5F7FA]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UKFlag className="w-6 h-4 rounded-[3px]" />
                <span className="text-sm font-medium leading-none">
                  English
                </span>
              </div>
              {language === 'en' && (
                <Check className="w-4 h-4 text-[#00875A] stroke-[2.5] flex-shrink-0" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
