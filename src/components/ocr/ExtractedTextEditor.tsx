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
import { useToast } from '../../lib/toast-context';

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
  originalFilename = 'document',
  averageConfidence,
  onTextChange,
  onReset,
}: ExtractedTextEditorProps) {
  const { t, language } = useLanguage();
  const { success } = useToast();

  const [currentText, setCurrentText] = useState<string>(initialText);
  const [prevInitial, setPrevInitial] = useState<string>(initialText);
  const [copied, setCopied] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  // Sync state during render when initialText prop changes (React recommended pattern)
  if (initialText !== prevInitial) {
    setPrevInitial(initialText);
    setCurrentText(initialText);
  }

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
    success(
      language === 'km' ? 'បានចម្លងអត្ថបទ' : 'Text Copied',
      language === 'km' ? 'អត្ថបទ OCR ត្រូវបានចម្លងទៅកាន់ Clipboard' : 'Extracted OCR text copied to clipboard'
    );
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
    success(
      language === 'km' ? 'ទាញយកជោគជ័យ' : 'Downloaded',
      `${baseName}_ocr_extracted.txt`
    );
  };

  const handleDownloadDoc = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${originalFilename} - OCR Extracted Document</title>
        <style>
          body { font-family: 'Battambang', 'Inter', Arial, sans-serif; font-size: 11pt; line-height: 1.6; }
          .header { border-bottom: 2px solid #2457A7; padding-bottom: 8px; margin-bottom: 16px; }
          .meta { font-size: 9pt; color: #5E6C84; margin-bottom: 24px; }
          .content { white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2 style="color: #2457A7; margin: 0;">ព្រះរាជាណាចក្រកម្ពុជា • ជាតិ សាសនា ព្រះមហាក្សត្រ</h2>
          <h3 style="color: #172B4D; margin: 4px 0 0 0;">Government Document Intelligence System - OCR Extract</h3>
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
    success(
      language === 'km' ? 'ទាញយកជោគជ័យ' : 'Downloaded',
      `${baseName}_ocr_extracted.doc`
    );
  };

  const confirmReset = () => {
    setCurrentText(initialText);
    setShowResetModal(false);
    if (onReset) {
      onReset();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-[#E5EAF0] rounded-xl shadow-xs overflow-hidden">
      {/* Editor Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#E5EAF0] bg-[#F5F7FA]">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <AlignLeft className="w-4 h-4 text-[#2457A7] flex-shrink-0" strokeWidth={2} />
          <span className="text-xs font-semibold text-[#172B4D] uppercase tracking-wider font-khmer truncate">
            {t.extractedText}
          </span>

          {averageConfidence !== null && averageConfidence !== undefined && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border ${
                averageConfidence >= 0.8
                  ? 'bg-[#E3FCEF] text-[#00875A] border-[#ABF5D1]'
                  : averageConfidence >= 0.5
                  ? 'bg-[#FFF0B3] text-[#FF991F] border-[#FFE58F]'
                  : 'bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]'
              }`}
            >
              <span>{(averageConfidence * 100).toFixed(0)}%</span>
            </span>
          )}

          {isModified && (
            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-[#EFF4FC] text-[#2457A7] border border-[#D0E0F7]">
              <Edit3 className="w-3 h-3" />
              <span>កែសម្រួល</span>
            </span>
          )}
        </div>

        {/* Toolbar Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-[#D0E0F7] bg-white text-[#172B4D] hover:bg-[#F5F7FA] transition-colors"
            title={t.copyText}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#00875A]" strokeWidth={2} />
                <span className="text-[#00875A] font-khmer">{t.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#5E6C84]" strokeWidth={2} />
                <span className="font-khmer">{t.copyText}</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadTxt}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-[#D0E0F7] bg-white text-[#172B4D] hover:bg-[#F5F7FA] transition-colors"
            title={t.downloadTxt}
          >
            <Download className="w-3.5 h-3.5 text-[#5E6C84]" strokeWidth={2} />
            <span className="font-khmer">TXT</span>
          </button>

          <button
            onClick={handleDownloadDoc}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-[#D0E0F7] bg-white text-[#172B4D] hover:bg-[#F5F7FA] transition-colors"
            title={t.downloadDocx}
          >
            <FileDown className="w-3.5 h-3.5 text-[#5E6C84]" strokeWidth={2} />
            <span className="font-khmer">DOC</span>
          </button>

          {isModified && (
            <button
              onClick={() => setShowResetModal(true)}
              className="p-1 sm:p-1.5 rounded-md text-[#5E6C84] hover:text-[#DE350B] hover:bg-[#FFEBE6] transition-colors"
              title="Reset to original OCR"
            >
              <RotateCcw className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative flex-1 min-h-[260px] sm:min-h-[420px] max-h-[380px] sm:max-h-[640px] flex flex-col">
        <textarea
          value={currentText}
          onChange={handleTextChange}
          placeholder="លទ្ធផលអត្ថបទដែលបានសម្គាល់នឹងបង្ហាញនៅទីនេះ..."
          className="flex-1 w-full p-3 sm:p-5 text-sm sm:text-base leading-relaxed text-[#172B4D] bg-white resize-none focus:outline-hidden font-khmer ocr-text-display border-0"
          spellCheck={false}
        />
      </div>

      {/* Textarea Footer Statistics */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-t border-[#E5EAF0] bg-[#F5F7FA] text-[11px] text-[#5E6C84]">
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
          <div className="bg-white rounded-xl max-w-sm w-full p-5 sm:p-6 shadow-xl border border-[#D0E0F7]">
            <h3 className="text-base font-bold text-[#172B4D] mb-2 font-khmer">
              {t.resetConfirmTitle}
            </h3>
            <p className="text-xs text-[#5E6C84] mb-5 leading-normal font-khmer">
              {t.resetConfirmDesc}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-[#D0E0F7] text-[#5E6C84] hover:bg-[#F5F7FA] font-khmer"
              >
                {t.cancel}
              </button>
              <button
                onClick={confirmReset}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#DE350B] text-white hover:bg-[#BF2600] font-khmer"
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
