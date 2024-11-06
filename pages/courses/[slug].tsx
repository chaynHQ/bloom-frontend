import {
  ISbStoriesParams,
  ISbStoryData,
  getStoryblokApi,
  useStoryblokState,
} from '@storyblok/react';
import { GetStaticPathsContext, GetStaticPropsContext, NextPage } from 'next';
import NoDataAvailable from '../../components/common/NoDataAvailable';
import StoryblokCoursePage, {
  StoryblokCoursePageProps,
} from '../../components/storyblok/StoryblokCoursePage';
import { getStoryblokPageProps } from '../../utils/getStoryblokPageProps';

interface Props {
  story: ISbStoryData | null;
}

const CourseOverview: NextPage<Props> = ({ story }) => {
  story = useStoryblokState(story);

  if (!story) {
    return <NoDataAvailable />;
  }

  return (
    <>
      <StoryblokCoursePage {...(story.content as StoryblokCoursePageProps)} storyId={story.id} />
    </>
  );
};

export async function getStaticProps({ locale, preview = false, params }: GetStaticPropsContext) {
  const slug = params?.slug instanceof Array ? params.slug.join('/') : params?.slug;

  const storyblokProps = await getStoryblokPageProps(`courses/${slug}`, locale, preview, {
    resolve_relations: 'week.sessions',
  });

  return {
    props: {
      ...storyblokProps,
      messages: {
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/navigation/${locale}.json`),
        ...require(`../../messages/courses/${locale}.json`),
      },
    },
    revalidate: 3600, // revalidate every hour
  };
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  let sbParams: ISbStoriesParams = {
    version: 'published',
    starts_with: 'courses/',
    filter_query: {
      component: {
        in: 'Course',
      },
    },
  };

  const storyblokApi = getStoryblokApi();
  let courses = await storyblokApi.getAll('cdn/links', sbParams);

  let paths: any = [];

  courses.forEach((course: Partial<ISbStoryData>) => {
    if (!course.slug || !course.published) return;

    if (!course.is_startpage) {
      return;
    }

    // get array for slug because of catch all
    const slug = course.slug;
    let splittedSlug = slug.split('/');

    if (locales) {
      // create additional languages
      for (const locale of locales) {
        paths.push({ params: { slug: splittedSlug[1] }, locale });
      }
    }
  });

  return {
    paths: paths,
    fallback: false,
  };
}

export default CourseOverview;
