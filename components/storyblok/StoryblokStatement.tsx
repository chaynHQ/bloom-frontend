import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';
import { Richtext } from 'storyblok-js-client';
import { richtextContentStyle } from '../../styles/common';

interface StoryblokStatementProps {
  text: Richtext;
  text_size: string;
}

const StoryblokStatement = (props: StoryblokStatementProps) => {
  const { text, text_size } = props;

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
    Typography: {
      fontSize: { xs: `${fontSize.xs}rem`, md: `${fontSize.md}rem` },
      lineHeight: `calc(${fontSize.md} * 1.70rem)`,
      marginX: 0,
    },
    ...richtextContentStyle,
  } as const;

  return (
    <Box sx={containerStyle}>
      {/**TODO add max width? */}
      {/**TODO add paragraph? */}
      <Typography>{text}</Typography>
    </Box>
  );
};

export default StoryblokStatement;
