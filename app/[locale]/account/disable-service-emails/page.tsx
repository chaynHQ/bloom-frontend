import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getTranslations } from 'next-intl/server';
import DisableServiceEmailsPage from '../../../../components/pages/DisableServiceEmailsPage';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Account.disableServiceEmails' });

  return generateMetadataBasic({ title: t('title') });
}

export default function Page() {
  return <DisableServiceEmailsPage />;
}
