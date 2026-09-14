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
export const pageHeaderPaddingTopMobile = '4.5rem !important';

export const cardShadow = '0px 1px 2px 0px rgba(0,0,0,0.08), 0px 1px 3px 1px rgba(0,0,0,0.08)';

// Design token "Shadow 3" — the soft drop the desktop nav casts onto the page below it.
export const navShadow = '0px 1px 3px 0px rgba(0,0,0,0.1), 0px 4px 8px 3px rgba(0,0,0,0.1)';

// Card hover: surface lifts to white (via the CardActionArea) and the shadow deepens.
export const cardShadowHover = '0px 6px 10px 4px rgba(0,0,0,0.05), 0px 2px 3px 0px rgba(0,0,0,0.2)';

export const interactiveCardStyle = {
  boxShadow: cardShadow,
  transition: 'box-shadow 150ms ease',
  '&:hover': { boxShadow: cardShadowHover },
} as const;

// The small eyebrow label above a title — "Current session" on the session and resource heroes,
// "Current course" on the session playlist. Design token "Label/Large": Montserrat 500, 14/20,
// grey.700 (#616161), no tracking.
export const eyebrowLabelStyle = {
  fontFamily: 'headingFontFamily',
  fontWeight: 500,
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
  letterSpacing: 0,
  color: 'grey.700',
} as const;

// The centred content rail the TopBar and standard pages align to; `wide` sections use the wider
// one. `contentRailGutter` is the `lg` Container inline padding that locks content to that width.
export const CONTENT_MAX_WIDTH = 1000;
export const CONTENT_MAX_WIDTH_WIDE = 1200;
export const contentRailGutter = (width: number = CONTENT_MAX_WIDTH) =>
  `calc((100vw - ${width}px) / 2)`;

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
        insetInlineStart: contentRailGutter(),
        insetInlineEnd: contentRailGutter(),
      },
    },
  }) as const;

// Keyboard-focus ring for items sitting on the magenta AppBar / nav drawer, where the global
// primary.dark outline would be invisible.
export const onDarkNavItemFocusStyle = {
  '&.Mui-focusVisible, &:focus-visible': {
    outline: '2px solid #fff',
    outlineOffset: '2px',
  },
} as const;

// Shared geometry for the nav bar's small pill buttons (language, log in).
export const navBarControlStyle = {
  minWidth: 'auto',
  height: 34,
  paddingBlock: 0,
  paddingInline: 1.5,
  borderRadius: '1000px',
  lineHeight: '1.25rem',
  '& .MuiSvgIcon-root': { fontSize: '1.25rem' },
  ...onDarkNavItemFocusStyle,
} as const;

// Cancels the global MuiMenu top offset; the gap comes from navDropdownPaperStyle's marginTop.
export const navDropdownRootStyle = {
  '&.MuiMenu-root': { top: 0 },
} as const;

export const navDropdownOrigin = {
  anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
  transformOrigin: { vertical: 'top', horizontal: 'right' },
} as const;

// Dropdown surface for the nav bar's language / account menus.
export const navDropdownPaperStyle = {
  marginTop: 1,
  minWidth: 160,
  borderRadius: '20px',
  backgroundColor: 'common.white',
  border: '1px solid',
  borderColor: 'sectionBorder',
  boxShadow: navShadow,
  overflow: 'hidden',
  '& .MuiList-root': { padding: 0.75 },
  '& .MuiMenuItem-root': { padding: 0, borderRadius: '100px' },
  '& .MuiMenuItem-root .MuiButton-root': {
    justifyContent: 'flex-start',
    width: '100%',
    paddingBlock: 0.75,
    paddingInline: 1.75,
    borderRadius: '100px',
    fontWeight: 400,
    color: 'text.primary',
  },
  '& .MuiButtonBase-root.Mui-focusVisible, & .MuiButtonBase-root:focus-visible': {
    outline: 'none',
    boxShadow: 'none',
  },
  '& .MuiMenuItem-root:hover, & .MuiMenuItem-root.Mui-focusVisible, & .MuiMenuItem-root .MuiButton-root:hover':
    {
      backgroundColor: 'background.default',
    },
} as const;

// Text link shared by the desktop top-nav row and the mobile drawer.
export const navMenuLinkStyle = {
  alignSelf: 'flex-start',
  width: 'auto',
  minHeight: 34,
  paddingBlock: 0,
  paddingInline: 1,
  borderRadius: '1000px',
  whiteSpace: 'nowrap',
  color: 'common.white',
  ':hover': { backgroundColor: 'background.default', color: 'primary.dark' },
  ...onDarkNavItemFocusStyle,
} as const;

// The distance the top nav row travels when it auto-hides on scroll. The AppBar and any
// element pinned just below it (breadcrumb, "Leave this site") ride up by the same amount.
export const navRetractTransform = {
  xs: 'translateY(-64px)',
  sm: 'translateY(-64px)',
} as const;

// Offset by `--top-banner-height`, published by the top banner (RedesignNewsBanner /
// UserResearchBanner) when one sits between the TopBar and the page body. When the top nav row
// auto-hides on scroll (`data-nav-hidden` on <html>, set by TopBar), these buttons slide up with it.
export const breadcrumbPositionStyle = {
  position: 'fixed',
  px: 2,
  insetInlineStart: { xs: 16, lg: '8%' },
  top: {
    xs: 'calc(80px + var(--top-banner-height, 0px))',
    sm: 'calc(80px + var(--top-banner-height, 0px))',
    md: 'calc(160px + var(--top-banner-height, 0px))',
  },
  zIndex: 100,
  boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.12);',
  transition: 'transform 0.3s ease',
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  'html[data-nav-hidden="true"] &': { transform: navRetractTransform },
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
  height: { xs: '4rem', sm: '4rem', md: getIsMaintenanceMode() ? '4rem' : '8.5rem' },
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
