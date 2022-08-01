import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import type { NextPage } from 'next';
import { GetStaticPropsContext } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { StoriesParams, StoryData } from 'storyblok-js-client';
import { render } from 'storyblok-rich-text-react-renderer';
import { RootState } from '../app/store';
import Link from '../components/common/Link';
import PartnerHeader from '../components/layout/PartnerHeader';
import StoryblokPageSection from '../components/storyblok/StoryblokPageSection';
import Storyblok, { useStoryblok } from '../config/storyblok';
import { LANGUAGES } from '../constants/enums';
import { PROMO_GET_STARTED_CLICKED, PROMO_GO_TO_COURSES_CLICKED } from '../constants/events';
import { useTypedSelector } from '../hooks/store';
import illustrationBloomHeadYellow from '../public/illustration_bloom_head_yellow.svg';
import welcomeToBloom from '../public/welcome_to_bloom.svg';
import { rowStyle } from '../styles/common';
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

interface Props {
  story: StoryData;
  preview: boolean;
  sbParams: StoriesParams;
  locale: LANGUAGES;
}

const Index: NextPage<Props> = ({ story, preview, sbParams, locale }) => {
  const t = useTranslations('Welcome');
  const { user, partnerAccesses, partnerAdmin } = useTypedSelector((state: RootState) => state);
  const eventUserData = getEventUserData({ user, partnerAccesses, partnerAdmin });

  story = useStoryblok(story, preview, sbParams, locale);

  const headerProps = {
    partnerLogoSrc: welcomeToBloom,
    partnerLogoAlt: 'alt.welcomeToBloom',
    imageSrc: illustrationBloomHeadYellow,
    imageAlt: 'alt.bloomHead',
  };

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
            {user.token ? (
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
                  sx={{ mt: 3 }}
                  variant="contained"
                  fullWidth
                  component={Link}
                  color="secondary"
                  onClick={() => {
                    logEvent(PROMO_GET_STARTED_CLICKED, eventUserData);
                  }}
                  href="/auth/register"
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
  const sbParams = {
    version: preview ? 'draft' : 'published',
    language: locale,
    ...(preview && { cv: Date.now() }),
  };

  let { data } = await Storyblok.get(`cdn/stories/home`, sbParams);

  return {
    props: {
      story: data ? data.story : null,
      preview,
      sbParams: JSON.stringify(sbParams),
      messages: {
        ...require(`../messages/shared/${locale}.json`),
        ...require(`../messages/navigation/${locale}.json`),
        ...require(`../messages/welcome/${locale}.json`),
      },
      locale,
    },
    revalidate: 3600, // revalidate every hour
  };
}

export default Index;
