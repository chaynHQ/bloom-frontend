import { Box } from '@mui/system';
import { Richtext } from 'storyblok-js-client';
import Quote from '../common/Quote';
import StoryblokImage from './StoryblokImage';

export interface StoryblokQuoteProps {
  text: Richtext;
  text_size: string;
  icon_color: string;
  image?: { alt: string; filename: string };
}

const StoryblokQuote = (props: StoryblokQuoteProps) => {
  const { text, text_size, icon_color = 'primary.dark', image } = props;

  if (!text) return <></>;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 5,
      }}
    >
      {image && (
        <Box>
          <StoryblokImage image={image} alignment="center" size="medium" />
        </Box>
      )}
      <Quote text={text} textSize={text_size} iconColor={icon_color} />
    </Box>
  );
};

export default StoryblokQuote;
