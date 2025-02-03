'use client';

import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { getImageSizes } from '@/lib/utils/imageSizes';
import bloomHead from '@/public/illustration_bloom_head.svg';
import { columnStyle } from '@/styles/common';
import { Container } from '@mui/material';
import Image from 'next/image';

const containerStyle = {
  ...columnStyle,
  minHeight: 'calc(100vh - 120px)',
  alignItems: 'flex-start',
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 180, md: 260 },
  height: { xs: 180, md: 260 },
  marginLeft: { xs: -3, md: -6 },
  marginBottom: 4,
} as const;

const NoDataAvailable = () => {
  const t = useTranslations('Shared.noDataAvailable');

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
      <Typography variant="h3" component="h1" maxWidth={700}>
        {t('title')}
      </Typography>
    </Container>
  );
};

export default NoDataAvailable;
