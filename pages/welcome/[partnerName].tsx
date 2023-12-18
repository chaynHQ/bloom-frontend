import { Box, Button, Card, CardContent, Container, Typography } from '@mui/material';
import type { GetStaticPathsContext, NextPage } from 'next';
import { GetStaticPropsContext } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { StoriesParams, StoryData } from 'storyblok-js-client';
import { render } from 'storyblok-rich-text-react-renderer';
import { useGetAutomaticAccessCodeFeatureForPartnerQuery } from '../../app/api';
import { RootState } from '../../app/store';
import Link from '../../components/common/Link';
import WelcomeCodeForm from '../../components/forms/WelcomeCodeForm';
import PartnerHeader from '../../components/layout/PartnerHeader';
import StoryblokPageSection from '../../components/storyblok/StoryblokPageSection';
import Storyblok, { useStoryblok } from '../../config/storyblok';
import { LANGUAGES } from '../../constants/enums';
import {
  generatePartnerPromoGetStartedEvent,
  generatePartnerPromoGoToCoursesEvent,
} from '../../constants/events';
import { getPartnerContent } from '../../constants/partners';
import { useTypedSelector } from '../../hooks/store';
import illustrationBloomHeadYellow from '../../public/illustration_bloom_head_yellow.svg';
import welcomeToBloom from '../../public/welcome_to_bloom.svg';
import { rowStyle } from '../../styles/common';
import hasAutomaticAccessFeature from '../../utils/hasAutomaticAccessCodeFeature';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import { RichTextOptions } from '../../utils/richText';

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

const Welcome: NextPage<Props> = ({ story, preview, sbParams, locale }) => {
  const t = useTranslations('Welcome');

  const { user, partnerAccesses, partnerAdmin } = useTypedSelector((state: RootState) => state);
  const eventUserData = getEventUserData({ user, partnerAccesses, partnerAdmin });
  story = useStoryblok(story, preview, sbParams, locale);
  const partnerContent = getPartnerContent(story.slug);

  const headerProps = {
    partnerLogoSrc: partnerContent.partnershipLogo || welcomeToBloom,
    partnerLogoAlt: partnerContent.partnershipLogoAlt || 'alt.welcomeToBloom',
    imageSrc: partnerContent.bloomGirlIllustration || illustrationBloomHeadYellow,
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
        <CallToActionCard partnerName={partnerContent.name} />
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

const CallToActionCard = ({ partnerName }: { partnerName: string }) => {
  const router = useRouter();
  const { user, partnerAccesses, partnerAdmin, partners } = useTypedSelector(
    (state: RootState) => state,
  );
  const t = useTranslations('Welcome');

  const [accessCodeRequired, setAccessCodeRequired] = useState<boolean>(true);
  const [codeParam, setCodeParam] = useState<string>('');
  const eventUserData = getEventUserData({ user, partnerAccesses, partnerAdmin });
  useGetAutomaticAccessCodeFeatureForPartnerQuery(partnerName);
  useEffect(() => {
    const partnerData = partners.find((p) => p.name.toLowerCase() === partnerName.toLowerCase());
    if (partnerData) {
      setAccessCodeRequired(!hasAutomaticAccessFeature(partnerData));
    }
  }, [partners, partnerName]);

  useEffect(() => {
    const { code } = router.query;
    if (code) setCodeParam(code + '');
  }, [setCodeParam, router.query]);

  return (
    <Card sx={rowItem}>
      <CardContent>
        {user.token && (
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
              onClick={() => {
                logEvent(generatePartnerPromoGoToCoursesEvent(partnerName), eventUserData);
              }}
              href="/courses"
            >
              {t('goToCourses')}
            </Button>
          </>
        )}
        {!user.token && accessCodeRequired && (
          <>
            <Typography variant="h2" component="h2">
              {t('getStarted')}
            </Typography>
            <Typography>{t.rich('accessIntroduction', { partnerName })}</Typography>
            <WelcomeCodeForm codeParam={codeParam} partnerParam={partnerName} />
          </>
        )}
        {!user.token && !accessCodeRequired && (
          <>
            <Typography variant="h2" component="h2">
              {t('getStarted')}
            </Typography>
            <Typography>{t.rich('publicIntroduction', { partnerName })}</Typography>
            <Button
              sx={{ mt: 3 }}
              variant="contained"
              fullWidth
              component={Link}
              color="secondary"
              onClick={() => {
                logEvent(generatePartnerPromoGetStartedEvent(partnerName), eventUserData);
              }}
              href={`/auth/register?partner=${partnerName.toLocaleLowerCase()}`}
            >
              {t('getStarted')}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export async function getStaticProps({ locale, preview = false, params }: GetStaticPropsContext) {
  const partnerName = params?.partnerName;

  const sbParams = {
    version: preview ? 'draft' : 'published',
    language: locale,
    ...(preview && { cv: Date.now() }),
  };

  let { data } = await Storyblok.get(`cdn/stories/welcome/${partnerName}`, sbParams);

  return {
    props: {
      story: data ? data.story : null,
      preview,
      sbParams: JSON.stringify(sbParams),
      messages: {
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/navigation/${locale}.json`),
        ...require(`../../messages/welcome/${locale}.json`),
      },
      locale,
    },
    revalidate: 3600, // revalidate every hour
  };
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  let { data } = await Storyblok.get('cdn/links/?starts_with=welcome/');

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
    paths: paths,
    fallback: false,
  };
}

export default Welcome;
