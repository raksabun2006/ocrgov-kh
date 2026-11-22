'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  History,
  CheckCircle2,
  ChevronRight,
  Save,
  ArrowLeft,
  CheckSquare,
} from 'lucide-react';
import { Shell } from '../../../components/layout/Shell';
import { DocumentViewer } from '../../../components/ocr/DocumentViewer';
import {
  getVerificationWorkspace,
  submitVerificationCorrections,
  getDocumentFileUrl,
} from '../../../lib/api/ocr';
import {
  DocumentVerificationView,
  FieldCorrectionInput,
  VerificationSubmissionResponse,
} from '../../../types/api';
import { useLanguage } from '../../../lib/i18n';
import { useAuth } from '../../../lib/auth-context';
import { useToast } from '../../../lib/toast-context';
import { SkeletonWorkspace } from '../../../components/ui/LoadingSkeleton';
import { ErrorState } from '../../../components/ui/ErrorState';

function VerificationWorkspaceContent() {
  const params = useParams();
  const documentId = params.id as string;

  const { t, language } = useLanguage();
  const { officer } = useAuth();
  const { success, error: toastError } = useToast();

  const [workspace, setWorkspace] = useState<DocumentVerificationView | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Verification Form State
  const [reviewerName, setReviewerName] = useState<string>(officer.name || 'officer');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [fieldNotes, setFieldNotes] = useState<Record<string, string>>({});
  const [confirmFinalize, setConfirmFinalize] = useState<boolean>(true);
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<VerificationSubmissionResponse | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchWorkspace() {
      if (!documentId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await getVerificationWorkspace(documentId);
        if (!isMounted) return;
        setWorkspace(data);

        const initialVals: Record<string, string> = {};
        data.fields.forEach((f) => {
          initialVals[f.field_name] = f.field_value || '';
        });
        setFieldValues(initialVals);
      } catch (err: unknown) {
        if (!isMounted) return;
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load verification workspace.'
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchWorkspace();
    return () => {
      isMounted = false;
    };
  }, [documentId]);

  const handleFieldChange = (fieldName: string, value: string) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const corrections: FieldCorrectionInput[] = [];
    workspace.fields.forEach((f) => {
      const currentVal = fieldValues[f.field_name] ?? '';
      const originalVal = f.field_value ?? '';
      if (currentVal !== originalVal || fieldNotes[f.field_name]) {
        corrections.push({
          field_name: f.field_name,
          corrected_value: currentVal,
          notes: fieldNotes[f.field_name] || undefined,
        });
      }
    });

    try {
      const res = await submitVerificationCorrections(documentId, {
        reviewer_name: reviewerName || officer.name || 'officer',
        corrections,
        confirm_and_finalize: confirmFinalize,
        notes: generalNotes || undefined,
      });

      setSubmissionSuccess(res);
      success(
        language === 'km' ? 'បានបញ្ជាក់ការផ្ទៀងផ្ទាត់' : 'Verification Finalized',
        res.message
      );
      const updatedWorkspace = await getVerificationWorkspace(documentId);
      setWorkspace(updatedWorkspace);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit verification corrections.';
      setError(msg);
      toastError(language === 'km' ? 'បរាជ័យ' : 'Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 sm:pb-4 border-b border-[#E5EAF0]">
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[#5E6C84] mb-1">
            <Link href="/" className="hover:text-[#2457A7] font-khmer">
              {t.navDashboard}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/verify" className="hover:text-[#2457A7] font-khmer">
              {t.navVerify}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#2457A7] font-semibold font-khmer">
              {t.verificationWorkspace}
            </span>
          </div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#172B4D] font-khmer flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-[#2457A7]" />
            <span>{t.verificationWorkspace}</span>
          </h1>
        </div>

        <Link
          href="/verify"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#D0E0F7] bg-white text-[#5E6C84] hover:bg-[#F5F7FA] font-khmer w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'km' ? 'ត្រឡប់ទៅជួរផ្ទៀងផ្ទាត់' : 'Back to Queue'}</span>
        </Link>
      </div>

      {/* Loading State */}
      {isLoading && <SkeletonWorkspace />}

      {/* Error Alert */}
      {error && (
        <ErrorState
          title="មិនអាចទាញយកទិន្នន័យផ្ទៀងផ្ទាត់បានទេ"
          message={error}
        />
      )}

      {/* Success Alert */}
      {submissionSuccess && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-[#E3FCEF] border border-[#ABF5D1] text-xs text-[#00875A] font-khmer">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-bold">{submissionSuccess.message}</p>
            <p className="text-[11px] text-[#006644]">
              កែតម្រូវបាន {submissionSuccess.total_corrected_fields} ចំណុច • មន្ត្រី៖ {submissionSuccess.verified_by}
            </p>
          </div>
        </div>
      )}

      {/* Verification Workspace View */}
      {workspace && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
          {/* Left Column: Official Document Preview */}
          <div className="space-y-4">
            <div className="bg-white border border-[#E5EAF0] rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-[#2457A7] uppercase tracking-wider font-khmer">
                    ឯកសារត្រូវផ្ទៀងផ្ទាត់
                  </h3>
                  <p className="text-sm font-semibold text-[#172B4D]">
                    {workspace.original_filename}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EFF4FC] text-[#2457A7] border border-[#D0E0F7]">
                  {workspace.document_type}
                </span>
              </div>
            </div>

            <DocumentViewer
              file={null}
              fileUrl={getDocumentFileUrl(workspace.document_id)}
            />

            {/* Uncertain Fields Warning Banner */}
            {workspace.highlighted_uncertain_fields.length > 0 && (
              <div className="p-4 rounded-xl bg-[#FFF0B3] border border-[#FFE58F] text-xs text-[#172B4D] space-y-1">
                <div className="flex items-center gap-1.5 font-bold font-khmer text-[#FF991F]">
                  <AlertTriangle className="w-4 h-4 text-[#FF991F]" />
                  <span>ចំណុចដែលកម្រិតទំនុកចិត្តទាប (Uncertain Fields):</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {workspace.highlighted_uncertain_fields.map((field) => (
                    <span
                      key={field}
                      className="px-2 py-0.5 rounded-sm bg-white border border-[#FFE58F] text-[11px] font-mono text-[#172B4D]"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Field Verification & Correction Form */}
          <div className="bg-white border border-[#E5EAF0] rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E5EAF0] bg-[#F5F7FA]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#172B4D] font-khmer">
                    ផ្ទាំងត្រួតពិនិត្យ និងកែតម្រូវទិន្នន័យ
                  </h3>
                  <p className="text-[11px] text-[#5E6C84] mt-0.5 font-khmer">
                    សូមផ្ទៀងផ្ទាត់រាល់ចំណុចជាមួយឯកសារដើមខាងឆ្វេងដៃ
                  </p>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded-sm bg-white border border-[#D0E0F7]">
                  Status: {workspace.status}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
              {/* Officer Reviewer Field */}
              <div>
                <label className="block text-xs font-semibold text-[#172B4D] uppercase tracking-wider mb-1 font-khmer">
                  {t.reviewerName} *
                </label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs bg-white border border-[#D0E0F7] rounded-lg font-khmer focus:ring-2 focus:ring-[#2457A7]"
                />
              </div>

              {/* Dynamic Field Inputs */}
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {workspace.fields.map((field) => {
                  const isUncertain = workspace.highlighted_uncertain_fields.includes(
                    field.field_name
                  );

                  return (
                    <div
                      key={field.field_name}
                      className={`p-3 rounded-lg border transition-all ${
                        isUncertain
                          ? 'bg-[#FFF0B3]/30 border-[#FFE58F]'
                          : 'bg-[#F5F7FA] border-[#E5EAF0]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="text-xs font-bold text-[#172B4D] font-khmer">
                          {field.field_name}
                        </label>

                        <div className="flex items-center gap-1.5 text-[10px]">
                          {field.confidence !== null && (
                            <span className="font-mono px-1.5 py-0.2 rounded-sm bg-white border border-[#D0E0F7]">
                              {(field.confidence * 100).toFixed(0)}%
                            </span>
                          )}
                          {isUncertain && (
                            <span className="text-[#FF991F] font-semibold font-khmer">
                              ពិនិត្យ
                            </span>
                          )}
                        </div>
                      </div>

                      <input
                        type="text"
                        value={fieldValues[field.field_name] || ''}
                        onChange={(e) =>
                          handleFieldChange(field.field_name, e.target.value)
                        }
                        className="w-full px-3 py-2 sm:py-1.5 text-base sm:text-xs bg-white border border-[#D0E0F7] rounded-md font-khmer focus:ring-2 focus:ring-[#2457A7]"
                        placeholder="បញ្ចូលទិន្នន័យត្រឹមត្រូវ..."
                      />
                    </div>
                  );
                })}
              </div>

              {/* Official Confirmation Checkbox */}
              <div className="p-3.5 rounded-lg bg-[#EFF4FC] border border-[#D0E0F7] space-y-1.5">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmFinalize}
                    onChange={(e) => setConfirmFinalize(e.target.checked)}
                    className="mt-0.5 rounded-sm text-[#2457A7] focus:ring-[#2457A7]"
                  />
                  <div className="text-xs font-semibold text-[#2457A7] font-khmer leading-snug">
                    {t.finalizeVerification}
                    <p className="text-[11px] font-normal text-[#5E6C84] mt-0.5">
                      ការបញ្ជាក់នេះនឹងកត់ត្រាចូលក្នុងប្រព័ន្ធសវនកម្មរដ្ឋបាលជាផ្លូវការ
                    </p>
                  </div>
                </label>
              </div>

              {/* Submit Action */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#2457A7] text-white hover:bg-[#1c4587] font-khmer shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'កំពុងរក្សាទុក...' : t.saveCorrections}</span>
                </button>
              </div>
            </form>

            {/* Prior Verification History */}
            {workspace.history && workspace.history.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-[#E5EAF0] bg-[#F5F7FA]">
                <h4 className="text-xs font-bold text-[#2457A7] uppercase tracking-wider mb-2.5 font-khmer flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  <span>ប្រវត្តិនៃការកែតម្រូវកន្លងមក (Correction History)</span>
                </h4>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {workspace.history.map((h, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-md bg-white border border-[#E5EAF0] text-[11px] space-y-0.5"
                    >
                      <div className="flex items-center justify-between text-[#5E6C84]">
                        <span className="font-semibold text-[#172B4D]">
                          {h.field_name}
                        </span>
                        <span>{new Date(h.verified_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[#DE350B] line-through">
                        {h.original_value || '(Empty)'}
                      </p>
                      <p className="text-[#00875A] font-semibold">
                        → {h.corrected_value}
                      </p>
                      <p className="text-[10px] text-[#7A869A]">
                        ផ្ទៀងផ្ទាត់ដោយ៖ {h.verified_by}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerificationPage() {
  return (
    <Shell>
      <Suspense
        fallback={
          <div className="p-12 bg-white border border-[#E5EAF0] rounded-xl text-center">
            <p className="text-xs text-[#5E6C84]">Loading verification workspace...</p>
          </div>
        }
      >
        <VerificationWorkspaceContent />
      </Suspense>
    </Shell>
  );
}
