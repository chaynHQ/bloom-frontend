import {
  ISbStoriesParams,
  ISbStoryData,
  getStoryblokApi,
  useStoryblokState,
} from '@storyblok/react';
import { GetStaticPathsContext, GetStaticPropsContext, NextPage } from 'next';
import NoDataAvailable from '../../components/common/NoDataAvailable';
import StoryblokResourceShortPage, {
  StoryblokResourceShortPageProps,
} from '../../components/storyblok/StoryblokResourceShortPage';
import { STORYBLOK_COMPONENTS } from '../../constants/enums';
import { getStoryblokPageProps, getStoryblokPagesByUuids } from '../../utils/getStoryblokPageProps';

interface Props {
  story: ISbStoryData | null;
  related_course: ISbStoryData | null;
}

const ResourceShortOverview: NextPage<Props> = ({ story, related_course }) => {
  story = useStoryblokState(story);

  if (!story) {
    return <NoDataAvailable />;
  }

  return (
    <>
      <StoryblokResourceShortPage
        {...(story.content as StoryblokResourceShortPageProps)}
        related_course={related_course}
        storyId={story.id}
      />
    </>
  );
};

export async function getStaticProps({
  locale = 'en',
  preview = false,
  params,
}: GetStaticPropsContext) {
  const slug = params?.slug instanceof Array ? params.slug.join('/') : params?.slug;

  const storyblokProps = await getStoryblokPageProps(`shorts/${slug}`, locale, preview, {
    resolve_relations: [
      'resource_short_video.related_content',
      'resource_short_video.related_session',
    ],
  });
  const relatedCourse = await fetchRelatedCourse(storyblokProps?.story, locale, preview, {});
  // const relatedContent = await fetchRelatedContent(
  //   storyblokProps?.story.content.related_content,
  //   locale,
  //   preview,
  //   {},
  // );

  return {
    props: {
      ...storyblokProps,
      related_course: relatedCourse || null,
      messages: {
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/navigation/${locale}.json`),
        ...require(`../../messages/resources/${locale}.json`),
      },
    },
    revalidate: 3600, // revalidate every hour
  };
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const isProduction = process.env.NEXT_PUBLIC_ENV === 'production';

  let sbParams: ISbStoriesParams = {
    version: isProduction ? 'published' : 'draft',
    starts_with: 'shorts/',
    filter_query: {
      component: {
        in: 'resource_short',
      },
    },
  };

  const storyblokApi = getStoryblokApi();
  let shorts = await storyblokApi.getAll('cdn/links', sbParams);

  let paths: any = [];

  shorts.forEach((short: Partial<ISbStoryData>) => {
    if (!short.slug || (isProduction && !short.published)) return;

    // get array for slug because of catch all
    const slug = short.slug;
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

const fetchRelatedContent = async (
  relatedContent: Array<ISbStoryData | string>,
  locale: string,
  preview: boolean,
  params: ISbStoriesParams,
): Promise<ISbStoryData[]> => {
  let formattedRelatedContent: ISbStoryData[] = [];
  // Sometimes the related content is just a string with the uuid of the related content. TODO debug why
  relatedContent.forEach(async (relatedContentItem) => {
    if (typeof relatedContentItem === 'string') {
      try {
        const storyblokStory = await getStoryblokPagesByUuids(
          relatedContentItem, // get course by course uuid
          locale,
          preview,
          params,
        );
        if (storyblokStory?.stories.length && !!storyblokStory.stories[0]) {
          formattedRelatedContent.push(storyblokStory.stories[0]);
        }
      } catch (error) {
        console.error('Error fetching related content:', error);
      }
    } else {
      formattedRelatedContent.push(relatedContentItem);
    }
  });
  return formattedRelatedContent;
};

const fetchRelatedCourse = async (
  relatedSession: ISbStoryData | string,
  locale: string,
  preview: boolean,
  params: ISbStoriesParams,
) => {
  let linkedStoryData: ISbStoryData[] | null = null;
  let course: ISbStoryData | null = null;

  // ensure we have the correct story data for the linked story rather than a uuid
  if (typeof relatedSession === 'string') {
    try {
      const storyblokStory = await getStoryblokPagesByUuids(
        relatedSession, // get course by course uuid
        locale,
        preview,
        params,
      );
      if (storyblokStory?.stories.length && !!storyblokStory.stories[0]) {
        linkedStoryData = storyblokStory.stories || null;
      }
    } catch (error) {
      console.error('Error fetching related course:', error);
      return null;
    }
  } else {
    linkedStoryData = relatedSession.content.related_session;
  }
  // depending on the type of linked story, we need to fetch the course
  if (linkedStoryData?.length) {
    // if we already have the course data, use it
    if (linkedStoryData[0]?.content.component === STORYBLOK_COMPONENTS.COURSE) {
      course = linkedStoryData[0] || null;
    } else {
      // if we don't have the course data, we need to get it from the linked story
      try {
        const storyblokCourseProps = await getStoryblokPagesByUuids(
          linkedStoryData[0].content.related_session[0].content.course, // get course by course uuid
          locale,
          preview,
          params,
        );

        if (storyblokCourseProps?.stories.length && !!storyblokCourseProps.stories[0]) {
          course = storyblokCourseProps.stories[0] || null;
        }
        // Your data fetching logic here
      } catch (error) {
        console.error('Error fetching related courses:', error);
        return null;
      }
    }
  }
  return course;
};

export default ResourceShortOverview;
