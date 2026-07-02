import { ENVIRONMENT } from '@/lib/constants/common';
import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

// Locales hidden from view/build in production only. They remain available on
// preview/staging so the languages can be tested before going live.
const HIDDEN_IN_PRODUCTION_LOCALES = ['ar', 'tr'];
const ALL_LOCALES = ['en', 'de', 'fr', 'es', 'pt', 'hi', 'ar', 'tr'];

const locales =
  ENVIRONMENT === 'production'
    ? ALL_LOCALES.filter((locale) => !HIDDEN_IN_PRODUCTION_LOCALES.includes(locale))
    : ALL_LOCALES;

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
