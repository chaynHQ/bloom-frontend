'use client';

import { STORYBLOK_COLORS } from '@/lib/constants/enums';
import { INLINE_ALIGNMENT, TEXT_ALIGNMENT } from '@/lib/utils/alignment';
import { columnStyle, sectionDivider } from '@/styles/common';
import theme from '@/styles/theme';
import { Container, type SxProps, type Theme } from '@mui/material';

interface PageSectionProps {
  children: any;
  color: STORYBLOK_COLORS;
  alignment: string;
  width?: 'default' | 'wide' | 'full';
  spacing?: 'default' | 'compact';
  divider?: boolean;
}

const PageSection = (props: PageSectionProps) => {
  const {
    children,
    color,
    alignment,
    width = 'default',
    spacing = 'default',
    divider = false,
  } = props;

  const containerStyle: SxProps<Theme> = {
    ...columnStyle,
    // `compact` matches the tighter rhythm of the app's own page sections.
    ...(divider && sectionDivider('top')),
    ...(spacing === 'compact' && {
      paddingTop: { xs: '2.5rem !important', md: '4rem !important' },
      paddingBottom: { xs: '2.5rem !important', md: '4rem !important' },
    }),
    ...(width === 'wide' && {
      paddingInlineStart: { lg: 'calc((100vw - 1200px) / 2) !important' },
      paddingInlineEnd: { lg: 'calc((100vw - 1200px) / 2) !important' },
    }),
    ...(width === 'full' && {
      paddingInlineStart: { xs: 0, ms: 0, md: 0, lg: 0 },
      paddingInlineEnd: { xs: 0, ms: 0, md: 0, lg: 0 },
      paddingTop: { xs: 0, ms: 0, md: 0, lg: 0 },
      paddingBottom: { xs: 0, ms: 0, md: 0, lg: 0 },
    }),
    // Gradient tokens have to go through `background`; flat ones through `backgroundColor`.
    ...(color &&
      (color.startsWith('bloomGradient')
        ? { background: theme.palette[color as 'bloomGradient'] }
        : { backgroundColor: color })),
    ...(alignment && { alignItems: INLINE_ALIGNMENT[alignment] ?? 'flex-start' }),
    textAlign: TEXT_ALIGNMENT[alignment] ?? 'start',
    ...(alignment === 'center' && {
      ' p': { marginX: 'auto' },
    }),
  };

  return <Container sx={containerStyle}>{children}</Container>;
};

export default PageSection;
