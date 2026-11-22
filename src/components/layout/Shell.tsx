'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { LanguageProvider } from '../../lib/i18n';
import { AuthProvider } from '../../lib/auth-context';
import { ToastProvider } from '../../lib/toast-context';

export function Shell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-[#F5F7FA] text-[#172B4D]">
            <Sidebar
              collapsed={collapsed}
              onToggle={() => setCollapsed(!collapsed)}
              mobileOpen={mobileOpen}
              onMobileClose={() => setMobileOpen(false)}
            />

            <div
              className={`flex flex-col min-h-screen transition-all duration-200 ease-in-out ${
                collapsed ? 'lg:pl-20' : 'lg:pl-68'
              }`}
            >
              <Header
                collapsed={collapsed}
                onMobileMenuClick={() => setMobileOpen(true)}
              />
              <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                {children}
              </main>

              {/* Official Government Digital Footer */}
              <footer className="mt-auto py-4 px-4 sm:px-6 border-t border-[#E5EAF0] bg-white text-xs text-[#5E6C84]">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                    <span className="font-semibold text-[#2457A7] font-khmer">
                      ប្រព័ន្ធឌីជីថលសម្រាប់សម្គាល់អត្ថបទក្នុងឯកសារ
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-[11px] sm:text-xs">
                      Kingdom of Cambodia • Document Intelligence System
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs text-[#5E6C84]">
                    <span>Version 1.0.0</span>
                    <span>•</span>
                    <span className="font-khmer">ច្រកទ្វារសុវត្ថិភាពឌីជីថលរដ្ឋបាល</span>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
