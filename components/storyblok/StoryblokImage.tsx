import { Box } from '@mui/system';
import Image from 'next/image';

interface StoryblokImageProps {
  image: { filename: string; alt: string };
  size: string;
  alignment: string;
}

const StoryblokImage = (props: StoryblokImageProps) => {
  const { image, size = 'extra-large', alignment = 'left' } = props;

  if (!image) return <></>;

  const imageContainerStyle = {
    width:
      size === 'extra-small'
        ? { xs: '15%', sm: '12.5%', md: '10%' }
        : size === 'small'
        ? { xs: '30%', md: '25%' }
        : size === 'medium'
        ? { xs: '40%', md: '50%' }
        : size === 'large'
        ? { xs: '60%', md: '75%' }
        : '100%',
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
  } as const;

  return (
    <Box sx={imageContainerStyle}>
      <Image src={image.filename} alt={image.alt} layout="fill" className="image"></Image>
    </Box>
  );
};

export default StoryblokImage;
