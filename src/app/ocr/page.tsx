'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileScan,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { Shell } from '../../components/layout/Shell';
import { DocumentUploader } from '../../components/ocr/DocumentUploader';
import { DocumentViewer } from '../../components/ocr/DocumentViewer';
import { ExtractedTextEditor } from '../../components/ocr/ExtractedTextEditor';
import { StructuredCivilData } from '../../components/ocr/StructuredCivilData';
import { ClassificationBadgeAndModal } from '../../components/ocr/ClassificationModal';
import { uploadDocument, getDocumentFileUrl } from '../../lib/api/ocr';
import { DocumentUploadResponse } from '../../types/api';
import { useLanguage } from '../../lib/i18n';

export default function OcrProcessingPage() {
  const { t, language } = useLanguage();

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [result, setResult] = useState<DocumentUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'civil'>('text');

  const handleProcess = async (file: File, officerName: string) => {
    setIsProcessing(true);
    setError(null);
    setCurrentFile(file);

    try {
      const response = await uploadDocument(file, officerName);
      setResult(response);
      if (response.birth_certificate_data) {
        setActiveTab('civil');
      } else {
        setActiveTab('text');
      }
    } catch (err: unknown) {
      console.error('OCR Processing error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to process document with OCR. Please check file and server connection.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClassificationUpdated = (newType: string, newLabel: string) => {
    if (result) {
      setResult({
        ...result,
        document_type: newType,
        type_khmer_label: newLabel,
      });
    }
  };

  const handleReset = () => {
    setResult(null);
    setCurrentFile(null);
    setError(null);
  };

  return (
    <Shell>
      <div className="space-y-4 sm:space-y-6">
        {/* Page Title & Breadcrumb: Mobile-friendly flex layout */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 sm:pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[#64748B] mb-1">
              <Link href="/" className="hover:text-[#17365D] font-khmer">
                {t.navDashboard}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#17365D] font-semibold font-khmer">
                {t.navOcr}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-[#17365D] font-khmer">
              {t.navOcr}
            </h1>
          </div>

          {result && (
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-lg border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F1F5F9] font-khmer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.clearText}</span>
              </button>

              <Link
                href={`/verify/${result.document_id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 text-xs font-semibold rounded-lg bg-[#17365D] text-white hover:bg-[#0f2440] font-khmer shadow-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t.verificationWorkspace}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Upload Section */}
        {!result && (
          <DocumentUploader
            onProcess={handleProcess}
            isProcessing={isProcessing}
          />
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 sm:p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs sm:text-sm text-[#DC2626]">
            <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-semibold font-khmer">
                {language === 'km' ? 'បញ្ហាដំណើរការ OCR' : 'OCR Processing Error'}
              </h4>
              <p className="text-xs leading-relaxed font-mono">{error}</p>
            </div>
          </div>
        )}

        {/* Processing Spinner Banner */}
        {isProcessing && (
          <div className="p-6 sm:p-8 bg-white border border-[#CBD5E1] rounded-xl text-center space-y-2 sm:space-y-3">
            <div className="inline-flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-[#EFF6FF] text-[#17365D] animate-spin mb-1 sm:mb-2">
              <svg className="w-5 sm:w-6 h-5 sm:h-6" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#17365D] font-khmer">
              {t.processing}
            </h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto font-khmer leading-relaxed">
              {t.processingSub}
            </p>
          </div>
        )}

        {/* Main Side-by-Side OCR Workspace: Stacked on mobile, side-by-side on lg screens */}
        {result && (
          <div className="space-y-4 sm:space-y-6">
            {/* Document Metadata & Classification Banner */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#64748B] font-khmer flex-shrink-0">ឯកសារ៖</span>
                  <span className="text-xs sm:text-sm font-bold text-[#1E293B] truncate" title={result.original_filename}>
                    {result.original_filename}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#64748B]">
                  <span>ID: <code className="font-mono text-[#17365D] text-[10px]">{result.document_id}</code></span>
                  <span>•</span>
                  <span>{new Date(result.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Classification badge with override capability */}
              <div className="pt-2 sm:pt-0 border-t sm:border-0 border-[#F1F5F9]">
                <ClassificationBadgeAndModal
                  documentId={result.document_id}
                  currentType={result.document_type}
                  khmerLabel={result.type_khmer_label}
                  confidence={result.average_confidence ?? undefined}
                  onUpdated={handleClassificationUpdated}
                />
              </div>
            </div>

            {/* Split Workspace: Document Preview (Left) & OCR Extraction / Structured Data (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
              {/* Left Panel: Document Preview */}
              <div className="w-full">
                <DocumentViewer
                  file={currentFile}
                  fileUrl={getDocumentFileUrl(result.document_id)}
                  mimeType={result.mime_type}
                  fileSizeBytes={result.file_size_bytes}
                  sha256Hash={result.sha256_hash}
                />
              </div>

              {/* Right Panel: Tabs for Extracted Text vs Civil Registration Fields */}
              <div className="w-full space-y-4">
                {/* Tab Switcher if Birth Certificate data exists */}
                {result.birth_certificate_data && (
                  <div className="flex items-center border-b border-[#E2E8F0] bg-white rounded-t-xl px-3 sm:px-4 pt-2.5 sm:pt-3 overflow-x-auto">
                    <button
                      onClick={() => setActiveTab('civil')}
                      className={`pb-2 px-2.5 sm:px-3 text-xs font-semibold border-b-2 font-khmer transition-colors whitespace-nowrap ${
                        activeTab === 'civil'
                          ? 'border-[#17365D] text-[#17365D]'
                          : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
                      }`}
                    >
                      {t.structuredDataTab}
                    </button>
                    <button
                      onClick={() => setActiveTab('text')}
                      className={`pb-2 px-2.5 sm:px-3 text-xs font-semibold border-b-2 font-khmer transition-colors whitespace-nowrap ${
                        activeTab === 'text'
                          ? 'border-[#17365D] text-[#17365D]'
                          : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
                      }`}
                    >
                      {t.rawTextTab}
                    </button>
                  </div>
                )}

                {activeTab === 'civil' && result.birth_certificate_data ? (
                  <StructuredCivilData
                    data={result.birth_certificate_data}
                    documentId={result.document_id}
                  />
                ) : (
                  <ExtractedTextEditor
                    initialText={result.extracted_text || ''}
                    documentId={result.document_id}
                    originalFilename={result.original_filename}
                    averageConfidence={result.average_confidence}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
