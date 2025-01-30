import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getTranslations } from 'next-intl/server';
import ResetPasswordPage from '../../../../components/pages/ResetPasswordPage';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Auth.resetPassword' });

  return generateMetadataBasic({ title: t('title') });
}

export default function Page() {
  return <ResetPasswordPage />;
}
