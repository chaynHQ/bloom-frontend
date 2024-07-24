import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { defaultLocale, HEADER_LOCALE_NAME, locales } from './i18n.config';

export default getRequestConfig(async () => {
  const locale = headers().get(HEADER_LOCALE_NAME) ?? defaultLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: {
      ...(await import(`./messages/shared/${locale}.json`)).default,
      ...(await import(`./messages/navigation/${locale}.json`)).default,
      ...(await import(`./messages/account/${locale}.json`)).default,
      ...(await import(`./messages/auth/${locale}.json`)).default,
      ...(await import(`./messages/partnerAdmin/${locale}.json`)).default,
      ...(await import(`./messages/admin/${locale}.json`)).default,
      ...(await import(`./messages/partnership/${locale}.json`)).default,
      ...(await import(`./messages/welcome/${locale}.json`)).default,
      ...(await import(`./messages/courses/${locale}.json`)).default,
      ...(await import(`./messages/therapy/${locale}.json`)).default,
      ...(await import(`./messages/chat/${locale}.json`)).default,
      ...(await import(`./messages/whatsapp/${locale}.json`)).default,
    },
    timeZone: 'Europe/London',
  };
});
