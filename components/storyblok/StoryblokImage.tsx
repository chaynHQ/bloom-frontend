'use client';

import { Box } from '@mui/material';
import { storyblokEditable } from '@storyblok/react/rsc';
import Image from 'next/image';
import { richtextContentStyle } from '../../styles/common';
import { getImageSizes } from '../../utils/imageSizes';

interface StoryblokImageProps {
  _uid: string;
  _editable: string;
  image: { filename: string; alt: string };
  size: string;
  alignment: string;
}

const StoryblokImage = (props: StoryblokImageProps) => {
  const { _uid, _editable, image, size = 'extra-large', alignment = 'left' } = props;

  if (!image || !image.filename) return <></>;

  const imageContainerStyle = {
    width:
      size === 'extra-small'
        ? { xs: 40, md: 80 }
        : size === 'small'
          ? { xs: 120, md: 160 }
          : size === 'medium'
            ? { xs: 200, md: 250 }
            : size === 'large'
              ? { xs: 400, md: 480 }
              : '100%',
    maxWidth: '100%',
    marginY:
      size === 'extra-small'
        ? 2
        : size === 'small'
          ? 3
          : size === 'medium'
            ? 4
            : size === 'large'
              ? 5
              : 6,
    marginLeft: alignment === 'center' || alignment === 'right' ? 'auto' : 0,
    marginRight: alignment === 'center' ? 'auto' : 0,

    '> span': {
      position: 'unset !important',
    },

    '.image': {
      objectFit: 'contain',
      width: '100% !important',
      position: 'relative !important',
      height: 'unset !important',
    },

    ...richtextContentStyle,
  } as const;

  return (
    <Box
      {...storyblokEditable({ _uid, _editable, image, size, alignment })}
      sx={imageContainerStyle}
    >
      <Image
        src={image.filename}
        alt={image.alt}
        className="image"
        fill
        sizes={getImageSizes(imageContainerStyle.width)}
        style={{
          objectFit: 'contain',
        }}
      />
    </Box>
  );
};

export default StoryblokImage;
