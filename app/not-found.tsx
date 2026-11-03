import BaseLayout from '@/components/layout/BaseLayout';
import NotFoundPage from '@/components/pages/NotFound';
import { routing } from '@/i18n/routing';
import { generateMetadataBase } from '@/lib/utils/generateMetadataBase';
import { setRequestLocale } from 'next-intl/server';

// The root not-found page gets no locale param; it renders in the default locale.
export async function generateMetadata() {
  return await generateMetadataBase(routing.defaultLocale);
}

export default function GlobalNotFound() {
  setRequestLocale(routing.defaultLocale);

  return (
    <BaseLayout locale={routing.defaultLocale}>
      <NotFoundPage />
    </BaseLayout>
  );
}
