import { Card, CardContent } from '@mui/material';
import { Box } from '@mui/system';
import { ISbRichtext } from '@storyblok/react';
import Image from 'next/legacy/image';
import { render } from 'storyblok-rich-text-react-renderer';
import { RichTextOptions } from '../../utils/richText';

interface StoryblokCardProps {
  image: { filename: string; alt: string };
  content: ISbRichtext;
  alignment: string;
  background: string;
  style: string;
}

const StoryblokCard = (props: StoryblokCardProps) => {
  const {
    image,
    content,
    alignment = 'left',
    background = 'common.white',
    style = 'default',
  } = props;

  if (!image || !image.filename) return <></>;

  const cardStyle = {
    '&:first-of-type': {
      marginTop: 0,
    },
  } as const;

  const slimPadding = {
    padding: { xs: 2, sm: 1, md: 2, lg: 2 },
    '&:last-child': { paddingBottom: { xs: 2, sm: 2, md: 2, lg: 2 } },
    gap: { xs: 3, sm: 1, md: 1 },
    '& h3:only-child': {
      marginBottom: 0,
    },
  };

  const cardContentStyle = {
    display: 'flex',
    flexDirection:
      alignment === 'right' ? 'row-reverse' : alignment === 'center' ? 'column' : 'row',
    alignItems: alignment === 'right' ? 'flex-end' : alignment === 'center' ? 'center' : 'center',
    textAlign: alignment === 'right' ? 'right' : alignment === 'center' ? 'center' : 'left',
    gap: 3,
    backgroundColor: background,
    ...(style == 'slim' ? slimPadding : {}),
  } as const;
  const slimImageStyle = {
    width: { xs: 80, sm: 80, md: 80 },
    height: { xs: 80, sm: 80, md: 80 },
    minWidth: { xs: 80, sm: 80, md: 80 },
    minHeight: { xs: 80, sm: 80, md: 80 },
  };
  const imageContainerStyle = {
    position: 'relative',
    width: { xs: 80, md: 100 },
    height: { xs: 80, md: 100 },
    ...(style == 'slim' ? slimImageStyle : {}),
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
