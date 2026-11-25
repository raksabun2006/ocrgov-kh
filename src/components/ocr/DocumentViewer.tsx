'use client';

import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, FileText, Check, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../lib/i18n';

interface DocumentViewerProps {
  file: File | null;
  fileUrl?: string | null;
  mimeType?: string;
  fileSizeBytes?: number;
  sha256Hash?: string;
}

export function DocumentViewer({
  file,
  fileUrl,
  mimeType,
  fileSizeBytes,
  sha256Hash,
}: DocumentViewerProps) {
  const { t, language } = useLanguage();
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  const previewUrl = React.useMemo(() => {
    if (fileUrl) return fileUrl;
    if (file) {
      return URL.createObjectURL(file);
    }
    return null;
  }, [file, fileUrl]);

  const isPdf =
    (mimeType && mimeType.includes('pdf')) ||
    (file && file.type === 'application/pdf') ||
    (file && file.name.toLowerCase().endsWith('.pdf'));

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoomLevel(100);

  const copyHash = () => {
    if (sha256Hash) {
      navigator.clipboard.writeText(sha256Hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="flex flex-col h-full bg-white border border-[#E5EAF0] rounded-xl shadow-[0_1px_3px_rgba(9,30,66,0.04)] overflow-hidden">
      {/* Viewer Header & Controls */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#E5EAF0] bg-white">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-[#2457A7] flex-shrink-0" strokeWidth={2} />
          <span className="text-xs font-semibold text-[#172B4D] uppercase tracking-wider font-khmer truncate">
            {t.documentPreview}
          </span>
          {fileSizeBytes ? (
            <span className="hidden sm:inline text-[11px] text-[#5E6C84] font-mono">
              ({formatFileSize(fileSizeBytes)})
            </span>
          ) : null}
        </div>

        {/* Zoom toolbar */}
        {!isPdf && previewUrl && (
          <div className="flex items-center gap-1 bg-white border border-[#D0E0F7] rounded-lg p-0.5">
            <button
              onClick={handleZoomOut}
              className="p-1 sm:p-1.5 rounded-sm text-[#5E6C84] hover:text-[#2457A7] hover:bg-[#EFF4FC] transition-colors"
              title={t.zoomOut}
            >
              <ZoomOut className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
            <span className="text-[11px] font-mono font-medium text-[#172B4D] px-1 min-w-[36px] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 sm:p-1.5 rounded-sm text-[#5E6C84] hover:text-[#2457A7] hover:bg-[#EFF4FC] transition-colors"
              title={t.zoomIn}
            >
              <ZoomIn className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 sm:p-1.5 rounded-sm text-[#5E6C84] hover:text-[#2457A7] hover:bg-[#EFF4FC] transition-colors"
              title={t.resetZoom}
            >
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>
        )}
      </div>

      {/* Main Preview Container: Responsive Height on Mobile */}
      <div className="relative flex-1 min-h-[260px] sm:min-h-[420px] max-h-[380px] sm:max-h-[640px] overflow-auto bg-[#F5F7FA] flex items-center justify-center p-3 sm:p-4">
        {!previewUrl ? (
          <div className="flex flex-col items-center justify-center text-center p-6 text-[#7A869A]">
            <FileText className="w-10 h-10 stroke-1 mb-2 text-[#C1C7D0]" />
            <p className="text-xs font-medium font-khmer">
              {language === 'km'
                ? 'មិនទាន់មានឯកសារសម្រាប់បង្ហាញ'
                : 'No document loaded to preview'}
            </p>
          </div>
        ) : isPdf ? (
          <iframe
            src={`${previewUrl}#toolbar=1&navpanes=0`}
            className="w-full h-full min-h-[300px] sm:min-h-[500px] border-0 rounded-lg shadow-xs"
            title="PDF Document Preview"
          />
        ) : (
          <div
            className="transition-transform duration-100 ease-out flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Official Document Preview"
              className="max-w-full max-h-[340px] sm:max-h-[560px] object-contain rounded-md shadow-md border border-[#E5EAF0] bg-white"
            />
          </div>
        )}
      </div>

      {/* Integrity Checksum Footer: Wraps cleanly on mobile */}
      {sha256Hash && (
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 border-t border-[#E5EAF0] bg-white text-[11px] gap-2">
          <div className="flex items-center gap-1.5 text-[#5E6C84] min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00875A] flex-shrink-0" strokeWidth={2} />
            <span className="font-semibold text-[#172B4D] hidden sm:inline">SHA-256:</span>
            <span className="font-mono text-[10px] truncate text-[#5E6C84] max-w-[130px] xs:max-w-[180px] sm:max-w-none">
              {sha256Hash}
            </span>
          </div>
          <button
            onClick={copyHash}
            className="px-2.5 py-1 sm:py-0.5 rounded-sm bg-[#F5F7FA] border border-[#D0E0F7] text-[#5E6C84] hover:text-[#2457A7] font-medium transition-colors flex-shrink-0 touch-manipulation text-xs sm:text-[11px]"
          >
            {copiedHash ? (
              <span className="text-[#00875A] flex items-center gap-1">
                <Check className="w-3 h-3" strokeWidth={2} />
                <span>Copied</span>
              </span>
            ) : (
              'Copy'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
