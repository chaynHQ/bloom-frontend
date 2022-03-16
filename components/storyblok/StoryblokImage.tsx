import { Box } from '@mui/system';
import Image from 'next/image';
import { richtextContentStyle } from '../../styles/common';

interface StoryblokImageProps {
  image: { filename: string; alt: string };
  size: string;
  alignment: string;
}

const StoryblokImage = (props: StoryblokImageProps) => {
  const { image, size = 'extra-large', alignment = 'left' } = props;

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

    '> div': {
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
    <Box sx={imageContainerStyle}>
      <Image src={image.filename} alt={image.alt} layout="fill" className="image"></Image>
    </Box>
  );
};

export default StoryblokImage;
