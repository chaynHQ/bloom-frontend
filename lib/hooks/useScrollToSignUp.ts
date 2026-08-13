'use client';

import { useTheme, useMediaQuery } from '@mui/material';
import { useCallback } from 'react';

// Scrolls the sign-up section into view, clearing the fixed nav that would otherwise cover it.
export function useScrollToSignUp() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  return useCallback(() => {
    const signUpSection = document.getElementById('signup-section');
    if (!signUpSection) return;

    const navHeight = isSmallScreen ? 48 : isMediumScreen ? 64 : 128;
    const elementPosition = signUpSection.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: elementPosition - navHeight, behavior: 'smooth' });
  }, [isSmallScreen, isMediumScreen]);
}
