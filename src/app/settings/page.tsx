'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  Server,
  ChevronRight,
  Save,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { Shell } from '../../components/layout/Shell';
import { useAuth } from '../../lib/auth-context';
import { useLanguage } from '../../lib/i18n';
import { useToast } from '../../lib/toast-context';
import { getHealthStatus } from '../../lib/api/ocr';
import { HealthResponse } from '../../types/api';
import { API_BASE_URL } from '../../lib/config';

export default function SettingsPage() {
  const { t, language } = useLanguage();
  const { officer, updateOfficerName } = useAuth();
  const { success } = useToast();

  const [name, setName] = useState(officer.name || 'officer');
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    getHealthStatus().then(setHealth).catch(console.error);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateOfficerName(name);
    success(
      language === 'km' ? 'បានរក្សាទុក' : 'Settings Saved',
      language === 'km' ? 'ឈ្មោះមន្ត្រីត្រូវបានរក្សាទុក' : 'Officer name updated'
    );
  };

  return (
    <Shell>
      <div className="space-y-4 sm:space-y-6 max-w-4xl">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 sm:pb-4 border-b border-[#E5EAF0]">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[#5E6C84] mb-1">
              <Link href="/" className="hover:text-[#2457A7] font-khmer">
                {t.navDashboard}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#2457A7] font-semibold font-khmer">
                {t.navSettings}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-[#172B4D] font-khmer flex items-center gap-2">
              <Settings className="w-6 h-6 text-[#2457A7]" strokeWidth={2} />
              <span>{t.navSettings}</span>
            </h1>
          </div>
        </div>

        {/* Officer Identifier Form */}
        <div className="bg-white border border-[#E5EAF0] rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E5EAF0] bg-[#F5F7FA]">
            <h3 className="text-xs sm:text-sm font-bold text-[#172B4D] font-khmer">
              អត្តសញ្ញាណមន្ត្រី (Officer Identifier)
            </h3>
            <p className="text-[11px] text-[#5E6C84] mt-0.5 font-khmer">
              ឈ្មោះនេះនឹងត្រូវបានបញ្ជូនទៅកាន់ Backend សម្រាប់កត់ត្រាសវនកម្ម (Audit Trail)
            </p>
          </div>

          <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#172B4D] mb-1.5 font-khmer">
                {t.officerNameLabel}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full max-w-md px-3 py-2 text-xs bg-white border border-[#D0E0F7] rounded-lg font-khmer focus:ring-2 focus:ring-[#2457A7]"
                placeholder="officer"
              />
            </div>

            <div className="pt-3 border-t border-[#F5F7FA] flex justify-start">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[#2457A7] text-white hover:bg-[#1c4587] font-khmer shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>រក្សាទុក (Save)</span>
              </button>
            </div>
          </form>
        </div>

        {/* Backend System Specs */}
        <div className="bg-white border border-[#E5EAF0] rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E5EAF0] bg-[#F5F7FA]">
            <h3 className="text-xs sm:text-sm font-bold text-[#172B4D] font-khmer flex items-center gap-2">
              <Server className="w-4 h-4 text-[#2457A7]" />
              <span>ការតភ្ជាប់ម៉ាស៊ីនបម្រើ OCR Backend</span>
            </h3>
          </div>

          <div className="p-4 sm:p-6 space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-[#F5F7FA]">
              <span className="text-[#5E6C84]">API Base URL:</span>
              <span className="font-mono font-semibold text-[#2457A7]">{API_BASE_URL}</span>
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
    </Shell>
  );
}
