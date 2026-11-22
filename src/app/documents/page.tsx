'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FolderArchive,
  Search,
  FileText,
  Download,
  Trash2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { Shell } from '../../components/layout/Shell';
import { searchArchive, deleteDocument, getDocumentFileUrl } from '../../lib/api/ocr';
import { DocumentMetadataResponse, DocumentTypeEnum } from '../../types/api';
import { DOCUMENT_TYPE_LABELS } from '../../lib/config';
import { useLanguage } from '../../lib/i18n';
import { useAuth } from '../../lib/auth-context';

export default function DocumentsArchivePage() {
  const { t, language } = useLanguage();
  const { officer } = useAuth();

  const [documents, setDocuments] = useState<DocumentMetadataResponse[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deleteModalDoc, setDeleteModalDoc] = useState<DocumentMetadataResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      const res = await searchArchive({
        query: searchQuery || undefined,
        document_type: selectedType || undefined,
        status: selectedStatus || undefined,
        page,
        limit,
      });
      setDocuments(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error('Failed to load archive documents', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [page, limit, selectedType, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDocuments();
  };

  const handleDelete = async () => {
    if (!deleteModalDoc) return;
    setIsDeleting(true);
    try {
      await deleteDocument(deleteModalDoc.document_id, officer.name);
      setActionMessage(
        language === 'km'
          ? `បានលុបឯកសារ ${deleteModalDoc.original_filename} ដោយជោគជ័យ`
          : `Document ${deleteModalDoc.original_filename} successfully deleted.`
      );
      setDeleteModalDoc(null);
      fetchDocuments();
    } catch (err: unknown) {
      setActionMessage(
        err instanceof Error ? err.message : 'Failed to delete document'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const documentTypes: DocumentTypeEnum[] = [
    'BIRTH_CERTIFICATE',
    'FAMILY_BOOK',
    'IDENTITY_CARD',
    'ADMINISTRATIVE_LETTER',
    'APPLICATION_FORM',
    'OFFICIAL_CERTIFICATE',
    'UNKNOWN',
  ];

  return (
    <Shell>
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 sm:pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[#64748B] mb-1">
              <Link href="/" className="hover:text-[#17365D] font-khmer">
                {t.navDashboard}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#17365D] font-semibold font-khmer">
                {t.navDocuments}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-[#17365D] font-khmer">
              {t.navDocuments}
            </h1>
          </div>

          <Link
            href="/ocr"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#17365D] text-white hover:bg-[#0f2440] font-khmer shadow-xs w-full sm:w-auto"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t.startOcr}</span>
          </Link>
        </div>

        {/* Feedback Alert */}
        {actionMessage && (
          <div className="p-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-semibold text-[#17365D] font-khmer">
            {actionMessage}
          </div>
        )}

        {/* Search & Filter Bar: Stacks on mobile */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 sm:p-4 shadow-xs">
          <form
            onSubmit={handleSearchSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3"
          >
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ស្វែងរកតាមឈ្មោះឯកសារ..."
                className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-base sm:text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#1E293B] focus:ring-2 focus:ring-[#2457A7] font-khmer"
              />
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-3.5 sm:top-2.5 pointer-events-none" />
            </div>

            {/* Document Type Dropdown */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#1E293B] focus:ring-2 focus:ring-[#2457A7] font-khmer"
              >
                <option value="">គ្រប់ប្រភេទឯកសារ (All Types)</option>
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {DOCUMENT_TYPE_LABELS[type]?.km || type} ({type})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#1E293B] focus:ring-2 focus:ring-[#2457A7] font-khmer"
              >
                <option value="">គ្រប់ស្ថានភាព (All Statuses)</option>
                <option value="PROCESSED">PROCESSED (ជោគជ័យ)</option>
                <option value="NEEDS_VERIFICATION">NEEDS_VERIFICATION (រង់ចាំផ្ទៀងផ្ទាត់)</option>
                <option value="FAILED">FAILED (បរាជ័យ)</option>
              </select>
            </div>

            {/* Search Button */}
            <div>
              <button
                type="submit"
                className="w-full px-4 py-2 text-xs font-semibold rounded-lg bg-[#17365D] text-white hover:bg-[#0f2440] font-khmer shadow-xs transition-colors"
              >
                ស្វែងរក (Search)
              </button>
            </div>
          </form>
        </div>

        {/* Document Records Table: Horizontal scroll for mobile */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-5 font-khmer">ឈ្មោះឯកសារ</th>
                  <th className="py-3 px-3 sm:px-4 font-khmer">{t.documentTypeLabel}</th>
                  <th className="py-3 px-3 sm:px-4 font-khmer">{t.statusLabel}</th>
                  <th className="py-3 px-3 sm:px-4 font-khmer">{t.confidenceScore}</th>
                  <th className="py-3 px-3 sm:px-4 font-khmer">{t.uploadedAt}</th>
                  <th className="py-3 px-4 sm:px-5 text-right font-khmer">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#64748B]">
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
                    <td colSpan={6} className="py-12 text-center text-[#94A3B8] font-khmer">
                      <div className="flex flex-col items-center justify-center p-4">
                        <FolderArchive className="w-10 h-10 stroke-1 mb-2 text-[#CBD5E1]" />
                        <p className="text-sm font-semibold text-[#475569]">{t.noDocumentsYet}</p>
                        <p className="text-xs text-[#94A3B8] mt-1">
                          ផ្ទុកឡើងឯកសារថ្មីដើម្បីចាប់ផ្តើមដំណើរការ OCR
                        </p>
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
                        <td className="py-3 px-4 sm:px-5 font-medium text-[#1E293B]">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#17365D] flex-shrink-0" strokeWidth={1.75} />
                            <div className="min-w-0">
                              <p className="truncate max-w-[180px] sm:max-w-[240px] font-semibold text-[#1E293B]" title={doc.original_filename}>
                                {doc.original_filename}
                              </p>
                              <span className="text-[10px] text-[#94A3B8] font-mono">
                                ID: {doc.document_id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 sm:px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#EFF6FF] text-[#17365D] border border-[#BFDBFE] font-khmer whitespace-nowrap">
                            {typeLabel}
                          </span>
                        </td>

                        <td className="py-3 px-3 sm:px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap ${
                              isProcessed
                                ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                                : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                            }`}
                          >
                            <span>{doc.status}</span>
                          </span>
                        </td>

                        <td className="py-3 px-3 sm:px-4 font-mono font-medium text-[#1E293B]">
                          {doc.average_confidence !== null
                            ? `${(doc.average_confidence * 100).toFixed(0)}%`
                            : '—'}
                        </td>

                        <td className="py-3 px-3 sm:px-4 text-[#64748B] whitespace-nowrap">
                          {new Date(doc.created_at).toLocaleDateString(
                            language === 'km' ? 'km-KH' : 'en-US',
                            { month: 'short', day: 'numeric', year: 'numeric' }
                          )}
                        </td>

                        <td className="py-3 px-4 sm:px-5 text-right whitespace-nowrap space-x-1">
                          <Link
                            href={`/verify/${doc.document_id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#F1F5F9] text-[#17365D] hover:bg-[#E2E8F0] font-khmer transition-colors"
                            title="Verify document fields"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span className="hidden xs:inline">{t.actionVerify}</span>
                          </Link>

                          <a
                            href={getDocumentFileUrl(doc.document_id)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center p-1 rounded-md text-[#64748B] hover:text-[#17365D] hover:bg-[#F1F5F9] transition-colors"
                            title="Download original file"
                          >
                            <Download className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => setDeleteModalDoc(doc)}
                            className="inline-flex items-center p-1 rounded-md text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
                            title="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer: Touch friendly */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] text-xs">
              <span className="text-[#64748B] font-khmer text-[11px] sm:text-xs">
                ទំព័រ {page} នៃ {totalPages} (សរុប {total} ឯកសារ)
              </span>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="p-1.5 rounded-md border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F1F5F9] disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  className="p-1.5 rounded-md border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F1F5F9] disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModalDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-[#CBD5E1]">
              <div className="flex items-center gap-3 text-[#DC2626] mb-3">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <h3 className="text-base font-bold font-khmer">
                  {t.deleteConfirm}
                </h3>
              </div>
              <p className="text-xs text-[#64748B] mb-2 font-khmer leading-relaxed">
                {t.deleteWarning}
              </p>
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs font-mono mb-5 truncate">
                <p className="font-semibold text-[#1E293B] truncate">
                  {deleteModalDoc.original_filename}
                </p>
                <p className="text-[#64748B] text-[10px]">
                  ID: {deleteModalDoc.document_id}
                </p>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeleteModalDoc(null)}
                  disabled={isDeleting}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9] font-khmer"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#DC2626] text-white hover:bg-[#B91C1C] font-khmer shadow-xs"
                >
                  {isDeleting ? 'កំពុងលុប...' : t.actionDelete}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
