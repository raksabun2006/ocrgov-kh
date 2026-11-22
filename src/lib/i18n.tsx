'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'km' | 'en';

export interface Translations {
  systemTitle: string;
  systemSubtitle: string;
  systemBadge: string;
  navDashboard: string;
  navOcr: string;
  navReceipts: string;
  navDocuments: string;
  navAudit: string;
  navSettings: string;
  startOcr: string;
  quickScan: string;
  uploadAreaTitle: string;
  uploadAreaSubtitle: string;
  uploadFormats: string;
  maxFileSize: string;
  selectFile: string;
  dragDropFile: string;
  processing: string;
  processingSub: string;
  uploading: string;
  successUpload: string;
  extractedText: string;
  documentPreview: string;
  copyText: string;
  copied: string;
  downloadTxt: string;
  downloadDocx: string;
  clearText: string;
  resetConfirmTitle: string;
  resetConfirmDesc: string;
  cancel: string;
  confirm: string;
  officerNameLabel: string;
  documentTypeLabel: string;
  classificationScore: string;
  statusLabel: string;
  confidenceScore: string;
  fileSizeLabel: string;
  hashLabel: string;
  uploadedAt: string;
  totalDocuments: string;
  processedDocs: string;
  pendingDocs: string;
  failedDocs: string;
  recentActivity: string;
  viewAll: string;
  noDocumentsYet: string;
  noAuditLogsYet: string;
  actionView: string;
  actionDelete: string;
  actionVerify: string;
  actionDownload: string;
  deleteConfirm: string;
  deleteWarning: string;
  overrideClassification: string;
  structuredDataTab: string;
  rawTextTab: string;
  verificationWorkspace: string;
  birthCertInfo: string;
  fullNameKhmer: string;
  fullNameEnglish: string;
  dob: string;
  gender: string;
  pob: string;
  fatherName: string;
  motherName: string;
  registrationNumber: string;
  registrationDate: string;
  reviewerName: string;
  finalizeVerification: string;
  saveCorrections: string;
  auditTrailTitle: string;
  onlineStatus: string;
  offlineStatus: string;
  switchLang: string;
  zoomIn: string;
  zoomOut: string;
  resetZoom: string;
  fitScreen: string;
}

const translations: Record<Language, Translations> = {
  km: {
    systemTitle: 'ប្រព័ន្ធឌីជីថលសម្រាប់សម្គាល់អត្ថបទក្នុងឯកសារ',
    systemSubtitle: 'Government Document Intelligence & OCR System',
    systemBadge: 'ព្រះរាជាណាចក្រកម្ពុជា • ជាតិ សាសនា ព្រះមហាក្សត្រ',
    navDashboard: 'ផ្ទាំងគ្រប់គ្រងទូទៅ',
    navOcr: 'ដំណើរការ OCR ឯកសារ',
    navReceipts: 'ស្កេនបង្កាន់ដៃ / វិក្កយបត្រ',
    navDocuments: 'បណ្ណសារឯកសារឌីជីថល',
    navAudit: 'កំណត់ហេតុសវនកម្ម',
    navSettings: 'ការកំណត់ & អត្តសញ្ញាណមន្ត្រី',
    startOcr: 'ចាប់ផ្តើមដំណើរការ OCR',
    quickScan: 'ស្កេនបង្កាន់ដៃរហ័ស',
    uploadAreaTitle: 'ទម្លាក់ឯកសារនៅទីនេះ ឬ ចុចដើម្បីជ្រើសរើស',
    uploadAreaSubtitle: 'គាំទ្រឯកសាររដ្ឋបាលជាទម្រង់ PDF, PNG, JPG, JPEG',
    uploadFormats: 'ទម្រង់ឯកសារ៖ PDF, PNG, JPG, JPEG',
    maxFileSize: 'ទំហំអតិបរមា៖ 15 MB ក្នុងមួយឯកសារ',
    selectFile: 'ជ្រើសរើសឯកសារ',
    dragDropFile: 'ទម្លាក់ឯកសារនៅទីនេះ',
    processing: 'កំពុងដំណើរការ OCR...',
    processingSub: 'ប្រព័ន្ធកំពុងពិនិត្យ កែតម្រូវ និងសម្គាល់អក្សរខ្មែរ និងអង់គ្លេស',
    uploading: 'កំពុងផ្ទុកឡើងឯកសារ...',
    successUpload: 'ដំណើរការ OCR ជោគជ័យ',
    extractedText: 'អត្ថបទដែលបានសម្គាល់ (OCR Text)',
    documentPreview: 'ទិដ្ឋភាពឯកសារដើម',
    copyText: 'ចម្លងអត្ថបទ',
    copied: 'បានចម្លងរួចរាល់',
    downloadTxt: 'ទាញយកជា TXT',
    downloadDocx: 'ទាញយកជា Word (DOCX)',
    clearText: 'សម្អាត / កំណត់ឡើងវិញ',
    resetConfirmTitle: 'បញ្ជាក់ការសម្អាតទិន្នន័យ',
    resetConfirmDesc: 'តើលោកអ្នកពិតជាចង់សម្អាតលទ្ធផល OCR និងឯកសារដែលបានជ្រើសរើសមែនទេ?',
    cancel: 'បោះបង់',
    confirm: 'បញ្ជាក់',
    officerNameLabel: 'ឈ្មោះមន្ត្រីទទួលបន្ទុក',
    documentTypeLabel: 'ប្រភេទឯកសាររដ្ឋបាល',
    classificationScore: 'កម្រិតភាពត្រឹមត្រូវនៃការចាត់ថ្នាក់',
    statusLabel: 'ស្ថានភាព',
    confidenceScore: 'កម្រិតទំនុកចិត្តមធ្យម (Confidence)',
    fileSizeLabel: 'ទំហំឯកសារ',
    hashLabel: 'លេខកូដសុចរិតភាព (SHA-256)',
    uploadedAt: 'កាលបរិច្ឆេទផ្ទុកឡើង',
    totalDocuments: 'ឯកសារសរុបក្នុងប្រព័ន្ធ',
    processedDocs: 'ដំណើរការជោគជ័យ',
    pendingDocs: 'រង់ចាំការផ្ទៀងផ្ទាត់',
    failedDocs: 'បរាជ័យ',
    recentActivity: 'សកម្មភាព OCR ថ្មីៗ',
    viewAll: 'មើលទាំងអស់',
    noDocumentsYet: 'មិនទាន់មានឯកសារនៅក្នុងប្រព័ន្ធនៅឡើយទេ',
    noAuditLogsYet: 'មិនទាន់មានកំណត់ហេតុសវនកម្មនៅឡើយទេ',
    actionView: 'ពិនិត្យ',
    actionDelete: 'លុប',
    actionVerify: 'ផ្ទៀងផ្ទាត់ទិន្នន័យ',
    actionDownload: 'ទាញយកឯកសារដើម',
    deleteConfirm: 'បញ្ជាក់ការលុបឯកសារ',
    deleteWarning: 'ឯកសារនិងកំណត់ត្រានឹងត្រូវលុបចេញពីប្រព័ន្ធដោយមានការកត់ត្រាសវនកម្ម។',
    overrideClassification: 'កែប្រែប្រភេទឯកសារ',
    structuredDataTab: 'ទិន្នន័យរចនាសម្ព័ន្ធ (Civil Registration)',
    rawTextTab: 'អត្ថបទ OCR ពេញលេញ',
    verificationWorkspace: 'ផ្ទាំងផ្ទៀងផ្ទាត់ទិន្នន័យដោយមន្ត្រី',
    birthCertInfo: 'ព័ត៌មានសំបុត្រកំណើតផ្លូវការ',
    fullNameKhmer: 'គោត្តនាម និងនាម (ខ្មែរ)',
    fullNameEnglish: 'ឈ្មោះជាឡាតាំង (English)',
    dob: 'ថ្ងៃ ខែ ឆ្នាំកំណើត',
    gender: 'ភេទ',
    pob: 'ទីកន្លែងកំណើត',
    fatherName: 'ឪពុកឈ្មោះ',
    motherName: 'ម្តាយឈ្មោះ',
    registrationNumber: 'លេខចុះបញ្ជី / សំបុត្រ',
    registrationDate: 'ថ្ងៃចុះបញ្ជី',
    reviewerName: 'ឈ្មោះមន្ត្រីត្រួតពិនិត្យ',
    finalizeVerification: 'បញ្ជាក់និងបញ្ចប់ការផ្ទៀងផ្ទាត់ជាផ្លូវការ',
    saveCorrections: 'រក្សាទុកការកែតម្រូវ',
    auditTrailTitle: 'កំណត់ត្រាសវនកម្មប្រព័ន្ធរដ្ឋបាល',
    onlineStatus: 'ដំណើរការធម្មតា',
    offlineStatus: 'មិនអាចភ្ជាប់បាន',
    switchLang: 'ភាសា / Language',
    zoomIn: 'ពង្រីក',
    zoomOut: 'បង្រួម',
    resetZoom: 'ទំហំដើម',
    fitScreen: 'តម្រូវតាមអេក្រង់',
  },
  en: {
    systemTitle: 'Government Document Intelligence & OCR System',
    systemSubtitle: 'Kingdom of Cambodia • Nation Religion King',
    systemBadge: 'Kingdom of Cambodia • Nation Religion King',
    navDashboard: 'Dashboard Overview',
    navOcr: 'OCR Document Processing',
    navReceipts: 'Quick Receipt Scan',
    navDocuments: 'Digital Document Archive',
    navAudit: 'Audit Trail Logs',
    navSettings: 'Settings & Identity',
    startOcr: 'Start OCR Processing',
    quickScan: 'Scan Receipt / Voucher',
    uploadAreaTitle: 'Drop official document here or click to browse',
    uploadAreaSubtitle: 'Supports administrative documents in PDF, PNG, JPG, JPEG',
    uploadFormats: 'Accepted formats: PDF, PNG, JPG, JPEG',
    maxFileSize: 'Maximum file size: 15 MB per file',
    selectFile: 'Browse File',
    dragDropFile: 'Drop document here',
    processing: 'Processing OCR...',
    processingSub: 'System is deskewing, filtering, and recognizing Khmer & English text',
    uploading: 'Uploading document...',
    successUpload: 'OCR Processing Successful',
    extractedText: 'Extracted OCR Text',
    documentPreview: 'Original Document Preview',
    copyText: 'Copy Text',
    copied: 'Copied to Clipboard',
    downloadTxt: 'Download as TXT',
    downloadDocx: 'Download as Word (DOCX)',
    clearText: 'Clear / Reset',
    resetConfirmTitle: 'Confirm Reset',
    resetConfirmDesc: 'Are you sure you want to clear the OCR output and selected document?',
    cancel: 'Cancel',
    confirm: 'Confirm',
    officerNameLabel: 'Responsible Officer Name',
    documentTypeLabel: 'Document Classification',
    classificationScore: 'Classification Confidence',
    statusLabel: 'Status',
    confidenceScore: 'Average OCR Confidence',
    fileSizeLabel: 'File Size',
    hashLabel: 'Integrity Checksum (SHA-256)',
    uploadedAt: 'Upload Date & Time',
    totalDocuments: 'Total Archived Documents',
    processedDocs: 'Successfully Processed',
    pendingDocs: 'Pending Verification',
    failedDocs: 'Failed',
    recentActivity: 'Recent OCR Activities',
    viewAll: 'View All',
    noDocumentsYet: 'No documents processed in the system yet.',
    noAuditLogsYet: 'No audit logs recorded yet.',
    actionView: 'View',
    actionDelete: 'Delete',
    actionVerify: 'Human Verification',
    actionDownload: 'Download Original',
    deleteConfirm: 'Confirm Document Deletion',
    deleteWarning: 'Document file and records will be deleted with an immutable audit log entry.',
    overrideClassification: 'Override Classification',
    structuredDataTab: 'Structured Civil Data',
    rawTextTab: 'Full OCR Extracted Text',
    verificationWorkspace: 'Official Verification Workspace',
    birthCertInfo: 'Civil Registration Record Details',
    fullNameKhmer: 'Full Name (Khmer)',
    fullNameEnglish: 'Full Name (Latin)',
    dob: 'Date of Birth',
    gender: 'Gender',
    pob: 'Place of Birth',
    fatherName: "Father's Name",
    motherName: "Mother's Name",
    registrationNumber: 'Registration Certificate No.',
    registrationDate: 'Registration Date',
    reviewerName: 'Reviewing Officer Name',
    finalizeVerification: 'Confirm & Finalize Verification Record',
    saveCorrections: 'Submit Field Corrections',
    auditTrailTitle: 'Administrative System Audit Trail',
    onlineStatus: 'System Online',
    offlineStatus: 'System Offline',
    switchLang: 'Language / ភាសា',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    resetZoom: 'Reset Zoom',
    fitScreen: 'Fit to Viewport',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'km',
  setLanguage: () => {},
  t: translations.km,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('km');

  useEffect(() => {
    const saved = localStorage.getItem('gov_ocr_lang') as Language;
    if (saved === 'km' || saved === 'en') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('gov_ocr_lang', lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
