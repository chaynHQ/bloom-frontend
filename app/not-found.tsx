import BaseLayout from '@/components/layout/BaseLayout';
import NotFoundPage from '@/components/pages/NotFound';
import { routing } from '@/i18n/routing';
import { generateMetadataBase } from '@/lib/utils/generateMetadataBase';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  return await generateMetadataBase(locale);
}

export default function GlobalNotFound() {
  return (
    <BaseLayout locale={routing.defaultLocale}>
      <NotFoundPage />
    </BaseLayout>
  );
}
