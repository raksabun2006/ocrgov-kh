'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import {
  Receipt,
  ChevronRight,
  FileText,
  Copy,
  Check,
  Download,
  UploadCloud,
  X,
  Languages,
} from 'lucide-react';
import { Shell } from '../../components/layout/Shell';
import { scanReceipt } from '../../lib/api/ocr';
import { ScanReceiptResponse } from '../../types/api';
import { useLanguage } from '../../lib/i18n';
import { useToast } from '../../lib/toast-context';
import { ErrorState } from '../../components/ui/ErrorState';

export default function ReceiptsScanPage() {
  const { t, language } = useLanguage();
  const { success, error: toastError } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [result, setResult] = useState<ScanReceiptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUrl = React.useMemo(() => {
    if (selectedFile) return URL.createObjectURL(selectedFile);
    return null;
  }, [selectedFile]);

  // Derive any detected receipt metadata lines from real extracted text
  const detectedSummary = React.useMemo(() => {
    if (!result?.extracted_text) return null;
    const text = result.extracted_text;
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    // Look for common receipt patterns
    const dateMatch = text.match(/\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/);
    const totalMatch = text.match(/(?:total|amount|grand total|តម្លៃសរុប|សរុប)[\s:]*([$៛]?\s*[\d,]+(?:\.\d{1,2})?)/i);
    const currencyMatch = text.includes('៛') || text.toLowerCase().includes('khr') ? 'KHR (រៀល)' : text.includes('$') ? 'USD ($)' : null;

    return {
      potentialMerchant: lines[0] || null,
      detectedDate: dateMatch ? dateMatch[1] : null,
      detectedTotal: totalMatch ? totalMatch[1] : null,
      detectedCurrency: currencyMatch,
    };
  }, [result]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const valid = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!valid) {
        setError('Please upload a JPG or PNG receipt image.');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || isScanning) return;
    setIsScanning(true);
    setError(null);
    try {
      const res = await scanReceipt(selectedFile);
      setResult(res);
      success(
        language === 'km' ? 'ស្កេនបង្កាន់ដៃជោគជ័យ' : 'Receipt Scanned Successfully',
        res.filename
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to scan receipt image.';
      setError(msg);
      toastError(language === 'km' ? 'ស្កេនបរាជ័យ' : 'Scan Failed', msg);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.extracted_text);
      setCopied(true);
      success(
        language === 'km' ? 'បានចម្លង' : 'Copied',
        language === 'km' ? 'អត្ថបទបង្កាន់ដៃត្រូវបានចម្លង' : 'Receipt text copied'
      );
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    const blob = new Blob([result.extracted_text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${result.filename || 'receipt'}_ocr.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
                {t.navReceipts}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-[#172B4D] font-khmer">
              {t.navReceipts}
            </h1>
          </div>
        </div>

        {/* Upload & Scanner Form */}
        <div className="bg-white border border-[#E5EAF0] rounded-xl p-4 sm:p-6 shadow-xs">
          <form onSubmit={handleScan} className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#D0E0F7] hover:border-[#2457A7] rounded-xl p-6 sm:p-8 text-center cursor-pointer bg-[#F5F7FA] transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center justify-center">
                <Receipt className="w-8 sm:w-10 h-8 sm:h-10 text-[#2457A7] mb-2" strokeWidth={1.75} />
                <h3 className="text-xs sm:text-sm font-bold text-[#172B4D] font-khmer px-2">
                  ជ្រើសរើសរូបភាពបង្កាន់ដៃ ឬ វិក្កយបត្រ (JPG / PNG)
                </h3>
                <p className="text-[11px] sm:text-xs text-[#5E6C84] mt-1 font-khmer px-2">
                  ប្រព័ន្ធនឹងសម្គាល់អក្សរខ្មែរ និងអង់គ្លេសដោយស្វ័យប្រវត្ត
                </p>
              </div>
            </div>

            {selectedFile && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg bg-[#EFF4FC] border border-[#D0E0F7]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#2457A7] truncate">
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  type="submit"
                  disabled={isScanning}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#2457A7] text-white hover:bg-[#1c4587] font-khmer shadow-xs w-full sm:w-auto"
                >
                  {isScanning ? 'កំពុងស្កេន...' : 'ចាប់ផ្តើមស្កេនបង្កាន់ដៃ'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Error */}
        {error && (
          <ErrorState
            title="បញ្ហាក្នុងការស្កេនបង្កាន់ដៃ"
            message={error}
          />
        )}

        {/* Results View */}
        {result && (
          <div className="space-y-4">
            {/* Real Metadata & Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-[#E5EAF0] shadow-xs text-xs">
              <div>
                <span className="text-[#5E6C84] block text-[11px] font-khmer">ឈ្មោះឯកសារ:</span>
                <span className="font-semibold text-[#172B4D] truncate block">{result.filename}</span>
              </div>
              <div>
                <span className="text-[#5E6C84] block text-[11px] font-khmer">ភាសាដែលគាំទ្រ:</span>
                <span className="font-mono font-semibold text-[#2457A7]">{result.languages.join(' + ')}</span>
              </div>
              {detectedSummary?.detectedDate && (
                <div>
                  <span className="text-[#5E6C84] block text-[11px] font-khmer">កាលបរិច្ឆេទសម្គាល់:</span>
                  <span className="font-mono font-semibold text-[#172B4D]">{detectedSummary.detectedDate}</span>
                </div>
              )}
              {detectedSummary?.detectedCurrency && (
                <div>
                  <span className="text-[#5E6C84] block text-[11px] font-khmer">រូបិយប័ណ្ណ:</span>
                  <span className="font-semibold text-[#00875A]">{detectedSummary.detectedCurrency}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
              {/* Left Preview */}
              <div className="bg-white border border-[#E5EAF0] rounded-xl p-3 sm:p-4 shadow-xs">
                <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider mb-2 sm:mb-3 font-khmer">
                  រូបភាពបង្កាន់ដៃដើម
                </h3>
                {previewUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={previewUrl}
                    alt="Receipt Preview"
                    className="max-h-[300px] sm:max-h-[500px] w-auto mx-auto object-contain rounded-lg border border-[#E5EAF0]"
                  />
                )}
              </div>

              {/* Right Text Output */}
              <div className="bg-white border border-[#E5EAF0] rounded-xl shadow-xs overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#E5EAF0] bg-[#F5F7FA]">
                  <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider font-khmer">
                    អត្ថបទដែលបានសម្គាល់
                  </h3>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-[#D0E0F7] bg-white text-[#172B4D] hover:bg-[#F5F7FA]"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-[#00875A]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleDownloadTxt}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-[#D0E0F7] bg-white text-[#172B4D] hover:bg-[#F5F7FA]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>TXT</span>
                    </button>
                  </div>
                </div>
                <textarea
                  readOnly
                  value={result.extracted_text}
                  className="w-full h-[280px] sm:h-[450px] p-3 sm:p-4 text-xs sm:text-sm font-khmer leading-relaxed bg-white border-0 resize-none focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
