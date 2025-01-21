'use client';

import { Box, Typography } from '@mui/material';
import { storyblokEditable } from '@storyblok/react/rsc';
import { richtextContentStyle } from '../../styles/common';

interface StoryblokStatementProps {
  _uid: string;
  _editable: string;
  text: string;
  text_size: string;
}

const StoryblokStatement = (props: StoryblokStatementProps) => {
  const { _uid, _editable, text, text_size } = props;

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
    maxWidth: 600,
    marginY: { xs: 2, md: 4 },
    marginX: 0,
    text: {
      fontFamily: 'Montserrat, sans-serif',
      fontStyle: 'italic',

      fontSize: { xs: `${fontSize.xs}rem`, md: `${fontSize.md}rem` },
      lineHeight: `calc(${fontSize.md} * 1.70rem)`,
      letterSpacing: '0.02rem',
    },
    ...richtextContentStyle,
  } as const;

  return (
    <Box sx={containerStyle} {...storyblokEditable({ _uid, _editable, text, text_size })}>
      <Typography>{text}</Typography>
    </Box>
  );
};

export default StoryblokStatement;
