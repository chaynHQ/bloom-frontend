import {
  ISbStoriesParams,
  ISbStoryData,
  getStoryblokApi,
  useStoryblokState,
} from '@storyblok/react';
import { GetStaticPathsContext, GetStaticPropsContext, NextPage } from 'next';
import NoDataAvailable from '../../../components/common/NoDataAvailable';
import StoryblokSessionPage, {
  StoryblokSessionPageProps,
} from '../../../components/storyblok/StoryblokSessionPage';
import { getStoryblokPageProps } from '../../../utils/getStoryblokPageProps';

interface Props {
  story: ISbStoryData | null;
}

const SessionDetail: NextPage<Props> = ({ story }) => {
  story = useStoryblokState(story);

  if (!story) {
    return <NoDataAvailable />;
  }

  const content = story.content as StoryblokSessionPageProps;

  return (
    <>
      <StoryblokSessionPage
        {...content}
        storyId={story.id}
        storyUuid={story.uuid}
        storyPosition={story.position}
      />
    </>
  );
};

export async function getStaticProps({ locale, preview = false, params }: GetStaticPropsContext) {
  const slug = params?.slug instanceof Array ? params.slug.join('/') : params?.slug;
  const sessionSlug =
    params?.sessionSlug instanceof Array ? params.sessionSlug.join('/') : params?.sessionSlug;
  const fullSlug = `courses/${slug}/${sessionSlug}`;

  const storyblokProps = await getStoryblokPageProps(fullSlug, locale, preview, {
    resolve_relations: ['Session.course', 'session_iba.course'],
  });

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

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  let sbParams: ISbStoriesParams = {
    version: 'published',
    starts_with: 'courses/',
  };

  const storyblokApi = getStoryblokApi();
  let sessions = await storyblokApi.getAll('cdn/links', sbParams);

  let paths: any = [];

  sessions.forEach((session: Partial<ISbStoryData>) => {
    const slug = session.slug;
    if (!slug) return;

    if (session.is_startpage || session.is_folder || !session.published) {
      return;
    }

    // get array for slug because of catch all
    let splittedSlug = slug.split('/');

    if (locales) {
      // create additional languages
      for (const locale of locales) {
        paths.push({ params: { slug: splittedSlug[1], sessionSlug: splittedSlug[2] }, locale });
      }
    }
  });

  return {
    paths: paths,
    fallback: false,
  };
}

export default SessionDetail;
