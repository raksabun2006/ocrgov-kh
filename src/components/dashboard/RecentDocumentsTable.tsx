'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Search,
  Download,
} from 'lucide-react';
import { DocumentMetadataResponse } from '../../types/api';
import { DOCUMENT_TYPE_LABELS } from '../../lib/config';
import { getDocumentFileUrl } from '../../lib/api/ocr';
import { useLanguage } from '../../lib/i18n';
import { SkeletonTable } from '../ui/LoadingSkeleton';
import { EmptyState } from '../ui/EmptyState';

interface RecentDocumentsTableProps {
  documents: DocumentMetadataResponse[];
  isLoading: boolean;
}

export function RecentDocumentsTable({
  documents,
  isLoading,
}: RecentDocumentsTableProps) {
  const { t, language } = useLanguage();
  const [filterText, setFilterText] = useState('');

  const filtered = documents.filter((doc) =>
    doc.original_filename.toLowerCase().includes(filterText.toLowerCase()) ||
    doc.document_type.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="bg-white border border-[#E5EAF0] rounded-xl shadow-xs overflow-hidden">
      {/* Table Header with Search & View All */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-[#E5EAF0] bg-white">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#2457A7]" strokeWidth={2} />
          <h3 className="text-xs sm:text-sm font-bold text-[#172B4D] uppercase tracking-wider font-khmer">
            {t.recentActivity}
          </h3>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="ស្វែងរកក្នុងតារាង..."
              className="w-full sm:w-48 text-base sm:text-xs bg-[#F5F7FA] border border-[#D0E0F7] rounded-md pl-7 pr-2.5 py-1.5 sm:py-1 text-[#172B4D] font-khmer focus:outline-hidden focus:ring-1 focus:ring-[#2457A7]"
            />
            <Search className="w-3.5 h-3.5 text-[#5E6C84] absolute left-2 top-2.5 sm:top-2 pointer-events-none" />
          </div>

          <Link
            href="/documents"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#2457A7] hover:underline font-khmer whitespace-nowrap flex-shrink-0"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
          </Link>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-4">
            <SkeletonTable rows={5} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={t.noDocumentsYet}
            description="ផ្ទុកឡើងឯកសារថ្មីដើម្បីចាប់ផ្តើមដំណើរការ OCR និងរក្សាទុកក្នុងបណ្ណសារ"
            action={
              <Link
                href="/ocr"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2457A7] text-white text-xs font-semibold hover:bg-[#1c4587] font-khmer shadow-xs"
              >
                <span>{t.startOcr}</span>
              </Link>
            }
          />
        ) : (
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-[#E5EAF0] bg-[#F5F7FA] text-[11px] font-semibold text-[#5E6C84] uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-5 font-khmer">ឈ្មោះឯកសារ</th>
                <th className="py-3 px-3 sm:px-4 font-khmer">{t.documentTypeLabel}</th>
                <th className="py-3 px-3 sm:px-4 font-khmer">{t.statusLabel}</th>
                <th className="py-3 px-3 sm:px-4 font-khmer">{t.confidenceScore}</th>
                <th className="py-3 px-3 sm:px-4 font-khmer">{t.uploadedAt}</th>
                <th className="py-3 px-4 sm:px-5 text-right font-khmer">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAF0] text-xs">
              {filtered.map((doc) => {
                const typeLabel =
                  DOCUMENT_TYPE_LABELS[doc.document_type]?.km || doc.document_type;
                const isProcessed = doc.status === 'PROCESSED';

                return (
                  <tr key={doc.document_id} className="hover:bg-[#F5F7FA] transition-colors">
                    <td className="py-3 px-4 sm:px-5 font-semibold text-[#172B4D]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#5E6C84] flex-shrink-0" strokeWidth={1.75} />
                        <span className="truncate max-w-[200px] sm:max-w-[240px]" title={doc.original_filename}>
                          {doc.original_filename}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 sm:px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#EFF4FC] text-[#2457A7] border border-[#D0E0F7] font-khmer whitespace-nowrap">
                        {typeLabel}
                      </span>
                    </td>

                    <td className="py-3 px-3 sm:px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap ${
                          isProcessed
                            ? 'bg-[#E3FCEF] text-[#00875A] border-[#ABF5D1]'
                            : 'bg-[#FFF0B3] text-[#FF991F] border-[#FFE58F]'
                        }`}
                      >
                        {isProcessed ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span>{doc.status}</span>
                      </span>
                    </td>

                    <td className="py-3 px-3 sm:px-4 font-mono font-medium text-[#172B4D]">
                      {doc.average_confidence !== null
                        ? `${(doc.average_confidence * 100).toFixed(0)}%`
                        : '—'}
                    </td>

                    <td className="py-3 px-3 sm:px-4 text-[#5E6C84] whitespace-nowrap">
                      {new Date(doc.created_at).toLocaleDateString(
                        language === 'km' ? 'km-KH' : 'en-US',
                        { month: 'short', day: 'numeric', year: 'numeric' }
                      )}
                    </td>

                    <td className="py-3 px-4 sm:px-5 text-right whitespace-nowrap space-x-1">
                      <Link
                        href={`/verify/${doc.document_id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#F5F7FA] text-[#2457A7] hover:bg-[#E5EAF0] font-khmer transition-colors"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>{t.actionVerify}</span>
                      </Link>

                      <a
                        href={getDocumentFileUrl(doc.document_id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center p-1 rounded-md text-[#5E6C84] hover:text-[#2457A7]"
                        title="Download file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
