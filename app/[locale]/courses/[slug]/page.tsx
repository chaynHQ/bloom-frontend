import NoDataAvailable from '@/components/common/NoDataAvailable';
import StoryblokCoursePage, {
  StoryblokCoursePageProps,
} from '@/components/storyblok/StoryblokCoursePage';
import { routing } from '@/i18n/routing';
import { getStoryblokStory } from '@/lib/storyblok';
import { getStoryblokApi, ISbStoriesParams } from '@storyblok/react/rsc';

export const dynamicParams = false;
export const revalidate = 14400; // invalidate every 4 hours

export async function generateStaticParams() {
  let paths: { slug: string; locale: string }[] = [];

  const locales = routing.locales;
  const storyblokApi = getStoryblokApi();

  let sbParams: ISbStoriesParams = {
    version: 'published',
    starts_with: 'courses/',
    filter_query: {
      component: {
        in: 'Course',
      },
    },
  };

  let { data } = await storyblokApi.get('cdn/links', sbParams, { cache: 'no-store' });

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

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const locale = (await params).locale;
  const slug = (await params).slug;

  const story = await getStoryblokStory(`courses/${slug}`, locale, {
    resolve_relations: 'week.sessions',
  });

  if (!story) {
    return <NoDataAvailable />;
  }

  return (
    <StoryblokCoursePage {...(story.content as StoryblokCoursePageProps)} storyId={story.id} />
  );
}
