import { Button, Card, CardContent } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { RootState } from '../../app/store';
import Link from '../../components/common/Link';
import AboutYouDemoForm from '../../components/forms/AboutYouDemoForm';
import ApplyCodeForm from '../../components/forms/ApplyCodeForm';
import PartnerHeader from '../../components/layout/PartnerHeader';
import { ABOUT_YOU_VIEWED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import illustrationBloomHeadYellow from '../../public/illustration_bloom_head_yellow.svg';
import welcomeToBloom from '../../public/welcome_to_bloom.svg';
import { rowStyle } from '../../styles/common';
import logEvent, { getEventUserData } from '../../utils/logEvent';

const containerStyle = {
  ...rowStyle,
  backgroundColor: 'primary.light',
  justifyContent: 'center',
  paddingTop: '4rem !important',
} as const;

const contentContainerStyle = {
  maxWidth: 600,
  textAlign: 'center',
} as const;

const formContainerStyle = {
  marginTop: 5,
  textAlign: 'left',
} as const;

const AboutYou: NextPage = () => {
  const [questionSetParam, setQuestionSetParam] = useState<string>('');
  const router = useRouter();

  const t = useTranslations('Account.aboutYou');
  const tS = useTranslations('Shared');

  const { user, partnerAccesses } = useTypedSelector((state: RootState) => state);

  useEffect(() => {
    const { q } = router.query;

    if (q) setQuestionSetParam(q + '');
  }, [router.query]);

  useEffect(() => {
    const eventUserData = getEventUserData({ user, partnerAccesses });

    logEvent(ABOUT_YOU_VIEWED, eventUserData);
  }, []);

  const headerProps = {
    partnerLogoSrc: welcomeToBloom,
    partnerLogoAlt: 'alt.welcomeToBloom',
    imageSrc: illustrationBloomHeadYellow,
    imageAlt: 'alt.bloomHead',
  };

  return (
    <Box>
      <Head>
        <title>{t('title')}</title>
      </Head>
      <PartnerHeader
        partnerLogoSrc={headerProps.partnerLogoSrc}
        partnerLogoAlt={headerProps.partnerLogoAlt}
        imageSrc={headerProps.imageSrc}
        imageAlt={headerProps.imageAlt}
      />
      <Container sx={containerStyle}>
        <Box sx={contentContainerStyle}>
          <Typography variant="h2" component="h2">
            {t('header')}
          </Typography>
          {!questionSetParam ? (
            <Typography variant="body1" component="p">
              {t('description')}
            </Typography>
          ) : (
            <Typography variant="body1" component="p">
              {t('description')}
            </Typography>
          )}
          <Button
            sx={{ mt: 3 }}
            variant="contained"
            component={Link}
            color="secondary"
            href="/courses"
          >
            {t('goToCourses')}
          </Button>
          <Box sx={formContainerStyle}>
            <Card>
              <CardContent>
                <Typography variant="h2" component="h2">
                  {t('title')}
                </Typography>
                {!questionSetParam ? <AboutYouDemoForm /> : <ApplyCodeForm />}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: {
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/navigation/${locale}.json`),
        ...require(`../../messages/account/${locale}.json`),
        ...require(`../../messages/auth/${locale}.json`),
      },
    },
  };
}

export default AboutYou;
