'use client';

import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  X,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../../lib/i18n';
import { MAX_FILE_SIZE_BYTES } from '../../lib/config';

interface DocumentUploaderProps {
  onProcess: (file: File, officerName: string) => Promise<void>;
  isProcessing: boolean;
}

export function DocumentUploader({
  onProcess,
  isProcessing,
}: DocumentUploaderProps) {
  const { t, language } = useLanguage();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const officerName = 'officer';
  const [ocrLanguage, setOcrLanguage] = useState<'khm+eng' | 'khm' | 'eng'>('khm+eng');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setValidationError(null);

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
    await onProcess(selectedFile, officerName);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="bg-white border border-[#E5EAF0] rounded-xl shadow-xs overflow-hidden">
      <div className="p-4 sm:p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Upload Document */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#2457A7] text-white text-[11px] font-bold">
                1
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-[#172B4D] uppercase tracking-wide font-khmer">
                {t.step1Title}
              </h3>
            </div>

            {!selectedFile ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-6 sm:p-10 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-[#2457A7] bg-[#EFF4FC]'
                    : 'border-[#D0E0F7] hover:border-[#2457A7] bg-[#F5F7FA]'
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
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white text-[#2457A7] border border-[#D0E0F7] shadow-xs mb-3">
                    <UploadCloud className="w-6 h-6" strokeWidth={1.75} />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#172B4D] mb-1 font-khmer">
                    {t.uploadAreaTitle}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-[#5E6C84] max-w-md mb-3 font-khmer">
                    {t.uploadAreaSubtitle}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] sm:text-[11px] text-[#5E6C84]">
                    <span className="px-2 py-0.5 rounded-md bg-white border border-[#E5EAF0] font-medium text-[#172B4D]">
                      PDF • PNG • JPG/JPEG
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-[#E5EAF0]">
                      {t.maxFileSize}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 sm:p-4 rounded-xl border border-[#D0E0F7] bg-[#F5F7FA]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#2457A7] text-white flex-shrink-0">
                      <FileText className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-[#172B4D] truncate">
                        {selectedFile.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-[#5E6C84] mt-0.5 font-mono">
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
                      className="p-1.5 rounded-md text-[#5E6C84] hover:text-[#DE350B] hover:bg-[#FFEBE6] transition-colors"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Step 2: OCR Configuration */}
          <div className="pt-2 border-t border-[#F5F7FA]">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#2457A7] text-white text-[11px] font-bold">
                2
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-[#172B4D] uppercase tracking-wide font-khmer">
                {t.step2Title}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1.5 font-khmer">
                  ភាសាសម្គាល់ (OCR Recognition Language)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOcrLanguage('khm+eng')}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      ocrLanguage === 'khm+eng'
                        ? 'border-[#2457A7] bg-[#EFF4FC] text-[#2457A7]'
                        : 'border-[#E5EAF0] bg-white text-[#5E6C84] hover:bg-[#F5F7FA]'
                    }`}
                  >
                    <span className="block font-khmer">ខ្មែរ + English</span>
                    <span className="text-[10px] font-mono text-[#7A869A]">Dual OCR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOcrLanguage('khm')}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      ocrLanguage === 'khm'
                        ? 'border-[#2457A7] bg-[#EFF4FC] text-[#2457A7]'
                        : 'border-[#E5EAF0] bg-white text-[#5E6C84] hover:bg-[#F5F7FA]'
                    }`}
                  >
                    <span className="block font-khmer">ភាសាខ្មែរ</span>
                    <span className="text-[10px] font-mono text-[#7A869A]">Khmer Only</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOcrLanguage('eng')}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      ocrLanguage === 'eng'
                        ? 'border-[#2457A7] bg-[#EFF4FC] text-[#2457A7]'
                        : 'border-[#E5EAF0] bg-white text-[#5E6C84] hover:bg-[#F5F7FA]'
                    }`}
                  >
                    <span className="block font-khmer">English</span>
                    <span className="text-[10px] font-mono text-[#7A869A]">Latin Only</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1.5 font-khmer">
                  ដំណើរការសម្អាតរូបភាព (OpenCV Pipeline)
                </label>
                <div className="p-2.5 rounded-lg bg-[#F5F7FA] border border-[#E5EAF0] text-[11px] text-[#5E6C84] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#00875A] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Deskew + CLAHE + Noise Filtering Binarization</span>
                  </div>
                  <p className="text-[10px] text-[#7A869A]">
                    ដំណើរការដោយស្វ័យប្រវត្តតាមរយៈ Backend OpenCV Preprocessing
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Error Banner */}
          {validationError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#FFEBE6] border border-[#FFBDAD] text-xs text-[#DE350B]">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
              <span className="font-khmer">{validationError}</span>
            </div>
          )}

          {/* Step 3: Trigger Action */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-[#E5EAF0]">
            <div className="text-[11px] text-[#5E6C84] font-khmer">
              ប្រព័ន្ធនឹងដំណើរការសម្អាតរូបភាព និងសម្គាល់អត្ថបទដោយស្វ័យប្រវត្ត
            </div>

            <button
              type="submit"
              disabled={!selectedFile || isProcessing}
              className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white transition-all shadow-xs w-full sm:w-auto ${
                !selectedFile || isProcessing
                  ? 'bg-[#A5ADBA] cursor-not-allowed opacity-60'
                  : 'bg-[#2457A7] hover:bg-[#1c4587] active:scale-[0.99]'
              }`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
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
