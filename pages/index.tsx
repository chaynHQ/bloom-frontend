import { Box, Button, Card, CardContent, Container, Typography } from '@mui/material';
import { ISbStoryData, useStoryblokState } from '@storyblok/react';
import type { NextPage } from 'next';
import { GetStaticPropsContext } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';
import Link from '../components/common/Link';
import NoDataAvailable from '../components/common/NoDataAvailable';
import PartnerHeader from '../components/layout/PartnerHeader';
import StoryblokPageSection from '../components/storyblok/StoryblokPageSection';
import { PROMO_GET_STARTED_CLICKED, PROMO_GO_TO_COURSES_CLICKED } from '../constants/events';
import { useTypedSelector } from '../hooks/store';
import illustrationBloomHeadYellow from '../public/illustration_bloom_head_yellow.svg';
import welcomeToBloom from '../public/welcome_to_bloom.svg';
import { rowStyle } from '../styles/common';
import { getStoryblokPageProps } from '../utils/getStoryblokPageProps';
import logEvent, { getEventUserData } from '../utils/logEvent';
import { RichTextOptions } from '../utils/richText';

const introContainerStyle = {
  maxWidth: 600,
  width: { xs: '100%', md: '45%' },
  fontSize: '1.375rem',
  fontFamily: 'Montserrat, sans-serif',
  fontStyle: 'italic',
  lineHeight: 1.75,
  'p, a, span': {
    fontSize: '1.375rem',
    fontFamily: 'Montserrat, sans-serif',
    fontStyle: 'italic',
    lineHeight: 1.75,
  },
} as const;

const rowItem = {
  width: { xs: '100%', sm: '60%', md: '45%' },
  height: '100%',
} as const;

const headerProps = {
  partnerLogoSrc: welcomeToBloom,
  partnerLogoAlt: 'alt.welcomeToBloom',
  imageSrc: illustrationBloomHeadYellow,
  imageAlt: 'alt.bloomHead',
};

interface Props {
  story: ISbStoryData | null;
  preview: boolean;
}

const Index: NextPage<Props> = ({ story, preview }) => {
  story = useStoryblokState(story);

  const t = useTranslations('Welcome');

  const userToken = useTypedSelector((state) => state.user.token);
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);
  const [registerPath, setRegisterPath] = useState('/auth/register');

  useEffect(() => {
    const referralPartner = window.localStorage.getItem('referralPartner');

    if (referralPartner) {
      setRegisterPath(`/auth/register?partner=${referralPartner}`);
    }
  }, []);

  if (!story) {
    return <NoDataAvailable />;
  }

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
      <Container sx={{ ...rowStyle, backgroundColor: 'primary.light' }}>
        <Box sx={introContainerStyle}>{render(story.content.introduction, RichTextOptions)}</Box>
        <Card sx={rowItem}>
          <CardContent>
            {userToken ? (
              <>
                <Typography variant="h2" component="h2">
                  {t('continueCourses')}
                </Typography>
                <Typography>{t('continueCoursesDescription')}</Typography>
                <Button
                  sx={{ mt: 3 }}
                  variant="contained"
                  fullWidth
                  component={Link}
                  color="secondary"
                  href="/courses"
                  onClick={() => {
                    logEvent(PROMO_GO_TO_COURSES_CLICKED, eventUserData);
                  }}
                >
                  {t('goToCourses')}
                </Button>
              </>
            ) : (
              <>
                <Typography variant="h2" component="h2">
                  {t('getStarted')}
                </Typography>
                <Typography>{t('publicIntroduction')}</Typography>
                <Button
                  id="primary-get-started-button"
                  sx={{ mt: 3 }}
                  variant="contained"
                  fullWidth
                  component={Link}
                  color="secondary"
                  onClick={() => {
                    logEvent(PROMO_GET_STARTED_CLICKED, eventUserData);
                  }}
                  href={registerPath}
                >
                  {t('getStarted')}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Container>
      {story.content.page_sections?.length > 0 &&
        story.content.page_sections.map((section: any, index: number) => (
          <StoryblokPageSection key={`page_section_${index}`} {...section} />
        ))}
    </Box>
  );
};

export async function getStaticProps({ locale, preview = false }: GetStaticPropsContext) {
  const storyblokProps = await getStoryblokPageProps('home', locale, preview);

  return {
    props: {
      ...storyblokProps,
      messages: {
        ...require(`../messages/shared/${locale}.json`),
        ...require(`../messages/navigation/${locale}.json`),
        ...require(`../messages/welcome/${locale}.json`),
        ...require(`../messages/courses/${locale}.json`),
        ...require(`../messages/chat/${locale}.json`),
      },
    },
    revalidate: 3600, // revalidate every hour
  };
}

export default Index;
