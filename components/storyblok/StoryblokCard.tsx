import { Card, CardContent } from '@mui/material';
import { Box } from '@mui/system';
import Image from 'next/image';
import { Richtext } from 'storyblok-js-client';
import { render } from 'storyblok-rich-text-react-renderer';
import { RichTextOptions } from '../../utils/richText';

interface StoryblokCardProps {
  image: { filename: string; alt: string };
  content: Richtext;
  alignment: string;
}

const StoryblokCard = (props: StoryblokCardProps) => {
  const { image, content, alignment = 'left' } = props;

  if (!image || !image.filename) return <></>;

  const cardStyle = {
    '&:first-child': {
      marginTop: 0,
    },
  } as const;

  const cardContentStyle = {
    display: 'flex',
    flexDirection:
      alignment === 'right' ? 'row-reverse' : alignment === 'center' ? 'column' : 'row',
    alignItems:
      alignment === 'right' ? 'flex-end' : alignment === 'center' ? 'center' : 'flex-start',
    textAlign: alignment === 'right' ? 'right' : alignment === 'center' ? 'center' : 'left',
    gap: 3,
  } as const;

  const imageContainerStyle = {
    position: 'relative',
    width: { xs: 80, md: 100 },
    height: { xs: 80, md: 100 },
  } as const;

  return (
    <Card sx={cardStyle}>
      <CardContent sx={cardContentStyle}>
        {image && image.filename && (
          <Box sx={imageContainerStyle}>
            <Image src={image.filename} alt={image.alt} layout="fill" className="image"></Image>
          </Box>
        )}
        <Box maxWidth={700}>{render(content, RichTextOptions)}</Box>
      </CardContent>
    </Card>
  );
};

export default StoryblokCard;
