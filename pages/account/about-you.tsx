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
import AboutYouDemographicForm from '../../components/forms/AboutYouDemographicForm';
import AboutYouSetAForm from '../../components/forms/AboutYouSetAForm';
import AboutYouSetBForm from '../../components/forms/AboutYouSetBForm';
import AboutYouSetCForm from '../../components/forms/AboutYouSetCForm';
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

const getForm = (formLabel: string) => {
  const formMap: { [key: string]: JSX.Element } = {
    default: <AboutYouDemographicForm />,
    a: <AboutYouSetAForm />,
    b: <AboutYouSetBForm />,
    c: <AboutYouSetCForm />,
  };
  return formMap[formLabel];
};

const AboutYou: NextPage = () => {
  const [questionSetParam, setQuestionSetParam] = useState<string>('default');
  const router = useRouter();

  const t = useTranslations('Account.aboutYou');

  const { user, partnerAccesses } = useTypedSelector((state: RootState) => state);

  useEffect(() => {
    const { q } = router.query;

    if (q) {
      setQuestionSetParam(q + '');
    } else {
      setQuestionSetParam('default');
    }
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

          {questionSetParam === 'default' && <Typography>{t('description')}</Typography>}
          {questionSetParam === 'a' && (
            <>
              <Typography>
                <strong>{t('descriptionALine1')}</strong>
              </Typography>
              <Typography>{t('descriptionALine2')}</Typography>
            </>
          )}
          {(questionSetParam === 'b' || questionSetParam === 'c') && (
            <Typography>{t('setBAndCDescription')}</Typography>
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
                  {questionSetParam === 'a' && t('titleA')}
                  {questionSetParam === 'default' && t('title')}
                </Typography>
                {getForm(questionSetParam)}
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
