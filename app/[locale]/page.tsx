import HomePage from '@/components/pages/HomePage';
import { getOptionalStoryblokStory, getStoryblokStory } from '@/lib/storyblok';
import { getLibraryStories } from '@/lib/utils/getLibraryStories';
import { ISbStoryData } from '@storyblok/react/rsc';

export const revalidate = 14400; // invalidate every 4 hours

// Cutover in progress: the redesigned home lives at `home-redesign` and moves to `home` (the
// old `Welcome`-component story there is deleted first). Accept either slug, but only ever a
// `home_page` story — never fall through to the old `Welcome` content. Once the move is done
// and verified, drop the fallback and read `home` directly.
async function getHomeStory(locale: string): Promise<ISbStoryData | undefined> {
  const redesign = await getStoryblokStory('home-redesign', locale);
  if (redesign) return redesign;
  const moved = await getOptionalStoryblokStory('home', locale);
  return moved?.content?.component === 'home_page' ? moved : undefined;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const [story, libraryStories] = await Promise.all([
    getHomeStory(locale),
    getLibraryStories(locale),
  ]);

  return <HomePage story={story} libraryStories={libraryStories} />;
}
