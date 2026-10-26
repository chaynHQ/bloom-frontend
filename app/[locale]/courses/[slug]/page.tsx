import StoryblokCoursePage from '@/components/storyblok/StoryblokCoursePage';
import { routing } from '@/i18n/routing';
import { STORYBLOK_ENVIRONMENT } from '@/lib/constants/common';
import { getStoryblokStory } from '@/lib/storyblok';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { isPublicContent } from '@/lib/utils/partnerContentAccess';
import { getCourseStories } from '@/lib/utils/getLibraryStories';
import { breadcrumbJsonLd, courseJsonLd, JsonLd } from '@/lib/utils/structuredData';
import { getStoryblokApi, ISbStoriesParams } from '@storyblok/react/rsc';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const dynamicParams = false;
export const revalidate = 14400; // invalidate every 4 hours

type Params = Promise<{ locale: string; slug: string }>;

async function getStory(locale: string, slug: string) {
  return await getStoryblokStory(`courses/${slug}`, locale, {
    resolve_relations: 'week.sessions',
  });
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'Courses' });
  const story = await getStory(locale, slug);

  if (!story) return;

  return generateMetadataBasic({
    title: story.content.name,
    titleParent: t('course'),
    description: story.content.seo_description || story.content.description,
    locale,
    path: `/courses/${slug}`,
    languages: story.content.languages,
    image: story.content.image?.filename,
    noIndex: story.content.coming_soon || !isPublicContent(story.content.included_for_partners),
  });
}

export async function generateStaticParams() {
  let paths: { slug: string; locale: string }[] = [];

  const locales = routing.locales;
  const storyblokApi = getStoryblokApi();

  let sbParams: ISbStoriesParams = {
    version: STORYBLOK_ENVIRONMENT,
    starts_with: 'courses/',
    filter_query: {
      component: {
        in: 'Course',
      },
    },
  };

  let { data } = await storyblokApi.get('cdn/links', sbParams);

  Object.keys(data.links).forEach((linkKey) => {
    const course = data.links[linkKey];

    if (!course.slug || !course.published) return;

    if (!course.is_startpage) {
      return;
    }

    const slug = course.slug.split('/')[1];

    for (const locale of locales) {
      paths.push({ slug, locale });
    }
  });

  return paths;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, slug } = await params;

  const [story, courseStories] = await Promise.all([
    getStory(locale, slug),
    getCourseStories(locale),
  ]);

  if (!story) {
    notFound();
  }

  const path = `/courses/${slug}`;
  const breadcrumbs = await breadcrumbJsonLd(locale, [{ name: story.content.name }]);

  return (
    <>
      <JsonLd data={courseJsonLd(story, locale, path)} />
      <JsonLd data={breadcrumbs} />
      <StoryblokCoursePage story={story} courseStories={courseStories} />
    </>
  );
}
