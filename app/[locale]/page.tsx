import HomePage from '@/components/pages/HomePage';
import { getStoryblokStory } from '@/lib/storyblok';
import { getLibraryStories } from '@/lib/utils/getLibraryStories';

export const revalidate = 14400; // invalidate every 4 hours

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const [story, libraryStories] = await Promise.all([
    getStoryblokStory('home', locale),
    getLibraryStories(locale),
  ]);

  return <HomePage story={story} libraryStories={libraryStories} />;
}
