import NoDataAvailable from '@/components/common/NoDataAvailable';
import StoryblokPage, { StoryblokPageProps } from '@/components/storyblok/StoryblokPage';
import { getStoryblokApi } from '@storyblok/react/rsc';

import { routing } from '@/i18n/routing';
import { getStoryblokPageProps } from '@/utils/getStoryblokPageProps';

export const dynamicParams = false;

export async function generateStaticParams() {
  const locales = routing.locales;
  const storyblokApi = getStoryblokApi();
  let { data } = await storyblokApi.get(
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

  let paths: { slug: string; locale: string }[] = [];
  Object.keys(data.links).forEach((linkKey) => {
    if (data.links[linkKey].is_folder || !data.links[linkKey].published) {
      return;
    }

    const slug = data.links[linkKey].slug;
    let splittedSlug = slug.split('/');

    if (locales && !excludePaths.includes(splittedSlug[0])) {
      // create additional languages
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
  const story = pageProps?.story;

  if (!story) {
    return <NoDataAvailable />;
  }

  return <StoryblokPage {...(story.content as StoryblokPageProps)} />;
}
