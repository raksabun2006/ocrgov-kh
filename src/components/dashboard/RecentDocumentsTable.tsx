'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  Eye,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { DocumentMetadataResponse } from '../../types/api';
import { DOCUMENT_TYPE_LABELS } from '../../lib/config';
import { useLanguage } from '../../lib/i18n';

interface RecentDocumentsTableProps {
  documents: DocumentMetadataResponse[];
  isLoading: boolean;
}

export function RecentDocumentsTable({
  documents,
  isLoading,
}: RecentDocumentsTableProps) {
  const { t, language } = useLanguage();

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(language === 'km' ? 'km-KH' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0] bg-white">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#17365D]" strokeWidth={2} />
          <h3 className="text-sm font-bold text-[#17365D] uppercase tracking-wider font-khmer">
            {t.recentActivity}
          </h3>
        </div>

        <Link
          href="/documents"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563A6] hover:text-[#17365D] font-khmer"
        >
          <span>{t.viewAll}</span>
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
        </Link>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
              <th className="py-3 px-5 font-khmer">ឈ្មោះឯកសារ</th>
              <th className="py-3 px-4 font-khmer">{t.documentTypeLabel}</th>
              <th className="py-3 px-4 font-khmer">{t.statusLabel}</th>
              <th className="py-3 px-4 font-khmer">{t.confidenceScore}</th>
              <th className="py-3 px-4 font-khmer">{t.uploadedAt}</th>
              <th className="py-3 px-5 text-right font-khmer">សកម្មភាព</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9] text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#64748B]">
                  <div className="inline-flex items-center gap-2 font-khmer">
                    <svg className="animate-spin h-4 w-4 text-[#17365D]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>កំពុងទាញយកទិន្នន័យ...</span>
                  </div>
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[#94A3B8] font-khmer">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="w-8 h-8 stroke-1 mb-2 text-[#CBD5E1]" />
                    <p>{t.noDocumentsYet}</p>
                    <Link
                      href="/ocr"
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#17365D] text-white text-xs font-semibold hover:bg-[#0f2440]"
                    >
                      <span>{t.startOcr}</span>
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              documents.map((doc) => {
                const typeLabel =
                  DOCUMENT_TYPE_LABELS[doc.document_type]?.km || doc.document_type;
                const isProcessed = doc.status === 'PROCESSED';

                return (
                  <tr key={doc.document_id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-5 font-medium text-[#1E293B]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#64748B] flex-shrink-0" strokeWidth={1.75} />
                        <span className="truncate max-w-[220px]" title={doc.original_filename}>
                          {doc.original_filename}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#EFF6FF] text-[#17365D] border border-[#BFDBFE] font-khmer">
                        {typeLabel}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                          isProcessed
                            ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                            : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
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

                    <td className="py-3 px-4 font-mono font-medium text-[#1E293B]">
                      {doc.average_confidence !== null
                        ? `${(doc.average_confidence * 100).toFixed(1)}%`
                        : '—'}
                    </td>

                    <td className="py-3 px-4 text-[#64748B]">
                      {formatDate(doc.created_at)}
                    </td>

                    <td className="py-3 px-5 text-right space-x-1.5">
                      <Link
                        href={`/verify/${doc.document_id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#F1F5F9] text-[#17365D] hover:bg-[#E2E8F0] font-khmer"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>{t.actionVerify}</span>
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
