'use client';

import { getImageSizes } from '@/lib/utils/imageSizes';
import illustrationChange from '@/public/illustration_change_peach.svg';
import { Box, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const containerStyle = {
  textAlign: 'center',
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 120, md: 160 },
  height: { xs: 120, md: 160 },
  marginBottom: 4,
  marginX: 'auto',
} as const;

export default function Page() {
  const t = useTranslations('Shared');

  return (
    <Container sx={containerStyle}>
      <Box sx={imageContainerStyle}>
        <Image
          alt={t('alt.change')}
          src={illustrationChange}
          fill
          sizes={getImageSizes(imageContainerStyle.width)}
          style={{
            objectFit: 'contain',
          }}
        />
      </Box>
      <Typography variant="h2" component="h2" mb={2}>
        {t('maintenanceBanner.title')}
      </Typography>
      <Typography maxWidth={650} mb={2} mx={'auto'}>
        {t('maintenanceBanner.description', {
          hours: process.env.NEXT_PUBLIC_MAINTENANCE_HOURS as string,
        })}
      </Typography>
    </Container>
  );
}
