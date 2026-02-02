'use client';

import { Link as i18nLink } from '@/i18n/routing';
import { SIGN_UP_TODAY_BANNER_BUTTON_CLICKED } from '@/lib/constants/events';
import { useCookieReferralPartner } from '@/lib/hooks/useCookieReferralPartner';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent from '@/lib/utils/logEvent';
import theme from '@/styles/theme';
import { Button, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

const containerStyle = {
  background: theme.palette.bloomGradient,
  textAlign: 'center',
} as const;

export const SignUpBanner = () => {
  const t = useTranslations('Shared');
  const userLoading = useTypedSelector(
    (state) => state.user.authStateLoading || state.user.loading,
  );
  const referralPartner = useCookieReferralPartner();

  const registerPath = useMemo(() => {
    return referralPartner ? `/auth/register?partner=${referralPartner}` : '/auth/register';
  }, [referralPartner]);

  if (userLoading) {
    return null;
  }

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
