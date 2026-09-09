import LoadingContainer from '@/components/common/LoadingContainer';
import StoryblokGrounding from '@/components/storyblok/StoryblokGrounding';
import { STORYBLOK_ENVIRONMENT } from '@/lib/constants/common';
import { getOptionalStoryblokStory, getStoryblokStories } from '@/lib/storyblok';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { ISbStoryData } from '@storyblok/react/rsc';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

// Storyblok's page size caps at 100; grounding has ~16 items today, so one page is enough, but
// this loops defensively rather than silently truncating a future-larger set.
const PER_PAGE = 100;
const MAX_PAGES = 5;

// The `grounding_page` story. Its slug is `grounding/overview` once step 6 moves the flat
// `grounding` page onto the new component (04-delete-flat-pages.mjs) — until then the flat
// `grounding` story still serves the hero copy, so try both.
async function getGroundingPageStory(locale: string): Promise<ISbStoryData | undefined> {
  return (
    (await getOptionalStoryblokStory('grounding/overview', locale)) ??
    (await getOptionalStoryblokStory('grounding', locale))
  );
}

async function getGroundingStories(locale: string): Promise<ISbStoryData[]> {
  const stories: ISbStoryData[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await getStoryblokStories(locale, {
      version: STORYBLOK_ENVIRONMENT,
      filter_query: { component: { in: 'resource_grounding' } },
      sort_by: 'position:asc',
      per_page: PER_PAGE,
      page,
    });

    if (!batch) break;
    stories.push(...batch);
    if (batch.length < PER_PAGE) break;
  }

  return stories;
}

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Resources.moment' });
  const pageStory = await getGroundingPageStory(locale);

  return generateMetadataBasic({
    title: pageStory?.content?.title ?? t('title'),
    description: pageStory?.content?.seo_description,
  });
}

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params;

  const [stories, pageStory] = await Promise.all([
    getGroundingStories(locale),
    getGroundingPageStory(locale),
  ]);

  if (!pageStory) notFound();

  // See the library page: useSearchParams needs a Suspense boundary, and the fallback needs
  // real height or the App Router skips its scroll-to-top when navigating here.
  return (
    <Suspense fallback={<LoadingContainer />}>
      <StoryblokGrounding story={pageStory} stories={stories} />
    </Suspense>
  );
}
