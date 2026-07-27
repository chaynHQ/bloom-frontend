import { type Locale } from 'date-fns';
import { ar, de, enGB, es, fr, hi, pt, tr } from 'date-fns/locale';

// Map next-intl locale identifiers to date-fns locale objects.
// Note: the date-fns `ar` locale formats dates with Western (Latin) digits, which
// matches the app-wide decision to use Western digits for Arabic.
const dateFnsLocales: Record<string, Locale> = {
  en: enGB,
  fr: fr,
  es: es,
  pt: pt,
  hi: hi,
  de: de,
  ar: ar,
  tr: tr,
};

// Helper to get the date-fns locale object based on the current app locale
export const getDateLocale = (currentLang: string): Locale => {
  return dateFnsLocales[currentLang] || enGB; // Fallback to English GB
};
