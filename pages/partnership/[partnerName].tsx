import { Box } from '@mui/material';
import {
  ISbStoriesParams,
  ISbStoryData,
  getStoryblokApi,
  useStoryblokState,
} from '@storyblok/react';
import { GetStaticPathsContext, GetStaticPropsContext, NextPage } from 'next';
import Head from 'next/head';
import NoDataAvailable from '../../components/common/NoDataAvailable';
import PartnerHeader from '../../components/layout/PartnerHeader';
import StoryblokPageSection from '../../components/storyblok/StoryblokPageSection';
import { PartnerContent, getPartnerContent } from '../../constants/partners';
import illustrationBloomHeadYellow from '../../public/illustration_bloom_head_yellow.svg';
import welcomeToBloom from '../../public/welcome_to_bloom.svg';
import { getStoryblokPageProps } from '../../utils/getStoryblokPageProps';

interface Props {
  story: ISbStoryData | null;
}

const Partnership: NextPage<Props> = ({ story }) => {
  story = useStoryblokState(story);

  if (!story) {
    return <NoDataAvailable />;
  }

  const partnerName = story.slug;
  const partnerContent = getPartnerContent(partnerName) as PartnerContent;

  return (
    <Box>
      <Head>
        <title>{story.content.title}</title>
      </Head>
      <PartnerHeader
        partnerLogoSrc={partnerContent.partnershipLogo || welcomeToBloom}
        partnerLogoAlt={partnerContent.partnershipLogoAlt || 'alt.welcomeToBloom'}
        imageSrc={partnerContent.bloomGirlIllustration || illustrationBloomHeadYellow}
        imageAlt={'alt.bloomHead'}
      />
      {story.content.page_sections?.length > 0 &&
        story.content.page_sections.map((section: any, index: number) => (
          <StoryblokPageSection key={`page_section_${index}`} {...section} />
        ))}
    </Box>
  );
};

export async function getStaticProps({ locale, preview = false, params }: GetStaticPropsContext) {
  const partnerName = params?.partnerName;

  const storyblokProps = await getStoryblokPageProps(`partnership/${partnerName}`, locale, preview);

  return {
    props: {
      ...storyblokProps,
      messages: {
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/navigation/${locale}.json`),
        ...require(`../../messages/partnership/${locale}.json`),
      },
    },
    revalidate: 3600, // revalidate every hour
  };
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  let sbParams: ISbStoriesParams = {
    published: true,
    starts_with: 'partnership/',
  };

  const storyblokApi = getStoryblokApi();
  let data = await storyblokApi.getAll('cdn/links', sbParams);

  let paths: any = [];

  data.forEach((story: Partial<ISbStoryData>) => {
    if (!story.slug) return;

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

export default Partnership;
