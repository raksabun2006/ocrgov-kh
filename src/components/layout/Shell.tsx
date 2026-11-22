'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { LanguageProvider } from '../../lib/i18n';
import { AuthProvider } from '../../lib/auth-context';

export function Shell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Prevent background scrolling when mobile drawer is open
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
        <div className="min-h-screen bg-[#F5F7FA] text-[#1E293B]">
          <Sidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
          />

          <div
            className={`flex flex-col min-h-screen transition-all duration-200 ease-in-out ${
              collapsed ? 'lg:pl-20' : 'lg:pl-72'
            }`}
          >
            <Header
              collapsed={collapsed}
              onMobileMenuClick={() => setMobileOpen(true)}
            />
            <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>

            {/* Official Cambodian Government Digital Footer */}
            <footer className="mt-auto py-4 px-4 sm:px-6 border-t border-[#E2E8F0] bg-white text-xs text-[#64748B]">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <span className="font-semibold text-[#17365D] font-khmer">
                    ប្រព័ន្ធឌីជីថលសម្រាប់សម្គាល់អត្ថបទក្នុងឯកសារ
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-[11px] sm:text-xs">Kingdom of Cambodia • Document Intelligence System</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] sm:text-xs">
                  <span>Version 1.0.0</span>
                  <a
                    href="https://3-25-134-111.sslip.io/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#2563A6] hover:underline"
                  >
                    API Docs
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}
