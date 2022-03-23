import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { GetStaticPathsContext, GetStaticPropsContext, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { StoriesParams, StoryData } from 'storyblok-js-client';
import { RootState } from '../../app/store';
import PartnerHeader from '../../components/layout/PartnerHeader';
import StoryblokPageSection from '../../components/storyblok/StoryblokPageSection';
import Storyblok, { useStoryblok } from '../../config/storyblok';
import { LANGUAGES } from '../../constants/enums';
import { getPartnerContent } from '../../constants/partners';
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

const Partnership: NextPage<Props> = ({ story, preview, sbParams, locale }) => {
  // TODO translations

  story = useStoryblok(story, preview, sbParams, locale);

  const partnerName = story.slug;
  const partnerContent = getPartnerContent(partnerName);

  // TODO reduce duplication: pull out content
  const headerProps = {
    partnerLogoSrc: partnerContent.partnershipLogo || welcomeToBloom,
    partnerLogoAlt: partnerContent.partnershipLogoAlt || 'alt.welcomeToBloom',
    imageSrc: partnerContent.bloomGirlIllustration || illustrationBloomHeadYellow,
    imageAlt: 'alt.bloomHead',
  };

  // TODO useEffect for partnerAccess?

  const { partnerAccesses } = useTypedSelector((state: RootState) => state);

  const hasPartnerAccess = partnerAccesses.find(
    (partnerAccess) => partnerAccess.partner.name === partnerName,
  );

  if (hasPartnerAccess) {
    // can view partnership content
    return (
      <Box>
        <Head>
          <title>{story.content.title}</title>
        </Head>
        <PartnerHeader
          partnerLogoSrc={headerProps.partnerLogoSrc}
          partnerLogoAlt={headerProps.partnerLogoAlt}
          imageSrc={headerProps.imageSrc}
          imageAlt={headerProps.imageAlt}
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
  }

  // if user doesn't have partner access, display alternate message
  return (
    // TODO pull out access guard message component
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
