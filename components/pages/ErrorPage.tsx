'use client';

import { getImageSizes } from '@/lib/utils/imageSizes';
import bloomHead from '@/public/illustration_bloom_head.svg';
import { fullScreenContainerStyle } from '@/styles/common';
import { Box, Button, Container, Typography } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect } from 'react';

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 180, md: 260 },
  height: { xs: 180, md: 260 },
  marginLeft: { xs: -3, md: -6 },
  marginBottom: 2,
} as const;

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const rollbar = useRollbar();

  useEffect(() => {
    rollbar.error(error);

    if ((window as any).newrelic) {
      (window as any).newrelic.noticeError(error);
    }
  }, [error, rollbar]);

  const t = useTranslations('Shared');

  return (
    <Container sx={fullScreenContainerStyle}>
      <Box sx={imageContainerStyle}>
        <Image
          alt={t('alt.bloomLogo')}
          src={bloomHead}
          fill
          sizes={getImageSizes(imageContainerStyle.width)}
        />
      </Box>
      <Typography variant="h1">{t('error.title')}</Typography>
      <Typography>{t('error.description')}</Typography>
      <Button
        sx={{ mt: 3 }}
        variant="contained"
        color="secondary"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        {t('error.buttonLabel')}
      </Button>
    </Container>
  );
}
