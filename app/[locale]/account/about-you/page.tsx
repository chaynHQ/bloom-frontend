import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getTranslations } from 'next-intl/server';
import AboutYouPage from '../../../../components/pages/AboutYouPage';

type Params = Promise<{ locale: string }>;

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Account.aboutYou' });

  return generateMetadataBasic({ title: t('title') });
}

export default function Page() {
  return <AboutYouPage />;
}
