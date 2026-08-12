'use client';

import { getImageSizes } from '@/lib/utils/imageSizes';
import { Box, Typography } from '@mui/material';
import Image, { type StaticImageData } from 'next/image';

const ICON_WIDTH = { xs: 88, md: 125 };

const ILLUSTRATION_ASPECT = 155 / 146;

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: 0.5,
} as const;

const iconStyle = {
  position: 'relative',
  width: ICON_WIDTH,
  height: {
    xs: ICON_WIDTH.xs / ILLUSTRATION_ASPECT,
    md: ICON_WIDTH.md / ILLUSTRATION_ASPECT,
  },
} as const;

export function IconFeature({
  iconSrc,
  label,
  qaId,
}: {
  iconSrc: StaticImageData | string;
  label: string;
  qaId?: string;
}) {
  return (
    <Box qa-id={qaId} sx={containerStyle}>
      <Box sx={iconStyle}>
        <Image
          alt=""
          src={iconSrc}
          fill
          sizes={getImageSizes(ICON_WIDTH)}
          style={{ objectFit: 'contain' }}
        />
      </Box>
      <Typography sx={{ color: 'text.primary' }}>{label}</Typography>
    </Box>
  );
}
