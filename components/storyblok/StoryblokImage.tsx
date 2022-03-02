import { Box } from '@mui/system';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface StoryblokImageProps {
  image: { filename: string; alt: string };
  size: string;
  alignment: string;
}

const StoryblokImage = (props: StoryblokImageProps) => {
  const { image, size, alignment } = props;

  // default full width, left alignment
  const [width, setWidth] = useState<string>('100%');
  const [marginLeft, setMarginLeft] = useState<number | string>(0);
  const [marginRight, setMarginRight] = useState<number | string>(0);
  const [marginY, setMarginY] = useState<number | string>(4);

  useEffect(() => {
    switch (size) {
      case 'x-small':
        setWidth('15%');
        setMarginY(1);
        break;
      case 'small':
        setWidth('30%');
        setMarginY(2);
        break;
      case 'medium':
        setWidth('50%');
        setMarginY(3);
        break;
      case 'large':
        setWidth('80%');
        setMarginY(4);
        break;
    }
    switch (alignment) {
      case 'center':
        setMarginLeft('auto');
        setMarginRight('auto');
        break;
      case 'right':
        setMarginLeft('auto');
        setMarginRight('0');
        break;
    }
  }, [setWidth, size, setMarginLeft, setMarginRight, setMarginY, alignment]);

  if (!image) return <></>;

  const imageContainerStyle = {
    width: width,
    marginLeft: marginLeft,
    marginRight: marginRight,
    marginY: marginY,

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
