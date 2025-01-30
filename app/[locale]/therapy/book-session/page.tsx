import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getTranslations } from 'next-intl/server';
import BookTherapyPage from './BookTherapyPage';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Therapy' });

  return generateMetadataBasic({ title: t('title') });
}

export default function Page() {
  return <BookTherapyPage />;
}
