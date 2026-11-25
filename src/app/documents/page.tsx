'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
  RotateCcw,
} from 'lucide-react';
import { Shell } from '../../components/layout/Shell';
import { searchArchive, deleteDocument, getDocumentFileUrl } from '../../lib/api/ocr';
import { DocumentMetadataResponse, DocumentTypeEnum } from '../../types/api';
import { DOCUMENT_TYPE_LABELS } from '../../lib/config';
import { useLanguage } from '../../lib/i18n';
import { useAuth } from '../../lib/auth-context';
import { SkeletonTable } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';

export default function DocumentsArchivePage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [documents, setDocuments] = useState<DocumentMetadataResponse[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalDoc, setDeleteModalDoc] = useState<DocumentMetadataResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
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
    } catch (err: unknown) {
      console.error('Failed to load archive documents', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load archive documents. Please check backend connection.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchQuery, selectedType, selectedStatus]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDocuments();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setSelectedStatus('');
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteModalDoc) return;
    setIsDeleting(true);
    try {
      await deleteDocument(deleteModalDoc.document_id, user?.username || 'officer');
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 sm:pb-4 border-b border-[#E5EAF0]">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[#5E6C84] mb-1">
              <Link href="/" className="hover:text-[#2457A7] font-khmer">
                {t.navDashboard}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#2457A7] font-semibold font-khmer">
                {t.navDocuments}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-[#172B4D] font-khmer flex items-center gap-2">
              <FolderArchive className="w-6 h-6 text-[#2457A7]" strokeWidth={2} />
              <span>{t.navDocuments}</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#EFF4FC] text-[#2457A7] border border-[#D0E0F7] font-khmer">
              {total} {language === 'km' ? 'ឯកសារក្នុងបណ្ណសារ' : 'Archived Records'}
            </span>

            <Link
              href="/ocr"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#2457A7] text-white hover:bg-[#1c4587] font-khmer shadow-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t.startOcr}</span>
            </Link>
          </div>
        </div>

        {/* Feedback Alert */}
        {actionMessage && (
          <div className="p-3.5 rounded-xl bg-[#EFF4FC] border border-[#D0E0F7] text-xs font-semibold text-[#2457A7] font-khmer flex items-center justify-between">
            <span>{actionMessage}</span>
            <button
              onClick={() => setActionMessage(null)}
              className="text-[#5E6C84] hover:text-[#172B4D] text-xs"
            >
              ×
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white border border-[#E5EAF0] rounded-xl p-3.5 sm:p-5 shadow-[0_1px_3px_rgba(9,30,66,0.04)]">
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
                className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-base sm:text-xs bg-[#F5F7FA] border border-[#D0E0F7] rounded-lg text-[#172B4D] focus:ring-1 focus:ring-[#2457A7] font-khmer"
              />
              <Search className="w-4 h-4 text-[#5E6C84] absolute left-3 top-3.5 sm:top-2.5 pointer-events-none" />
            </div>

            {/* Document Type Dropdown */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs bg-[#F5F7FA] border border-[#D0E0F7] rounded-lg text-[#172B4D] focus:ring-1 focus:ring-[#2457A7] font-khmer"
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
                className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs bg-[#F5F7FA] border border-[#D0E0F7] rounded-lg text-[#172B4D] focus:ring-1 focus:ring-[#2457A7] font-khmer"
              >
                <option value="">គ្រប់ស្ថានភាព (All Statuses)</option>
                <option value="PROCESSED">PROCESSED (ជោគជ័យ)</option>
                <option value="NEEDS_VERIFICATION">NEEDS_VERIFICATION (រង់ចាំផ្ទៀងផ្ទាត់)</option>
                <option value="FAILED">FAILED (បរាជ័យ)</option>
              </select>
            </div>

            {/* Search and Reset Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-xs font-semibold rounded-lg bg-[#2457A7] text-white hover:bg-[#1c4587] font-khmer shadow-xs transition-colors"
              >
                ស្វែងរក
              </button>
              {(searchQuery || selectedType || selectedStatus) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-[#F5F7FA] text-[#5E6C84] hover:bg-[#E5EAF0] border border-[#E5EAF0] transition-colors"
                  title="Reset filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Error State with Retry Button */}
        {error && (
          <ErrorState
            title="បញ្ហាក្នុងការទាញយកបណ្ណសារឯកសារ"
            message={error}
            onRetry={fetchDocuments}
          />
        )}

        {/* Document Records Table */}
        <div className="bg-white border border-[#E5EAF0] rounded-xl shadow-[0_1px_3px_rgba(9,30,66,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-4 sm:p-6">
                <SkeletonTable rows={8} />
              </div>
            ) : documents.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  icon={FolderArchive}
                  title={t.noDocumentsYet}
                  description={
                    searchQuery || selectedType || selectedStatus
                      ? 'រកមិនឃើញឯកសារដែលត្រូវនឹងលក្ខខណ្ឌស្វែងរកទេ។ សូមព្យាយាមប្តូរពាក្យគន្លឹះ ឬសម្អាតតម្រង។'
                      : 'មិនទាន់មានឯកសារក្នុងបណ្ណសារនៅឡើយទេ។ សូមចាប់ផ្តើមដំណើរការ OCR ឯកសារថ្មី។'
                  }
                  action={
                    searchQuery || selectedType || selectedStatus ? (
                      <button
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F5F7FA] text-[#2457A7] border border-[#D0E0F7] text-xs font-semibold hover:bg-[#EFF4FC] font-khmer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>សម្អាតតម្រង (Reset Filters)</span>
                      </button>
                    ) : (
                      <Link
                        href="/ocr"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2457A7] text-white text-xs font-semibold hover:bg-[#1c4587] font-khmer shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{t.startOcr}</span>
                      </Link>
                    )
                  }
                />
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[720px]">
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
                  {documents.map((doc) => {
                    const typeLabel =
                      DOCUMENT_TYPE_LABELS[doc.document_type]?.km || doc.document_type;
                    const isProcessed = doc.status === 'PROCESSED';

                    return (
                      <tr key={doc.document_id} className="hover:bg-[#F5F7FA] transition-colors">
                        <td className="py-3 px-4 sm:px-5 font-medium text-[#172B4D]">
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-[#2457A7] flex-shrink-0" strokeWidth={1.75} />
                            <div className="min-w-0">
                              <p className="truncate max-w-[180px] sm:max-w-[260px] font-semibold text-[#172B4D]" title={doc.original_filename}>
                                {doc.original_filename}
                              </p>
                              <span className="text-[10px] text-[#7A869A] font-mono">
                                ID: {doc.document_id.slice(0, 8)}...
                              </span>
                            </div>
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
                            <span>{doc.status}</span>
                          </span>
                        </td>

                        <td className="py-3 px-3 sm:px-4 font-mono font-medium text-[#172B4D]">
                          {doc.average_confidence !== null
                            ? `${(doc.average_confidence * 100).toFixed(0)}%`
                            : '—'}
                        </td>

                        <td className="py-3 px-3 sm:px-4 text-[#5E6C84] whitespace-nowrap font-mono text-[11px]">
                          {new Date(doc.created_at).toLocaleDateString(
                            language === 'km' ? 'km-KH' : 'en-US',
                            { month: 'short', day: 'numeric', year: 'numeric' }
                          )}
                        </td>

                        <td className="py-3 px-4 sm:px-5 text-right whitespace-nowrap space-x-1">
                          <Link
                            href={`/verify/${doc.document_id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#F5F7FA] text-[#2457A7] hover:bg-[#EFF4FC] border border-[#D0E0F7] font-khmer transition-colors"
                            title="Verify document fields"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{t.actionVerify}</span>
                          </Link>

                          <a
                            href={getDocumentFileUrl(doc.document_id)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center p-1.5 rounded-md text-[#5E6C84] hover:text-[#2457A7] hover:bg-[#EFF4FC] transition-colors"
                            title="Download original file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => setDeleteModalDoc(doc)}
                            className="inline-flex items-center p-1.5 rounded-md text-[#5E6C84] hover:text-[#DE350B] hover:bg-[#FFEBE6] transition-colors"
                            title="Delete document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t border-[#E5EAF0] bg-white text-xs">
              <span className="text-[#5E6C84] font-khmer">
                {language === 'km'
                  ? `ទំព័រទី ${page} នៃ ${totalPages} (សរុប ${total} ឯកសារ)`
                  : `Page ${page} of ${totalPages} (${total} total records)`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page <= 1 || isLoading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D0E0F7] bg-white text-[#172B4D] hover:bg-[#F5F7FA] disabled:opacity-40 disabled:cursor-not-allowed font-khmer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>មុន (Prev)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page >= totalPages || isLoading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D0E0F7] bg-white text-[#172B4D] hover:bg-[#F5F7FA] disabled:opacity-40 disabled:cursor-not-allowed font-khmer"
                >
                  <span>បន្ទាប់ (Next)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModalDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5EAF0] p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFEBE6] text-[#DE350B] flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#172B4D] font-khmer">
                    បញ្ជាក់ការលុបឯកសាររដ្ឋបាល
                  </h3>
                  <p className="text-xs text-[#5E6C84] font-khmer mt-0.5">
                    តើអ្នកពិតជាចង់លុបឯកសារ <strong className="text-[#172B4D]">{deleteModalDoc.original_filename}</strong> ចេញពីប្រព័ន្ធមែនទេ?
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#F5F7FA] rounded-lg text-xs text-[#5E6C84] space-y-1">
                <div>Document ID: <code className="font-mono text-[#172B4D]">{deleteModalDoc.document_id}</code></div>
                <div>SHA-256: <code className="font-mono text-[10px] break-all">{deleteModalDoc.sha256_hash}</code></div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalDoc(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#E5EAF0] bg-white text-[#5E6C84] hover:bg-[#F5F7FA] font-khmer"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#DE350B] text-white hover:bg-[#bf2600] font-khmer shadow-xs"
                >
                  {isDeleting ? 'កំពុងលុប...' : 'លុបចេញ (Confirm Delete)'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
