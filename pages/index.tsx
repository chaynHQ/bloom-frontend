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
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { StoriesParams, StoryData } from 'storyblok-js-client';
import Link from '../components/common/Link';
import PartnerHeader from '../components/layout/PartnerHeader';
import StoryblokPageSection from '../components/storyblok/StoryblokPageSection';
import Storyblok, { useStoryblok } from '../config/storyblok';
import { LANGUAGES } from '../constants/enums';
import illustrationBloomHeadYellow from '../public/illustration_bloom_head_yellow.svg';
import welcomeToBloom from '../public/welcome_to_bloom.svg';
import { rowStyle } from '../styles/common';

const textContainerStyle = {
  maxWidth: 600,
  width: { xs: '100%', md: '45%' },
} as const;

const rowItem = {
  width: { xs: '100%', sm: '60%', md: '45%' },
} as const;

interface Props {
  story: StoryData;
  preview: boolean;
  sbParams: StoriesParams;
  messages: any;
  locale: LANGUAGES;
}

const Welcome: NextPage<Props> = ({ story, preview, sbParams, messages, locale }) => {
  const t = useTranslations('Welcome');
  const router = useRouter();
  const [codeParam, setCodeParam] = useState<string>('');

  story = useStoryblok(story, preview, sbParams, locale);

  const headerProps = {
    partnerLogoSrc: welcomeToBloom,
    partnerLogoAlt: 'alt.welcomeToBloom',
    imageSrc: illustrationBloomHeadYellow,
    imageAlt: 'alt.bloomHead',
  };

  useEffect(() => {
    const { code } = router.query;
    if (code) setCodeParam(code + '');
  }, [setCodeParam, router.query]);

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
        <Box sx={textContainerStyle}>
          <Typography pb={2} variant="subtitle1" component="p">
            {story.content.introduction}
          </Typography>
        </Box>
        <Card sx={rowItem}>
          <CardContent>
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
              href="/auth/register"
            >
              {t('getStarted')}
            </Button>
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
    cv: preview ? Date.now() : 0,
  };

  let { data } = await Storyblok.get(`cdn/stories/welcome`, sbParams);

  return {
    props: {
      story: data ? data.story : null,
      preview,
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

export default Welcome;
