import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image, { StaticImageData } from 'next/image';
import { richtextContentStyle, rowStyle } from '../../styles/common';

export interface ImageTextItem {
  text: string;
  illustrationSrc: StaticImageData;
  illustrationAlt: string;
}

interface ImageTextGridProps {
  items: Array<ImageTextItem>;
  translations: string;
}

const containerStyle = {
  ...rowStyle,
  width: { xs: '100%', md: '60%' },
} as const;

const itemContainerStyle = {
  position: 'relative',
  width: { xs: '100%', sm: '50%' },
  paddingX: 2,
  paddingY: 1,
  alignText: 'center',
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: 100,
  height: 100,
  marginY: 3,
  marginX: 'auto',

  ...richtextContentStyle,
} as const;

const ImageTextGrid = (props: ImageTextGridProps) => {
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
              sizes="100vw"
              style={{
                objectFit: 'contain',
              }}
            />
          </Box>
          <Typography>{t(item.text)}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default ImageTextGrid;
