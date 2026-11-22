'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, ShieldAlert, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../lib/i18n';
import { useAuth } from '../../lib/auth-context';
import { MAX_FILE_SIZE_BYTES, ACCEPTED_FILE_TYPES } from '../../lib/config';

interface DocumentUploaderProps {
  onProcess: (file: File, officerName: string) => Promise<void>;
  isProcessing: boolean;
  uploadProgress?: number;
}

export function DocumentUploader({
  onProcess,
  isProcessing,
}: DocumentUploaderProps) {
  const { t, language } = useLanguage();
  const { officer } = useAuth();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [officerName, setOfficerName] = useState<string>(officer.name || 'officer');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setValidationError(null);

    // Format validation
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    const isImage =
      fileType === 'image/jpeg' ||
      fileType === 'image/png' ||
      fileName.endsWith('.jpg') ||
      fileName.endsWith('.jpeg') ||
      fileName.endsWith('.png');
    const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf');

    if (!isImage && !isPdf) {
      setValidationError(
        language === 'km'
          ? 'ទម្រង់ឯកសារមិនត្រូវបានគាំទ្រ។ សូមជ្រើសរើសឯកសារជា PDF, PNG ឬ JPG/JPEG។'
          : 'Unsupported file format. Please upload PDF, PNG, or JPG/JPEG.'
      );
      return;
    }

    // Size validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setValidationError(
        language === 'km'
          ? `ទំហំឯកសារធំពេក (${sizeMb} MB)។ ទំហំអតិបរមាអនុញ្ញាតគឺ 15 MB។`
          : `File size too large (${sizeMb} MB). Maximum allowed size is 15 MB.`
      );
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || isProcessing) return;
    await onProcess(selectedFile, officerName || 'officer');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
      <div className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Drag & Drop Area optimized for mobile touch */}
          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 sm:p-12 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-[#17365D] bg-[#EFF6FF]'
                  : 'border-[#CBD5E1] hover:border-[#94A3B8] bg-[#F8FAFC]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                onChange={handleFileChange}
              />

              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center justify-center w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-[#EFF6FF] text-[#17365D] mb-3 sm:mb-4">
                  <UploadCloud className="w-6 sm:w-7 h-6 sm:h-7" strokeWidth={1.8} />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-[#1E293B] mb-1 font-khmer px-2">
                  {t.uploadAreaTitle}
                </h3>
                <p className="text-xs text-[#64748B] max-w-md mb-3 sm:mb-4 font-khmer px-2">
                  {t.uploadAreaSubtitle}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs text-[#64748B]">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-[#E2E8F0]">
                    <span className="font-medium text-[#1E293B]">PDF</span>
                    <span>•</span>
                    <span className="font-medium text-[#1E293B]">PNG</span>
                    <span>•</span>
                    <span className="font-medium text-[#1E293B]">JPG</span>
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-[#E2E8F0]">
                    {t.maxFileSize}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Selected File Display */
            <div className="p-3 sm:p-4 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 rounded-lg bg-[#17365D] text-white flex-shrink-0">
                    <FileText className="w-5 sm:w-6 h-5 sm:h-6" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-[#1E293B] truncate">
                      {selectedFile.name}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-0.5">
                      <span>{formatFileSize(selectedFile.size)}</span>
                      <span>•</span>
                      <span className="uppercase">{selectedFile.type || 'DOCUMENT'}</span>
                    </div>
                  </div>
                </div>

                {!isProcessing && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 rounded-md text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors flex-shrink-0"
                    title="Remove selected document"
                  >
                    <X className="w-5 h-5" strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Validation Error Banner */}
          {validationError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626]">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
              <span className="font-khmer">{validationError}</span>
            </div>
          )}

          {/* Submit Action: Full width on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            <div className="text-[11px] sm:text-xs text-[#64748B] font-khmer text-center sm:text-left">
              {language === 'km'
                ? 'ឯកសារនឹងត្រូវដំណើរការសម្គាល់ភាសាខ្មែរ និងអង់គ្លេស'
                : 'Document will be processed with dual Khmer & English OCR'}
            </div>

            <button
              type="submit"
              disabled={!selectedFile || isProcessing}
              className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white transition-all shadow-xs w-full sm:w-auto ${
                !selectedFile || isProcessing
                  ? 'bg-[#94A3B8] cursor-not-allowed opacity-60'
                  : 'bg-[#17365D] hover:bg-[#0f2440] active:scale-[0.99]'
              }`}
            >
              {isProcessing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  <span className="font-khmer">{t.processing}</span>
                </>
              ) : (
                <>
                  <span className="font-khmer">{t.startOcr}</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
