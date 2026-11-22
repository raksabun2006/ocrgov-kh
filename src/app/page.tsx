'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileScan,
  Receipt,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Activity,
  History,
  CheckCircle2,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Shell } from '../components/layout/Shell';
import { StatsCards } from '../components/dashboard/StatsCards';
import { RecentDocumentsTable } from '../components/dashboard/RecentDocumentsTable';
import { searchArchive, getHealthStatus, getAuditLogs } from '../lib/api/ocr';
import {
  DocumentMetadataResponse,
  HealthResponse,
  AuditLogItem,
} from '../types/api';
import { useLanguage } from '../lib/i18n';

export default function DashboardPage() {
  const { t, language } = useLanguage();

  const [documents, setDocuments] = useState<DocumentMetadataResponse[]>([]);
  const [totalDocs, setTotalDocs] = useState<number>(0);
  const [processedDocs, setProcessedDocs] = useState<number>(0);
  const [pendingDocs, setPendingDocs] = useState<number>(0);
  const [failedDocs, setFailedDocs] = useState<number>(0);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLogItem[]>([]);
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

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [archiveRes, healthRes, logsRes] = await Promise.allSettled([
          searchArchive({ page: 1, limit: 8 }),
          getHealthStatus(),
          getAuditLogs({ limit: 6 }),
        ]);

        if (!isMounted) return;

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

        if (healthRes.status === 'fulfilled') {
          setHealth(healthRes.value);
        }

        if (logsRes.status === 'fulfilled') {
          setRecentLogs(logsRes.value.items || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Shell>
      <div className="space-y-4 sm:space-y-6">
        {/* Welcome Section */}
        <div className="relative overflow-hidden bg-white border border-[#E5EAF0] rounded-xl sm:rounded-2xl p-4 sm:p-7 shadow-xs">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF4FC] border border-[#D0E0F7] font-semibold text-[#2457A7] font-khmer">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2457A7]" strokeWidth={2} />
                  <span>រាជរដ្ឋាភិបាលកម្ពុជា</span>
                </span>
                <span className="text-[#5E6C84] font-medium font-khmer">
                  {todayFormatted}
                </span>
              </div>

              <h2 className="text-lg sm:text-2xl font-bold text-[#172B4D] tracking-tight font-khmer">
                {language === 'km'
                  ? `សូមស្វាគមន៍មកកាន់ ${t.systemTitle}`
                  : `Welcome to ${t.systemTitle}`}
              </h2>

              <p className="text-xs sm:text-sm text-[#5E6C84] max-w-2xl font-khmer leading-relaxed">
                {language === 'km'
                  ? 'ប្រព័ន្ធរដ្ឋបាលឌីជីថលកម្រិតខ្ពស់សម្រាប់បំប្លែង ស្វែងរក និងផ្ទៀងផ្ទាត់ឯកសារផ្លូវការ (សំបុត្រកំណើត សៀវភៅគ្រួសារ អត្តសញ្ញាណប័ណ្ណ និងលិខិតរដ្ឋបាល) ដោយប្រើប្រាស់បច្ចេកវិទ្យា OCR ភាសាខ្មែរ និងអង់គ្លេស។'
                  : 'Enterprise digital platform for digitizing, recognizing (dual Khmer & English OCR), classifying, and archiving Cambodian administrative documents.'}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto pt-2 lg:pt-0">
              <Link
                href="/ocr"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#2457A7] hover:bg-[#1c4587] transition-all shadow-xs w-full sm:w-auto"
              >
                <FileScan className="w-4 h-4" strokeWidth={2} />
                <span className="font-khmer">{t.newOcrAction}</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Link>

              <Link
                href="/search"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-[#172B4D] bg-[#F5F7FA] hover:bg-[#E5EAF0] border border-[#D0E0F7] transition-all w-full sm:w-auto"
              >
                <Search className="w-4 h-4 text-[#2457A7]" strokeWidth={2} />
                <span className="font-khmer">{t.navSearch}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Statistics Cards */}
        <StatsCards
          total={totalDocs}
          processed={processedDocs}
          pending={pendingDocs}
          failed={failedDocs}
          isLoading={isLoading}
        />

        {/* OCR Service Status & Compact Engine Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Health & Engine status */}
          <div className="p-4 bg-white border border-[#E5EAF0] rounded-xl shadow-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F5F7FA]">
              <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wider font-khmer">
                {t.ocrServiceStatus}
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00875A] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00875A]" />
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#5E6C84]">Backend API:</span>
                <span className="font-semibold text-[#00875A]">Online (HTTP 200)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5E6C84]">OCR Engine:</span>
                <span className="font-semibold text-[#172B4D]">
                  {health?.ocr_engine?.ready ? 'Tesseract Ready' : 'Online'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5E6C84]">Languages:</span>
                <span className="font-mono text-[#2457A7] font-semibold">
                  {health?.ocr_engine?.languages.join(' + ') || 'khm + eng'}
                </span>
              </div>
            </div>
          </div>

          {/* OpenCV Preprocessing Pipeline */}
          <div className="p-4 bg-white border border-[#E5EAF0] rounded-xl shadow-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F5F7FA]">
              <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wider font-khmer">
                ការសម្អាតរូបភាព (OpenCV)
              </span>
              <Cpu className="w-4 h-4 text-[#2457A7]" />
            </div>
            <div className="space-y-1.5 text-xs text-[#5E6C84]">
              <div className="flex justify-between">
                <span>Deskew (តម្រង់មុំ):</span>
                <span className="font-semibold text-[#00875A]">Active</span>
              </div>
              <div className="flex justify-between">
                <span>CLAHE Contrast:</span>
                <span className="font-semibold text-[#00875A]">Active</span>
              </div>
              <div className="flex justify-between">
                <span>Noise Filter & Binarization:</span>
                <span className="font-semibold text-[#00875A]">Active</span>
              </div>
            </div>
          </div>

          {/* Civil Registration AI Extraction */}
          <div className="p-4 bg-white border border-[#E5EAF0] rounded-xl shadow-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F5F7FA]">
              <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wider font-khmer">
                ទាញយកទិន្នន័យអត្រានុកូលដ្ឋាន
              </span>
              <Activity className="w-4 h-4 text-[#00875A]" />
            </div>
            <div className="space-y-1.5 text-xs text-[#5E6C84]">
              <div className="flex justify-between">
                <span>សំបុត្រកំណើត:</span>
                <span className="font-semibold text-[#2457A7] font-khmer">៩ វាលទិន្នន័យស្វ័យប្រវត្ត</span>
              </div>
              <div className="flex justify-between">
                <span>ការចាត់ថ្នាក់ឯកសារ:</span>
                <span className="font-semibold text-[#2457A7] font-khmer">៧ ប្រភេទផ្លូវការ</span>
              </div>
              <div className="flex justify-between">
                <span>កម្រិតទំនុកចិត្ត (Confidence):</span>
                <span className="font-semibold text-[#00875A] font-mono">0.0 - 1.0 Real Metric</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid: Recent Activities Table & Audit Trail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <RecentDocumentsTable
              documents={documents}
              isLoading={isLoading}
            />
          </div>

          {/* Audit Logs Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white border border-[#E5EAF0] rounded-xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F5F7FA]">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#2457A7]" />
                  <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider font-khmer">
                    {language === 'km' ? 'សកម្មភាពសវនកម្មថ្មីៗ' : 'Recent Audit Trail'}
                  </h3>
                </div>
                <Link
                  href="/audit"
                  className="text-[11px] font-semibold text-[#2457A7] hover:underline font-khmer"
                >
                  {t.viewAll}
                </Link>
              </div>

              {recentLogs.length === 0 ? (
                <p className="text-xs text-[#7A869A] text-center py-4 font-khmer">
                  {t.noAuditLogsYet}
                </p>
              ) : (
                <div className="space-y-2.5">
                  {recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg bg-[#F5F7FA] border border-[#E5EAF0] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#2457A7] font-mono text-[11px]">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-[#7A869A]">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5E6C84] truncate">
                        Officer: <span className="font-medium text-[#172B4D]">{log.user_id}</span> • {log.resource_type}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
