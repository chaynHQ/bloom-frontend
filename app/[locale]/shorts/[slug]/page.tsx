import StoryblokResourceShortPage, {
  StoryblokResourceShortPageProps,
} from '@/components/storyblok/StoryblokResourceShortPage';
import { routing } from '@/i18n/routing';
import { COURSE_CATEGORIES } from '@/lib/constants/enums';
import { getStoryblokStories, getStoryblokStory } from '@/lib/storyblok';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getStoryblokApi, ISbStoriesParams } from '@storyblok/react/rsc';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const dynamicParams = false;
export const revalidate = 14400; // invalidate every 4 hours

type Params = Promise<{ locale: string; slug: string }>;

async function getStory(locale: string, slug: string) {
  return await getStoryblokStory(`shorts/${slug}`, locale, {
    resolve_relations: [
      'resource_short_video.related_content',
      'resource_short_video.related_session',
      'resource_short_video.related_session.course',
    ],
  });
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'Resources' });
  const story = await getStory(locale, slug);

  if (!story) return;

  return generateMetadataBasic({
    title: story.content.name,
    titleParent: t('shorts'),
    description: story.content.seo_description,
  });
}

export async function generateStaticParams() {
  let paths: { slug: string; locale: string }[] = [];

  const locales = routing.locales;
  const storyblokApi = getStoryblokApi();

  let sbParams: ISbStoriesParams = {
    version: 'published',
    starts_with: 'shorts/',
    filter_query: {
      component: {
        in: 'resource_short',
      },
    },
  };

  const { data } = await storyblokApi.get('cdn/links/', sbParams);

  Object.keys(data.links).forEach((linkKey) => {
    const story = data.links[linkKey];

    if (!story.slug || !story.published) return;

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

  const relatedSessionData = Array.isArray(story?.content.related_session)
    ? story?.content.related_session[0]
    : story?.content.related_session; // Some are published as arrays and others are just one. This is because a field changed type

  const relatedSessionType: COURSE_CATEGORIES =
    relatedSessionData?.content?.component?.toLowerCase();

  if (
    relatedSessionType === COURSE_CATEGORIES.SESSION ||
    relatedSessionType === COURSE_CATEGORIES.SESSION_IBA
  ) {
    // temporary fix for the fact that the course field is sometimes an object and sometimes a string
    const courseIdentifierType = typeof relatedSessionData?.content?.course;
    const courseId = courseIdentifierType === 'string' && relatedSessionData?.content?.course;
    const relatedCourseSlug = relatedSessionData?.content?.course?.slug;
    const relatedCourse = relatedCourseSlug
      ? await getStoryblokStory(relatedCourseSlug, locale)
      : await getStoryblokStories(locale, {}, courseId).then((stories) => stories && stories[0]);

    return (
      <StoryblokResourceShortPage
        {...(story.content as StoryblokResourceShortPageProps)}
        related_course={relatedCourse}
        related_session={relatedSessionData}
        storyUuid={story.uuid}
      />
    );
  }

  return (
    <StoryblokResourceShortPage
      {...(story.content as StoryblokResourceShortPageProps)}
      related_course={relatedSessionData}
      related_session={undefined}
      storyUuid={story.uuid}
    />
  );
}
