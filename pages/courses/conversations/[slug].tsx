import {
  ISbStoriesParams,
  ISbStoryData,
  getStoryblokApi,
  useStoryblokState,
} from '@storyblok/react';
import { GetStaticPathsContext, GetStaticPropsContext, NextPage } from 'next';
import NoDataAvailable from '../../../components/common/NoDataAvailable';
import StoryblokResourceConversationPage, {
  StoryblokResourceConversationPageProps,
} from '../../../components/storyblok/StoryblokResourceConversationPage';
import { getStoryblokPageProps } from '../../../utils/getStoryblokPageProps';

interface Props {
  story: ISbStoryData | null;
}

const ResourceConversationOverview: NextPage<Props> = ({ story }) => {
  story = useStoryblokState(story);

  if (!story) {
    return <NoDataAvailable />;
  }

  return (
    <>
      <StoryblokResourceConversationPage
        {...(story.content as StoryblokResourceConversationPageProps)}
        storyId={story.id}
      />
    </>
  );
};

export async function getStaticProps({ locale, preview = false, params }: GetStaticPropsContext) {
  const slug = params?.slug instanceof Array ? params.slug.join('/') : params?.slug;

  const storyblokProps = await getStoryblokPageProps(`conversations/${slug}`, locale, preview, {
    resolve_relations: ['related_content', 'related_exercises'],
  });

  return {
    props: {
      ...storyblokProps,
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
    starts_with: 'conversations/',
    filter_query: {
      component: {
        in: 'resource_conversation',
      },
    },
  };

  const storyblokApi = getStoryblokApi();
  let conversations = await storyblokApi.getAll('cdn/links', sbParams);

  let paths: any = [];

  conversations.forEach((conversation: Partial<ISbStoryData>) => {
    if (!conversation.slug || (isProduction && !conversation.published)) return;

    // get array for slug because of catch all
    const slug = conversation.slug;
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

export default ResourceConversationOverview;
