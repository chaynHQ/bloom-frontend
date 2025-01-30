'use client';

import Quote from '@/components/common/Quote';
import { getImageSizes } from '@/lib/utils/imageSizes';
import { Box } from '@mui/material';
import { ISbRichtext, storyblokEditable } from '@storyblok/react/rsc';
import Image from 'next/image';

const containerStyle = {
  display: 'flex',
  marginX: { xs: 2, lg: 3 },
  flexDirection: { xs: 'column', md: 'row' },
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: { xs: 2, md: 10 },
  paddingTop: 1,
} as const;

const imageContainerStyle = {
  marginX: 'auto',
  marginY: 4,
  minWidth: { xs: 200, md: 230, lg: 260 },
  maxWidth: { xs: 200, md: 230, lg: 260 },
  '.image': {
    objectFit: 'contain',
    width: '100% !important',
    position: 'relative !important',
    height: 'unset !important',
  },
};

interface StoryblokQuoteProps {
  _uid: string;
  _editable: string;
  text: ISbRichtext;
  text_size: string;
  icon_color: string;
  image?: { alt: string; filename: string };
}

const StoryblokQuote = (props: StoryblokQuoteProps) => {
  const { _uid, _editable, text, text_size, icon_color = 'primary.dark', image } = props;

  if (!text) return <></>;

  return (
    <Box
      {...storyblokEditable({ _uid, _editable, text, text_size, icon_color, image })}
      sx={containerStyle}
    >
      {image && (
        <Box sx={imageContainerStyle}>
          <Image
            src={image.filename}
            alt={image.alt}
            className="image"
            fill
            sizes={getImageSizes(imageContainerStyle.maxWidth)}
            style={{
              objectFit: 'contain',
            }}
          />
        </Box>
      )}
      <Quote text={text} textSize={text_size} iconColor={icon_color} />
    </Box>
  );
};

export default StoryblokQuote;
