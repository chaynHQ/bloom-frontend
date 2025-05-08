'use client';

import { getImageSizes } from '@/lib/utils/imageSizes';
import { richtextContentStyle, rowStyle } from '@/styles/common';
import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image, { StaticImageData } from 'next/image';

export interface ImageTextItem {
  text: string;
  illustrationSrc: StaticImageData;
  illustrationAlt: string;
}

interface ImageTextRowProps {
  items: Array<ImageTextItem>;
  translations: string;
}

const containerStyle = {
  ...rowStyle,
  width: 'calc(100% + 2rem)',
  mx: '-1rem',
} as const;

const itemContainerStyle = {
  position: 'relative',
  width: { xs: '100%', sm: '50%', md: '25%' },
  paddingX: 2,
  paddingY: 1,
  alignText: 'center',
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: 100,
  height: 100,
  marginY: '1rem !important',
  marginX: 'auto',

  ...richtextContentStyle,
} as const;

const ImageTextRow = (props: ImageTextRowProps) => {
  const { items, translations } = props;

  const t = useTranslations(translations);
  const tS = useTranslations('Shared');

  return (
    <Box sx={containerStyle}>
      {items.map((item, i) => (
        <Box key={`item${i}`} sx={itemContainerStyle}>
          <Box sx={imageContainerStyle}>
            <Image
              alt={tS(item.illustrationAlt)}
              src={item.illustrationSrc}
              fill
              sizes={getImageSizes(imageContainerStyle.width)}
              style={{
                objectFit: 'contain',
              }}
            />
          </Box>
          <Typography variant="body2">{t(item.text)}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default ImageTextRow;
