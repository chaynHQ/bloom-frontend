import NoDataAvailable from '@/lib/components/common/NoDataAvailable';
import StoryblokPage, { StoryblokPageProps } from '@/lib/components/storyblok/StoryblokPage';
import { getStoryblokApi, ISbStoriesParams } from '@storyblok/react/rsc';

import { routing } from '@/i18n/routing';
import { getStoryblokStory } from '@/lib/storyblok';

export const dynamicParams = false;
export const revalidate = 14400; // invalidate every 4 hours

export async function generateStaticParams() {
  let paths: { slug: string; locale: string }[] = [];

  const locales = routing.locales;
  const storyblokApi = getStoryblokApi();

  let sbParams: ISbStoriesParams = {
    version: 'published',
  };

  const { data } = await storyblokApi.get('cdn/links/', sbParams);

  const excludePaths: string[] = [
    'home',
    'welcome',
    'meet-the-team',
    'courses',
    'about-our-courses',
    'messaging',
    'shorts',
    'conversations',
  ];

  Object.keys(data.links).forEach((linkKey) => {
    const story = data.links[linkKey];
    const slug = story.slug;
    const basePath = slug.split('/')[0];

    if (story.is_folder || !story.published || excludePaths.includes(basePath)) return;

    for (const locale of locales) {
      paths.push({ slug, locale });
    }
  });
  return paths;
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const locale = (await params).locale;
  const slug = (await params).slug;

  const story = await getStoryblokStory(slug, locale);

  if (!story) {
    return <NoDataAvailable />;
  }

  return <StoryblokPage {...(story.content as StoryblokPageProps)} />;
}
