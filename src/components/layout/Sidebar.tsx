'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileScan,
  Receipt,
  FolderArchive,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useLanguage } from '../../lib/i18n';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function NavLinks({
  collapsed,
  onMobileClose,
}: {
  collapsed: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname() || '/';
  const { t, language } = useLanguage();

  const navigation = [
    {
      name: t.navDashboard,
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      name: t.navOcr,
      href: '/ocr',
      icon: FileScan,
      active: pathname.startsWith('/ocr'),
    },
    {
      name: t.navReceipts,
      href: '/receipts',
      icon: Receipt,
      active: pathname.startsWith('/receipts'),
    },
    {
      name: t.navDocuments,
      href: '/documents',
      icon: FolderArchive,
      active: pathname.startsWith('/documents') || pathname.startsWith('/verify'),
    },
    {
      name: t.navAudit,
      href: '/audit',
      icon: History,
      active: pathname.startsWith('/audit'),
    },
    {
      name: t.navSettings,
      href: '/settings',
      icon: Settings,
      active: pathname.startsWith('/settings'),
    },
  ];

  return (
    <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onMobileClose}
            className={`group flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-lg text-sm font-medium transition-all ${
              item.active
                ? 'bg-[#EFF6FF] text-[#17365D] font-semibold border-l-4 border-[#17365D] pl-2.5'
                : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
            } ${collapsed ? 'justify-center px-0' : ''}`}
            title={collapsed ? item.name : undefined}
          >
            <Icon
              className={`w-5 h-5 flex-shrink-0 transition-colors ${
                item.active
                  ? 'text-[#17365D]'
                  : 'text-[#64748B] group-hover:text-[#17365D]'
              }`}
              strokeWidth={item.active ? 2 : 1.75}
            />
            {!collapsed && (
              <span className={`truncate ${language === 'km' ? 'font-khmer' : ''}`}>
                {item.name}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop with tap-to-dismiss */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-[#E2E8F0] shadow-lg lg:shadow-none transition-all duration-200 ease-in-out ${
          collapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Clean institutional header without unnecessary logos */}
        <div className="flex items-center justify-between h-16 sm:h-20 px-4 border-b border-[#E2E8F0] bg-white">
          {!collapsed ? (
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xs font-bold tracking-wider text-[#17365D] uppercase truncate font-khmer">
                ព្រះរាជាណាចក្រកម្ពុជា
              </span>
              <span className="text-[11px] text-[#64748B] truncate tracking-tight">
                Kingdom of Cambodia
              </span>
            </div>
          ) : (
            <div className="mx-auto text-[11px] font-bold text-[#17365D] tracking-widest font-khmer">
              កម្ពុជា
            </div>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggle}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-[#64748B] hover:text-[#17365D] hover:bg-[#F1F5F9] transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" strokeWidth={2} />
            ) : (
              <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            )}
          </button>

          {/* Mobile close button (X) */}
          <button
            onClick={onMobileClose}
            className="flex lg:hidden items-center justify-center w-8 h-8 rounded-md text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Navigation list */}
        <Suspense fallback={<div className="flex-1 px-3 py-4" />}>
          <NavLinks collapsed={collapsed} onMobileClose={onMobileClose} />
        </Suspense>

        {/* Clean footer status */}
        <div className="p-3 border-t border-[#E2E8F0] text-center text-[10px] text-[#94A3B8] font-khmer">
          {!collapsed && (
            <span>ប្រព័ន្ធឌីជីថលរដ្ឋបាលកម្ពុជា</span>
          )}
        </div>
      </aside>
    </>
  );
}
