import { Box } from '@mui/system';
import { useTranslations } from 'next-intl';
import { Richtext } from 'storyblok-js-client';
import { richtextContentStyle } from '../../styles/common';

interface StoryblokQuoteProps {
  text: Richtext;
  text_size: string;
  icon_color: string;
}

const StoryblokQuote = (props: StoryblokQuoteProps) => {
  const { text, text_size, icon_color = 'primary.dark' } = props;
  const tS = useTranslations('Shared');

  if (!text) return <></>;

  const fontSize =
    text_size === 'extra-small'
      ? { xs: 0.875, md: 1 }
      : text_size === 'small'
      ? { xs: 1, md: 1.125 }
      : text_size === 'large'
      ? { xs: 1.25, md: 1.5 }
      : text_size === 'extra-large'
      ? { xs: 1.5, md: 1.75 }
      : { xs: 1.125, md: 1.25 }; // default / medium

  const containerStyle = {
    fontFamily: 'Montserrat, sans-serif',
    fontStyle: 'italic',
    marginY: { xs: 2, md: 4 },
    maxWidth: 700,
    blockquote: {
      fontSize: { xs: `${fontSize.xs}rem`, md: `${fontSize.md}rem` },
      lineHeight: `calc(${fontSize.md} * 1.75rem)`,
      marginX: 0,

      '&:before': {
        content: 'open-quote',
        left: '-0.75rem',
      },

      '&:after': {
        content: 'close-quote',
        left: '0.25rem',
      },

      '&:before, &:after': {
        display: 'inline-block',
        verticalAlign: 'bottom',
        color: icon_color,
        fontSize: `calc(${fontSize.md} * 4rem)`,
        top: '0.75rem',
        position: 'relative',
      },
    },
    cite: {
      fontStyle: 'normal',
      fontSize: `${fontSize.xs}rem)`,
    },
    ...richtextContentStyle,
  } as const;

  return (
    <Box sx={containerStyle}>
      <blockquote>{text}</blockquote>
      <cite>~ {tS('survivor')}</cite>
    </Box>
  );
};

export default StoryblokQuote;
