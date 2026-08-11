'use client';

import { floatingBannerGap, getFloatingBannerPosition } from '@/lib/constants/banners';
import { PWA_DESKTOP_BANNER_VIEWED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import usePWA from '@/lib/hooks/usePwa';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import IosShareIcon from '@mui/icons-material/IosShare';
import { Button, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';

export const DesktopPwaBanner = () => {
  const [isMounted, setIsMounted] = useState(false);
  const hasLoggedView = useRef(false);
  const { bannerState, declineInstallation, install, getPwaMetaData } = usePWA();
  const t = useTranslations('Shared.pwaBanner');
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);
  const analyticsPayload = useMemo(() => {
    return {
      ...eventUserData,
      ...getPwaMetaData,
    };
  }, [eventUserData, getPwaMetaData]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only log a view once the banner is actually on screen — it now waits for a cookie decision.
    if (isMounted && !isSmallScreen && bannerState !== 'Hidden' && !hasLoggedView.current) {
      hasLoggedView.current = true;
      logEvent(PWA_DESKTOP_BANNER_VIEWED, analyticsPayload);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, isSmallScreen, bannerState]);

  if (!isMounted || isSmallScreen || bannerState === 'Hidden') return null;

  const bannerStyle = {
    // Shares its anchor with the cookie banner — only one of the two is ever visible at a time.
    ...getFloatingBannerPosition(isSmallScreen),
    p: 2.5,
    width: 250,
    maxWidth: `calc(100vw - ${floatingBannerGap * 2}px)`,
    backgroundColor: 'common.white',
  } as const;

  return (
    <Paper elevation={1} sx={bannerStyle}>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
        }}
      >
        {t(bannerState === 'Generic' ? 'mobileDescription' : 'iosDescription')}
      </Typography>
      {bannerState === 'Generic' ? (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            mt: 1.5,
            ml: 'auto',
          }}
        >
          <Button
            onClick={declineInstallation}
            variant="outlined"
            color="secondary"
            size="small"
            sx={{ px: 2, minWidth: 'auto', whiteSpace: 'nowrap' }}
          >
            {t('button-decline-label')}
          </Button>
          <Button
            onClick={install}
            variant="contained"
            color="secondary"
            size="small"
            sx={{ px: 2, minWidth: 'auto', whiteSpace: 'nowrap' }}
          >
            {t('button-install-label')}
          </Button>
        </Stack>
      ) : (
        <Stack
          direction="row"
          sx={{
            gap: 2,
          }}
        >
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="body1">{t('iosStep1')}</Typography>
            <IosShareIcon />
          </Stack>
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="body1">{t('iosStep2')}</Typography>
            <AddBoxOutlinedIcon />
          </Stack>
        </Stack>
      )}
    </Paper>
  );
};
