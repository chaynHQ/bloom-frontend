'use client';

import ProgressStatus from '@/components/common/ProgressStatus';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { getImageSizes } from '@/lib/utils/imageSizes';
// Calm fallback, shared with the session hero, for resource types whose CMS entry has no hero image.
import illustrationDefault from '@/public/illustration_person4_peach.svg';
import { Box, Divider, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
} as const;

const imageStyle = {
  position: 'relative',
  flexShrink: 0,
  width: { xs: 100, md: 134 },
  height: { xs: 100, md: 134 },
  borderRadius: '50%',
  overflow: 'hidden',
  backgroundColor: 'secondary.light',
} as const;

const eyebrowStyle = {
  fontFamily: 'headingFontFamily',
  fontWeight: 500,
  color: 'grey.700',
  mb: 0.5,
} as const;

interface ResourceHeroProps {
  title: string;
  progress: PROGRESS_STATUS;
  eyebrow?: string;
  subtitle?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export const ResourceHero = ({
  title,
  progress,
  eyebrow,
  subtitle,
  imageSrc,
  imageAlt,
}: ResourceHeroProps) => {
  const tS = useTranslations('Shared');

  return (
    <Box qa-id="resource-hero">
      <Box sx={rowStyle}>
        <Box sx={imageStyle}>
          <Image
            alt={imageSrc ? (imageAlt ?? '') : tS('alt.personTea')}
            src={imageSrc ?? illustrationDefault}
            fill
            priority
            sizes={getImageSizes(imageStyle.width)}
            style={{ objectFit: 'contain', padding: '14%' }}
          />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          {eyebrow && (
            <Typography component="div" variant="body2" sx={eyebrowStyle}>
              {eyebrow}
            </Typography>
          )}
          <Typography variant="h1" component="h1" sx={{ mb: 0 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography component="p" sx={{ mt: 1, mb: 0, color: 'grey.800' }}>
              {subtitle}
            </Typography>
          )}
          {progress !== PROGRESS_STATUS.NOT_STARTED && (
            <Box sx={{ mt: 2 }}>
              <ProgressStatus status={progress} />
            </Box>
          )}
        </Box>
      </Box>
      <Divider sx={{ mt: 3, borderColor: 'sectionBorder' }} />
    </Box>
  );
};
