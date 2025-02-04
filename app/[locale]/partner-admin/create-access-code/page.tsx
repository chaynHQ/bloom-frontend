import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getTranslations } from 'next-intl/server';
import CreateAccessCodePage from '../../../../components/pages/CreateAccessCodePage';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'PartnerAdmin.createAccessCode' });

  return generateMetadataBasic({ title: t('title') });
}

export default function Page() {
  return <CreateAccessCodePage />;
}
