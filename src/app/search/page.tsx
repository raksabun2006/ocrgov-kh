'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  FileText,
  ShieldCheck,
  Download,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { Shell } from '../../components/layout/Shell';
import { searchArchive, getDocumentFileUrl } from '../../lib/api/ocr';
import { DocumentMetadataResponse, DocumentTypeEnum } from '../../types/api';
import { DOCUMENT_TYPE_LABELS } from '../../lib/config';
import { useLanguage } from '../../lib/i18n';
import { SkeletonTable } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export default function AdvancedSearchPage() {
  const { t, language } = useLanguage();

  const [query, setQuery] = useState('');
  const [docType, setDocType] = useState<string>('');
  const [regNumber, setRegNumber] = useState('');
  const [status, setStatus] = useState<string>('');
  const [results, setResults] = useState<DocumentMetadataResponse[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalFound, setTotalFound] = useState(0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await searchArchive({
        query: query || undefined,
        document_type: docType || undefined,
        registration_number: regNumber || undefined,
        status: status || undefined,
        limit: 25,
      });
      setResults(res.items || []);
      setTotalFound(res.total || 0);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const documentTypes: DocumentTypeEnum[] = [
    'BIRTH_CERTIFICATE',
    'FAMILY_BOOK',
    'IDENTITY_CARD',
    'ADMINISTRATIVE_LETTER',
    'APPLICATION_FORM',
    'OFFICIAL_CERTIFICATE',
  ];

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-[#E5EAF0]">
          <h1 className="text-xl sm:text-2xl font-bold text-[#172B4D] font-khmer flex items-center gap-2.5">
            <Search className="w-6 h-6 text-[#2457A7]" strokeWidth={2} />
            <span>{t.navSearch}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5E6C84] mt-1 font-khmer">
            {language === 'km'
              ? 'ស្វែងរកឯកសាររដ្ឋបាលក្នុងបណ្ណសារតាមរយៈពាក្យគន្លឹះ លេខចុះបញ្ជី និងប្រភេទឯកសារ'
              : 'Search archived government documents by keyword, registration certificate number, and category'}
          </p>
        </div>

        {/* Search Panel */}
        <div className="bg-white border border-[#E5EAF0] rounded-xl p-5 shadow-xs">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1 font-khmer">
                  ពាក្យគន្លឹះ / ឈ្មោះឯកសារ
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="បញ្ចូលពាក្យគន្លឹះ..."
                  className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs bg-[#F5F7FA] border border-[#D0E0F7] rounded-lg text-[#172B4D] focus:ring-2 focus:ring-[#2457A7] font-khmer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1 font-khmer">
                  លេខចុះបញ្ជី / លេខសំបុត្រ
                </label>
                <input
                  type="text"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="ឧទាហរណ៍៖ 123/2026..."
                  className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs bg-[#F5F7FA] border border-[#D0E0F7] rounded-lg text-[#172B4D] focus:ring-2 focus:ring-[#2457A7] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1 font-khmer">
                  ប្រភេទឯកសារ
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs bg-[#F5F7FA] border border-[#D0E0F7] rounded-lg text-[#172B4D] focus:ring-2 focus:ring-[#2457A7] font-khmer"
                >
                  <option value="">គ្រប់ប្រភេទ (All)</option>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {DOCUMENT_TYPE_LABELS[type]?.km || type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1 font-khmer">
                  ស្ថានភាពដំណើរការ
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs bg-[#F5F7FA] border border-[#D0E0F7] rounded-lg text-[#172B4D] focus:ring-2 focus:ring-[#2457A7] font-khmer"
                >
                  <option value="">គ្រប់ស្ថានភាព (All)</option>
                  <option value="PROCESSED">PROCESSED (ជោគជ័យ)</option>
                  <option value="NEEDS_VERIFICATION">NEEDS_VERIFICATION (រង់ចាំផ្ទៀងផ្ទាត់)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-semibold bg-[#2457A7] text-white hover:bg-[#1c4587] font-khmer shadow-xs transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isLoading ? 'កំពុងស្វែងរក...' : 'ស្វែងរកឥឡូវនេះ (Search)'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="bg-white border border-[#E5EAF0] rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-[#E5EAF0] bg-[#F5F7FA] text-xs font-semibold text-[#5E6C84] font-khmer">
              រកឃើញសរុប {totalFound} ឯកសារ
            </div>

            {isLoading ? (
              <div className="p-4">
                <SkeletonTable rows={4} />
              </div>
            ) : results.length === 0 ? (
              <EmptyState
                icon={Search}
                title="មិនមានឯកសារត្រូវគ្នានឹងការស្វែងរកទេ"
                description="សូមពិនិត្យមើលពាក្យគន្លឹះ ឬលេខចុះបញ្ជីម្តងទៀត"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[640px]">
                  <thead>
                    <tr className="border-b border-[#E5EAF0] bg-[#F5F7FA] text-[11px] font-semibold text-[#5E6C84] uppercase tracking-wider">
                      <th className="py-3 px-5 font-khmer">ឈ្មោះឯកសារ</th>
                      <th className="py-3 px-4 font-khmer">ប្រភេទ</th>
                      <th className="py-3 px-4 font-khmer">ស្ថានភាព</th>
                      <th className="py-3 px-4 font-khmer">ទំនុកចិត្ត</th>
                      <th className="py-3 px-4 font-khmer">កាលបរិច្ឆេទ</th>
                      <th className="py-3 px-5 text-right font-khmer">សកម្មភាព</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EAF0] text-xs">
                    {results.map((doc) => (
                      <tr key={doc.document_id} className="hover:bg-[#F5F7FA] transition-colors">
                        <td className="py-3 px-5 font-medium text-[#172B4D]">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#2457A7] flex-shrink-0" />
                            <span className="truncate max-w-[220px]" title={doc.original_filename}>
                              {doc.original_filename}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#EFF4FC] text-[#2457A7] border border-[#D0E0F7] font-khmer">
                            {DOCUMENT_TYPE_LABELS[doc.document_type]?.km || doc.document_type}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border bg-[#E3FCEF] text-[#00875A] border-[#ABF5D1]">
                            {doc.status}
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

                        <td className="py-3 px-5 text-right space-x-1.5">
                          <Link
                            href={`/verify/${doc.document_id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#F5F7FA] text-[#2457A7] hover:bg-[#E5EAF0] font-khmer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>ផ្ទៀងផ្ទាត់</span>
                          </Link>

                          <a
                            href={getDocumentFileUrl(doc.document_id)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center p-1 rounded-md text-[#5E6C84] hover:text-[#2457A7]"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}
