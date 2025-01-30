'use client';

import { STORYBLOK_COLORS } from '@/lib/constants/enums';
import { columnStyle } from '@/styles/common';
import theme from '@/styles/theme';
import { Container } from '@mui/material';

interface PageSectionProps {
  children: any;
  color: STORYBLOK_COLORS;
  alignment: string;
}

const PageSection = (props: PageSectionProps) => {
  const { children, color, alignment } = props;
  const containerStyle = {
    ...columnStyle,
    ...(color && {
      backgroundColor: color,
      ...(color === STORYBLOK_COLORS.BLOOM_GRADIENT
        ? { background: theme.palette.bloomGradient }
        : {}),
    }),
    ...(alignment && {
      alignItems:
        alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
    }),
    textAlign: alignment === 'center' ? 'center' : alignment === 'right' ? 'right' : 'left',
    ...(alignment === 'center' && {
      ' p': { marginX: 'auto' },
    }),
  } as const;

  return <Container sx={containerStyle}>{children}</Container>;
};

export default PageSection;
