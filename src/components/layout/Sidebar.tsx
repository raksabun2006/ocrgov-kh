'use client';

import React, { Suspense, useState } from 'react';
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
  Users,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
  LogIn,
} from 'lucide-react';
import { useLanguage } from '../../lib/i18n';
import { useAuth } from '../../lib/auth-context';
import { AuthModal } from '../auth/AuthModal';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function NavLinks({
  collapsed,
  onMobileClose,
  onRequestLogin,
}: {
  collapsed: boolean;
  onMobileClose: () => void;
  onRequestLogin: () => void;
}) {
  const rawPathname = usePathname() || '/';
  const { t, language, localizeHref } = useLanguage();
  const { isAuthenticated, isGuest, hasRole, hasPermission } = useAuth();

  // Normalize path to ignore /km or /en prefix for active tab matching
  const normalizedPathname = rawPathname.replace(/^\/(km|en)(\/|$)/, '$2') || '/';

  // Overview
  const overviewGroup = [
    {
      name: t.navDashboard,
      href: '/',
      icon: LayoutDashboard,
      active: normalizedPathname === '/',
      visible: true,
    },
  ];

  // Document Operations (Public + Authenticated)
  const docOperations = [
    {
      name: t.navOcr,
      href: '/ocr',
      icon: FileScan,
      active: normalizedPathname.startsWith('/ocr'),
      visible: true,
    },
    {
      name: t.navReceipts,
      href: '/receipts',
      icon: Receipt,
      active: normalizedPathname.startsWith('/receipts'),
      visible: true,
    },
    {
      name: t.navDocuments,
      href: '/documents',
      icon: FolderArchive,
      active: normalizedPathname === '/documents',
      visible: true,
    },
    {
      name: t.navVerify,
      href: '/verify',
      icon: CheckSquare,
      active: normalizedPathname.startsWith('/verify'),
      visible: true,
    },
    {
      name: t.navSearch,
      href: '/search',
      icon: Search,
      active: normalizedPathname.startsWith('/search'),
      visible: true,
    },
  ];

  // Administration (Only for authenticated users with administrative privileges)
  const isAdmin = hasRole('ADMIN') || hasRole('SUPER_ADMIN');
  const canViewAudit = isAdmin || hasPermission('audit:read');
  const canViewUsers = isAdmin || hasPermission('users:read') || hasPermission('users:write');
  const canViewRoles = isAdmin;
  const canViewSettings = isAuthenticated;

  const adminGovernance = [
    {
      name: t.navAudit,
      href: '/audit',
      icon: History,
      active: normalizedPathname.startsWith('/audit'),
      visible: canViewAudit,
    },
    {
      name: t.navUsers,
      href: '/users',
      icon: Users,
      active: normalizedPathname.startsWith('/users'),
      visible: canViewUsers,
    },
    {
      name: t.navRoles,
      href: '/roles',
      icon: Shield,
      active: normalizedPathname.startsWith('/roles'),
      visible: canViewRoles,
    },
    {
      name: t.navSettings,
      href: '/settings',
      icon: Settings,
      active: normalizedPathname.startsWith('/settings'),
      visible: canViewSettings,
    },
  ].filter((item) => item.visible);

  const renderGroup = (items: typeof docOperations, groupLabel?: string) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-1 mb-4">
        {groupLabel && !collapsed && (
          <div className="px-3 py-1.5 text-[10px] font-bold text-[#7A869A] uppercase tracking-wider font-khmer">
            {groupLabel}
          </div>
        )}
        {items.map((item) => {
          const Icon = item.icon;
          const targetHref = localizeHref(item.href);

          return (
            <Link
              key={item.href}
              href={targetHref}
              onClick={onMobileClose}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                item.active
                  ? 'bg-[#EFF4FC] text-[#2457A7] font-semibold border-l-4 border-[#2457A7] pl-2.5 shadow-2xs'
                  : 'text-[#5E6C84] hover:bg-[#F5F7FA] hover:text-[#172B4D]'
              } ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={`w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0 transition-colors ${
                  item.active ? 'text-[#2457A7]' : 'text-[#7A869A] group-hover:text-[#2457A7]'
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
      </div>
    );
  };

  return (
    <nav className="flex-1 px-3 py-3 overflow-y-auto">
      {renderGroup(overviewGroup, language === 'km' ? 'ទិដ្ឋភាពរួម' : 'Overview')}
      {renderGroup(docOperations, language === 'km' ? 'ប្រតិបត្តិការឯកសារ' : 'Document Operations')}
      {adminGovernance.length > 0 &&
        renderGroup(adminGovernance, language === 'km' ? 'អភិបាលកិច្ច & សវនកម្ម' : 'Administration')}

      {/* Guest Mode Sign-in Banner in Sidebar */}
      {isGuest && !collapsed && (
        <div className="mt-4 p-3 rounded-xl bg-[#F5F7FA] border border-[#E5EAF0] text-center space-y-2">
          <p className="text-[11px] text-[#5E6C84] font-khmer leading-snug">
            {language === 'km'
              ? 'ចូលគណនីជាមន្ត្រីដើម្បីប្រើប្រាស់មុខងាររដ្ឋបាល'
              : 'Sign in as an officer to access governance tools'}
          </p>
          <button
            type="button"
            onClick={() => {
              onMobileClose();
              onRequestLogin();
            }}
            className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#2457A7] text-white hover:bg-[#1c4587] transition-all cursor-pointer font-khmer shadow-2xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{t.loginText}</span>
          </button>
        </div>
      )}
    </nav>
  );
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { language } = useLanguage();
  const [authModalOpen, setAuthModalOpen] = useState(false);

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
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-[#E5EAF0] shadow-xs lg:shadow-none transition-all duration-200 ease-in-out h-[100dvh] ${
          collapsed ? 'w-20' : 'w-72 max-w-[85vw] sm:w-68'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Official Cambodian Government Identity Header with Royal Emblem */}
        <div className="flex items-center justify-between h-16 sm:h-20 px-3.5 sm:px-4 border-b border-[#E5EAF0] bg-white">
          {!collapsed ? (
            <Link href="/" className="flex items-center gap-2.5 min-w-0 pr-1 hover:opacity-90 transition-opacity">
              <img
                src="/images/cambodia-emblem.png"
                alt="Cambodia Emblem"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain flex-shrink-0 drop-shadow-xs"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] sm:text-[13px] font-bold tracking-tight text-[#172B4D] uppercase truncate font-khmer leading-snug">
                  ព្រះរាជាណាចក្រកម្ពុជា
                </span>
                <span className="text-[9.5px] text-[#5E6C84] truncate tracking-wider font-semibold uppercase mt-0.5">
                  Kingdom of Cambodia
                </span>
                <span className="text-[9px] text-[#2457A7] font-semibold truncate font-khmer mt-0.5">
                  ប្រព័ន្ធឯកសាររដ្ឋបាល
                </span>
              </div>
            </Link>
          ) : (
            <Link href="/" className="mx-auto hover:opacity-90 transition-opacity" title="Kingdom of Cambodia">
              <img
                src="/images/cambodia-emblem.png"
                alt="Cambodia Emblem"
                className="w-8 h-8 object-contain drop-shadow-xs"
              />
            </Link>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggle}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-[#5E6C84] hover:text-[#172B4D] hover:bg-[#F5F7FA] transition-colors cursor-pointer"
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

        {/* Navigation items */}
        <Suspense fallback={<div className="flex-1 px-3 py-4" />}>
          <NavLinks
            collapsed={collapsed}
            onMobileClose={onMobileClose}
            onRequestLogin={() => setAuthModalOpen(true)}
          />
        </Suspense>

        {/* Institutional footer indicator */}
        <div className="p-3 border-t border-[#E5EAF0] text-center text-[10px] text-[#7A869A] font-khmer">
          {!collapsed ? (
            <span className="flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00875A]" />
              <span>ប្រព័ន្ធរដ្ឋបាលឌីជីថលកម្ពុជា</span>
            </span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-[#00875A] inline-block" />
          )}
        </div>
      </aside>

      {/* Auth Modal for protected actions */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
