'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  FileScan,
  ArrowRight,
  ShieldCheck,
  Cpu,
  History,
  CheckCircle2,
  Search,
  RefreshCw,
  TrendingUp,
  LogIn,
  Receipt,
  FileText,
  Users,
  CheckSquare,
  AlertCircle,
  Activity,
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
import { ErrorState } from '../components/ui/ErrorState';

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
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [todayFormatted, setTodayFormatted] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    if (language === 'km') {
      const days = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
      const months = [
        'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
        'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
      ];
      setTodayFormatted(`ថ្ងៃ${days[now.getDay()]} ទី${now.getDate()} ខែ${months[now.getMonth()]} ឆ្នាំ${now.getFullYear()}`);
    } else {
      setTodayFormatted(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    }
  }, [language]);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      // 1. Fetch live archive data (Public endpoint: gives real total & recent items)
      // 2. Fetch health status (Public endpoint: gives backend & OCR engine state)
      // 3. Fetch audit logs (Public endpoint: gives recent system audit events)
      const promises: [
        Promise<unknown>,
        Promise<unknown>,
        Promise<unknown>,
        Promise<unknown>?,
        Promise<unknown>?
      ] = [
        searchArchive({ page: 1, limit: 100 }),
        getHealthStatus(),
        getAuditLogs({ limit: 6 }),
      ];

      if (isAuthenticated) {
        promises.push(getAdminDashboardSummary());
        promises.push(getAdminOcrStatistics());
      }

      const results = await Promise.allSettled(promises);
      const [archiveRes, healthRes, logsRes, adminDashRes, ocrStatsRes] = results;

      if (archiveRes.status === 'fulfilled') {
        const val = archiveRes.value as { total?: number; items?: DocumentMetadataResponse[] };
        const items = val.items || [];
        setDocuments(items);
        setTotalDocs(val.total || items.length);

        const processed = items.filter((d) => d.status === 'PROCESSED').length;
        const pending = items.filter((d) => d.status === 'NEEDS_VERIFICATION').length;
        const failed = items.filter(
          (d) => d.status !== 'PROCESSED' && d.status !== 'NEEDS_VERIFICATION'
        ).length;

        setProcessedDocs(processed);
        setPendingDocs(pending);
        setFailedDocs(failed);
      }

      if (adminDashRes && adminDashRes.status === 'fulfilled' && adminDashRes.value) {
        const data = adminDashRes.value as Record<string, unknown>;
        if (typeof data.total_documents === 'number') setTotalDocs(data.total_documents);
        if (typeof data.processed_documents === 'number') setProcessedDocs(data.processed_documents);
        if (typeof data.pending_verifications === 'number') setPendingDocs(data.pending_verifications);
        if (typeof data.failed_documents === 'number') setFailedDocs(data.failed_documents);
      }

      if (ocrStatsRes && ocrStatsRes.status === 'fulfilled' && ocrStatsRes.value) {
        setOcrStats(ocrStatsRes.value as OcrStatisticsResponse);
      }

      if (healthRes.status === 'fulfilled') {
        setHealth(healthRes.value as HealthResponse);
      }

      if (logsRes.status === 'fulfilled' && logsRes.value) {
        const val = logsRes.value as { items?: AuditLogItem[] };
        setRecentLogs(Array.isArray(val.items) ? val.items : []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      setFetchError(
        err instanceof Error
          ? err.message
          : 'Failed to communicate with OCR backend. Please check network and retry.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <Shell>
      <div className="space-y-4 sm:space-y-6">
        {/* ========================================================================= */}
        {/* OFFICIAL GOVERNMENT HERO BANNER                                          */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden bg-white border border-[#E5EAF0] rounded-xl sm:rounded-2xl p-5 sm:p-7 shadow-[0_1px_3px_rgba(9,30,66,0.04)]">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4 max-w-3xl">
              <img
                src="/images/cambodia-emblem.png"
                alt="Royal Emblem of Cambodia"
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain flex-shrink-0 drop-shadow-xs hidden sm:block mt-0.5"
              />
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF4FC] border border-[#D0E0F7] font-semibold text-[#2457A7] font-khmer">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2457A7]" strokeWidth={2} />
                    <span>ព្រះរាជាណាចក្រកម្ពុជា • រាជរដ្ឋាភិបាលឌីជីថល</span>
                  </span>
                  <span className="text-[#5E6C84] font-medium font-khmer">
                    {todayFormatted}
                  </span>
                  {isGuest ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF0B3] text-[#172B4D] border border-[#FFE58F] font-khmer">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF991F]" />
                      <span>ភ្ញៀវ (Guest Mode)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E3FCEF] text-[#00875A] border border-[#ABF5D1] font-khmer">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00875A]" />
                      <span>មន្ត្រីផ្លូវការ (Officer Active)</span>
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#172B4D] tracking-tight font-khmer">
                  {language === 'km'
                    ? 'ប្រព័ន្ធឌីជីថលសម្រាប់សម្គាល់អត្ថបទក្នុងឯកសាររដ្ឋបាល'
                    : 'Khmer Government Document Intelligence System'}
                </h1>

                <p className="text-xs sm:text-sm text-[#5E6C84] font-khmer leading-relaxed">
                  {language === 'km'
                    ? 'ប្រព័ន្ធស្កេន និងបំប្លែងឯកសាររដ្ឋបាលផ្លូវការ (សំបុត្រកំណើត សៀវភៅគ្រួសារ អត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរ លិខិតរដ្ឋបាល និងវិក្កយបត្រ) ទៅជាទិន្នន័យឌីជីថល ដោយប្រើប្រាស់បច្ចេកវិទ្យាសម្គាល់អក្សរពីរភាសា (Khmer & English OCR) កម្រិតស្តង់ដាររដ្ឋាភិបាល។'
                    : 'Official government platform for automated optical character recognition (Khmer & English OCR), document classification, and civil registration extraction for administrative documents and civil records.'}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
              <Link
                href="/ocr"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#2457A7] hover:bg-[#1c4587] transition-all shadow-xs"
              >
                <FileScan className="w-4 h-4" />
                <span className="font-khmer">{t.newOcrAction}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/search"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-[#172B4D] bg-[#F5F7FA] hover:bg-[#E5EAF0] border border-[#E5EAF0] transition-all font-khmer"
              >
                <Search className="w-4 h-4 text-[#5E6C84]" />
                <span>{language === 'km' ? 'ស្វែងរកឯកសារ' : 'Search Documents'}</span>
              </Link>

              {isGuest && (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-[#2457A7] bg-[#EFF4FC] hover:bg-[#D0E0F7] border border-[#D0E0F7] transition-all cursor-pointer font-khmer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{language === 'km' ? 'ចូលគណនីមន្ត្រី' : 'Sign In'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Authenticated Officer Ribbon (When signed in) */}
          {isAuthenticated && user && (
            <div className="mt-5 pt-4 border-t border-[#F5F7FA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EFF4FC] text-[#2457A7] font-bold text-xs flex items-center justify-center border border-[#D0E0F7]">
                  {user.username.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <span className="font-semibold text-[#172B4D] font-khmer">
                    {user.full_name || user.username}
                  </span>
                  <span className="text-[#7A869A] mx-2">•</span>
                  <span className="font-mono text-[11px] text-[#2457A7] font-bold uppercase">
                    {roles.join(', ') || 'OFFICER'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadDashboardData}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#5E6C84] hover:text-[#172B4D] bg-[#F5F7FA] hover:bg-[#E5EAF0] border border-[#D0E0F7] transition-all cursor-pointer"
                  title="Refresh Metrics"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="font-khmer">ផ្ទុកឡើងវិញ</span>
                </button>

                {isAdmin && (
                  <Link
                    href="/users"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EFF4FC] text-[#2457A7] border border-[#D0E0F7] hover:bg-[#D0E0F7] font-khmer transition-all"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{t.navUsers}</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error State with Retry Button */}
        {fetchError && (
          <ErrorState
            title="បញ្ហាក្នុងការទាញយកទិន្នន័យពីម៉ាស៊ីនបម្រើ (Backend Communication Error)"
            message={fetchError}
            onRetry={loadDashboardData}
          />
        )}

        {/* ========================================================================= */}
        {/* 4 CORE STATISTICS CARDS (Connected to actual backend APIs)                 */}
        {/* ========================================================================= */}
        <StatsCards
          total={totalDocs}
          processed={processedDocs}
          pending={pendingDocs}
          failed={failedDocs}
          isLoading={isLoading}
        />

        {/* ========================================================================= */}
        {/* CORE SERVICES SHOWCASE (Document OCR, Receipt Scanner, Public Archive)     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Document OCR */}
          <div className="p-5 bg-white border border-[#E5EAF0] rounded-xl shadow-[0_1px_3px_rgba(9,30,66,0.04)] space-y-2 hover:border-[#D0E0F7] transition-all">
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
                <span>{language === 'km' ? 'សាកល្បងស្កេន' : 'Start OCR Extraction'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Receipt Scanner */}
          <div className="p-5 bg-white border border-[#E5EAF0] rounded-xl shadow-[0_1px_3px_rgba(9,30,66,0.04)] space-y-2 hover:border-[#D0E0F7] transition-all">
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

          {/* Card 3: Digital Document Archive */}
          <div className="p-5 bg-white border border-[#E5EAF0] rounded-xl shadow-[0_1px_3px_rgba(9,30,66,0.04)] space-y-2 hover:border-[#D0E0F7] transition-all">
            <div className="w-10 h-10 rounded-lg bg-[#EFF4FC] text-[#2457A7] flex items-center justify-center mb-3">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#172B4D] font-khmer">
              {language === 'km' ? 'បណ្ណសារឯកសារឌីជីថល' : 'Digital Document Archive'}
            </h3>
            <p className="text-xs text-[#5E6C84] font-khmer leading-relaxed">
              {language === 'km'
                ? 'ស្វែងរកកំណត់ត្រាឯកសាររដ្ឋបាលតាមលេខកូដចុះបញ្ជី ប្រភេទឯកសារ ឬពាក្យគន្លឹះក្នុងអត្ថបទ។'
                : 'Search public records and archived documents by registration number, type, or keyword.'}
            </p>
            <div className="pt-2">
              <Link
                href="/documents"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2457A7] hover:underline font-khmer"
              >
                <span>{language === 'km' ? 'ចូលទៅកាន់បណ្ណសារ' : 'Open Archive'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* OCR ENGINE STATUS & IMAGE PREPROCESSING DIAGNOSTIC                        */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 bg-white border border-[#E5EAF0] rounded-xl shadow-[0_1px_3px_rgba(9,30,66,0.04)]">
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
                  {health?.status === 'online' || health?.status === 'ok' ? 'Online (HTTP 200)' : t.onlineStatus}
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
                <span className="font-mono text-[#00875A] font-semibold">Khmer + English (Dual)</span>
              </div>
              <div className="flex justify-between">
                <span>ម៉ូឌុលចាត់ថ្នាក់:</span>
                <span className="font-semibold text-[#172B4D]">Rule + ML Classifier</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-[#E5EAF0] rounded-xl shadow-[0_1px_3px_rgba(9,30,66,0.04)]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F5F7FA]">
              <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wider font-khmer">
                ការកែតម្រូវរូបភាព (OPENCV PIPELINE)
              </span>
              <span className="text-[10px] text-[#00875A] font-semibold bg-[#E3FCEF] px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-[#5E6C84]">
              <div className="flex justify-between">
                <span>បង្វិលតម្រង់ (Deskew):</span>
                <span className="font-mono text-[#172B4D] font-semibold">OpenCV MinAreaRect</span>
              </div>
              <div className="flex justify-between">
                <span>កម្រិតពន្លឺ (CLAHE Contrast):</span>
                <span className="font-mono text-[#172B4D] font-semibold">Adaptive Clip 2.0</span>
              </div>
              <div className="flex justify-between">
                <span>បំបាត់ស្នាម (Noise Filter):</span>
                <span className="font-mono text-[#172B4D] font-semibold">Bilateral Binarization</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-[#E5EAF0] rounded-xl shadow-[0_1px_3px_rgba(9,30,66,0.04)]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F5F7FA]">
              <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wider font-khmer">
                អត្រាជោគជ័យ និងភាពទុកចិត្ត
              </span>
              <TrendingUp className="w-4 h-4 text-[#00875A]" />
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-[#172B4D] font-mono">
                  {totalDocs > 0 ? Math.round((processedDocs / totalDocs) * 100) : 100}%
                </span>
                <span className="text-[10px] text-[#00875A] font-semibold font-khmer">
                  ដំណើរការជោគជ័យ
                </span>
              </div>
              <div className="w-full bg-[#E5EAF0] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#00875A] h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalDocs > 0 ? Math.round((processedDocs / totalDocs) * 100) : 100}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-[#7A869A] font-khmer">
                កម្រិតទំនុកចិត្តជាមធ្យម 0.90+ លើឯកសារច្បាស់
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RECENT OCR ACTIVITIES & AUDIT STREAM                                      */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <RecentDocumentsTable documents={documents} isLoading={isLoading} />
          </div>

          {/* Recent Audit Activities Stream */}
          <div className="bg-white border border-[#E5EAF0] rounded-xl shadow-[0_1px_3px_rgba(9,30,66,0.04)] p-4 sm:p-5 flex flex-col h-full">
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

            <div className="flex-1 overflow-y-auto max-h-[380px] pr-1">
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
                          {new Date(log.timestamp || Date.now()).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#172B4D] font-khmer truncate">
                        {typeof log.details === 'string'
                          ? log.details
                          : log.resource_id || log.resource_type || log.action}
                      </div>
                      <div className="text-[10px] text-[#5E6C84] flex items-center justify-between pt-0.5">
                        <span className="font-mono text-[#00875A] font-semibold">{log.user_id}</span>
                        <span className="text-[#00875A] font-semibold text-[10px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Recorded</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-[#F5F7FA] text-center">
              <span className="text-[10px] text-[#7A869A] font-khmer">
                កំណត់ត្រាសវនកម្មរដ្ឋបាលមិនអាចកែប្រែបានទេ (Immutable Audit Trail)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </Shell>
  );
}
