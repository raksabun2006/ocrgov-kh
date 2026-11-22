'use client';

import React, { useState } from 'react';
import { LogIn, X, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { useLanguage } from '../../lib/i18n';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login } = useAuth();
  const { language } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ username, password });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 800);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : language === 'km'
          ? 'ឈ្មោះគណនី ឬលេខសម្ងាត់មិនត្រឹមត្រូវ'
          : 'Invalid username or password'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-[#E5EAF0] rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5EAF0] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#EFF4FC] text-[#2457A7]">
              <LogIn className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#172B4D] font-khmer">
                {language === 'km' ? 'ចូលប្រើប្រព័ន្ធរដ្ឋបាល' : 'Government Officer Login'}
              </h3>
              <p className="text-[11px] text-[#5E6C84] font-khmer">
                {language === 'km'
                  ? 'ប្រព័ន្ធផ្ទៀងផ្ទាត់អត្តសញ្ញាណមន្ត្រីផ្លូវការ'
                  : 'Official Authentication Gateway'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#5E6C84] hover:text-[#172B4D] hover:bg-[#F5F7FA] rounded-md transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-[#FFEBE6] border border-[#FFBDAD] text-xs text-[#DE350B] flex items-start gap-2 font-khmer">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-[#E3FCEF] border border-[#ABF5D1] text-xs text-[#00875A] flex items-center gap-2 font-khmer">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>
                {language === 'km' ? 'ចូលប្រព័ន្ធជោគជ័យ' : 'Login successful!'}
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1.5 font-khmer">
              {language === 'km' ? 'ឈ្មោះគណនី (Username / Email)' : 'Username or Email'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="officer"
                className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-base sm:text-sm bg-[#F5F7FA] border border-[#D0E0F7] rounded-lg text-[#172B4D] focus:ring-2 focus:ring-[#2457A7] font-khmer"
              />
              <User className="w-4 h-4 text-[#7A869A] absolute left-3 top-3 sm:top-2.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1.5 font-khmer">
              {language === 'km' ? 'ពាក្យសម្ងាត់ (Password)' : 'Password'}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-base sm:text-sm bg-[#F5F7FA] border border-[#D0E0F7] rounded-lg text-[#172B4D] focus:ring-2 focus:ring-[#2457A7]"
              />
              <Lock className="w-4 h-4 text-[#7A869A] absolute left-3 top-3 sm:top-2.5 pointer-events-none" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || success}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-[#2457A7] hover:bg-[#1c4587] transition-all shadow-xs cursor-pointer ${
                isSubmitting ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              <LogIn className="w-4 h-4" strokeWidth={2} />
              <span className="font-khmer">
                {isSubmitting
                  ? language === 'km'
                    ? 'កំពុងផ្ទៀងផ្ទាត់...'
                    : 'Authenticating...'
                  : language === 'km'
                  ? 'ចូលប្រព័ន្ធ'
                  : 'Sign In'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
