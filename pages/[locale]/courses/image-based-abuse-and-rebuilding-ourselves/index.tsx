import { ISbStoryData, useStoryblokState } from '@storyblok/react';
import { GetStaticPropsContext, NextPage } from 'next';
import NoDataAvailable from '../../../components/common/NoDataAvailable';
import StoryblokCoursePage, {
  StoryblokCoursePageProps,
} from '../../../components/storyblok/StoryblokCoursePage';
import { getStoryblokPageProps } from '../../../utils/getStoryblokPageProps';

interface Props {
  story: ISbStoryData | null;
}

const CourseOverview: NextPage<Props> = ({ story }) => {
  story = useStoryblokState(story);

  if (!story) {
    return <NoDataAvailable />;
  }

  return (
    <StoryblokCoursePage {...(story.content as StoryblokCoursePageProps)} storyId={story.id} />
  );
};

export async function getStaticProps({ locale, preview = false }: GetStaticPropsContext) {
  const storyblokProps = await getStoryblokPageProps(
    'courses/image-based-abuse-and-rebuilding-ourselves/',
    locale,
    preview,
    {
      resolve_relations: 'week.sessions',
    },
  );

  return {
    props: {
      ...storyblokProps,
      messages: {
        ...require(`../../../messages/shared/${locale}.json`),
        ...require(`../../../messages/navigation/${locale}.json`),
        ...require(`../../../messages/courses/${locale}.json`),
      },
    },
    revalidate: 3600, // revalidate every hour
  };
}

export default CourseOverview;
