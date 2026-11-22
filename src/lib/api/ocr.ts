import { apiClient } from './client';
import { API_BASE_URL } from '../config';
import {
  DocumentUploadResponse,
  DocumentMetadataResponse,
  DocumentSearchResult,
  DocumentVerificationView,
  VerificationSubmissionRequest,
  VerificationSubmissionResponse,
  ClassificationResult,
  ClassificationCorrectionRequest,
  AuditLogQueryResponse,
  ScanReceiptResponse,
  HealthResponse,
  ArchiveSearchParams,
  AuditLogParams,
} from '../../types/api';

/**
 * 1. Upload & Process Document
 * Real endpoint: POST /api/v1/documents/upload
 */
export async function uploadDocument(
  file: File,
  officerName: string = 'officer'
): Promise<DocumentUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('officer_name', officerName);

  return apiClient<DocumentUploadResponse>('/api/v1/documents/upload', {
    method: 'POST',
    body: formData,
    timeoutMs: 120000, // OCR processing may take time
  });
}

/**
 * 2. Get Document Details
 * Real endpoint: GET /api/v1/documents/{document_id}
 */
export async function getDocumentDetails(
  documentId: string
): Promise<DocumentMetadataResponse> {
  return apiClient<DocumentMetadataResponse>(`/api/v1/documents/${documentId}`, {
    method: 'GET',
  });
}

/**
 * 3. Delete Document
 * Real endpoint: DELETE /api/v1/documents/{document_id}
 */
export async function deleteDocument(
  documentId: string,
  officerName: string = 'admin'
): Promise<{ success: boolean; message?: string }> {
  return apiClient<{ success: boolean; message?: string }>(
    `/api/v1/documents/${documentId}`,
    {
      method: 'DELETE',
      params: { officer_name: officerName },
    }
  );
}

/**
 * 4. Get Document File URL
 * Real endpoint: GET /api/v1/documents/{document_id}/file
 */
export function getDocumentFileUrl(documentId: string): string {
  return `${API_BASE_URL}/api/v1/documents/${documentId}/file`;
}

/**
 * 5. Get Verification Workspace
 * Real endpoint: GET /api/v1/verifications/{document_id}
 */
export async function getVerificationWorkspace(
  documentId: string
): Promise<DocumentVerificationView> {
  return apiClient<DocumentVerificationView>(`/api/v1/verifications/${documentId}`, {
    method: 'GET',
  });
}

/**
 * 6. Submit Verification Corrections
 * Real endpoint: POST /api/v1/verifications/{document_id}/submit
 */
export async function submitVerificationCorrections(
  documentId: string,
  payload: VerificationSubmissionRequest
): Promise<VerificationSubmissionResponse> {
  return apiClient<VerificationSubmissionResponse>(
    `/api/v1/verifications/${documentId}/submit`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

/**
 * 7. Get Document Classification
 * Real endpoint: GET /api/v1/classification/{document_id}
 */
export async function getDocumentClassification(
  documentId: string
): Promise<ClassificationResult> {
  return apiClient<ClassificationResult>(`/api/v1/classification/${documentId}`, {
    method: 'GET',
  });
}

/**
 * 8. Override Document Classification
 * Real endpoint: PATCH /api/v1/classification/{document_id}/override
 */
export async function overrideDocumentClassification(
  documentId: string,
  payload: ClassificationCorrectionRequest,
  officerName: string = 'officer'
): Promise<ClassificationResult> {
  return apiClient<ClassificationResult>(
    `/api/v1/classification/${documentId}/override`,
    {
      method: 'PATCH',
      params: { officer_name: officerName },
      body: JSON.stringify(payload),
    }
  );
}

/**
 * 9. Search Digital Archive
 * Real endpoint: GET /api/v1/archive/search
 */
export async function searchArchive(
  params: ArchiveSearchParams = {}
): Promise<DocumentSearchResult> {
  return apiClient<DocumentSearchResult>('/api/v1/archive/search', {
    method: 'GET',
    params: {
      query: params.query,
      document_type: params.document_type,
      status: params.status,
      registration_number: params.registration_number,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
    },
  });
}

/**
 * 10. Get System Audit Trail Logs
 * Real endpoint: GET /api/v1/audit/logs
 */
export async function getAuditLogs(
  params: AuditLogParams = {}
): Promise<AuditLogQueryResponse> {
  return apiClient<AuditLogQueryResponse>('/api/v1/audit/logs', {
    method: 'GET',
    params: {
      user_id: params.user_id,
      action: params.action,
      resource_id: params.resource_id,
      limit: params.limit ?? 25,
    },
  });
}

/**
 * 11. Quick Receipt Scan
 * Real endpoint: POST /api/v1/receipts/scan
 */
export async function scanReceipt(file: File): Promise<ScanReceiptResponse> {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient<ScanReceiptResponse>('/api/v1/receipts/scan', {
    method: 'POST',
    body: formData,
    timeoutMs: 60000,
  });
}

/**
 * 12. Health Check
 * Real endpoint: GET /api/v1/health
 */
export async function getHealthStatus(): Promise<HealthResponse> {
  return apiClient<HealthResponse>('/api/v1/health', {
    method: 'GET',
    timeoutMs: 10000,
  });
}
