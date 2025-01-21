import { ISbStoriesParams, ISbStoryData, getStoryblokApi } from '@storyblok/react/rsc';
import type { GetStaticPathsContext, NextPage } from 'next';
import { GetStaticPropsContext } from 'next';
import NoDataAvailable from '../../components/common/NoDataAvailable';
import StoryblokWelcomePage, {
  StoryblokWelcomePageProps,
} from '../../components/storyblok/StoryblokWelcomePage';
import { getStoryblokPageProps } from '../../utils/getStoryblokPageProps';

interface Props {
  story: ISbStoryData | null;
}

const Welcome: NextPage<Props> = ({ story }) => {
  if (!story) {
    return <NoDataAvailable />;
  }

  return (
    <StoryblokWelcomePage
      {...(story.content as StoryblokWelcomePageProps)}
      storySlug={story.slug}
    />
  );
};

export async function getStaticProps({ locale, preview = false, params }: GetStaticPropsContext) {
  const partnerName = params?.partnerName;
  const storyblokProps = await getStoryblokPageProps(`welcome/${partnerName}`, locale);

  return {
    props: {
      ...storyblokProps,
      messages: {
        ...require(`../../messages/courses/${locale}.json`),
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/navigation/${locale}.json`),
        ...require(`../../messages/welcome/${locale}.json`),
      },
    },
    revalidate: 3600, // revalidate every hour
  };
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  let sbParams: ISbStoriesParams = {
    version: 'published',
    starts_with: 'welcome/',
  };

  const storyblokApi = getStoryblokApi();
  let data = await storyblokApi.getAll('cdn/links', sbParams, 'welcome', { cache: 'no-store' });

  let paths: any = [];

  data.forEach((story: Partial<ISbStoryData>) => {
    if (!story.slug || !story.published) return;

    // get array for slug because of catch all
    let splittedSlug = story.slug.split('/');

    if (locales) {
      // create additional languages
      for (const locale of locales) {
        paths.push({ params: { partnerName: splittedSlug[1] }, locale });
      }
    }
  });

  return {
    paths,
    fallback: false,
  };
}

export default Welcome;
