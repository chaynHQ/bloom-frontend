export type Locale = (typeof locales)[number];
export const COOKIE_LOCALE_NAME = 'NEXT_LOCALE';
export const COOKIE_LOCALE_PATH = '/';

export const locales = ['en', 'es', 'hi', 'fr', 'pt', 'de'];
export const defaultLocale: Locale = 'en';
