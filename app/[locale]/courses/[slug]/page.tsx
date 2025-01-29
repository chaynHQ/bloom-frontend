import NoDataAvailable from '@/components/common/NoDataAvailable';
import StoryblokCoursePage, {
  StoryblokCoursePageProps,
} from '@/components/storyblok/StoryblokCoursePage';
import { getStoryblokStory } from '@/lib/storyblok';
import { ISbStoriesParams, ISbStoryData, getStoryblokApi } from '@storyblok/react/rsc';
import { GetStaticPathsContext, GetStaticPropsContext, NextPage } from 'next';

interface Props {
  story: ISbStoryData | null;
}

const CourseOverview: NextPage<Props> = ({ story }) => {
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

  const storyblokProps = await getStoryblokStory(`courses/${slug}`, locale, {
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
  let courses = await storyblokApi.getAll('cdn/links', sbParams, 'course', { cache: 'no-store' });

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
