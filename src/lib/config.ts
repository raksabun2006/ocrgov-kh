export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://3-25-134-111.sslip.io';

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
export const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
export const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

export const DOCUMENT_TYPE_LABELS: Record<string, { km: string; en: string }> = {
  BIRTH_CERTIFICATE: {
    km: 'សំបុត្រកំណើត',
    en: 'Birth Certificate',
  },
  FAMILY_BOOK: {
    km: 'សៀវភៅគ្រួសារ',
    en: 'Family Book',
  },
  IDENTITY_CARD: {
    km: 'អត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរ',
    en: 'National ID Card',
  },
  ADMINISTRATIVE_LETTER: {
    km: 'លិខិតរដ្ឋបាលផ្លូវការ',
    en: 'Administrative Letter',
  },
  APPLICATION_FORM: {
    km: 'ពាក្យស្នើសុំរដ្ឋបាល',
    en: 'Application Form',
  },
  OFFICIAL_CERTIFICATE: {
    km: 'វិញ្ញាបនបត្រ / សញ្ញាបត្រផ្លូវការ',
    en: 'Official Certificate',
  },
  UNKNOWN: {
    km: 'មិនទាន់កំណត់ប្រភេទ',
    en: 'Unclassified Document',
  },
};
