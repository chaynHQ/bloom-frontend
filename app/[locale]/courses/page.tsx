import { FeatureFlag } from '@/config/featureFlag';
import { LANGUAGES } from '@/constants/enums';
import { getStoryblokApi } from '@/lib/storyblok';
import { ISbStoriesParams, ISbStoryData } from '@storyblok/react/rsc';
import CoursesPage from './page-client';

export const revalidate = 14400; // invalidate every 4 hours

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as LANGUAGES;

  const baseProps: Partial<ISbStoriesParams> = {
    language: locale,
    version: 'published',
    sort_by: 'position:description',
  };

  const sbCoursesParams: ISbStoriesParams = {
    ...baseProps,
    starts_with: 'courses/',
    filter_query: {
      component: {
        in: 'Course',
      },
    },
  };

  const sbConversationsParams: ISbStoriesParams = {
    ...baseProps,
    starts_with: 'conversations/',
  };

  const sbShortsParams: ISbStoriesParams = {
    ...baseProps,
    starts_with: 'shorts/',
  };

  const storyblokApi = getStoryblokApi();

  const { data: coursesData } = await storyblokApi.get('cdn/stories/', sbCoursesParams, {
    cache: 'no-store',
  });

  const { data: conversationsData } = await storyblokApi.get(
    'cdn/stories/',
    sbConversationsParams,
    {
      cache: 'no-store',
    },
  );

  const { data: shortsData } = await storyblokApi.get('cdn/stories/', sbShortsParams, {
    cache: 'no-store',
  });

  const contentLanguagesString = locale === 'en' ? 'default' : locale;

  console.log(coursesData);
  const courses = coursesData.stories?.filter(
    (course: ISbStoryData) => !FeatureFlag.getDisabledCourses().has(course.full_slug),
  );

  const conversations = conversationsData.stories.filter((conversation: ISbStoryData) =>
    conversation.content.languages.includes(contentLanguagesString),
  );

  const shorts = shortsData.stories.filter((short: ISbStoryData) =>
    short.content.languages.includes(contentLanguagesString),
  );

  return <CoursesPage courseStories={courses} conversations={conversations} shorts={shorts} />;
}
