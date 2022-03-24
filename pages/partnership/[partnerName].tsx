import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { GetStaticPathsContext, GetStaticPropsContext, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { StoriesParams, StoryblokComponent, StoryData } from 'storyblok-js-client';
import { RootState } from '../../app/store';
import PartnerHeader from '../../components/layout/PartnerHeader';
import StoryblokPageSection from '../../components/storyblok/StoryblokPageSection';
import Storyblok, { useStoryblok } from '../../config/storyblok';
import { LANGUAGES } from '../../constants/enums';
import { getPartnerContent, Partner } from '../../constants/partners';
import { useTypedSelector } from '../../hooks/store';
import illustrationBloomHeadYellow from '../../public/illustration_bloom_head_yellow.svg';
import illustrationPerson4Peach from '../../public/illustration_person4_peach.svg';
import welcomeToBloom from '../../public/welcome_to_bloom.svg';
import { columnStyle } from '../../styles/common';

interface Props {
  story: StoryData;
  preview: boolean;
  sbParams: StoriesParams;
  locale: LANGUAGES;
}

// TODO pull out shared stylings
const accessContainerStyle = {
  ...columnStyle,
  height: '100vh',
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 150, md: 210 },
  height: { xs: 150, md: 210 },
  marginBottom: 4,
} as const;

// TODO pull out
type StoryBlokData = StoryData<
  StoryblokComponent<string> & {
    [index: string]: any;
  }
>;

const Partnership: NextPage<Props> = ({ story, preview, sbParams, locale }) => {
  // TODO translations

  story = useStoryblok(story, preview, sbParams, locale);

  const partnerName = story.slug;

  const [incorrectAccess, setIncorrectAccess] = useState<boolean>(true);
  const { partnerAccesses } = useTypedSelector((state: RootState) => state);

  useEffect(() => {
    // TODO pull out this function - used multiple places
    const hasPartnerAccess = !!partnerAccesses.find(
      (partnerAccess) => partnerAccess.partner.name.toLowerCase() === partnerName,
    );

    setIncorrectAccess(!hasPartnerAccess);
  }, [partnerName, partnerAccesses]);

  // If user doesn't have partner access, display alternate message
  if (incorrectAccess) {
    return showIncorrectAccessView();
  } else {
    // User can view partnership content
    const partnerContent = getPartnerContent(partnerName);
    return showPartnershipView(story, partnerContent);
  }
};

const showIncorrectAccessView = () => {
  // TODO pull out access guard message component
  return (
    <Container sx={accessContainerStyle}>
      <Box sx={imageContainerStyle}>
        <Image
          alt={'alt.personTea'}
          src={illustrationPerson4Peach}
          layout="fill"
          objectFit="contain"
        />
      </Box>
      {/* TODO add message  */}
    </Container>
  );
};

const showPartnershipView = (story: StoryBlokData, partnerContent: Partner) => {
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
          <StoryblokPageSection
            key={`page_section_${index}`}
            content={section.content}
            alignment={section.alignment}
            color={section.color}
          />
        ))}
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
