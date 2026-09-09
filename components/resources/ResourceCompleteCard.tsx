'use client';

import { Link as i18nLink } from '@/i18n/routing';
import { getImageSizes } from '@/lib/utils/imageSizes';
import illustrationSun from '@/public/illustration_sun.svg';
import { Box, Button, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const cardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 3,
  py: 2,
  px: { xs: 2, sm: 4 },
  borderRadius: '8px',
  border: '1px solid',
  borderColor: 'cardBorder',
  backgroundColor: 'cardSurface',
} as const;

const imageStyle = { position: 'relative', flexShrink: 0, width: 66, height: 62 } as const;

const copyStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  minWidth: 0,
  flex: 1,
} as const;

export const ResourceCompleteCard = () => {
  const t = useTranslations('Resources.complete');

  return (
    <Box qa-id="resource-complete-card" sx={cardStyle}>
      <Box sx={imageStyle}>
        <Image
          alt=""
          src={illustrationSun}
          fill
          sizes={getImageSizes(imageStyle.width)}
          style={{ objectFit: 'contain' }}
        />
      </Box>
      <Box sx={copyStyle}>
        <Typography variant="h4" component="p" sx={{ mb: 0 }}>
          {t('title')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'grey.700' }}>
          {t('body')}
        </Typography>
        <Button
          variant="contained"
          color="error"
          component={i18nLink}
          href="/library"
          fullWidth
          sx={{ mt: 1, maxWidth: 'none' }}
        >
          {t('cta')}
        </Button>
      </Box>
    </Box>
  );
};
