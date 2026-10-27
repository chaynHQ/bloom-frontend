import HomePage from '@/components/pages/HomePage';
import { getStoryblokStory } from '@/lib/storyblok';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getLibraryStories } from '@/lib/utils/getLibraryStories';
import { getTranslations } from 'next-intl/server';

export const revalidate = 14400; // invalidate every 4 hours

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [story, t] = await Promise.all([
    getStoryblokStory('home', locale),
    getTranslations({ locale, namespace: 'Shared.metadata' }),
  ]);

  return generateMetadataBasic({
    title: story?.content.title || t('title'),
    description: story?.content.seo_description || t('description'),
    locale,
    path: '',
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const [story, libraryStories] = await Promise.all([
    getStoryblokStory('home', locale),
    getLibraryStories(locale),
  ]);

  return <HomePage story={story} libraryStories={libraryStories} />;
}
