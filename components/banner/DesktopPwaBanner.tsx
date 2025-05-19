'use client';

import usePWA from '@/lib/hooks/usePwa';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import IosShareIcon from '@mui/icons-material/IosShare';
import { Button, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';

export const DesktopPwaBanner = () => {
  const { bannerState, declineInstallation, install } = usePWA();
  const t = useTranslations('Shared.pwaBanner');
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  if (isSmallScreen || bannerState === 'Hidden') return null;

  return (
    <Paper
      elevation={1}
      sx={{
        px: 2,
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: bannerState === 'Generic' ? 0 : '1rem',
        justifyContent: bannerState === 'Generic' ? 'space-between' : 'flex-start',
        backgroundColor: 'common.white',
        width: '100%',
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
        {t(bannerState === 'Generic' ? 'mobileDescription' : 'iosDescription')}
      </Typography>

      {bannerState === 'Generic' ? (
        <Stack direction="row" spacing={2}>
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
