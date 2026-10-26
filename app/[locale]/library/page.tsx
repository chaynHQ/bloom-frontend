import LoadingContainer from '@/components/common/LoadingContainer';
import LibraryPage from '@/components/pages/LibraryPage';
import { getStoryblokStory } from '@/lib/storyblok';
import { getLibraryStories } from '@/lib/utils/getLibraryStories';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { Suspense } from 'react';

export const revalidate = 14400; // invalidate every 4 hours, matching the other content pages

type Params = Promise<{ locale: string }>;

// Throws rather than rendering a headerless page: a failed build or revalidation keeps the last
// good version live, where notFound() would replace it with a 404 until the next revalidation.
async function getLibraryStory(locale: string) {
  const story = await getStoryblokStory('library', locale);
  if (!story) throw new Error(`Storyblok story "library" unavailable for locale ${locale}`);
  return story;
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const { content } = await getLibraryStory(locale);

  return generateMetadataBasic({
    title: content.seo_title || content.title,
    description: content.seo_description,
  });
}

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params;
  const [story, stories] = await Promise.all([getLibraryStory(locale), getLibraryStories(locale)]);

  // useSearchParams needs a Suspense boundary; the fallback needs real height, or the App
  // Router measures an empty segment and skips its scroll-to-top when navigating here.
  return (
    <Suspense fallback={<LoadingContainer />}>
      <LibraryPage story={story} stories={stories} />
    </Suspense>
  );
}
