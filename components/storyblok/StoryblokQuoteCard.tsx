'use client';

import { QuoteCard, type QuoteTextSize } from '@/components/common/QuoteCard';
import { STORYBLOK_COLORS } from '@/lib/constants/enums';
import { RichTextOptions } from '@/lib/utils/richText';
import { Box } from '@mui/material';
import { storyblokEditable } from '@storyblok/react/rsc';
import { render, StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

export interface StoryblokQuoteCardProps {
  _uid: string;
  _editable: string;
  text: StoryblokRichtext;
  attribution: string;
  text_size: QuoteTextSize;
  background: STORYBLOK_COLORS;
}

const StoryblokQuoteCard = (props: StoryblokQuoteCardProps) => {
  const {
    _uid,
    _editable,
    text,
    attribution,
    text_size = 'small',
    background = STORYBLOK_COLORS.PRIMARY_LIGHT,
  } = props;

  if (!text) return <></>;

  return (
    <Box
      {...storyblokEditable({ _uid, _editable, text, attribution, text_size, background })}
      sx={{ mb: 2, '&:last-of-type': { mb: 0 } }}
    >
      <QuoteCard
        text={render(text, RichTextOptions)}
        attribution={attribution}
        textSize={text_size}
        background={background}
        qaId="storyblok-quote-card"
      />
    </Box>
  );
};

export default StoryblokQuoteCard;
