import StoryblokPage from '@/components/storyblok/StoryblokPage';
import { routing } from '@/i18n/routing';
import { STORYBLOK_ENVIRONMENT } from '@/lib/constants/common';
import { getStoryblokStory } from '@/lib/storyblok';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getStoryblokApi, ISbStoriesParams } from '@storyblok/react/rsc';
import { notFound } from 'next/navigation';

export const dynamicParams = false;
export const revalidate = 14400; // invalidate every 4 hours

type Params = Promise<{ locale: string; slug: string }>;

async function getStory(locale: string, slug: string) {
  return await getStoryblokStory(`policies/${slug}`, locale);
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const story = await getStory(locale, slug);

  if (!story) return;

  return generateMetadataBasic({
    title: story.content.title,
    description: story.content.seo_description,
  });
}

export async function generateStaticParams() {
  let paths: { slug: string; locale: string }[] = [];

  const locales = routing.locales;
  const storyblokApi = getStoryblokApi();

  let sbParams: ISbStoriesParams = {
    version: STORYBLOK_ENVIRONMENT,
    starts_with: 'policies/',
  };

  const { data } = await storyblokApi.get('cdn/links/', sbParams);

  Object.keys(data.links).forEach((linkKey) => {
    const story = data.links[linkKey];

    if (story.is_folder || !story.slug || !story.published) return;

    const slug = story.slug.split('/')[1];

    for (const locale of locales) {
      paths.push({ slug, locale });
    }
  });
  return paths;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, slug } = await params;

  const story = await getStory(locale, slug);

  if (!story) {
    notFound();
  }

  return <StoryblokPage story={story} />;
}
