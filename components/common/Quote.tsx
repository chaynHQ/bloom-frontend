import { Box } from '@mui/system';
import { ISbRichtext } from '@storyblok/react';
import { richtextContentStyle } from '../../styles/common';

interface QuoteProps {
  text: ISbRichtext | string;
  textSize: string;
  iconColor: string;
}

const Quote = (props: QuoteProps) => {
  const { text, textSize, iconColor = 'primary.dark' } = props;

  if (!text) return <></>;

  const fontSize =
    textSize === 'extra-small'
      ? { xs: 0.875, md: 1 }
      : textSize === 'small'
        ? { xs: 1, md: 1.125 }
        : textSize === 'large'
          ? { xs: 1.25, md: 1.5 }
          : textSize === 'extra-large'
            ? { xs: 1.5, md: 1.75 }
            : { xs: 1.125, md: 1.25 }; // default / medium
  const quotePosition =
    textSize === 'extra-small'
      ? { top: '-50px', left: '0' }
      : textSize === 'small'
        ? { top: '-40px', left: '0' }
        : { top: '-50px', left: '0' }; // medium/ large/ extra large
  const quoteSize =
    textSize === 'extra-small' || textSize === 'small'
      ? { height: '20px', width: '20px' }
      : { height: '20px', width: '30px' }; // medium/ large/ extra large

  const containerStyle = {
    fontFamily: 'Montserrat, sans-serif',
    fontStyle: 'italic',
    maxWidth: 700,
    blockquote: {
      fontSize: { xs: `${fontSize.xs}rem`, md: `${fontSize.md}rem` },
      lineHeight: `calc(${fontSize.md} * 1.75rem)`,
      marginX: 0,
      position: 'relative',
      '&:before': {
        content: 'url(/pink_quotes.svg)',
        display: 'block',
        verticalAlign: 'top',
        color: iconColor,
        fontSize: `calc(${fontSize.md} * 4rem)`,
        position: 'absolute',
        ...quoteSize,
        ...quotePosition,
      },
      '&:after': {
        content: 'no-close-quote',
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
      {/* @ts-ignore */}
      <blockquote>{text}</blockquote>
    </Box>
  );
};

export default Quote;
