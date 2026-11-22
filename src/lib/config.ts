// In browser, always use same-origin relative URLs to hide backend IP and eliminate CORS blocks.
// In SSR / server-side, fallback to env or direct backend.
export const API_BASE_URL =
  typeof window !== 'undefined'
    ? ''
    : process.env.NEXT_PUBLIC_API_BASE_URL || 'https://3-25-134-111.sslip.io';

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
];

export const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

export const DOCUMENT_TYPE_LABELS: Record<string, { km: string; en: string }> = {
  BIRTH_CERTIFICATE: {
    km: 'សំបុត្រកំណើត (Birth Certificate)',
    en: 'Birth Certificate',
  },
  FAMILY_BOOK: {
    km: 'សៀវភៅគ្រួសារ (Family Book)',
    en: 'Family Record Book',
  },
  IDENTITY_CARD: {
    km: 'អត្តសញ្ញាណប័ណ្ណ (Identity Card)',
    en: 'National Identity Card',
  },
  ADMINISTRATIVE_LETTER: {
    km: 'លិខិតរដ្ឋបាល (Administrative Letter)',
    en: 'Official Administrative Letter',
  },
  RECEIPT: {
    km: 'បង្កាន់ដៃ / វិក្កយបត្រ (Receipt)',
    en: 'Financial Receipt / Voucher',
  },
  LAND_TITLE: {
    km: 'ប័ណ្ណកម្មសិទ្ធិដីធ្លី (Land Title)',
    en: 'Official Land Title Certificate',
  },
  UNKNOWN: {
    km: 'មិនទាន់កំណត់ប្រភេទ (Unknown / Unclassified)',
    en: 'Unclassified Document',
  },
};
