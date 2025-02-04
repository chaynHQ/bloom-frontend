import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getTranslations } from 'next-intl/server';
import AdminDashboardPage from '../../../../components/pages/AdminDashboardPage';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Admin' });

  return generateMetadataBasic({ title: t('title') });
}

export default function Page() {
  return <AdminDashboardPage />;
}
