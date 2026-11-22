'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileScan,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  Cpu,
  Layers,
  ArrowRight,
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
import { useToast } from '../../lib/toast-context';
import { ErrorState } from '../../components/ui/ErrorState';

export default function OcrProcessingPage() {
  const { t, language } = useLanguage();
  const { success, error: toastError } = useToast();

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
      success(
        language === 'km' ? 'ដំណើរការ OCR ជោគជ័យ' : 'OCR Processing Successful',
        `${response.original_filename} (${response.type_khmer_label})`
      );

      if (response.birth_certificate_data) {
        setActiveTab('civil');
      } else {
        setActiveTab('text');
      }
    } catch (err: unknown) {
      console.error('OCR Processing error:', err);
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to process document with OCR. Please check file and server connection.';
      setError(msg);
      toastError(language === 'km' ? 'ដំណើរការបរាជ័យ' : 'Processing Failed', msg);
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
      success(
        language === 'km' ? 'បានកែប្រែប្រភេទឯកសារ' : 'Classification Updated',
        newLabel
      );
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
        {/* Step Indicator Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 sm:pb-4 border-b border-[#E5EAF0]">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[#5E6C84] mb-1">
              <Link href="/" className="hover:text-[#2457A7] font-khmer">
                {t.navDashboard}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#2457A7] font-semibold font-khmer">
                {t.navOcr}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-[#172B4D] font-khmer">
              {t.navOcr}
            </h1>
          </div>

          {result && (
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#D0E0F7] bg-white text-[#5E6C84] hover:bg-[#F5F7FA] font-khmer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.clearText}</span>
              </button>

              <Link
                href={`/verify/${result.document_id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#2457A7] text-white hover:bg-[#1c4587] font-khmer shadow-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t.verificationWorkspace}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Step 1 & 2: Upload and Configuration View */}
        {!result && (
          <DocumentUploader
            onProcess={handleProcess}
            isProcessing={isProcessing}
          />
        )}

        {/* Error Alert */}
        {error && (
          <ErrorState
            title="បញ្ហាក្នុងការដំណើរការ OCR"
            message={error}
            onRetry={currentFile ? () => handleProcess(currentFile, 'officer') : undefined}
          />
        )}

        {/* Step 3: Dedicated Processing Feedback */}
        {isProcessing && (
          <div className="p-8 sm:p-12 bg-white border border-[#E5EAF0] rounded-xl text-center space-y-4 shadow-xs">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#EFF4FC] text-[#2457A7] animate-spin">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-[#172B4D] font-khmer">
                {t.processing}
              </h3>
              <p className="text-xs text-[#5E6C84] max-w-md mx-auto font-khmer leading-relaxed">
                {t.processingSub}
              </p>
            </div>

            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-[#F5F7FA] border border-[#E5EAF0] text-xs text-[#5E6C84]">
              <span className="font-mono text-[#2457A7] font-semibold">Step 3 of 4:</span>
              <span className="font-khmer">OpenCV Filtering → Tesseract Dual OCR → Civil AI Extraction</span>
            </div>
          </div>
        )}

        {/* Step 4: OCR Results Workspace */}
        {result && (
          <div className="space-y-4 sm:space-y-6">
            {/* Metadata & Classification Bar */}
            <div className="bg-white border border-[#E5EAF0] rounded-xl p-3.5 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#5E6C84] font-khmer flex-shrink-0">ឯកសារ៖</span>
                  <span className="text-xs sm:text-sm font-bold text-[#172B4D] truncate" title={result.original_filename}>
                    {result.original_filename}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#5E6C84]">
                  <span>ID: <code className="font-mono text-[#2457A7] text-[10px]">{result.document_id}</code></span>
                  <span>•</span>
                  <span>{new Date(result.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{(result.file_size_bytes / 1024).toFixed(1)} KB</span>
                </div>
              </div>

              {/* Classification badge with override capability */}
              <div className="pt-2 sm:pt-0 border-t sm:border-0 border-[#F5F7FA]">
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
              {/* Left Panel: High Resolution Document Preview */}
              <div className="w-full">
                <DocumentViewer
                  file={currentFile}
                  fileUrl={getDocumentFileUrl(result.document_id)}
                  mimeType={result.mime_type}
                  fileSizeBytes={result.file_size_bytes}
                  sha256Hash={result.sha256_hash}
                />
              </div>

              {/* Right Panel: Extracted Text and Structured Civil Registration Tab */}
              <div className="w-full space-y-4">
                {result.birth_certificate_data && (
                  <div className="flex items-center border-b border-[#E5EAF0] bg-white rounded-t-xl px-3 sm:px-4 pt-2.5 sm:pt-3 overflow-x-auto">
                    <button
                      onClick={() => setActiveTab('civil')}
                      className={`pb-2 px-2.5 sm:px-3 text-xs font-semibold border-b-2 font-khmer transition-colors whitespace-nowrap ${
                        activeTab === 'civil'
                          ? 'border-[#2457A7] text-[#2457A7]'
                          : 'border-transparent text-[#5E6C84] hover:text-[#172B4D]'
                      }`}
                    >
                      {t.structuredDataTab}
                    </button>
                    <button
                      onClick={() => setActiveTab('text')}
                      className={`pb-2 px-2.5 sm:px-3 text-xs font-semibold border-b-2 font-khmer transition-colors whitespace-nowrap ${
                        activeTab === 'text'
                          ? 'border-[#2457A7] text-[#2457A7]'
                          : 'border-transparent text-[#5E6C84] hover:text-[#172B4D]'
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
