import StoryblokSessionPage, {
  StoryblokSessionPageProps,
} from '@/components/storyblok/StoryblokSessionPage';
import { routing } from '@/i18n/routing';
import { STORYBLOK_ENVIRONMENT } from '@/lib/constants/common';
import { getStoryblokStory } from '@/lib/storyblok';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getStoryblokApi, ISbStoriesParams } from '@storyblok/react/rsc';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const dynamicParams = false;
export const revalidate = 14400; // invalidate every 4 hours

type Params = Promise<{ locale: string; slug: string; sessionSlug: string }>;

async function getStory(locale: string, slug: string) {
  return await getStoryblokStory(slug, locale, {
    resolve_relations: ['Session.course', 'session_iba.course'],
  });
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, slug, sessionSlug } = await params;
  const t = await getTranslations({ locale, namespace: 'Courses' });
  const fullSlug = `courses/${slug}/${sessionSlug}`;
  const story = await getStory(locale, fullSlug);

  if (!story) {
    return;
  }

  return generateMetadataBasic({
    title: story.content.name,
    titleParent: t('session'),
    description: story.content.seo_description,
  });
}

export async function generateStaticParams() {
  let paths: { slug: string; sessionSlug: string; locale: string }[] = [];

  const locales = routing.locales;
  const storyblokApi = getStoryblokApi();

  let sbParams: ISbStoriesParams = {
    version: STORYBLOK_ENVIRONMENT,
    starts_with: 'courses/',
  };

  let { data } = await storyblokApi.get('cdn/links', sbParams);

  Object.keys(data.links).forEach((linkKey) => {
    const session = data.links[linkKey];

    if (!session.slug || !session.published || session.is_startpage || session.is_folder) return;

    for (const locale of locales) {
      const slug = session.slug.split('/')[1];
      const sessionSlug = session.slug.split('/')[2];
      paths.push({ slug, sessionSlug, locale });
    }
  });

  return paths;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, slug, sessionSlug } = await params;

  const fullSlug = `courses/${slug}/${sessionSlug}`;
  const story = await getStory(locale, fullSlug);

  if (!story) {
    notFound();
  }

  const content = story.content as StoryblokSessionPageProps;

  return (
    <StoryblokSessionPage {...content} storyUuid={story.uuid} storyPosition={story.position} />
  );
}
