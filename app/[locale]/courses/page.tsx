import { STORYBLOK_ENVIRONMENT } from '@/lib/constants/common';
import { FeatureFlag } from '@/lib/featureFlag';
import { getStoryblokStories } from '@/lib/storyblok';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { ISbStoriesParams, ISbStoryData } from '@storyblok/react/rsc';
import { getTranslations } from 'next-intl/server';
import CoursesPage from '../../../components/pages/CoursesPage';

export const revalidate = 14400; // invalidate every 4 hours

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Courses' });

  return generateMetadataBasic({ title: t('courses'), description: t('introduction') });
}

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params;

  const baseProps: Partial<ISbStoriesParams> = {
    language: locale,
    version: STORYBLOK_ENVIRONMENT,
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

  const coursesStories = (await getStoryblokStories(locale, sbCoursesParams)) || [];
  const conversationsStories = (await getStoryblokStories(locale, sbConversationsParams)) || [];
  const shortsStories = (await getStoryblokStories(locale, sbShortsParams)) || [];

  const contentLanguagesString = locale === 'en' ? 'default' : locale;

  const courses = coursesStories?.filter(
    (course: ISbStoryData) => !FeatureFlag.getDisabledCourses().has(course.full_slug),
  );

  const conversations = conversationsStories?.filter((conversation: ISbStoryData) =>
    conversation.content.languages.includes(contentLanguagesString),
  );

  const shorts = shortsStories?.filter((short: ISbStoryData) =>
    short.content.languages.includes(contentLanguagesString),
  );

  return <CoursesPage courseStories={courses} conversations={conversations} shorts={shorts} />;
}
