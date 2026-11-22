'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileScan,
  Receipt,
  ArrowRight,
  ShieldCheck,
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
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [archiveRes, healthRes, logsRes] = await Promise.allSettled([
          searchArchive({ page: 1, limit: 6 }),
          getHealthStatus(),
          getAuditLogs({ limit: 5 }),
        ]);

        if (!isMounted) return;

        if (archiveRes.status === 'fulfilled') {
          const items = archiveRes.value.items || [];
          setDocuments(items);
          setTotalDocs(archiveRes.value.total || 0);

          const processed = items.filter((d) => d.status === 'PROCESSED').length;
          setProcessedDocs(processed);
          setPendingDocs(items.filter((d) => d.status !== 'PROCESSED').length);
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
        {/* Welcome Institutional Banner: Responsive padding & button layout */}
        <div className="relative overflow-hidden bg-white border border-[#E2E8F0] rounded-xl sm:rounded-2xl p-4 sm:p-7 shadow-xs">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-1.5 sm:space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[11px] sm:text-xs font-semibold text-[#17365D]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2563A6]" strokeWidth={2} />
                <span className="font-khmer">
                  {language === 'km'
                    ? 'ប្រព័ន្ធគ្រប់គ្រងបណ្ណសារ និងសម្គាល់អត្ថបទឌីជីថលផ្លូវការ'
                    : 'Official Digital Document Archive & OCR Intelligence'}
                </span>
              </div>

              <h2 className="text-lg sm:text-2xl font-bold text-[#17365D] tracking-tight font-khmer">
                {language === 'km'
                  ? `សូមស្វាគមន៍មកកាន់ ${t.systemTitle}`
                  : `Welcome to ${t.systemTitle}`}
              </h2>

              <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl font-khmer leading-relaxed">
                {language === 'km'
                  ? 'ប្រព័ន្ធឌីជីថលសម្រាប់បំប្លែង ស្វែងរក និងផ្ទៀងផ្ទាត់ឯកសាររដ្ឋបាលកម្ពុជា (សំបុត្រកំណើត សៀវភៅគ្រួសារ អត្តសញ្ញាណប័ណ្ណ និងលិខិតផ្លូវការ) ដោយប្រើបច្ចេកវិទ្យា OCR ភាសាខ្មែរ និងអង់គ្លេស។'
                  : 'Enterprise system for digitizing, recognizing (dual Khmer & English OCR), classifying, and archiving Cambodian administrative records.'}
              </p>
            </div>

            {/* Quick Action Buttons: Stack on mobile with full width */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto pt-2 lg:pt-0">
              <Link
                href="/ocr"
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#17365D] hover:bg-[#0f2440] transition-colors shadow-xs w-full sm:w-auto"
              >
                <FileScan className="w-4 h-4" strokeWidth={2} />
                <span className="font-khmer">{t.startOcr}</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Link>

              <Link
                href="/receipts"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-[#17365D] bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] transition-colors w-full sm:w-auto"
              >
                <Receipt className="w-4 h-4 text-[#2563A6]" strokeWidth={2} />
                <span className="font-khmer">{t.quickScan}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Dynamic Statistics Cards */}
        <StatsCards
          total={totalDocs}
          processed={processedDocs}
          pending={pendingDocs}
          failed={0}
          health={health}
        />

        {/* Dashboard Grid: Recent Documents Table & Recent Audit Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <RecentDocumentsTable
              documents={documents}
              isLoading={isLoading}
            />
          </div>

          {/* Quick System & Audit Summary Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 sm:mb-4 border-b border-[#F1F5F9]">
                <h3 className="text-xs font-bold text-[#17365D] uppercase tracking-wider font-khmer">
                  {language === 'km' ? 'ព័ត៌មានម៉ាស៊ីន OCR ផ្លូវការ' : 'OCR Engine Specifications'}
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-[#F8FAFC]">
                  <span className="text-[#64748B] font-khmer">ម៉ាស៊ីនដំណើរការ</span>
                  <span className="font-semibold text-[#1E293B]">OpenCV + Tesseract</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#F8FAFC]">
                  <span className="text-[#64748B] font-khmer">ភាសាគាំទ្រ</span>
                  <span className="font-semibold text-[#1E293B] font-mono">khm + eng (Dual)</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#F8FAFC]">
                  <span className="text-[#64748B] font-khmer">ការសម្អាតរូបភាព</span>
                  <span className="font-semibold text-[#1E293B]">Deskew, CLAHE, Noise Filter</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[#64748B] font-khmer">ការទាញយកទិន្នន័យ</span>
                  <span className="font-semibold text-[#16A34A] font-khmer">ស្វ័យប្រវត្ត (Civil Reg)</span>
                </div>
              </div>
            </div>

            {/* Recent Audit Activities */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F1F5F9]">
                <h3 className="text-xs font-bold text-[#17365D] uppercase tracking-wider font-khmer">
                  {language === 'km' ? 'សកម្មភាពសវនកម្មថ្មីៗ' : 'Recent Audit Trail'}
                </h3>
                <Link
                  href="/audit"
                  className="text-[11px] font-semibold text-[#2563A6] hover:underline font-khmer"
                >
                  {t.viewAll}
                </Link>
              </div>

              {recentLogs.length === 0 ? (
                <p className="text-xs text-[#94A3B8] text-center py-4 font-khmer">
                  {t.noAuditLogsYet}
                </p>
              ) : (
                <div className="space-y-2.5">
                  {recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#F1F5F9] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#17365D] font-mono">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-[#94A3B8]">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] truncate">
                        Officer: {log.user_id} • Res: {log.resource_type}
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
