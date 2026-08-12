import { getIsMaintenanceMode } from '@/lib/utils/maintenanceMode';

export const rowStyle = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
} as const;

export const columnStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
} as const;

export const iconTextRowStyle = {
  ...rowStyle,
  gap: 1.5,
  marginTop: 2,
  alignItems: 'center',
  justifyContent: 'flex-start',
} as const;

export const richtextContentStyle = {
  '&:only-child': {
    marginY: 0,
  },

  '&:first-of-type': {
    marginTop: 0,
  },

  '&:last-of-type': {
    marginBottom: 0,
  },
} as const;

// Every page-opening header band starts at the same depth, leaving room for the fixed
// "Leave this site" and breadcrumb buttons that float over the top of it.
export const pageHeaderPaddingTop = '3.5rem !important';
export const pageHeaderPaddingBottom = '3.5rem !important';

export const cardShadow = '0px 1px 2px 0px rgba(0,0,0,0.08), 0px 1px 3px 1px rgba(0,0,0,0.08)';

// A hairline where two sections meet. A pseudo-element rather than a border, so it spans the
// content width rather than the full viewport (see the MuiContainer overrides in styles/theme.ts).
export const sectionDivider = (edge: 'top' | 'bottom') =>
  ({
    position: 'relative',
    [`&::${edge === 'top' ? 'before' : 'after'}`]: {
      content: '""',
      position: 'absolute',
      [edge]: 0,
      insetInlineStart: '1.5rem',
      insetInlineEnd: '1.5rem',
      borderTop: '1px solid',
      borderColor: 'sectionBorder',
      '@media (min-width:600px)': { insetInlineStart: '2rem', insetInlineEnd: '2rem' },
      '@media (min-width:1200px)': {
        insetInlineStart: 'calc((100vw - 1000px) / 2)',
        insetInlineEnd: 'calc((100vw - 1000px) / 2)',
      },
    },
  }) as const;

// Offset by `--top-banner-height`, published by UserResearchBanner when a banner sits between the
// TopBar and the page body.
export const breadcrumbPositionStyle = {
  position: 'fixed',
  px: 2,
  insetInlineStart: { xs: 16, lg: '8%' },
  top: {
    xs: 'calc(64px + var(--top-banner-height, 0px))',
    sm: 'calc(80px + var(--top-banner-height, 0px))',
    md: 'calc(160px + var(--top-banner-height, 0px))',
  },
  zIndex: 100,
  boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.12);',
} as const;

export const breadcrumbButtonStyle = {
  ...breadcrumbPositionStyle,
  backgroundColor: 'white',
  ':hover': {
    backgroundColor: 'white',
  },
} as const;

export const scaleTitleStyle = {
  marginBottom: '0.5rem !important',
  fontStyle: 'italic',
  color: 'grey.800',
};

export const staticFieldLabelStyle = {
  marginBottom: 4,

  '> .MuiInputLabel-shrink': {
    position: 'relative',
    transform: 'none !important',
    whiteSpace: 'initial',

    '&.Mui-focused': {
      transform: 'none !important',
    },
  },

  '> .MuiInput-root': {
    marginTop: 1,
  },
};

// Matches the rendered AppBar height: the logo row, plus the DesktopMainNav tab strip from `md`.
export const topBarSpacerStyle = {
  height: { xs: '3.25rem', sm: '4rem', md: getIsMaintenanceMode() ? '4rem' : '8.5rem' },
} as const;

export const mobileBottomNavSpacerStyle = {
  height: { xs: 9, md: 0 }, // Approximately 72px in MUI spacing units
} as const;

export const fullScreenContainerStyle = {
  ...columnStyle,
  minHeight: {
    xs: `calc(100vh - ${topBarSpacerStyle.height.xs})`,
    md: `calc(100vh - ${topBarSpacerStyle.height.md})`,
  },
  backgroundColor: 'background.default',
} as const;
