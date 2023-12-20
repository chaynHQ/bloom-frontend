import { Box } from '@mui/system';
import { ISbRichtext, storyblokEditable } from '@storyblok/react';
import Image from 'next/image';
import Quote from '../common/Quote';

const imageContainerStyle = {
  marginX: 'auto',
  marginY: 4,
  width: { xs: 200, md: 250 },
  '.image': {
    objectFit: 'contain',
    width: '100% !important',
    position: 'relative !important',
    height: 'unset !important',
  },
};

export interface StoryblokQuoteProps {
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
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 7,
      }}
    >
      {image && (
        <Box sx={imageContainerStyle}>
          <Image src={image.filename} alt={image.alt} layout="fill" className="image" />
        </Box>
      )}
      <Quote text={text} textSize={text_size} iconColor={icon_color} />
    </Box>
  );
};

export default StoryblokQuote;
