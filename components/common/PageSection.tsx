'use client';

import { STORYBLOK_COLORS } from '@/lib/constants/enums';
import { columnStyle } from '@/styles/common';
import theme from '@/styles/theme';
import { Container } from '@mui/material';

interface PageSectionProps {
  children: any;
  color: STORYBLOK_COLORS;
  alignment: string;
  width?: 'default' | 'wide' | 'full';
}

const PageSection = (props: PageSectionProps) => {
  const { children, color, alignment, width = 'default' } = props;

  const containerStyle = {
    ...columnStyle,
    ...(width === 'wide' && {
      paddingLeft: { lg: 'calc((100vw - 1200px) / 2) !important' },
      paddingRight: { lg: 'calc((100vw - 1200px) / 2) !important' },
    }),
    ...(width === 'full' && {
      paddingLeft: { xs: 0, ms: 0, md: 0, lg: 0 },
      paddingRight: { xs: 0, ms: 0, md: 0, lg: 0 },
      paddingTop: { xs: 0, ms: 0, md: 0, lg: 0 },
      paddingBottom: { xs: 0, ms: 0, md: 0, lg: 0 },
    }),
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
