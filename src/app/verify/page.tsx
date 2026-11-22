'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  ShieldCheck,
  FileText,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Shell } from '../../components/layout/Shell';
import { searchArchive } from '../../lib/api/ocr';
import { DocumentMetadataResponse } from '../../types/api';
import { DOCUMENT_TYPE_LABELS } from '../../lib/config';
import { useLanguage } from '../../lib/i18n';
import { SkeletonTable } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export default function VerificationQueuePage() {
  const { t, language } = useLanguage();

  const [documents, setDocuments] = useState<DocumentMetadataResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('');

  useEffect(() => {
    async function loadQueue() {
      setIsLoading(true);
      try {
        const res = await searchArchive({
          document_type: filterType || undefined,
          limit: 30,
        });
        setDocuments(res.items || []);
      } catch (err) {
        console.error('Failed to load verification queue', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadQueue();
  }, [filterType]);

  const pendingDocs = documents.filter((d) => d.status !== 'PROCESSED');
  const verifiedDocs = documents.filter((d) => d.status === 'PROCESSED');

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#E5EAF0]">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#172B4D] font-khmer flex items-center gap-2.5">
              <CheckSquare className="w-6 h-6 text-[#2457A7]" strokeWidth={2} />
              <span>{t.navVerify}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#5E6C84] mt-1 font-khmer">
              {language === 'km'
                ? 'ផ្ទាំងគ្រប់គ្រងការត្រួតពិនិត្យ និងផ្ទៀងផ្ទាត់ទិន្នន័យស្រង់ចេញដោយមន្ត្រីរដ្ឋបាល'
                : 'Administrative officer queue for reviewing and verifying extracted OCR documents'}
            </p>
          </div>
        </div>

        {/* Verification Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-[#E5EAF0] rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#5E6C84] mb-2 font-khmer">
              <span>រង់ចាំការផ្ទៀងផ្ទាត់</span>
              <Clock className="w-4 h-4 text-[#FF991F]" />
            </div>
            <span className="text-2xl font-bold font-mono text-[#172B4D]">
              {pendingDocs.length}
            </span>
          </div>

          <div className="p-4 bg-white border border-[#E5EAF0] rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#5E6C84] mb-2 font-khmer">
              <span>បានផ្ទៀងផ្ទាត់រួចរាល់</span>
              <CheckCircle2 className="w-4 h-4 text-[#00875A]" />
            </div>
            <span className="text-2xl font-bold font-mono text-[#172B4D]">
              {verifiedDocs.length}
            </span>
          </div>

          <div className="p-4 bg-white border border-[#E5EAF0] rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#5E6C84] mb-2 font-khmer">
              <span>ឯកសារទាំងអស់ក្នុងជួរ</span>
              <FileText className="w-4 h-4 text-[#2457A7]" />
            </div>
            <span className="text-2xl font-bold font-mono text-[#172B4D]">
              {documents.length}
            </span>
          </div>
        </div>

        {/* Verification Queue Table */}
        <div className="bg-white border border-[#E5EAF0] rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E5EAF0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider font-khmer">
              {t.verificationQueue}
            </h3>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#5E6C84]" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-xs bg-[#F5F7FA] border border-[#D0E0F7] rounded-md px-2.5 py-1 text-[#172B4D] font-khmer"
              >
                <option value="">គ្រប់ប្រភេទឯកសារ (All Types)</option>
                <option value="BIRTH_CERTIFICATE">សំបុត្រកំណើត (Birth Certificate)</option>
                <option value="FAMILY_BOOK">សៀវភៅគ្រួសារ (Family Book)</option>
                <option value="IDENTITY_CARD">អត្តសញ្ញាណប័ណ្ណ (National ID)</option>
                <option value="ADMINISTRATIVE_LETTER">លិខិតរដ្ឋបាល (Admin Letter)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-4">
                <SkeletonTable rows={5} />
              </div>
            ) : documents.length === 0 ? (
              <EmptyState
                icon={CheckSquare}
                title="មិនមានឯកសារនៅក្នុងជួរផ្ទៀងផ្ទាត់នៅឡើយទេ"
                description="ឯកសារដែលបានផ្ទុកឡើងនឹងបង្ហាញនៅទីនេះសម្រាប់មន្ត្រីពិនិត្យ និងកែតម្រូវទិន្នន័យ"
                action={
                  <Link
                    href="/ocr"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2457A7] text-white text-xs font-semibold hover:bg-[#1c4587] font-khmer"
                  >
                    <span>{t.startOcr}</span>
                  </Link>
                }
              />
            ) : (
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-[#E5EAF0] bg-[#F5F7FA] text-[11px] font-semibold text-[#5E6C84] uppercase tracking-wider">
                    <th className="py-3 px-5 font-khmer">ឈ្មោះឯកសារ</th>
                    <th className="py-3 px-4 font-khmer">ប្រភេទ</th>
                    <th className="py-3 px-4 font-khmer">ស្ថានភាព</th>
                    <th className="py-3 px-4 font-khmer">ទំនុកចិត្ត OCR</th>
                    <th className="py-3 px-4 font-khmer">កាលបរិច្ឆេទ</th>
                    <th className="py-3 px-5 text-right font-khmer">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EAF0] text-xs">
                  {documents.map((doc) => {
                    const isProcessed = doc.status === 'PROCESSED';
                    const typeLabel =
                      DOCUMENT_TYPE_LABELS[doc.document_type]?.km || doc.document_type;

                    return (
                      <tr key={doc.document_id} className="hover:bg-[#F5F7FA] transition-colors">
                        <td className="py-3 px-5 font-semibold text-[#172B4D]">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#2457A7] flex-shrink-0" />
                            <span className="truncate max-w-[220px]" title={doc.original_filename}>
                              {doc.original_filename}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#EFF4FC] text-[#2457A7] border border-[#D0E0F7] font-khmer">
                            {typeLabel}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                              isProcessed
                                ? 'bg-[#E3FCEF] text-[#00875A] border-[#ABF5D1]'
                                : 'bg-[#FFF0B3] text-[#FF991F] border-[#FFE58F]'
                            }`}
                          >
                            <span>{doc.status}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono font-medium text-[#172B4D]">
                          {doc.average_confidence !== null
                            ? `${(doc.average_confidence * 100).toFixed(0)}%`
                            : '—'}
                        </td>

                        <td className="py-3 px-4 text-[#5E6C84]">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-5 text-right">
                          <Link
                            href={`/verify/${doc.document_id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#2457A7] text-white hover:bg-[#1c4587] font-khmer shadow-xs"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>ផ្ទៀងផ្ទាត់ (Verify)</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
