import { type Locale } from 'date-fns';
import { de, enGB, es, fr, hi, pt } from 'date-fns/locale';

// Map next-intl locale identifiers to date-fns locale objects
const dateFnsLocales: Record<string, Locale> = {
  en: enGB,
  fr: fr,
  es: es,
  pt: pt,
  hi: hi,
  de: de,
};

// Helper to get the date-fns locale object based on the current app locale
export const getDateLocale = (currentLang: string): Locale => {
  return dateFnsLocales[currentLang] || enGB; // Fallback to English GB
};
