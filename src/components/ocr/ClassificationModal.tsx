'use client';

import React, { useState } from 'react';
import { Tag, Edit2, X, ShieldAlert } from 'lucide-react';
import { DocumentTypeEnum } from '../../types/api';
import { DOCUMENT_TYPE_LABELS } from '../../lib/config';
import { overrideDocumentClassification } from '../../lib/api/ocr';
import { useLanguage } from '../../lib/i18n';
import { useAuth } from '../../lib/auth-context';

interface ClassificationModalProps {
  documentId: string;
  currentType: string;
  khmerLabel?: string;
  confidence?: number;
  onUpdated: (newType: string, newLabel: string) => void;
}

export function ClassificationBadgeAndModal({
  documentId,
  currentType,
  khmerLabel,
  confidence,
  onUpdated,
}: ClassificationModalProps) {
  const { t, language } = useLanguage();
  const { officer } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentTypeEnum>(
    (currentType as DocumentTypeEnum) || 'BIRTH_CERTIFICATE'
  );
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableTypes: DocumentTypeEnum[] = [
    'BIRTH_CERTIFICATE',
    'FAMILY_BOOK',
    'IDENTITY_CARD',
    'ADMINISTRATIVE_LETTER',
    'APPLICATION_FORM',
    'OFFICIAL_CERTIFICATE',
    'UNKNOWN',
  ];

  const handleOverride = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await overrideDocumentClassification(
        documentId,
        {
          document_type: selectedType,
          reason: reason || undefined,
        },
        officer.name || 'officer'
      );
      onUpdated(res.document_type, res.type_khmer_label);
      setIsOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to override classification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayKhmer =
    khmerLabel ||
    DOCUMENT_TYPE_LABELS[currentType]?.km ||
    currentType;

  return (
    <>
      {/* Classification Tag & Override Button */}
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EFF4FC] border border-[#D0E0F7] text-xs font-semibold text-[#2457A7]">
          <Tag className="w-3.5 h-3.5 text-[#2457A7]" strokeWidth={2} />
          <span className="font-khmer">{displayKhmer}</span>
          <span className="text-[#5E6C84] text-[11px] font-normal font-sans">
            ({currentType})
          </span>
          {confidence !== undefined && (
            <span className="px-1.5 py-0.2 rounded-sm bg-white border border-[#D0E0F7] text-[10px] text-[#2457A7]">
              {(confidence * 100).toFixed(0)}%
            </span>
          )}
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="p-1.5 rounded-md text-[#5E6C84] hover:text-[#2457A7] hover:bg-[#F5F7FA] transition-colors border border-transparent hover:border-[#D0E0F7]"
          title={t.overrideClassification}
        >
          <Edit2 className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>

      {/* Override Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#D0E0F7]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F5F7FA]">
              <h3 className="text-sm font-bold text-[#172B4D] font-khmer">
                {t.overrideClassification}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#7A869A] hover:text-[#172B4D]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-[#FFEBE6] border border-[#FFBDAD] text-xs text-[#DE350B]">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1.5 font-khmer">
                  {t.documentTypeLabel}
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as DocumentTypeEnum)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D0E0F7] rounded-lg text-[#172B4D] focus:ring-2 focus:ring-[#2457A7] font-khmer"
                >
                  {availableTypes.map((type) => (
                    <option key={type} value={type}>
                      {DOCUMENT_TYPE_LABELS[type]?.km || type} ({type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1.5 font-khmer">
                  {language === 'km' ? 'មូលហេតុនៃការកែប្រែ' : 'Reason for Override'}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D0E0F7] rounded-lg text-[#172B4D] focus:ring-2 focus:ring-[#2457A7] font-khmer"
                  placeholder="បញ្ជាក់ពីមូលហេតុនៃការកែប្រែប្រភេទឯកសារ..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-3 border-t border-[#F5F7FA]">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#D0E0F7] text-[#5E6C84] hover:bg-[#F5F7FA] font-khmer"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleOverride}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#2457A7] text-white hover:bg-[#1c4587] font-khmer shadow-xs"
              >
                {isSubmitting ? 'កំពុងកែប្រែ...' : t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
