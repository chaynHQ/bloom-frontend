import NoDataAvailable from '@/components/common/NoDataAvailable';
import StoryblokResourceShortPage, {
  StoryblokResourceShortPageProps,
} from '@/components/storyblok/StoryblokResourceShortPage';
import { getStoryblokStory } from '@/lib/storyblok';
import { ISbStoriesParams, ISbStoryData, getStoryblokApi } from '@storyblok/react/rsc';
import { GetStaticPathsContext, GetStaticPropsContext, NextPage } from 'next';

interface Props {
  story: ISbStoryData | null;
}

const ResourceShortOverview: NextPage<Props> = ({ story }) => {
  if (!story) {
    return <NoDataAvailable />;
  }

  return (
    <>
      <StoryblokResourceShortPage
        {...(story.content as StoryblokResourceShortPageProps)}
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

  const storyblokProps = await getStoryblokStory(`shorts/${slug}`, locale, {
    resolve_relations: [
      'resource_short_video.related_content',
      'resource_short_video.related_session',
    ],
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
    starts_with: 'shorts/',
    filter_query: {
      component: {
        in: 'resource_short',
      },
    },
  };

  const storyblokApi = getStoryblokApi();
  let shorts = await storyblokApi.getAll('cdn/links', sbParams, 'short_video', {
    cache: 'no-store',
  });

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

export default ResourceShortOverview;
