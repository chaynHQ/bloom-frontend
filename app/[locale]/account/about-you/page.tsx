'use client';

import AboutYouDemographicForm from '@/components/forms/AboutYouDemographicForm';
import AboutYouSetAForm from '@/components/forms/AboutYouSetAForm';
import PartnerHeader from '@/components/layout/PartnerHeader';
import { Link as i18nLink } from '@/i18n/routing';
import { SURVEY_FORMS } from '@/lib/constants/enums';
import { ABOUT_YOU_VIEWED, SIGNUP_SURVEY_SKIPPED } from '@/lib/constants/events';
import logEvent from '@/lib/utils/logEvent';
import illustrationBloomHeadYellow from '@/public/illustration_bloom_head_yellow.svg';
import welcomeToBloom from '@/public/welcome_to_bloom.svg';
import { rowStyle } from '@/styles/common';
import { Box, Button, Card, CardContent, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useSearchParams } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

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
  const formMap: { [key: string]: ReactNode } = {
    default: <AboutYouDemographicForm />,
    a: <AboutYouSetAForm />,
  };
  return formMap[formLabel];
};

export default function Page() {
  const [questionSetParam, setQuestionSetParam] = useState<string>(SURVEY_FORMS.default);
  const searchParams = useSearchParams();
  const qParam = searchParams.get('q');
  const return_url = searchParams.get('return_url');
  const t = useTranslations('Account.aboutYou');

  useEffect(() => {
    if (qParam) {
      setQuestionSetParam(qParam + '');
    } else {
      setQuestionSetParam(SURVEY_FORMS.default);
    }
  }, [qParam]);

  useEffect(() => {
    logEvent(ABOUT_YOU_VIEWED);
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
        <title>{`${t('title')} • Bloom`}</title>
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

          {questionSetParam === SURVEY_FORMS.default && <Typography>{t('description')}</Typography>}
          {questionSetParam === SURVEY_FORMS.a && (
            <>
              <Typography>
                <strong>{t('descriptionALine1')}</strong>
              </Typography>
              <Typography>{t('descriptionALine2')}</Typography>
            </>
          )}
          <Button
            sx={{ mt: 3 }}
            variant="contained"
            onClick={() => {
              logEvent(SIGNUP_SURVEY_SKIPPED);
            }}
            color="secondary"
            component={i18nLink}
            href={typeof return_url === 'string' ? return_url : '/courses'}
          >
            {t('goToCourses')}
          </Button>
          <Box sx={formContainerStyle}>
            <Card>
              <CardContent>
                <Typography variant="h2" component="h2">
                  {questionSetParam === SURVEY_FORMS.a && t('titleA')}
                  {questionSetParam === SURVEY_FORMS.default && t('title')}
                </Typography>
                {getForm(questionSetParam)}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
