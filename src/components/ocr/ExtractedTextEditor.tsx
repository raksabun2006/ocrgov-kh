'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  RotateCcw,
  FileDown,
  Edit3,
  AlignLeft,
} from 'lucide-react';
import { useLanguage } from '../../lib/i18n';

interface ExtractedTextEditorProps {
  initialText: string;
  documentId?: string;
  originalFilename?: string;
  averageConfidence?: number | null;
  onTextChange?: (newText: string) => void;
  onReset?: () => void;
}

export function ExtractedTextEditor({
  initialText,
  documentId,
  originalFilename = 'document',
  averageConfidence,
  onTextChange,
  onReset,
}: ExtractedTextEditorProps) {
  const { t, language } = useLanguage();

  const [currentText, setCurrentText] = useState<string>(initialText);
  const [copied, setCopied] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  React.useEffect(() => {
    setCurrentText(initialText);
  }, [initialText]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCurrentText(val);
    if (onTextChange) {
      onTextChange(val);
    }
  };

  const isModified = currentText !== initialText;

  const charCount = currentText.length;
  const wordCount = currentText.trim() ? currentText.trim().split(/\s+/).length : 0;
  const lineCount = currentText ? currentText.split('\n').length : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([currentText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const baseName = originalFilename.replace(/\.[^/.]+$/, '');
    link.href = url;
    link.download = `${baseName}_ocr_extracted.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadDoc = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${originalFilename} - OCR Extracted Document</title>
        <style>
          body { font-family: 'Battambang', 'Inter', Arial, sans-serif; font-size: 11pt; line-height: 1.6; }
          .header { border-bottom: 2px solid #17365D; padding-bottom: 8px; margin-bottom: 16px; }
          .meta { font-size: 9pt; color: #64748B; margin-bottom: 24px; }
          .content { white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2 style="color: #17365D; margin: 0;">ព្រះរាជាណាចក្រកម្ពុជា • ជាតិ សាសនា ព្រះមហាក្សត្រ</h2>
          <h3 style="color: #2563A6; margin: 4px 0 0 0;">Government Document Intelligence System - OCR Extract</h3>
        </div>
        <div class="meta">
          <p>Document Name: ${originalFilename}</p>
          <p>Confidence Score: ${averageConfidence ? (averageConfidence * 100).toFixed(1) + '%' : 'N/A'}</p>
          <p>Extracted At: ${new Date().toLocaleString()}</p>
        </div>
        <div class="content">${currentText.replace(/\n/g, '<br/>')}</div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const baseName = originalFilename.replace(/\.[^/.]+$/, '');
    link.href = url;
    link.download = `${baseName}_ocr_extracted.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const confirmReset = () => {
    setCurrentText(initialText);
    setShowResetModal(false);
    if (onReset) {
      onReset();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
      {/* Editor Header: Wraps smoothly on small devices */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <AlignLeft className="w-4 h-4 text-[#17365D] flex-shrink-0" strokeWidth={2} />
          <span className="text-xs font-semibold text-[#1E293B] uppercase tracking-wider font-khmer truncate">
            {t.extractedText}
          </span>

          {averageConfidence !== null && averageConfidence !== undefined && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border ${
                averageConfidence >= 0.8
                  ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                  : averageConfidence >= 0.5
                  ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                  : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
              }`}
            >
              <span>{(averageConfidence * 100).toFixed(0)}%</span>
            </span>
          )}

          {isModified && (
            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-[#EFF6FF] text-[#2563A6] border border-[#BFDBFE]">
              <Edit3 className="w-3 h-3" />
              <span>កែសម្រួល</span>
            </span>
          )}
        </div>

        {/* Toolbar Actions: touch friendly buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-md border border-[#CBD5E1] bg-white text-[#1E293B] hover:bg-[#F1F5F9] transition-colors"
            title={t.copyText}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#16A34A]" strokeWidth={2} />
                <span className="text-[#16A34A] font-khmer">{t.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#64748B]" strokeWidth={2} />
                <span className="font-khmer">{t.copyText}</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadTxt}
            className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-md border border-[#CBD5E1] bg-white text-[#1E293B] hover:bg-[#F1F5F9] transition-colors"
            title={t.downloadTxt}
          >
            <Download className="w-3.5 h-3.5 text-[#64748B]" strokeWidth={2} />
            <span className="font-khmer">TXT</span>
          </button>

          <button
            onClick={handleDownloadDoc}
            className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-md border border-[#CBD5E1] bg-white text-[#1E293B] hover:bg-[#F1F5F9] transition-colors"
            title={t.downloadDocx}
          >
            <FileDown className="w-3.5 h-3.5 text-[#64748B]" strokeWidth={2} />
            <span className="font-khmer">DOC</span>
          </button>

          {isModified && (
            <button
              onClick={() => setShowResetModal(true)}
              className="p-1 sm:p-1.5 rounded-md text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
              title="Reset to original OCR"
            >
              <RotateCcw className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Main Textarea: Responsive on mobile */}
      <div className="relative flex-1 min-h-[260px] sm:min-h-[420px] max-h-[380px] sm:max-h-[640px] flex flex-col">
        <textarea
          value={currentText}
          onChange={handleTextChange}
          placeholder="លទ្ធផលអត្ថបទដែលបានសម្គាល់នឹងបង្ហាញនៅទីនេះ..."
          className="flex-1 w-full p-3 sm:p-5 text-sm sm:text-base leading-relaxed text-[#1E293B] bg-white resize-none focus:outline-hidden font-khmer ocr-text-display border-0"
          spellCheck={false}
        />
      </div>

      {/* Textarea Footer Statistics */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-t border-[#E2E8F0] bg-[#F8FAFC] text-[11px] text-[#64748B]">
        <div className="flex items-center gap-2 sm:gap-3 font-mono text-[10px] sm:text-[11px]">
          <span>{charCount} chars</span>
          <span>•</span>
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{lineCount} lines</span>
        </div>
        <div className="text-[10px] sm:text-[11px] font-khmer truncate pl-2">
          {language === 'km' ? 'អក្សរខ្មែរ (Battambang)' : 'Khmer (Battambang)'}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 sm:p-6 shadow-xl border border-[#CBD5E1]">
            <h3 className="text-base font-bold text-[#1E293B] mb-2 font-khmer">
              {t.resetConfirmTitle}
            </h3>
            <p className="text-xs text-[#64748B] mb-5 leading-normal font-khmer">
              {t.resetConfirmDesc}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9] font-khmer"
              >
                {t.cancel}
              </button>
              <button
                onClick={confirmReset}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#DC2626] text-white hover:bg-[#B91C1C] font-khmer"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
