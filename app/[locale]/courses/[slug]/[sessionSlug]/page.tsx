import StoryblokSessionPage, {
  StoryblokSessionPageProps,
} from '@/components/storyblok/StoryblokSessionPage';
import { routing } from '@/i18n/routing';
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

  if (!story) return;

  return generateMetadataBasic({
    title: story.content.name,
    titleParent: t('session'),
    description: story.content.seo_description,
  });
}

export async function generateStaticParams() {
  let paths: { slug: string; locale: string }[] = [];

  const locales = routing.locales;
  const storyblokApi = getStoryblokApi();

  let sbParams: ISbStoriesParams = {
    version: 'published',
    starts_with: 'courses/',
    content_type: 'session',
  };

  let sbIBAParams: ISbStoriesParams = {
    version: 'published',
    starts_with: 'courses/',
    content_type: 'session_iba',
  };

  let { data } = await storyblokApi.get('cdn/links', sbParams);
  let { data: dataIBA } = await storyblokApi.get('cdn/links', sbIBAParams);

  const combinedSessions = { ...data.links, ...dataIBA.links };

  Object.keys(combinedSessions).forEach((linkKey) => {
    const session = data.links[linkKey];

    if (!session.slug || !session.published) return;

    const courseSlug = session.slug.split('/')[1];
    const sessionSlug = session.slug.split('/')[2];

    for (const locale of locales) {
      paths.push({ slug: `/${courseSlug}/${sessionSlug}`, locale });
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
    <StoryblokSessionPage
      {...content}
      storyId={story.id}
      storyUuid={story.uuid}
      storyPosition={story.position}
    />
  );
}
