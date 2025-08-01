'use client';

import { PWA_DESKTOP_BANNER_VIEWED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import usePWA from '@/lib/hooks/usePwa';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import { rowStyle } from '@/styles/common';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import IosShareIcon from '@mui/icons-material/IosShare';
import { Button, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';

export const DesktopPwaBanner = () => {
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
    if (!isSmallScreen) {
      logEvent(PWA_DESKTOP_BANNER_VIEWED, analyticsPayload);
    }
  }, [isSmallScreen]);

  if (isSmallScreen || bannerState === 'Hidden') return null;

  const bannerStyle = {
    ...rowStyle,
    position: 'fixed',
    zIndex: 1000,
    px: 2,
    py: 1.5,
    maxWidth: { md: 720, lg: 800 },
    minWidth: { md: 640, lg: 800 },
    top: { md: 150, lg: 160 },
    alignItems: 'center',
    gap: 2,
    justifyContent: bannerState === 'Generic' ? 'space-between' : 'flex-start',
    backgroundColor: 'common.white',
    width: 'auto',
  } as const;

  return (
    <Paper elevation={1} sx={bannerStyle}>
      <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
        {t(bannerState === 'Generic' ? 'mobileDescription' : 'iosDescription')}
      </Typography>

      {bannerState === 'Generic' ? (
        <Stack direction="row" spacing={1}>
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
        <Stack direction="row" gap={2}>
          <Stack alignItems="center" direction="row" gap={1}>
            <Typography variant="body1">{t('iosStep1')}</Typography>
            <IosShareIcon />
          </Stack>
          <Stack alignItems="center" direction="row" gap={1}>
            <Typography variant="body1">{t('iosStep2')}</Typography>
            <AddBoxOutlinedIcon />
          </Stack>
        </Stack>
      )}
    </Paper>
  );
};
