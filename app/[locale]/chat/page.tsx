import { getLocale } from 'next-intl/server';
import { locales } from '../../../i18n/config';
import { getStoryblokPageProps } from '../../../utils/getStoryblokPageProps';
import Chat from './chat';

export const revalidate = 3600;

export default async function Page() {
  const preview = false;
  const locale = await getLocale();
  const storyblokProps = await getStoryblokPageProps('chat', locale, preview);
  return <Chat story={storyblokProps?.story}></Chat>;
}

export async function generateStaticParams() {
  return locales.map((locale) => {
    return { params: { locale } };
  });
}
