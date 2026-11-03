import StoryblokPage from '@/components/storyblok/StoryblokPage';
import { getStoryblokApi, ISbStoriesParams } from '@storyblok/react/rsc';

import { routing } from '@/i18n/routing';
import { STORYBLOK_ENVIRONMENT } from '@/lib/constants/common';
import { getStoryblokStory } from '@/lib/storyblok';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import {
  isInvalidSlugPageRequest,
  isSlugPageLink,
  type StoryblokLink,
} from '@/lib/utils/validateSlugPageRequest';
import { notFound } from 'next/navigation';

export const dynamicParams = false;
export const revalidate = 14400; // invalidate every 4 hours

type Params = Promise<{ locale: string; slug: string }>;

async function getStory(locale: string, slug: string) {
  return await getStoryblokStory(slug, locale);
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, slug } = await params;
  if (isInvalidSlugPageRequest(locale, slug)) return;

  const story = await getStory(locale, slug);

  if (!story) return;

  return generateMetadataBasic({
    title: story.content.title,
    description: story.content.seo_description,
    locale,
    path: `/${slug}`,
  });
}

export async function generateStaticParams() {
  let paths: { slug: string; locale: string }[] = [];

  const locales = routing.locales;
  const storyblokApi = getStoryblokApi();

  let sbParams: ISbStoriesParams = {
    version: STORYBLOK_ENVIRONMENT,
  };

  const { data } = await storyblokApi.get('cdn/links/', sbParams);

  Object.values(data.links as Record<string, StoryblokLink>).forEach((link) => {
    if (!isSlugPageLink(link)) return;

    for (const locale of locales) {
      paths.push({ slug: link.slug, locale });
    }
  });
  return paths;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, slug } = await params;

  if (isInvalidSlugPageRequest(locale, slug)) {
    notFound();
  }

  const story = await getStory(locale, slug);

  if (!story) {
    notFound();
  }

  return <StoryblokPage story={story} />;
}
