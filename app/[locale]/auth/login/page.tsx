import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getTranslations } from 'next-intl/server';
import LoginPage from '../../../../components/pages/LoginPage';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Auth.login' });

  return generateMetadataBasic({ title: t('title') });
}

export default function Page() {
  return <LoginPage />;
}
