import { pageHeaderPaddingTop } from '@/styles/common';

// The resource pages share the session pages' flat page background and full content rail. The
// header, "moment" section and related content span the rail; only the media card and the
// action panel below it are capped and centred.
export const resourceContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  backgroundColor: 'pageBackground',
  paddingTop: { xs: '0.75rem !important', md: pageHeaderPaddingTop },
  paddingBottom: { xs: '3rem !important', md: '5rem !important' },
} as const;

// The capped, centred column that holds the media card and the blocks that sit directly under it.
export const resourceCardColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  width: '100%',
  maxWidth: 680,
  marginInline: 'auto',
} as const;
