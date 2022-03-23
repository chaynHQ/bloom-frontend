import { NextPage } from 'next';
import { StoriesParams, StoryData } from 'storyblok-js-client';
import { LANGUAGES } from '../../constants/enums';

interface Props {
  story: StoryData;
  preview: boolean;
  sbParams: StoriesParams;
  locale: LANGUAGES;
}

const Partnership: NextPage<Props> = () => {
  // TODO translations

  return <></>;
};

// TODO getStaticProps: retrieve storyblok data

// TODO getStaticPaths: get dynamic paths

export default Partnership;
