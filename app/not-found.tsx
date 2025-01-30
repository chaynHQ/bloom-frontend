import { routing } from '@/i18n/routing';
import BaseLayout from '@/lib/components/layout/BaseLayout';
import NotFoundPage from '@/lib/components/pages/NotFound';

export default function GlobalNotFound() {
  return (
    <BaseLayout locale={routing.defaultLocale}>
      <NotFoundPage />
    </BaseLayout>
  );
}
