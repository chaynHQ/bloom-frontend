'use client';

import { Link as i18nLink } from '@/i18n/routing';
import { SIGN_UP_TODAY_BANNER_BUTTON_CLICKED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent from '@/lib/utils/logEvent';
import theme from '@/styles/theme';
import { Button, Container, Typography } from '@mui/material';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const containerStyle = {
  background: theme.palette.bloomGradient,
  textAlign: 'center',
} as const;

export const SignUpBanner = () => {
  const t = useTranslations('Shared');
  const entryPartnerReferral = useTypedSelector((state) => state.user.entryPartnerReferral);
  const [registerPath, setRegisterPath] = useState('/auth/register');

  useEffect(() => {
    const referralPartner = Cookies.get('referralPartner') || entryPartnerReferral;

    if (referralPartner) {
      setRegisterPath(`/auth/register?partner=${referralPartner}`);
    }
  }, [entryPartnerReferral]);

  return (
    <Container id="signup-banner" sx={containerStyle}>
      <Typography variant="h2" component="h2" mb={2}>
        {t('signUpTodayPromo.title')}
      </Typography>
      <Typography mb={2}>{t('signUpTodayPromo.description1')}</Typography>
      <Typography
        sx={{
          mb: '2rem !important',
        }}
      >
        {t('signUpTodayPromo.description2')}
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        href={registerPath}
        component={i18nLink}
        onClick={() => {
          logEvent(SIGN_UP_TODAY_BANNER_BUTTON_CLICKED);
        }}
      >
        {t('signUpTodayPromo.button')}
      </Button>
    </Container>
  );
};
