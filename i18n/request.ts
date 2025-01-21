import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: {
      ...(await import(`../messages/shared/${locale}.json`)).default,
      ...(await import(`../messages/auth/${locale}.json`)).default,
      ...(await import(`../messages/account/${locale}.json`)).default,
      ...(await import(`../messages/courses/${locale}.json`)).default,
      ...(await import(`../messages/account/${locale}.json`)).default,
      ...(await import(`../messages/admin/${locale}.json`)).default,
      ...(await import(`../messages/therapy/${locale}.json`)).default,
      ...(await import(`../messages/welcome/${locale}.json`)).default,
      ...(await import(`../messages/partnerAdmin/${locale}.json`)).default,
    },
  };
});
