import { ISbStoryData, getStoryblokApi, useStoryblokState } from '@storyblok/react';
import { GetStaticPathsContext, GetStaticPropsContext, NextPage } from 'next';
import NoDataAvailable from '../components/common/NoDataAvailable';
import StoryblokPage, { StoryblokPageProps } from '../components/storyblok/StoryblokPage';
import { getStoryblokPageProps } from '../utils/getStoryblokPageProps';

interface Props {
  story: ISbStoryData | null;
}

const Page: NextPage<Props> = ({ story }) => {
  story = useStoryblokState(story);

  if (!story) {
    return <NoDataAvailable />;
  }

  return <StoryblokPage {...(story.content as StoryblokPageProps)} />;
};

export async function getStaticProps({ locale, preview = false, params }: GetStaticPropsContext) {
  const slug = params?.slug instanceof Array ? params.slug.join('/') : params?.slug;

  const storyblokProps = await getStoryblokPageProps(slug, locale, preview);

  return {
    props: {
      ...storyblokProps,
      messages: {
        ...require(`../messages/shared/${locale}.json`),
        ...require(`../messages/navigation/${locale}.json`),
      },
    },
    revalidate: 3600, // revalidate every hour
  };
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const storyblokApi = getStoryblokApi();
  let { data } = await storyblokApi.get('cdn/links/', { version: 'published' });

  const excludePaths: string[] = [
    'home',
    'welcome',
    'meet-the-team',
    'courses',
    'about-our-courses',
    'messaging',
    'shorts',
    'conversations',
  ];

  let paths: any = [];
  Object.keys(data.links).forEach((linkKey) => {
    if (data.links[linkKey].is_folder || !data.links[linkKey].published) {
      return;
    }

    const slug = data.links[linkKey].slug;
    let splittedSlug = slug.split('/');

    if (locales && !excludePaths.includes(splittedSlug[0])) {
      // create additional languages
      for (const locale of locales) {
        paths.push({ params: { slug: slug }, locale });
      }
    }
  });

  return {
    paths: paths,
    fallback: false,
  };
}

export default Page;
