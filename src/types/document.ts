import { DocumentTypeEnum } from './api';

export interface DocumentFilterState {
  searchQuery: string;
  documentType: DocumentTypeEnum | 'ALL';
  status: string;
  page: number;
  limit: number;
}

export interface OCRProcessingState {
  isUploading: boolean;
  uploadProgress: number;
  isProcessing: boolean;
  error: string | null;
}

export interface OfficerProfile {
  name: string;
  officerId: string;
  departmentKhmer: string;
  departmentEnglish: string;
  roleKhmer: string;
  roleEnglish: string;
}
