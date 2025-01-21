'use client';

import { Box } from '@mui/material';
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
          ? { xs: 1.25, md: 1.375 }
          : textSize === 'extra-large'
            ? { xs: 1.375, md: 1.5 }
            : { xs: 1.125, md: 1.25 }; // default / medium

  const containerStyle = {
    fontFamily: 'Montserrat, sans-serif',
    fontStyle: 'italic',
    maxWidth: 700,
    blockquote: {
      fontSize: { xs: `${fontSize.xs}rem`, md: `${fontSize.md}rem` },
      lineHeight: { xs: `calc(${fontSize.xs} * 1.625rem)`, md: `calc(${fontSize.md} * 1.625rem)` },
      marginX: 0,
      position: 'relative',
      '&:before': {
        content: 'url(/pink_quotes.svg)',
        display: 'block',
        verticalAlign: 'top',
        color: iconColor,
        fontSize: `calc(${fontSize.md} * 4rem)`,
        position: 'absolute',
        height: '28px',
        width: '28px',
        top: { xs: '-60px', md: '-40px' },
        left: { xs: 0, md: '-44px' },
      },
      '&:after': {
        content: 'none',
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
