import {
  contentRailGutter,
  pageHeaderPaddingTop,
  pageHeaderPaddingTopMobile,
} from '@/styles/common';

// Shared by the full session page and the logged-out gate view so both keep the same two-column
// shell. Full-bleed two-column from `lg`: the playlist pins to the inline start, the session
// content aligns its inline end to the standard content rail rather than drifting to the viewport.
export const sessionContainerStyle = {
  display: 'flex',
  flexDirection: { xs: 'column', lg: 'row' },
  alignItems: 'flex-start',
  gap: { lg: 3 },
  backgroundColor: 'pageBackground',
  // Below `lg` this clears the back link (a floating button below `md`, inline at `md`); from
  // `lg` the header offset moves to `sessionMainStyle` so the playlist can sit near the top.
  paddingTop: { xs: pageHeaderPaddingTopMobile, md: pageHeaderPaddingTop, lg: '1rem !important' },
  // No bottom padding below `lg`: the sticky course bar should meet the footer with no dead gap.
  paddingBottom: { xs: '0 !important', lg: '5rem !important' },
  paddingInlineStart: { lg: '1.5rem !important' },
  paddingInlineEnd: { lg: `max(1.5rem, ${contentRailGutter()}) !important` },
} as const;

export const sessionMainStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  flex: 1,
  minWidth: 0,
  width: '100%',
  maxWidth: { lg: 620 },
  paddingTop: { lg: pageHeaderPaddingTop },
  // Pushes the column to the inline end so its right edge lands on the content rail.
  marginInlineStart: { lg: 'auto' },
} as const;
