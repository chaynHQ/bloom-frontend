'use client';

import { IconFeature } from '@/components/common/IconFeature';
import { Link as i18nLink } from '@/i18n/routing';
import { SIGN_UP_TODAY_BANNER_BUTTON_CLICKED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { useRegisterPath } from '@/lib/hooks/useRegisterPath';
import logEvent from '@/lib/utils/logEvent';
import globeIcon from '@/public/globe.svg';
import heartIcon from '@/public/heart.svg';
import playPauseIcon from '@/public/play_pause.svg';
import { sectionDivider } from '@/styles/common';
import theme from '@/styles/theme';
import { Box, Button, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const FEATURES = [
  { key: 'multilingual', icon: globeIcon },
  { key: 'freeAndAnonymous', icon: heartIcon },
  { key: 'exploreAtYourPace', icon: playPauseIcon },
] as const;

// A hairline only where the section meets another one, never against the header or footer.
const containerStyle = (sectionAbove: boolean, sectionBelow: boolean) =>
  ({
    background: theme.palette.bloomGradientSoftUp,
    textAlign: 'center',
    pt: { xs: 5, md: 8 },
    pb: { xs: 5, md: 8 },
    ...(sectionAbove && sectionDivider('top')),
    ...(sectionBelow && sectionDivider('bottom')),
  }) as const;

// Two features per row on mobile, with the odd one centred beneath; three across from `md`.
const featuresStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: { xs: 3, md: 5 },
  mt: 4,
  '& > *': { flexBasis: { xs: '40%', md: 0 }, flexGrow: { md: 1 } },
} as const;

// The signed-out closing section: what Bloom offers, then the sign-up call to action. Shown on the
// home page and at the foot of the public content pages.
export function SignUpSection({
  sectionAbove = true,
  sectionBelow = false,
}: {
  sectionAbove?: boolean;
  sectionBelow?: boolean;
}) {
  const t = useTranslations('Shared.signUpSection');
  const userLoading = useTypedSelector(
    (state) => state.user.authStateLoading || state.user.loading,
  );
  const registerPath = useRegisterPath();
  // `userLoading` can flip mid-hydration, so hold the server-rendered output until after mount.
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  if (!isMounted || userLoading) return null;

  return (
    <Container
      id="signup-section"
      qa-id="sign-up-section"
      sx={containerStyle(sectionAbove, sectionBelow)}
    >
      <Typography variant="h2">{t('title')}</Typography>
      <Typography>{t('introduction')}</Typography>

      <Box sx={featuresStyle}>
        {FEATURES.map(({ key, icon }) => (
          <IconFeature key={key} iconSrc={icon} label={t(key)} qaId={`sign-up-section-${key}`} />
        ))}
      </Box>

      <Button
        qa-id="sign-up-section-cta"
        variant="contained"
        color="error"
        component={i18nLink}
        href={registerPath}
        onClick={() => logEvent(SIGN_UP_TODAY_BANNER_BUTTON_CLICKED)}
        sx={{ mt: 4 }}
      >
        {t('cta')}
      </Button>
    </Container>
  );
}
