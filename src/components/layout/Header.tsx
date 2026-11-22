'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, User, LogIn, LogOut, Shield, ChevronDown, Key } from 'lucide-react';
import { useLanguage } from '../../lib/i18n';
import { useAuth } from '../../lib/auth-context';
import { LanguageFlagSwitcher } from './LanguageFlagSwitcher';
import { AuthModal } from '../auth/AuthModal';

interface HeaderProps {
  onMobileMenuClick: () => void;
  collapsed: boolean;
}

export function Header({ onMobileMenuClick }: HeaderProps) {
  const { t, language, localizeHref } = useLanguage();
  const { user, isAuthenticated, isGuest, roles, hasRole, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 sm:h-20 px-3 sm:px-6 lg:px-8 bg-white border-b border-[#E5EAF0] shadow-[0_1px_2px_rgba(9,30,66,0.03)]">
        {/* Left: Mobile hamburger & Clean Government Header */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <button
            onClick={onMobileMenuClick}
            className="lg:hidden p-2 -ml-1 text-[#5E6C84] hover:bg-[#F5F7FA] rounded-lg transition-colors focus:outline-hidden touch-manipulation"
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
            <h1 className="text-xs sm:text-base lg:text-lg font-bold text-[#172B4D] tracking-tight font-khmer truncate max-w-[200px] xs:max-w-xs sm:max-w-md md:max-w-xl">
              {t.systemTitle}
            </h1>
          </div>
        </div>

        {/* Right: User Profile Menu & Flag Country Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Role Status & Account */}
          {isAuthenticated && user ? (
            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-[#E5EAF0] hover:border-[#CBD5E1] bg-white transition-all text-xs font-medium text-[#172B4D] focus:outline-hidden cursor-pointer shadow-2xs"
              >
                <div className="w-6 h-6 rounded-full bg-[#EFF4FC] text-[#2457A7] flex items-center justify-center font-bold text-[11px]">
                  {user.username.slice(0, 1).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-semibold text-xs leading-none truncate max-w-[120px]">
                    {user.full_name ? user.full_name.split(' ')[0] : user.username}
                  </span>
                  <span className="text-[10px] text-[#00875A] font-mono leading-none mt-0.5 font-bold">
                    {roles[0] || 'OFFICER'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#7A869A] hidden sm:block" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-[#E5EAF0] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-[#F5F7FA]">
                    <p className="text-xs font-bold text-[#172B4D] truncate">{user.full_name || user.username}</p>
                    <p className="text-[11px] text-[#5E6C84] truncate">{user.email}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {roles.map((r) => (
                        <span
                          key={r}
                          className="px-2 py-0.5 rounded-xs bg-[#EFF4FC] text-[#2457A7] text-[10px] font-mono font-semibold"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href={localizeHref('/settings')}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-[#172B4D] hover:bg-[#F5F7FA] font-khmer transition-colors"
                    >
                      <Key className="w-3.5 h-3.5 text-[#5E6C84]" />
                      <span>{t.accountSettings}</span>
                    </Link>

                    {hasRole('ADMIN') && (
                      <Link
                        href={localizeHref('/users')}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-[#172B4D] hover:bg-[#F5F7FA] font-khmer transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5 text-[#2457A7]" />
                        <span>{t.navUsers}</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-[#F5F7FA]">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-[#DE350B] hover:bg-[#FFEBE6] font-khmer transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.logoutText}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#FFF0B3] text-[#172B4D] border border-[#FFE58F] font-khmer">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF991F]" />
                <span>ភ្ញៀវ (Guest)</span>
              </span>
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#2457A7] bg-[#EFF4FC] hover:bg-[#D0E0F7] border border-[#D0E0F7] transition-all cursor-pointer font-khmer shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5" strokeWidth={2} />
                <span>{t.loginText}</span>
              </button>
            </div>
          )}

          {/* Flag Switcher */}
          <LanguageFlagSwitcher />
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
