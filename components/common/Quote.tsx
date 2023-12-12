import { Box } from '@mui/system';
import { useTranslations } from 'next-intl';
import { Richtext } from 'storyblok-js-client';
import { richtextContentStyle } from '../../styles/common';

interface QuoteProps {
  text: Richtext | string;
  textSize: string;
  iconColor: string;
}

const Quote = (props: QuoteProps) => {
  const { text, textSize, iconColor = 'primary.dark' } = props;
  const tS = useTranslations('Shared');

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

  const containerStyle = {
    fontFamily: 'Montserrat, sans-serif',
    fontStyle: 'italic',
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
        color: iconColor,
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
      {/* @ts-ignore */}
      <blockquote>{text}</blockquote>
    </Box>
  );
};

export default Quote;
