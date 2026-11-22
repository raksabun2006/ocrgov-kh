'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  FileScan,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Activity,
  History,
  CheckCircle2,
  Search,
  RefreshCw,
  TrendingUp,
  LogIn,
  Receipt,
  FileText,
  CheckSquare,
  Users,
  Shield,
  Layers,
  Sparkles,
  Lock,
} from 'lucide-react';
import { Shell } from '../components/layout/Shell';
import { StatsCards } from '../components/dashboard/StatsCards';
import { RecentDocumentsTable } from '../components/dashboard/RecentDocumentsTable';
import {
  searchArchive,
  getHealthStatus,
  getAuditLogs,
  getAdminDashboardSummary,
  getAdminOcrStatistics,
} from '../lib/api/ocr';
import {
  DocumentMetadataResponse,
  HealthResponse,
  AuditLogItem,
  OcrStatisticsResponse,
} from '../types/api';
import { useLanguage } from '../lib/i18n';
import { useAuth } from '../lib/auth-context';
import { AuthModal } from '../components/auth/AuthModal';

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const { user, isAuthenticated, isGuest, hasRole, roles } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const isAdmin = hasRole('ADMIN') || hasRole('SUPER_ADMIN');

  const [documents, setDocuments] = useState<DocumentMetadataResponse[]>([]);
  const [totalDocs, setTotalDocs] = useState<number>(0);
  const [processedDocs, setProcessedDocs] = useState<number>(0);
  const [pendingDocs, setPendingDocs] = useState<number>(0);
  const [failedDocs, setFailedDocs] = useState<number>(0);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLogItem[]>([]);
  const [ocrStats, setOcrStats] = useState<OcrStatisticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [todayFormatted, setTodayFormatted] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    if (language === 'km') {
      const days = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
      const months = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
      setTodayFormatted(`ថ្ងៃ${days[now.getDay()]} ទី${now.getDate()} ខែ${months[now.getMonth()]} ឆ្នាំ${now.getFullYear()}`);
    } else {
      setTodayFormatted(now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }));
    }
  }, [language]);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [archiveRes, healthRes, logsRes, adminDashRes, ocrStatsRes] = await Promise.allSettled([
        searchArchive({ page: 1, limit: 8 }),
        getHealthStatus(),
        getAuditLogs({ limit: 6 }),
        getAdminDashboardSummary(),
        getAdminOcrStatistics(),
      ]);

      if (archiveRes.status === 'fulfilled') {
        const items = archiveRes.value.items || [];
        setDocuments(items);
        setTotalDocs(archiveRes.value.total || 0);

        const processed = items.filter((d) => d.status === 'PROCESSED').length;
        const pending = items.filter((d) => d.status === 'NEEDS_VERIFICATION').length;
        const failed = items.filter(
          (d) => d.status !== 'PROCESSED' && d.status !== 'NEEDS_VERIFICATION'
        ).length;

        setProcessedDocs(processed);
        setPendingDocs(pending);
        setFailedDocs(failed);
      }

      if (adminDashRes.status === 'fulfilled' && adminDashRes.value) {
        const data = adminDashRes.value;
        if (data.total_documents !== undefined) setTotalDocs(data.total_documents);
        if (data.processed_documents !== undefined) setProcessedDocs(data.processed_documents);
        if (data.pending_verifications !== undefined) setPendingDocs(data.pending_verifications);
        if (data.failed_documents !== undefined) setFailedDocs(data.failed_documents);
      }

      if (ocrStatsRes.status === 'fulfilled' && ocrStatsRes.value) {
        setOcrStats(ocrStatsRes.value);
      }

      if (healthRes.status === 'fulfilled') {
        setHealth(healthRes.value);
      }

      if (logsRes.status === 'fulfilled' && logsRes.value) {
        setRecentLogs(Array.isArray(logsRes.value.items) ? logsRes.value.items : []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <Shell>
      <div className="space-y-4 sm:space-y-6">
        {/* ========================================================================= */}
        {/* GUEST DASHBOARD: Public Landing, Introduction & Public OCR Capabilities */}
        {/* ========================================================================= */}
        {isGuest ? (
          <>
            {/* Guest Welcome & Platform Identity */}
            <div className="relative overflow-hidden bg-white border border-[#E5EAF0] rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-xs">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF4FC] border border-[#D0E0F7] font-semibold text-[#2457A7] font-khmer">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2457A7]" strokeWidth={2} />
                      <span>ព្រះរាជាណាចក្រកម្ពុជា • រាជរដ្ឋាភិបាលឌីជីថល</span>
                    </span>
                    <span className="text-[#5E6C84] font-medium font-khmer">
                      {todayFormatted}
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#172B4D] tracking-tight font-khmer">
                    {language === 'km'
                      ? 'ប្រព័ន្ធឌីជីថលសម្រាប់សម្គាល់អត្ថបទក្នុងឯកសារផ្លូវការ'
                      : 'Cambodian Government Document Intelligence & OCR System'}
                  </h1>

                  <p className="text-xs sm:text-sm text-[#5E6C84] font-khmer leading-relaxed">
                    {language === 'km'
                      ? 'ប្រព័ន្ធស្កេន និងបំប្លែងឯកសាររដ្ឋបាលផ្លូវការ (សំបុត្រកំណើត សៀវភៅគ្រួសារ អត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរ លិខិតរដ្ឋបាល និងវិក្កយបត្រ) ទៅជាទិន្នន័យឌីជីថល ដោយប្រើប្រាស់បច្ចេកវិទ្យាសម្គាល់អក្សរពីរភាសា (Khmer & English OCR) កម្រិតស្តង់ដាររដ្ឋាភិបាល។'
                      : 'Official government platform for automated optical character recognition (Khmer & English OCR), document classification, and civil registration extraction for administrative documents and civil records.'}
                  </p>
                </div>

                {/* Primary Guest CTA */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                  <Link
                    href="/ocr"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#2457A7] hover:bg-[#1c4587] transition-all shadow-xs"
                  >
                    <FileScan className="w-4 h-4" />
                    <span className="font-khmer">{t.newOcrAction}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setAuthModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-[#2457A7] bg-[#EFF4FC] hover:bg-[#D0E0F7] border border-[#D0E0F7] transition-all cursor-pointer font-khmer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{language === 'km' ? 'ចូលគណនីមន្ត្រី' : 'Officer Sign In'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Public Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-white border border-[#E5EAF0] rounded-xl shadow-xs space-y-2 hover:border-[#D0E0F7] transition-all">
                <div className="w-10 h-10 rounded-lg bg-[#EFF4FC] text-[#2457A7] flex items-center justify-center mb-3">
                  <FileScan className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#172B4D] font-khmer">
                  {language === 'km' ? 'ដំណើរការ OCR ឯកសាររដ្ឋបាល' : 'Administrative Document OCR'}
                </h3>
                <p className="text-xs text-[#5E6C84] font-khmer leading-relaxed">
                  {language === 'km'
                    ? 'ស្កេនបំប្លែងសំបុត្រកំណើត សៀវភៅគ្រួសារ និងលិខិតរដ្ឋបាល ដោយទាញយកអត្ថបទភាសាខ្មែរ និងអង់គ្លេសដោយស្វ័យប្រវត្តិ។'
                    : 'Process civil registration documents with dual-language Khmer and English recognition models.'}
                </p>
                <div className="pt-2">
                  <Link
                    href="/ocr"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2457A7] hover:underline font-khmer"
                  >
                    <span>{language === 'km' ? 'សាកល្បងស្កេន' : 'Try OCR Extraction'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="p-5 bg-white border border-[#E5EAF0] rounded-xl shadow-xs space-y-2 hover:border-[#D0E0F7] transition-all">
                <div className="w-10 h-10 rounded-lg bg-[#E3FCEF] text-[#00875A] flex items-center justify-center mb-3">
                  <Receipt className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#172B4D] font-khmer">
                  {language === 'km' ? 'ស្កេនវិក្កយបត្រ & បង្កាន់ដៃ' : 'Receipt & Invoice Scanner'}
                </h3>
                <p className="text-xs text-[#5E6C84] font-khmer leading-relaxed">
                  {language === 'km'
                    ? 'ស្រង់ទិន្នន័យទឹកប្រាក់ កាលបរិច្ឆេទ ឈ្មោះហាង និងទំនិញពីបង្កាន់ដៃទូទាត់រដ្ឋបាល និងឯកជន។'
                    : 'Extract amounts, line items, and merchant information from payment vouchers and receipts.'}
                </p>
                <div className="pt-2">
                  <Link
                    href="/receipts"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00875A] hover:underline font-khmer"
                  >
                    <span>{language === 'km' ? 'ស្កេនបង្កាន់ដៃ' : 'Scan Receipt'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="p-5 bg-white border border-[#E5EAF0] rounded-xl shadow-xs space-y-2 hover:border-[#D0E0F7] transition-all">
                <div className="w-10 h-10 rounded-lg bg-[#F5F7FA] text-[#172B4D] flex items-center justify-center mb-3">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#172B4D] font-khmer">
                  {language === 'km' ? 'ស្វែងរកឯកសារសាធារណៈ' : 'Public Archive Search'}
                </h3>
                <p className="text-xs text-[#5E6C84] font-khmer leading-relaxed">
                  {language === 'km'
                    ? 'ស្វែងរកកំណត់ត្រាឯកសាររដ្ឋបាលតាមលេខកូដចុះបញ្ជី ប្រភេទឯកសារ ឬពាក្យគន្លឹះក្នុងអត្ថបទ។'
                    : 'Search public records and archived documents by registration number, type, or keyword.'}
                </p>
                <div className="pt-2">
                  <Link
                    href="/search"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#172B4D] hover:underline font-khmer"
                  >
                    <span>{language === 'km' ? 'ស្វែងរកឯកសារ' : 'Search Documents'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Specifications & Public Usage Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Technical Specifications */}
              <div className="p-5 bg-white border border-[#E5EAF0] rounded-xl shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#F5F7FA] pb-2.5">
                  <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wider font-khmer">
                    {language === 'km' ? 'លក្ខណៈបច្ចេកទេសគាំទ្រ (Specifications)' : 'Supported Specifications'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00875A] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00875A]" />
                    </span>
                    <span className="text-[11px] font-semibold text-[#00875A] font-khmer">
                      {health?.status === 'ok' ? 'ប្រព័ន្ធដំណើរការធម្មតា (Online)' : t.onlineStatus}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-[#5E6C84]">
                  <div className="flex justify-between py-1 border-b border-[#F5F7FA]">
                    <span className="font-khmer">ទម្រង់ឯកសារគាំទ្រ (File Formats):</span>
                    <span className="font-mono font-semibold text-[#172B4D]">PDF, PNG, JPG, JPEG, TIFF</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F5F7FA]">
                    <span className="font-khmer">ទំហំឯកសារអតិបរមា (Max Size):</span>
                    <span className="font-mono font-semibold text-[#172B4D]">20 MB / ឯកសារ</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F5F7FA]">
                    <span className="font-khmer">ភាសាគាំទ្រ (Languages):</span>
                    <span className="font-mono text-[#00875A] font-semibold">Khmer + English (Dual)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-khmer">បច្ចេកវិទ្យាកែតម្រូវរូបភាព:</span>
                    <span className="font-mono font-semibold text-[#172B4D]">CLAHE, Deskew, Denoise</span>
                  </div>
                </div>
              </div>

              {/* Usage Instructions */}
              <div className="p-5 bg-white border border-[#E5EAF0] rounded-xl shadow-xs space-y-3">
                <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wider font-khmer block border-b border-[#F5F7FA] pb-2.5">
                  {language === 'km' ? 'ជំហាននៃការប្រើប្រាស់ (3 Simple Steps)' : 'How It Works'}
                </span>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#EFF4FC] text-[#2457A7] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong className="text-[#172B4D] font-khmer block">ជ្រើសរើស ឬទម្លាក់ឯកសារ</strong>
                      <span className="text-[#5E6C84] font-khmer text-[11px]">
                        ទម្លាក់រូបភាព ឬឯកសារ PDF នៃសំបុត្រកំណើត ឬលិខិតរដ្ឋបាលទៅក្នុងផ្ទាំងស្កេន។
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#EFF4FC] text-[#2457A7] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong className="text-[#172B4D] font-khmer block">ប្រព័ន្ធដំណើរការ OCR ដោយស្វ័យប្រវត្តិ</strong>
                      <span className="text-[#5E6C84] font-khmer text-[11px]">
                        ម៉ាស៊ីន AI និង Tesseract 5 LSTM ធ្វើការស្គាល់តួអក្សរ និងចាត់ថ្នាក់ឯកសារ។
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#EFF4FC] text-[#2457A7] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong className="text-[#172B4D] font-khmer block">ទាញយកអត្ថបទ និងទិន្នន័យសម្រេច</strong>
                      <span className="text-[#5E6C84] font-khmer text-[11px]">
                        ពិនិត្យលទ្ធផលអត្ថបទដើម ឬទិន្នន័យរចនាសម្ព័ន្ធ ហើយទាញយកជាទម្រង់ JSON/Text។
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* ========================================================================= */
          /* AUTHENTICATED USER & ADMINISTRATOR DASHBOARD                             */
          /* ========================================================================= */
          <>
            {/* Officer Identification Panel */}
            <div className="bg-white border border-[#E5EAF0] rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#EFF4FC] text-[#2457A7] font-bold text-lg flex items-center justify-center flex-shrink-0 border border-[#D0E0F7]">
                    {user?.username ? user.username.slice(0, 1).toUpperCase() : 'O'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base sm:text-lg text-[#172B4D] font-khmer">
                        {user?.full_name || user?.username}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {roles.map((r) => (
                          <span
                            key={r}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                              r === 'ADMIN' || r === 'SUPER_ADMIN'
                                ? 'bg-[#EFF4FC] text-[#2457A7] border border-[#D0E0F7]'
                                : 'bg-[#E3FCEF] text-[#00875A] border border-[#ABF5D1]'
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#00875A] font-semibold font-khmer">
                        <span className="w-2 h-2 rounded-full bg-[#00875A]" />
                        <span>{language === 'km' ? 'សម័យប្រជុំសកម្ម' : 'Active Session'}</span>
                      </span>
                    </div>
                    <p className="text-xs text-[#5E6C84] font-khmer mt-0.5">
                      {user?.email} • {language === 'km' ? 'នាយកដ្ឋានអត្រានុកូលដ្ឋាន' : 'Civil Registration Dept'}
                    </p>
                  </div>
                </div>

                {/* Quick Action Shortcuts */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={loadDashboardData}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#5E6C84] hover:text-[#172B4D] bg-[#F5F7FA] hover:bg-[#E5EAF0] border border-[#D0E0F7] transition-all cursor-pointer"
                    title="Refresh Metrics"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span className="font-khmer">ផ្ទុកឡើងវិញ</span>
                  </button>

                  <Link
                    href="/ocr"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#2457A7] hover:bg-[#1c4587] font-khmer transition-all shadow-xs"
                  >
                    <FileScan className="w-4 h-4" />
                    <span>{t.newOcrAction}</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/users"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#EFF4FC] text-[#2457A7] border border-[#D0E0F7] hover:bg-[#D0E0F7] font-khmer transition-all"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{t.navUsers}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* 4 Statistics Cards (Real Backend Metrics) */}
            <StatsCards
              total={totalDocs}
              processed={processedDocs}
              pending={pendingDocs}
              failed={failedDocs}
              isLoading={isLoading}
            />

            {/* Technical Specs & Diagnostics Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-4 bg-white border border-[#E5EAF0] rounded-xl shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F5F7FA]">
                  <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wider font-khmer">
                    {t.ocrServiceStatus}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00875A] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00875A]" />
                    </span>
                    <span className="text-[11px] font-semibold text-[#00875A] font-khmer">
                      {t.onlineStatus}
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-[#5E6C84]">
                  <div className="flex justify-between">
                    <span>ម៉ាស៊ីនសម្គាល់ (Engine):</span>
                    <span className="font-semibold text-[#172B4D]">Tesseract 5 + LSTM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ភាសាគាំទ្រ (Languages):</span>
                    <span className="font-mono text-[#00875A] font-semibold">Khmer + English</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ម៉ូឌុលចាត់ថ្នាក់:</span>
                    <span className="font-semibold text-[#172B4D]">ML Classifier v1.2</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border border-[#E5EAF0] rounded-xl shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F5F7FA]">
                  <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wider font-khmer">
                    ការកែតម្រូវរូបភាព (Preprocessing)
                  </span>
                  <span className="text-[10px] text-[#2457A7] font-semibold">Active</span>
                </div>
                <div className="space-y-1.5 text-xs text-[#5E6C84]">
                  <div className="flex justify-between">
                    <span>បង្វិលតម្រង់ (Deskew):</span>
                    <span className="font-mono text-[#00875A]">OpenCV MinAreaRect</span>
                  </div>
                  <div className="flex justify-between">
                    <span>កម្រិតពន្លឺ (CLAHE):</span>
                    <span className="font-mono text-[#00875A]">Adaptive Clip 2.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>បំបាត់ស្នាម (Denoise):</span>
                    <span className="font-mono text-[#00875A]">Bilateral Filter</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border border-[#E5EAF0] rounded-xl shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F5F7FA]">
                  <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wider font-khmer">
                    អត្រាជោគជ័យ (Accuracy)
                  </span>
                  <TrendingUp className="w-4 h-4 text-[#00875A]" />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-bold text-[#172B4D] font-mono">
                      {totalDocs > 0 ? Math.round((processedDocs / totalDocs) * 100) : 100}%
                    </span>
                    <span className="text-[10px] text-[#00875A] font-semibold font-khmer">
                      ដំណើរការដោយជោគជ័យ
                    </span>
                  </div>
                  <div className="w-full bg-[#E5EAF0] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#00875A] h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${totalDocs > 0 ? Math.round((processedDocs / totalDocs) * 100) : 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Documents Table & Admin Audit Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className={`${isAdmin ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                <RecentDocumentsTable documents={documents} isLoading={isLoading} />
              </div>

              {/* Administrator Audit Stream (Visible only to administrators/auditors) */}
              {isAdmin && (
                <div className="bg-white border border-[#E5EAF0] rounded-xl shadow-xs p-4 sm:p-5 flex flex-col h-full">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF0] mb-3">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-[#2457A7]" />
                      <h3 className="text-xs sm:text-sm font-bold text-[#172B4D] uppercase tracking-wider font-khmer">
                        {t.auditTrailTitle}
                      </h3>
                    </div>
                    <Link
                      href="/audit"
                      className="text-[11px] font-semibold text-[#2457A7] hover:underline font-khmer"
                    >
                      {language === 'km' ? 'មើលទាំងអស់' : 'View All'}
                    </Link>
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-[360px] pr-1">
                    {recentLogs.length === 0 ? (
                      <div className="text-center py-8 text-xs text-[#7A869A] font-khmer">
                        {t.noAuditLogsYet}
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {recentLogs.map((log, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-[#F5F7FA] border border-[#E5EAF0] text-xs space-y-1 hover:border-[#D0E0F7] transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-semibold text-[#2457A7] text-[11px]">
                                {log.action}
                              </span>
                              <span className="text-[10px] text-[#7A869A] font-mono">
                                {new Date(log.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#172B4D] font-khmer truncate">
                              {typeof log.details === 'string'
                                ? log.details
                                : log.resource_id || log.resource_type || log.action}
                            </div>
                            <div className="text-[10px] text-[#5E6C84] flex items-center justify-between">
                              <span className="font-mono text-[#00875A]">{log.user_id}</span>
                              <span className="text-[#00875A] font-semibold text-[10px] inline-flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>Logged</span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#F5F7FA] text-center">
                    <span className="text-[10px] text-[#7A869A] font-khmer">
                      កំណត់ត្រាសវនកម្មមិនអាចកែប្រែបានទេ (Immutable Audit Trail)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </Shell>
  );
}
