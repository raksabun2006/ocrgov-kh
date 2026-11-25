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
    timeoutMs: 300000, // OCR processing may take time (up to 5 min)
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
    timeoutMs: 300000,
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

/**
 * 13. Authentication: Login
 * Real endpoint: POST /api/v1/auth/login
 */
export async function loginApi(credentials: {
  username: string;
  password: string;
}): Promise<import('../../types/api').TokenResponse> {
  return apiClient<import('../../types/api').TokenResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

/**
 * 14. Authentication: Logout
 * Real endpoint: POST /api/v1/auth/logout
 */
export async function logoutApi(): Promise<void> {
  return apiClient<void>('/api/v1/auth/logout', {
    method: 'POST',
  });
}

/**
 * 15. Authentication: Get Current Profile
 * Real endpoint: GET /api/v1/auth/me
 */
export async function getCurrentUserProfile(): Promise<import('../../types/api').UserProfileResponse> {
  return apiClient<import('../../types/api').UserProfileResponse>('/api/v1/auth/me', {
    method: 'GET',
  });
}

/**
 * 16. Authentication: Change Password
 * Real endpoint: POST /api/v1/auth/change-password
 */
export async function changePasswordApi(
  payload: import('../../types/api').ChangePasswordRequest
): Promise<void> {
  return apiClient<void>('/api/v1/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * 17. Admin: Dashboard Summary
 * Real endpoint: GET /api/v1/admin/dashboard
 */
export async function getAdminDashboardSummary(): Promise<import('../../types/api').AdminDashboardResponse> {
  return apiClient<import('../../types/api').AdminDashboardResponse>('/api/v1/admin/dashboard', {
    method: 'GET',
  });
}

/**
 * 18. Admin: OCR Statistics
 * Real endpoint: GET /api/v1/admin/ocr/statistics
 */
export async function getAdminOcrStatistics(): Promise<import('../../types/api').OcrStatisticsResponse> {
  return apiClient<import('../../types/api').OcrStatisticsResponse>('/api/v1/admin/ocr/statistics', {
    method: 'GET',
  });
}

/**
 * 19. Admin: Users List
 * Real endpoint: GET /api/v1/admin/users
 */
export async function listAdminUsers(
  skip: number = 0,
  limit: number = 50,
  search?: string
): Promise<import('../../types/api').UserProfileResponse[]> {
  const res = await apiClient<Record<string, unknown>>('/api/v1/admin/users', {
    method: 'GET',
    params: { skip, limit, search },
  });
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.users)) return res.users as import('../../types/api').UserProfileResponse[];
  if (res && Array.isArray(res.items)) return res.items as import('../../types/api').UserProfileResponse[];
  if (res && Array.isArray(res.data)) return res.data as import('../../types/api').UserProfileResponse[];
  return [];
}

/**
 * 20. Admin: Create User
 * Real endpoint: POST /api/v1/admin/users
 */
export async function createAdminUser(
  payload: import('../../types/api').CreateUserRequest
): Promise<import('../../types/api').UserProfileResponse> {
  return apiClient<import('../../types/api').UserProfileResponse>('/api/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * 21. Admin: Update User
 * Real endpoint: PATCH /api/v1/admin/users/{user_id}
 */
export async function updateAdminUser(
  userId: string,
  payload: import('../../types/api').UpdateUserRequest
): Promise<import('../../types/api').UserProfileResponse> {
  return apiClient<import('../../types/api').UserProfileResponse>(`/api/v1/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/**
 * 22. Admin: Update User Status
 * Real endpoint: PATCH /api/v1/admin/users/{user_id}/status
 */
export async function updateAdminUserStatus(
  userId: string,
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED'
): Promise<import('../../types/api').UserProfileResponse> {
  return apiClient<import('../../types/api').UserProfileResponse>(`/api/v1/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/**
 * 23. Admin: Assign User Roles
 * Real endpoint: POST /api/v1/admin/users/{user_id}/roles
 */
export async function assignAdminUserRoles(
  userId: string,
  roleNames: string[]
): Promise<import('../../types/api').UserProfileResponse> {
  return apiClient<import('../../types/api').UserProfileResponse>(`/api/v1/admin/users/${userId}/roles`, {
    method: 'POST',
    body: JSON.stringify({ role_names: roleNames }),
  });
}

/**
 * 24. Admin: List Roles
 * Real endpoint: GET /api/v1/admin/roles
 */
export async function listAdminRoles(): Promise<import('../../types/api').RoleItem[]> {
  const res = await apiClient<Record<string, unknown>>('/api/v1/admin/roles', {
    method: 'GET',
  });
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.roles)) return res.roles as import('../../types/api').RoleItem[];
  if (res && Array.isArray(res.items)) return res.items as import('../../types/api').RoleItem[];
  if (res && Array.isArray(res.data)) return res.data as import('../../types/api').RoleItem[];
  return [];
}

/**
 * 25. Admin: List Permissions
 * Real endpoint: GET /api/v1/admin/permissions
 */
export async function listAdminPermissions(): Promise<import('../../types/api').PermissionItem[]> {
  const res = await apiClient<Record<string, unknown>>('/api/v1/admin/permissions', {
    method: 'GET',
  });
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.permissions)) return res.permissions as import('../../types/api').PermissionItem[];
  if (res && Array.isArray(res.items)) return res.items as import('../../types/api').PermissionItem[];
  if (res && Array.isArray(res.data)) return res.data as import('../../types/api').PermissionItem[];
  return [];
}

/**
 * 26. Admin: List OCR Providers
 * Real endpoint: GET /api/v1/admin/ocr/providers
 */
export async function listAdminOcrProviders(): Promise<unknown> {
  return apiClient<unknown>('/api/v1/admin/ocr/providers', {
    method: 'GET',
  });
}

/**
 * 27. Admin: System Health Diagnostic
 * Real endpoint: GET /api/v1/admin/system/health
 */
export async function getAdminSystemHealth(): Promise<unknown> {
  return apiClient<unknown>('/api/v1/admin/system/health', {
    method: 'GET',
  });
}
