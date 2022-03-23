import Box from '@mui/material/Box';
import { GetStaticPathsContext, GetStaticPropsContext, NextPage } from 'next';
import Head from 'next/head';
import { StoriesParams, StoryData } from 'storyblok-js-client';
import Storyblok, { useStoryblok } from '../../config/storyblok';
import { LANGUAGES } from '../../constants/enums';

interface Props {
  story: StoryData;
  preview: boolean;
  sbParams: StoriesParams;
  locale: LANGUAGES;
}

const Partnership: NextPage<Props> = ({ story, preview, sbParams, locale }) => {
  // TODO translations

  story = useStoryblok(story, preview, sbParams, locale);

  // TODO add in authenticated & partner affiliated access
  // TODO add in actual story content
  return (
    <Box>
      <Head>
        <title>{story.content.title}</title>
      </Head>
    </Box>
  );
};

export async function getStaticProps({ locale, preview = false, params }: GetStaticPropsContext) {
  const partnerName = params?.partnerName;

  const sbParams = {
    version: preview ? 'draft' : 'published',
    cv: preview ? Date.now() : 0,
    language: locale,
  };

  let { data } = await Storyblok.get(`cdn/stories/partnership/${partnerName}`, sbParams);

  return {
    props: {
      story: data ? data.story : null,
      preview,
      messages: {
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/navigation/${locale}.json`),
      },
      locale,
    },
    revalidate: 3600, // revalidate every hour
  };
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  let { data } = await Storyblok.get('cdn/links/?starts_with=partnership/');

  let paths: any = [];
  Object.keys(data.links).forEach((linkKey) => {
    // get array for slug because of catch all
    const slug = data.links[linkKey].slug;
    let splittedSlug = slug.split('/');

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

export default Partnership;
