import { GroundingPage } from '@/components/pages/GroundingPage';
import { STORYBLOK_ENVIRONMENT } from '@/lib/constants/common';
import { getOptionalStoryblokStory, getStoryblokStories } from '@/lib/storyblok';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { ISbStoryData } from '@storyblok/react/rsc';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

// Storyblok's page size caps at 100; grounding has ~16 items today, so one page is enough, but
// this loops defensively rather than silently truncating a future-larger set.
const PER_PAGE = 100;
const MAX_PAGES = 5;

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
  const heroStory = await getOptionalStoryblokStory('grounding', locale);

  return generateMetadataBasic({
    title: heroStory?.content?.title ?? t('title'),
    description: heroStory?.content?.seo_description,
  });
}

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params;

  const [stories, heroStory] = await Promise.all([
    getGroundingStories(locale),
    // Reused for hero copy only — this flat page is shadowed by this route but not deleted until step 6.
    getOptionalStoryblokStory('grounding', locale),
  ]);

  // `useSearchParams` in GroundingPage needs a Suspense boundary above it.
  return (
    <Suspense>
      <GroundingPage stories={stories} heroStory={heroStory} />
    </Suspense>
  );
}
