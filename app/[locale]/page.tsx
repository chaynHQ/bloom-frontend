import { getStoryblokPageProps } from '@/utils/getStoryblokPageProps';
import HomePage from './page-client';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale;

  const pageProps = await getStoryblokPageProps('home', locale);
  return <HomePage story={pageProps?.story} />;
}
