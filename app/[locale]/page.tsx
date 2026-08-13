import HomePage from '@/components/pages/HomePage';
import { getStoryblokStory } from '@/lib/storyblok';
import { getLibraryStories } from '@/lib/utils/getLibraryStories';

export const revalidate = 14400; // invalidate every 4 hours

// The redesigned home page is a separate story so the live `home` one keeps serving production
// until cutover. At cutover: delete `home`, rename this story to `home`, and set this back.
const HOME_SLUG = 'home-redesign';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const [story, libraryStories] = await Promise.all([
    getStoryblokStory(HOME_SLUG, locale),
    getLibraryStories(locale),
  ]);

  return <HomePage story={story} libraryStories={libraryStories} />;
}
