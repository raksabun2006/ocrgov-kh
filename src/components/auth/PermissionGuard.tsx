'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { useLanguage } from '../../lib/i18n';
import { AuthModal } from './AuthModal';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
  requiredAnyPermissions?: string[];
}

export function PermissionGuard({
  children,
  requiredRole,
  requiredPermission,
  requiredAnyPermissions,
}: PermissionGuardProps) {
  const { isAuthenticated, isGuest, hasRole, hasPermission, hasAnyPermission, isLoading } = useAuth();
  const { language } = useLanguage();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2457A7]" />
      </div>
    );
  }

  // Check authorization
  let isAuthorized = isAuthenticated;

  if (requiredRole && !hasRole(requiredRole)) {
    isAuthorized = false;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    isAuthorized = false;
  }

  if (requiredAnyPermissions && !hasAnyPermission(requiredAnyPermissions)) {
    isAuthorized = false;
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#FFEBE6] border border-[#FFBDAD] flex items-center justify-center text-[#DE350B] mb-4">
          <ShieldAlert className="w-8 h-8" strokeWidth={2} />
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#FFEBE6] text-[#DE350B] mb-2">
          403 Access Denied
        </span>

        <h2 className="text-xl sm:text-2xl font-bold text-[#172B4D] font-khmer mb-2">
          {language === 'km'
            ? 'ការចូលប្រើប្រាស់ត្រូវបានបដិសេធ'
            : 'Administrative Access Restricted'}
        </h2>

        <p className="text-xs sm:text-sm text-[#5E6C84] font-khmer max-w-md mb-6 leading-relaxed">
          {isGuest
            ? language === 'km'
              ? 'លោកអ្នកកំពុងស្ថិតក្នុងរបៀបភ្ញៀវ។ ដើម្បីចូលប្រើប្រាស់ផ្នែករដ្ឋបាលនេះ សូមចូលគណនីជាមន្ត្រីដែលមានសិទ្ធិអនុញ្ញាតផ្លូវការ។'
              : 'You are currently in Guest Mode. Please sign in with an authorized government account to access this module.'
            : language === 'km'
            ? 'គណនីរបស់លោកអ្នកពុំមានសិទ្ធិអនុញ្ញាតគ្រប់គ្រាន់សម្រាប់ផ្នែកនេះឡើយ។ សូមទាក់ទងរដ្ឋបាលប្រព័ន្ធ (SUPER_ADMIN)។'
            : 'Your account does not possess the required permissions for this resource. Please contact your system administrator.'}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-[#D0E0F7] bg-white text-[#172B4D] hover:bg-[#F5F7FA] font-khmer transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'km' ? 'ត្រឡប់ទៅផ្ទាំងដើម' : 'Return to Dashboard'}</span>
          </Link>

          {isGuest && (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#2457A7] text-white hover:bg-[#1c4587] font-khmer transition-all shadow-xs cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{language === 'km' ? 'ចូលគណនីមន្ត្រី' : 'Officer Sign In'}</span>
            </button>
          )}
        </div>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
