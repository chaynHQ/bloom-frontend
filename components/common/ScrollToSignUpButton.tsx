'use client';

import { useTypedSelector } from '@/lib/hooks/store';
import { useScrollToSignUp } from '@/lib/hooks/useScrollToSignUp';
import { Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const ScrollToSignUpButton = () => {
  const t = useTranslations('Shared');
  const [isMounted, setIsMounted] = useState(false);
  const scrollToSignUp = useScrollToSignUp();
  const userLoading = useTypedSelector(
    (state) => state.user.authStateLoading || state.user.loading,
  );
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  if (!isMounted || userLoading) {
    return null;
  }

  return (
    <Button variant="contained" color="secondary" onClick={scrollToSignUp}>
      {t('scrollToSignUp.button')}
    </Button>
  );
};

export default ScrollToSignUpButton;
