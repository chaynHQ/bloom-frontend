import StoryblokGrounding from '@/components/storyblok/StoryblokGrounding';
import { STORYBLOK_ENVIRONMENT } from '@/lib/constants/common';
import { getStoryblokStories, getStoryblokStory } from '@/lib/storyblok';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { ISbStoryData } from '@storyblok/react/rsc';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const revalidate = 14400; // invalidate every 4 hours

// Storyblok's page size caps at 100; grounding has ~16 items today, so one page is enough, but
// this loops defensively rather than silently truncating a future-larger set.
const PER_PAGE = 100;
const MAX_PAGES = 5;

async function getGroundingPageStory(locale: string): Promise<ISbStoryData | undefined> {
  return await getStoryblokStory('grounding/overview', locale);
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
    locale,
    path: '/grounding',
  });
}

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params;

  const [stories, pageStory] = await Promise.all([
    getGroundingStories(locale),
    getGroundingPageStory(locale),
  ]);

  if (!pageStory) notFound();

  return <StoryblokGrounding story={pageStory} stories={stories} />;
}
