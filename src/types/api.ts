/**
 * Cambodian Government Document Intelligence System API Types
 * Mapped strictly to OpenAPI 3.1.0 specifications.
 */

export type DocumentTypeEnum =
  | 'BIRTH_CERTIFICATE'
  | 'FAMILY_BOOK'
  | 'IDENTITY_CARD'
  | 'ADMINISTRATIVE_LETTER'
  | 'APPLICATION_FORM'
  | 'OFFICIAL_CERTIFICATE'
  | 'UNKNOWN';

export interface BirthCertificateField {
  value?: string | null;
  confidence?: number | null;
  bounding_box?: Record<string, number> | null;
  is_uncertain: boolean;
}

export interface BirthCertificateData {
  full_name_khmer?: string | null;
  full_name_english?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  place_of_birth?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
  registration_number?: string | null;
  registration_date?: string | null;
  field_confidences?: Record<string, BirthCertificateField> | null;
}

export interface DocumentUploadResponse {
  document_id: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  sha256_hash: string;
  document_type: string;
  type_khmer_label: string;
  status: string;
  extracted_text: string | null;
  average_confidence: number | null;
  birth_certificate_data?: BirthCertificateData | null;
  created_at: string;
}

export interface DocumentMetadataResponse {
  document_id: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  sha256_hash: string;
  document_type: string;
  status: string;
  average_confidence: number | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentSearchResult {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  items: DocumentMetadataResponse[];
}

export interface FieldVerificationDetail {
  field_name: string;
  field_value: string | null;
  confidence: number | null;
  uncertainty_level: string;
  bounding_box: Record<string, number> | null;
  is_verified: boolean;
}

export interface VerificationHistoryItem {
  field_name: string;
  original_value: string | null;
  corrected_value: string | null;
  verified_by: string;
  notes: string | null;
  verified_at: string;
}

export interface DocumentVerificationView {
  document_id: string;
  original_filename: string;
  document_type: string;
  status: string;
  document_file_url: string;
  average_confidence: number | null;
  highlighted_uncertain_fields: string[];
  fields: FieldVerificationDetail[];
  history: VerificationHistoryItem[];
}

export interface FieldCorrectionInput {
  field_name: string;
  corrected_value: string;
  notes?: string | null;
}

export interface VerificationSubmissionRequest {
  reviewer_name: string;
  corrections: FieldCorrectionInput[];
  confirm_and_finalize: boolean;
  notes?: string | null;
}

export interface VerificationSubmissionResponse {
  success: boolean;
  document_id: string;
  status: string;
  message: string;
  total_corrected_fields: number;
  verified_by: string;
  verified_at: string;
}

export interface ClassificationResult {
  document_type: DocumentTypeEnum;
  type_khmer_label: string;
  confidence: number;
  matched_keywords: string[];
  scores: Record<string, number>;
}

export interface ClassificationCorrectionRequest {
  document_type: DocumentTypeEnum;
  reason?: string | null;
}

export interface AuditLogItem {
  id: number;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address: string | null;
  details: Record<string, unknown> | null;
  timestamp: string;
}

export interface AuditLogQueryResponse {
  total: number;
  items: AuditLogItem[];
}

export interface ScanReceiptResponse {
  success: boolean;
  filename: string;
  languages: string[];
  extracted_text: string;
}

export interface HealthResponse {
  system: string;
  version: string;
  status: string;
  ocr_engine?: {
    ready: boolean;
    languages: string[];
  };
  docs_url?: string;
  openapi_url?: string;
}

export interface ArchiveSearchParams {
  query?: string;
  document_type?: string;
  status?: string;
  registration_number?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogParams {
  user_id?: string;
  action?: string;
  resource_id?: string;
  limit?: number;
}
