import SettingsPage from '@/components/pages/SettingsPage';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getTranslations } from 'next-intl/server';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Account.accountSettings' });

  return generateMetadataBasic({ title: t('title') });
}

export default function Page() {
  return <SettingsPage />;
}
