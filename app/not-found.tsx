import BaseLayout from '@/components/layout/BaseLayout';
import NotFoundPage from '@/components/pages/NotFound';
import { routing } from '@/i18n/routing';

export default function GlobalNotFound() {
  return (
    <BaseLayout locale={routing.defaultLocale}>
      <NotFoundPage />
    </BaseLayout>
  );
}
