'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileScan,
  Receipt,
  FolderArchive,
  CheckSquare,
  Search,
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
  const rawPathname = usePathname() || '/';
  const { t, language, localizeHref } = useLanguage();

  // Normalize path to ignore /km or /en prefix for active tab matching
  const normalizedPathname = rawPathname.replace(/^\/(km|en)(\/|$)/, '$2') || '/';

  const navigation = [
    {
      name: t.navDashboard,
      href: '/',
      icon: LayoutDashboard,
      active: normalizedPathname === '/',
    },
    {
      name: t.navOcr,
      href: '/ocr',
      icon: FileScan,
      active: normalizedPathname.startsWith('/ocr'),
    },
    {
      name: t.navReceipts,
      href: '/receipts',
      icon: Receipt,
      active: normalizedPathname.startsWith('/receipts'),
    },
    {
      name: t.navDocuments,
      href: '/documents',
      icon: FolderArchive,
      active: normalizedPathname === '/documents',
    },
    {
      name: t.navVerify,
      href: '/verify',
      icon: CheckSquare,
      active: normalizedPathname.startsWith('/verify'),
    },
    {
      name: t.navSearch,
      href: '/search',
      icon: Search,
      active: normalizedPathname.startsWith('/search'),
    },
    {
      name: t.navAudit,
      href: '/audit',
      icon: History,
      active: normalizedPathname.startsWith('/audit'),
    },
    {
      name: t.navSettings,
      href: '/settings',
      icon: Settings,
      active: normalizedPathname.startsWith('/settings'),
    },
  ];

  return (
    <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
      {navigation.map((item) => {
        const Icon = item.icon;
        const targetHref = localizeHref(item.href);
        return (
          <Link
            key={item.href}
            href={targetHref}
            onClick={onMobileClose}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              item.active
                ? 'bg-[#EFF4FC] text-[#2457A7] font-semibold border-l-4 border-[#2457A7] pl-2.5 shadow-xs'
                : 'text-[#5E6C84] hover:bg-[#F5F7FA] hover:text-[#172B4D]'
            } ${collapsed ? 'justify-center px-0' : ''}`}
            title={collapsed ? item.name : undefined}
          >
            <Icon
              className={`w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0 transition-colors ${
                item.active
                  ? 'text-[#2457A7]'
                  : 'text-[#7A869A] group-hover:text-[#2457A7]'
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
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-[#E5EAF0] shadow-sm lg:shadow-none transition-all duration-200 ease-in-out ${
          collapsed ? 'w-20' : 'w-68'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Government Identity Header without unnecessary logos */}
        <div className="flex items-center justify-between h-16 sm:h-20 px-4 border-b border-[#E5EAF0] bg-white">
          {!collapsed ? (
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xs font-bold tracking-wider text-[#2457A7] uppercase truncate font-khmer">
                ព្រះរាជាណាចក្រកម្ពុជា
              </span>
              <span className="text-[11px] text-[#5E6C84] truncate tracking-tight">
                Kingdom of Cambodia
              </span>
            </div>
          ) : (
            <div className="mx-auto text-[11px] font-bold text-[#2457A7] tracking-widest font-khmer">
              កម្ពុជា
            </div>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggle}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-[#5E6C84] hover:text-[#172B4D] hover:bg-[#F5F7FA] transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" strokeWidth={2} />
            ) : (
              <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            )}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="flex lg:hidden items-center justify-center w-8 h-8 rounded-md text-[#5E6C84] hover:text-[#172B4D] hover:bg-[#F5F7FA]"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Navigation items (8 core items) */}
        <Suspense fallback={<div className="flex-1 px-3 py-4" />}>
          <NavLinks collapsed={collapsed} onMobileClose={onMobileClose} />
        </Suspense>

        {/* Institutional footer indicator */}
        <div className="p-3 border-t border-[#E5EAF0] text-center text-[10px] text-[#7A869A] font-khmer">
          {!collapsed && (
            <span>ប្រព័ន្ធឌីជីថលរដ្ឋបាលកម្ពុជា</span>
          )}
        </div>
      </aside>
    </>
  );
}
