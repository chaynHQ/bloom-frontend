import NoDataAvailable from '@/components/common/NoDataAvailable';
import StoryblokPage, { StoryblokPageProps } from '@/components/storyblok/StoryblokPage';
import { getStoryblokApi, ISbStoryData } from '@storyblok/react/rsc';

import { routing } from '@/i18n/routing';
import { getStoryblokPageProps } from '@/utils/getStoryblokPageProps';

export const dynamicParams = false;
export const revalidate = 14400; // invalidate every 4 hours

export async function generateStaticParams() {
  let paths: { slug: string; locale: string }[] = [];

  const locales = routing.locales;
  const storyblokApi = getStoryblokApi();
  const { data } = await storyblokApi.get(
    'cdn/links/',
    { version: 'published' },
    { cache: 'no-store' },
  );

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

    if (story.is_folder || !story.published) return;

    const slug = story.slug;
    const basePath = slug.split('/')[0];

    if (locales && !excludePaths.includes(basePath)) {
      for (const locale of locales) {
        paths.push({ slug, locale });
      }
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

  const pageProps = await getStoryblokPageProps(slug, locale);
  const story = pageProps?.story as ISbStoryData;

  if (!story) {
    return <NoDataAvailable />;
  }

  return <StoryblokPage {...(story.content as StoryblokPageProps)} />;
}
