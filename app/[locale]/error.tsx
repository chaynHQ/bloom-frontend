'use client';

import { Box, Button, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect } from 'react';
import { columnStyle } from '../../styles/common';
import { getImageSizes } from '../../utils/imageSizes';
import bloomHead from '../public/illustration_bloom_head.svg';

const containerStyle = {
  ...columnStyle,
  height: '100vh',
  alignItems: 'flex-start',
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 180, md: 260 },
  height: { xs: 180, md: 260 },
  marginLeft: { xs: -3, md: -6 },
  marginBottom: 2,
} as const;

const Error = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => {
  useEffect(() => {
    if ((window as any).newrelic) {
      (window as any).newrelic.noticeError(error);
    }
  }, [error]);

  const t = useTranslations('Shared.error');

  return (
    <Container sx={containerStyle}>
      <Box sx={imageContainerStyle}>
        <Image
          alt={t('alt.bloomLogo')}
          src={bloomHead}
          fill
          sizes={getImageSizes(imageContainerStyle.width)}
        />
      </Box>
      <Typography variant="h1">{t('title')}</Typography>
      <Typography>{t('description')}</Typography>
      <Button
        sx={{ mt: 3 }}
        variant="contained"
        color="secondary"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        {t('buttonLabel')}
      </Button>
    </Container>
  );
};

export default Error;
