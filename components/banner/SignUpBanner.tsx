import { Button, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { SIGN_UP_TODAY_BANNER_BUTTON_CLICKED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import theme from '../../styles/theme';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import Link from '../common/Link';

const containerStyle = {
  background: theme.palette.bloomGradient,
  textAlign: 'center',
} as const;

export const SignUpBanner = () => {
  const t = useTranslations('Shared');
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
        component={Link}
        variant="contained"
        color="secondary"
        href={registerPath}
        onClick={() => {
          logEvent(SIGN_UP_TODAY_BANNER_BUTTON_CLICKED, eventUserData);
        }}
      >
        {t('signUpTodayPromo.button')}
      </Button>
    </Container>
  );
};
