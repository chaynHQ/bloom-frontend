'use client';

import { useTypedSelector } from '@/lib/hooks/store';
import { Button, useMediaQuery, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const ScrollToSignUpButton = () => {
  const t = useTranslations('Shared');
  const theme = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  const userLoading = useTypedSelector(
    (state) => state.user.authStateLoading || state.user.loading,
  );
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const handleClick = () => {
    const signUpBanner = document.getElementById('signup-banner');
    if (signUpBanner) {
      // Nav height: xs: 48px, sm: 64px, md: 128px
      const navHeight = isSmallScreen ? 48 : isMediumScreen ? 64 : 128;
      const elementPosition = signUpBanner.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - navHeight, behavior: 'smooth' });
    }
  };

  if (!isMounted || userLoading) {
    return null;
  }

  return (
    <Button variant="contained" color="secondary" onClick={handleClick}>
      {t('scrollToSignUp.button')}
    </Button>
  );
};

export default ScrollToSignUpButton;
