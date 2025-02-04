'use client';

import { getImageSizes } from '@/lib/utils/imageSizes';
import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image, { StaticImageData } from 'next/image';

interface ImageTextGridProps {
  items: {
    text: string;
    illustrationSrc: StaticImageData;
    illustrationAlt: string;
  }[];
  translations: string;
}

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'left',
} as const;

const itemContainerStyle = {
  display: 'flex',
  flexDirection: 'row',
  paddingX: 2,
  paddingY: 1,
  alignItems: 'center',
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: 100,
  height: 100,
  paddingX: 5,
  marginX: 1,
} as const;

const textStyle = {
  marginTop: 'auto',
  marginBottom: 'auto',
} as const;

const ImageTextColumn = (props: ImageTextGridProps) => {
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
          <Typography sx={textStyle}>{t(item.text)}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default ImageTextColumn;
