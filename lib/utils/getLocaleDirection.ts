export type Direction = 'ltr' | 'rtl';

/**
 * Locales that are written right-to-left.
 * To add a future RTL locale (e.g. Urdu, Farsi, Hebrew) add its code here —
 * this is the single source of truth for text direction across the app.
 */
export const RTL_LOCALES: readonly string[] = ['ar'];

/**
 * Returns the text direction for a given locale.
 * Note: Turkish ('tr') is a left-to-right language despite being one of the
 * newly added locales — only Arabic ('ar') is RTL.
 */
export const getLocaleDirection = (locale: string): Direction =>
  RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';

export const isRtlLocale = (locale: string): boolean => getLocaleDirection(locale) === 'rtl';
