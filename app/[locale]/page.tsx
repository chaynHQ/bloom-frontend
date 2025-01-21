import { getStoryblokPageProps } from '../../utils/getStoryblokPageProps';
import HomePage from './home-page';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale;

  const pageProps = await getStoryblokPageProps('home', locale);
  return <HomePage story={pageProps?.story} />;
}
