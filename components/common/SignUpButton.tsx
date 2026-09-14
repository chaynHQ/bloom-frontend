'use client';

import { Link as i18nLink } from '@/i18n/routing';
import { SIGN_UP_HERO_BUTTON_CLICKED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { useRegisterPath } from '@/lib/hooks/useRegisterPath';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import { Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface Props {
  labelKey?: 'cta' | 'ctaMessaging';
  // Reported as `sign_up_section_source` on the click event.
  source: string;
}

// Page-header CTA for signed-out visitors on the partially-public pages — sends them to register.
const SignUpButton = ({ labelKey = 'cta', source }: Props) => {
  const t = useTranslations('Shared.signUpSection');
  const [isMounted, setIsMounted] = useState(false);
  const registerPath = useRegisterPath();
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
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

  const handleClick = () => {
    logEvent(SIGN_UP_HERO_BUTTON_CLICKED, {
      sign_up_section_source: source,
      ...getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin),
    });
  };

  return (
    <Button
      variant="contained"
      color="error"
      component={i18nLink}
      href={registerPath}
      onClick={handleClick}
    >
      {t(labelKey)}
    </Button>
  );
};

export default SignUpButton;
