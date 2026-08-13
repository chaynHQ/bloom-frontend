import WelcomePage from '@/components/pages/WelcomePage';
import StoryblokWelcomePage from '@/components/storyblok/StoryblokWelcomePage';
import { routing } from '@/i18n/routing';
import { STORYBLOK_ENVIRONMENT } from '@/lib/constants/common';
import { getOptionalStoryblokStory, getStoryblokStory } from '@/lib/storyblok';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getLibraryStories } from '@/lib/utils/getLibraryStories';
import { ISbResult, ISbStoriesParams, getStoryblokApi } from '@storyblok/react/rsc';
import { notFound } from 'next/navigation';

export const revalidate = 14400; // invalidate every 4 hours
export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string; partnerName: string }>;

// The redesign is a separate story so `welcome/<partner>` keeps serving until cutover, and a
// partner without one (Fruitz, retired) is unaffected. At cutover: delete `welcome/<partner>`,
// rename the redesign to take its place, and drop the fallback below.
const redesignSlug = (partnerName: string) => `welcome-redesign/${partnerName}`;

async function getStory(locale: string, partnerName: string) {
  return await getStoryblokStory(`welcome/${partnerName}`, locale, {
    resolve_relations: ['resource_carousel.resources'],
  });
}

async function getRedesignStory(locale: string, partnerName: string) {
  return await getOptionalStoryblokStory(redesignSlug(partnerName), locale);
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, partnerName } = await params;
  const story =
    (await getRedesignStory(locale, partnerName)) ?? (await getStory(locale, partnerName));

  if (!story) return;

  return generateMetadataBasic({
    // The redesign moved the hero headline into `title`, so the document title has its own field.
    title: story.content.seo_title || story.content.title,
    description: story.content.seo_description,
  });
}

export async function generateStaticParams() {
  let paths: { slug: string; locale: string }[] = [];

  const locales = routing.locales;

  let sbParams: ISbStoriesParams = {
    version: STORYBLOK_ENVIRONMENT,
    starts_with: 'welcome/',
  };

  const storyblokApi = getStoryblokApi();

  const { data } = (await storyblokApi.get('cdn/links', sbParams)) as ISbResult;

  Object.keys(data.links).forEach((linkKey: string) => {
    const story = data.links[linkKey];

    if (story.is_folder || !story.published) return;

    const slug = story.slug;

    for (const locale of locales) {
      paths.push({ slug, locale });
    }
  });

  return paths;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, partnerName } = await params;

  const [redesignStory, libraryStories] = await Promise.all([
    getRedesignStory(locale, partnerName),
    getLibraryStories(locale),
  ]);

  if (redesignStory) {
    return (
      <WelcomePage
        story={redesignStory}
        libraryStories={libraryStories}
        partnerName={partnerName}
      />
    );
  }

  const story = await getStory(locale, partnerName);

  if (!story) {
    notFound();
  }

  return <StoryblokWelcomePage story={story} />;
}
