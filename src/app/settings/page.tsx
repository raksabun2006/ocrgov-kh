'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  Server,
  ChevronRight,
  Save,
  CheckCircle2,
  Lock,
  Cpu,
  AlertCircle,
  Key,
} from 'lucide-react';
import { Shell } from '../../components/layout/Shell';
import { useAuth } from '../../lib/auth-context';
import { useLanguage } from '../../lib/i18n';
import { useToast } from '../../lib/toast-context';
import {
  getHealthStatus,
  changePasswordApi,
  listAdminOcrProviders,
} from '../../lib/api/ocr';
import { HealthResponse } from '../../types/api';

export default function SettingsPage() {
  const { t, language } = useLanguage();
  const { officer, user, isAuthenticated, updateOfficerName } = useAuth();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'general' | 'password' | 'ocr'>('general');
  const [name, setName] = useState(officer.name || 'officer');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [ocrProviders, setOcrProviders] = useState<any>(null);

  // Password Change Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    getHealthStatus().then(setHealth).catch(console.error);
    listAdminOcrProviders().then(setOcrProviders).catch(() => {});
  }, []);

  const handleSaveOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    updateOfficerName(name);
    success(
      language === 'km' ? 'បានរក្សាទុក' : 'Settings Saved',
      language === 'km' ? 'ឈ្មោះមន្ត្រីត្រូវបានរក្សាទុក' : 'Officer identifier updated'
    );
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError(
        language === 'km'
          ? 'ពាក្យសម្ងាត់ថ្មី និងការបញ្ជាក់ពាក្យសម្ងាត់មិនដូចគ្នាទេ'
          : 'New password and confirmation do not match'
      );
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        language === 'km'
          ? 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៨ តួអក្សរ'
          : 'Password must be at least 8 characters'
      );
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePasswordApi({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      success(
        language === 'km' ? 'បានប្តូរពាក្យសម្ងាត់' : 'Password Changed',
        language === 'km'
          ? 'ពាក្យសម្ងាត់របស់អ្នកត្រូវបានកែប្រែដោយជោគជ័យ'
          : 'Your account password has been updated'
      );
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change password';
      setPasswordError(msg);
      toastError('Change Password Failed', msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Shell>
      <div className="space-y-4 sm:space-y-6 max-w-4xl">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 sm:pb-4 border-b border-[#E5EAF0]">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[#5E6C84] mb-1 font-khmer">
              <Link href="/" className="hover:text-[#2457A7]">
                {t.navDashboard}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#2457A7] font-semibold">{t.navSettings}</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-[#172B4D] font-khmer flex items-center gap-2">
              <Settings className="w-6 h-6 text-[#2457A7]" strokeWidth={2} />
              <span>{t.navSettings}</span>
            </h1>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 border-b border-[#E5EAF0] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'general'
                ? 'bg-[#2457A7] text-white shadow-xs'
                : 'text-[#5E6C84] hover:bg-white hover:text-[#172B4D]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="font-khmer">ការកំណត់ទូទៅ (General)</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'password'
                ? 'bg-[#2457A7] text-white shadow-xs'
                : 'text-[#5E6C84] hover:bg-white hover:text-[#172B4D]'
            }`}
          >
            <Key className="w-4 h-4" />
            <span className="font-khmer">ពាក្យសម្ងាត់ & សុវត្ថិភាព (Security)</span>
          </button>

          <button
            onClick={() => setActiveTab('ocr')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ocr'
                ? 'bg-[#2457A7] text-white shadow-xs'
                : 'text-[#5E6C84] hover:bg-white hover:text-[#172B4D]'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span className="font-khmer">ម៉ាស៊ីន OCR & រោគវិនិច្ឆ័យ</span>
          </button>
        </div>

        {/* Tab 1: General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white border border-[#E5EAF0] rounded-xl shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#E5EAF0] bg-[#F5F7FA]">
                <h3 className="text-xs sm:text-sm font-bold text-[#172B4D] font-khmer">
                  អត្តសញ្ញាណមន្ត្រីទទួលបន្ទុក (Responsible Officer Identifier)
                </h3>
                <p className="text-[11px] text-[#5E6C84] mt-0.5 font-khmer">
                  ឈ្មោះនេះនឹងត្រូវបានបញ្ជូនទៅកាន់ Backend សម្រាប់កត់ត្រាសវនកម្ម (Audit Trail)
                </p>
              </div>

              <form onSubmit={handleSaveOfficer} className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] mb-1.5 font-khmer">
                    {t.officerNameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full max-w-md px-3 py-2.5 sm:py-2 text-base sm:text-xs bg-white border border-[#D0E0F7] rounded-lg font-khmer focus:ring-2 focus:ring-[#2457A7]"
                    placeholder="officer"
                  />
                </div>

                <div className="pt-3 border-t border-[#F5F7FA] flex justify-start">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[#2457A7] text-white hover:bg-[#1c4587] font-khmer shadow-xs transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>រក្សាទុក (Save)</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Connection Specs */}
            <div className="bg-white border border-[#E5EAF0] rounded-xl shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#E5EAF0] bg-[#F5F7FA]">
                <h3 className="text-xs sm:text-sm font-bold text-[#172B4D] font-khmer flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#2457A7]" />
                  <span>ការតភ្ជាប់ម៉ាស៊ីនបម្រើ OCR Backend</span>
                </h3>
              </div>

              <div className="p-4 sm:p-6 space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-[#F5F7FA]">
                  <span className="text-[#5E6C84] font-khmer">ច្រកតភ្ជាប់ API:</span>
                  <span className="font-mono text-xs font-semibold text-[#00875A] inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00875A]" />
                    <span>Internal Protected Gateway (Encrypted)</span>
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#F5F7FA]">
                  <span className="text-[#5E6C84]">System Name:</span>
                  <span className="font-semibold text-[#172B4D]">
                    {health?.system || 'Khmer Government Document Intelligence System'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#F5F7FA]">
                  <span className="text-[#5E6C84]">API Version:</span>
                  <span className="font-mono text-[#172B4D]">{health?.version || '1.0.0'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#F5F7FA]">
                  <span className="text-[#5E6C84]">OCR Engine Languages:</span>
                  <span className="font-mono text-[#00875A] font-semibold">
                    {health?.ocr_engine?.languages.join(', ') || 'khm, eng'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[#5E6C84]">OCR Status:</span>
                  <span className="font-semibold text-[#00875A] inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ready & Operational</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Security & Change Password */}
        {activeTab === 'password' && (
          <div className="bg-white border border-[#E5EAF0] rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E5EAF0] bg-[#F5F7FA]">
              <h3 className="text-xs sm:text-sm font-bold text-[#172B4D] font-khmer flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#2457A7]" />
                <span>ផ្លាស់ប្តូរពាក្យសម្ងាត់គណនី (Change Password)</span>
              </h3>
              <p className="text-[11px] text-[#5E6C84] mt-0.5 font-khmer">
                {isAuthenticated && user
                  ? `គណនីបច្ចុប្បន្ន: ${user.username} (${user.email})`
                  : 'សូមចូលប្រព័ន្ធជាមុនសិនដើម្បីកែប្រែពាក្យសម្ងាត់'}
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="p-4 sm:p-6 space-y-4">
              {passwordError && (
                <div className="p-3 rounded-lg bg-[#FFEBE6] border border-[#FFBDAD] text-xs text-[#DE350B] flex items-center gap-2 font-khmer">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1 font-khmer">
                  ពាក្យសម្ងាត់បច្ចុប្បន្ន (Current Password) *
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full max-w-md px-3 py-2.5 sm:py-2 text-base sm:text-xs bg-[#F5F7FA] border border-[#D0E0F7] rounded-lg text-[#172B4D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1 font-khmer">
                  ពាក្យសម្ងាត់ថ្មី (New Password, min 8 chars) *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full max-w-md px-3 py-2.5 sm:py-2 text-base sm:text-xs bg-[#F5F7FA] border border-[#D0E0F7] rounded-lg text-[#172B4D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1 font-khmer">
                  បញ្ជាក់ពាក្យសម្ងាត់ថ្មី (Confirm New Password) *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full max-w-md px-3 py-2.5 sm:py-2 text-base sm:text-xs bg-[#F5F7FA] border border-[#D0E0F7] rounded-lg text-[#172B4D]"
                />
              </div>

              <div className="pt-3 border-t border-[#F5F7FA] flex justify-start">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[#2457A7] text-white hover:bg-[#1c4587] font-khmer shadow-xs transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {isChangingPassword
                      ? language === 'km'
                        ? 'កំពុងកែប្រែ...'
                        : 'Updating...'
                      : 'ប្តូរពាក្យសម្ងាត់'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: OCR Engine Diagnostics */}
        {activeTab === 'ocr' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E5EAF0] rounded-xl shadow-xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#F5F7FA]">
                <Cpu className="w-5 h-5 text-[#2457A7]" />
                <h3 className="text-sm font-bold text-[#172B4D] font-khmer">
                  ព័ត៌មានលម្អិតម៉ាស៊ីន OCR & AI Pipeline
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-[#F5F7FA] border border-[#E5EAF0] space-y-2">
                  <span className="font-bold text-[#172B4D] block font-khmer">
                    OpenCV Preprocessing Pipeline
                  </span>
                  <div className="text-[#5E6C84] space-y-1">
                    <div>• Deskewing: Automatic angle detection via Hough transform</div>
                    <div>• Contrast Enhancement: CLAHE (Adaptive Histogram)</div>
                    <div>• Denoising: Gaussian & Median blur filtering</div>
                    <div>• Binarization: Otsu adaptive thresholding</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#F5F7FA] border border-[#E5EAF0] space-y-2">
                  <span className="font-bold text-[#172B4D] block font-khmer">
                    Tesseract Recognition Engine
                  </span>
                  <div className="text-[#5E6C84] space-y-1">
                    <div>• Dual-language recognition: Khmer (khm) + English (eng)</div>
                    <div>• Page Segmentation Mode: Automatic page segmentation (PSM 3)</div>
                    <div>• OEM: LSTM Neural Network recognition engine</div>
                    <div>• Output: High precision UTF-8 Unicode characters</div>
                  </div>
                </div>
              </div>

              {ocrProviders && (
                <div className="pt-2">
                  <span className="text-xs font-semibold text-[#172B4D] block mb-2 font-khmer">
                    Registered OCR Providers (Backend):
                  </span>
                  <pre className="p-3 rounded-lg bg-[#0F172A] text-[#E2E8F0] text-[11px] font-mono overflow-x-auto">
                    {JSON.stringify(ocrProviders, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
