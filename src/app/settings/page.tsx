'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  Server,
  ChevronRight,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Shell } from '../../components/layout/Shell';
import { useAuth } from '../../lib/auth-context';
import { useLanguage } from '../../lib/i18n';
import { getHealthStatus } from '../../lib/api/ocr';
import { HealthResponse } from '../../types/api';
import { API_BASE_URL } from '../../lib/config';

export default function SettingsPage() {
  const { t, language } = useLanguage();
  const { officer, updateOfficerName } = useAuth();

  const [name, setName] = useState(officer.name);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    getHealthStatus().then(setHealth).catch(console.error);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateOfficerName(name);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <Shell>
      <div className="space-y-6 max-w-4xl">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
              <Link href="/" className="hover:text-[#17365D] font-khmer">
                {t.navDashboard}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#17365D] font-semibold font-khmer">
                {t.navSettings}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#17365D] font-khmer">
              {t.navSettings}
            </h1>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-xs font-semibold text-[#16A34A] font-khmer">
            <CheckCircle2 className="w-4 h-4" />
            <span>បានរក្សាទុកការកំណត់ដោយជោគជ័យ</span>
          </div>
        )}

        {/* Officer Identifier Form */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <h3 className="text-sm font-bold text-[#17365D] font-khmer">
              អត្តសញ្ញាណមន្ត្រី (Officer Name / ID)
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5 font-khmer">
              ឈ្មោះនេះនឹងត្រូវបានបញ្ជូនទៅកាន់ Backend សម្រាប់កត់ត្រាសវនកម្ម (Audit Trail)
            </p>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1.5 font-khmer">
                {t.officerNameLabel}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full max-w-md px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-lg font-khmer focus:ring-2 focus:ring-[#17365D]"
                placeholder="officer"
              />
            </div>

            <div className="pt-3 border-t border-[#F1F5F9] flex justify-start">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[#17365D] text-white hover:bg-[#0f2440] font-khmer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>រក្សាទុក (Save)</span>
              </button>
            </div>
          </form>
        </div>

        {/* Backend System Specs */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <h3 className="text-sm font-bold text-[#17365D] font-khmer flex items-center gap-2">
              <Server className="w-4 h-4 text-[#2563A6]" />
              <span>ការតភ្ជាប់ម៉ាស៊ីនបម្រើ OCR Backend</span>
            </h3>
          </div>

          <div className="p-6 space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
              <span className="text-[#64748B]">API Base URL:</span>
              <span className="font-mono font-semibold text-[#17365D]">{API_BASE_URL}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
              <span className="text-[#64748B]">System Name:</span>
              <span className="font-semibold text-[#1E293B]">{health?.system || 'Khmer Government Document Intelligence System'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
              <span className="text-[#64748B]">API Version:</span>
              <span className="font-mono text-[#1E293B]">{health?.version || '1.0.0'}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[#64748B]">OCR Engine Languages:</span>
              <span className="font-mono text-[#16A34A] font-semibold">
                {health?.ocr_engine?.languages.join(', ') || 'khm, eng'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
