import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getTranslations } from 'next-intl/server';
import RegisterPage from '../../../../components/pages/RegisterPage';

type Params = Promise<{ locale: string }>;

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Auth.register' });

  return generateMetadataBasic({ title: t('title') });
}

export default function Page() {
  return <RegisterPage />;
}
