'use client';

import usePWA from '@/lib/hooks/usePwa';
import icon from '@/public/icons/android/icon-96x96.png';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import IosShareIcon from '@mui/icons-material/IosShare';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const boxStyle = {
  backgroundColor: 'common.white',
  p: '2rem',
  pb: '1.5rem',
} as const;
const containerStyle = {
  padding: '0!important',
};
const imageTextStyle = {
  justifyContent: 'flex-start',
  alignItems: 'center',
};
const buttonContainerStyle = {
  justifyContent: 'flex-end',
  alignItems: 'center',
  mt: 2,
};
const iconStyle = {
  height: '3rem',
  width: '3rem',
};
const iconStyleSmall = {
  height: '2.25rem',
  width: '2.25rem',
};

export const MobilePwaBanner = () => {
  const { bannerState, declineInstallation, install } = usePWA();
  const t = useTranslations('Shared.pwaBanner');

  if (bannerState === 'Hidden') return null;

  return (
    <Box sx={boxStyle}>
      <Container sx={containerStyle}>
        <Stack direction="row" spacing={3} sx={imageTextStyle}>
          <Image
            alt="App icon"
            src={icon}
            style={bannerState === 'Generic' ? iconStyle : iconStyleSmall}
          />
          <Typography component="h3" color="textPrimary">
            {t(bannerState === 'Generic' ? 'mobileDescription' : 'iosDescription')}
          </Typography>
        </Stack>
        {bannerState === 'Generic' ? (
          <Stack direction="row" spacing={2} sx={buttonContainerStyle}>
            <Button variant="outlined" onClick={declineInstallation} color="primary">
              {t('button-decline-label')}
            </Button>
            <Button variant="contained" onClick={install} color="secondary">
              {t('button-install-label')}
            </Button>
          </Stack>
        ) : (
          <Stack sx={{ pl: '2rem', mt: '1rem' }}>
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
      </Container>
    </Box>
  );
};
