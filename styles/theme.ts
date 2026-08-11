'use client';

import type { Direction } from '@/lib/utils/getLocaleDirection';
import {
  alpha,
  createTheme,
  darken,
  lighten,
  responsiveFontSizes,
  type Theme,
} from '@mui/material/styles';

// If you want to declare custom colours that aren't officially in the palette, add them here
declare module '@mui/material/styles' {
  interface Palette {
    palePrimaryLight: string;
    bloomGradient: string;
    bloomGradientVertical: string;
    bloomGradientSoft: string;
    bloomGradientSoftUp: string;
    cardSurface: string;
    cardBorder: string;
    sectionSurface: string;
    panelSurface: string;
    pageBackground: string;
    inputBorder: string;
    sectionBorder: string;
    chipBackground: string;
    chipBackgroundHover: string;
    badgeBlue: string;
    badgeBlueBorder: string;
    supportArrowPanel: string;
  }
  interface PaletteOptions {
    palePrimaryLight?: string;
    paleSecondaryLight?: string;
    bloomGradient?: string;
    bloomGradientVertical?: string;
    bloomGradientSoft?: string;
    bloomGradientSoftUp?: string;
    overlayBackground?: string;
    cardSurface?: string;
    cardBorder?: string;
    sectionSurface?: string;
    panelSurface?: string;
    pageBackground?: string;
    inputBorder?: string;
    sectionBorder?: string;
    chipBackground?: string;
    chipBackgroundHover?: string;
    badgeBlue?: string;
    badgeBlueBorder?: string;
    supportArrowPanel?: string;
  }

  // The heading font with its RTL fallback, for use as `sx={{ fontFamily: 'headingFontFamily' }}`
  // on non-heading elements.
  interface TypographyVariants {
    headingFontFamily: string;
  }
  interface TypographyVariantsOptions {
    headingFontFamily?: string;
  }
}

// Arabic (RTL) needs a font with Arabic glyph coverage; Open Sans / Montserrat are Latin-only.
// For RTL locales we fall back to the Arabic font first, keeping the Latin fonts as fallback
// for any mixed Latin content (URLs, partner names, etc.).
const bodyFontFamily = (direction: Direction) =>
  direction === 'rtl' ? 'var(--font-arabic), var(--font-open-sans)' : 'var(--font-open-sans)';
const headingFontFamily = (direction: Direction) =>
  direction === 'rtl' ? 'var(--font-arabic), var(--font-montserrat)' : 'var(--font-montserrat)';

// Headings and card titles are pure black in the design; body copy sits at grey.800.
const headingColor = '#000000';
const bodyColor = '#424242';

/**
 * Builds the MUI theme for a given text direction. MUI v9 + Emotion emit CSS logical
 * properties internally, so passing `direction` here (combined with `dir` on <html>) is
 * what makes the built-in components mirror for RTL. Our own styles use logical
 * properties to achieve the same.
 */
export const createAppTheme = (direction: Direction = 'ltr'): Theme => {
  const isRtl = direction === 'rtl';

  // Create a theme instance.
  let theme = createTheme({
    direction,
    palette: {
      primary: {
        main: '#F3D6D8',
        light: '#F7E2E4',
        dark: '#EA0050',
      },
      secondary: {
        main: '#FFBFA4',
        light: '#FFEAE1',
        dark: '#FF976A',
      },
      background: {
        default: '#FEF6F2',
      },
      text: {
        primary: bodyColor,
      },
      error: {
        main: '#EA0050',
      },
      palePrimaryLight: '#F9eded',
      paleSecondaryLight: '#FFF8F4',
      overlayBackground: 'rgba(0, 0, 0, 0.4)',
      bloomGradient: 'linear-gradient(#F3D6D8, #FFEAE1)',
      bloomGradientVertical: 'linear-gradient(to left, #FFBFA4 0%, #FFEAE1 100%)',
      // Used behind the page header and the library's "Get support" section.
      bloomGradientSoft: 'linear-gradient(180deg, #FCE7E1 0%, #FEE9E1 100%)',
      // The same soft gradient running upwards, behind the sign-up section.
      bloomGradientSoftUp: 'linear-gradient(0deg, #F9E2E3 0%, #FFEAE1 100%)',
      cardSurface: '#FFFCFA',
      cardBorder: '#EBE0E1',
      // The pale section behind the home page's session and course rows, and the main nav.
      sectionSurface: '#FAF1F2',
      panelSurface: '#FCF8F8',
      pageBackground: '#FFF2EB',
      inputBorder: '#DECECF',
      // Hairline between adjacent page sections.
      sectionBorder: '#DECECF',
      chipBackground: '#FFD8C7',
      chipBackgroundHover: '#FFC9B2',
      badgeBlue: '#DFF0F5',
      badgeBlueBorder: '#CCE7F0',
      supportArrowPanel: '#F9E2E3',
    },
    shape: {
      borderRadius: 20,
    },
    // Material 3 scale from the "Bloom Library 2026" Figma: Montserrat for headings and labels,
    // Open Sans for body. Comments below name the style each variant maps to.
    typography: {
      fontFamily: bodyFontFamily(direction),
      headingFontFamily: headingFontFamily(direction),
      // Headline/Large, at 400 by product decision.
      h1: {
        fontFamily: headingFontFamily(direction),
        fontSize: '2rem',
        fontWeight: 400,
        marginBottom: '1.25rem',
        lineHeight: 40 / 32,
        color: headingColor,
      },
      // Headline/Small stepping up to Headline/Medium from `md`.
      h2: {
        fontFamily: headingFontFamily(direction),
        fontSize: '1.5rem',
        fontWeight: 400,
        marginBottom: '1.25rem',
        lineHeight: 32 / 24,
        color: headingColor,
        '@media (min-width:900px)': {
          fontSize: '1.75rem',
          lineHeight: 36 / 28,
        },
      },
      // Title/Large.
      h3: {
        fontFamily: headingFontFamily(direction),
        fontSize: '1.375rem',
        marginBottom: '1rem',
        fontWeight: 500,
        lineHeight: 28 / 22,
        color: headingColor,
      },
      // Title/Medium — the shared card-title style.
      h4: {
        fontFamily: headingFontFamily(direction),
        fontSize: '1.125rem',
        fontWeight: 500,
        lineHeight: 24 / 18,
        letterSpacing: '0.15px',
        color: headingColor,
      },
      subtitle1: {
        fontSize: '1.375rem',
        fontFamily: headingFontFamily(direction),
        fontStyle: 'italic',
      },
      // Body/Large.
      body1: {
        fontSize: '1rem',
        lineHeight: 24 / 16,
      },
      // Body/Medium.
      body2: {
        fontSize: '0.875rem',
        lineHeight: 20 / 14,
      },
    },
  });

  theme = createTheme(theme, {
    palette: {
      background: {
        paper: theme.palette.primary.light,
      },
      info: {
        main: theme.palette.primary.main,
      },
    },
    components: {
      MuiContainer: {
        styleOverrides: {
          root: {
            maxWidth: '100% !important',
            paddingTop: 78,
            paddingBottom: 60,
            paddingInlineStart: '1.5rem !important',
            paddingInlineEnd: '1.5rem !important',

            [theme.breakpoints.up('sm')]: {
              paddingTop: 80,
              paddingBottom: 80,
              paddingInlineStart: '2rem !important',
              paddingInlineEnd: '2rem !important',
            },
            [theme.breakpoints.up('md')]: {
              paddingTop: 100,
              paddingBottom: 100,
              paddingInlineStart: '2rem !important',
              paddingInlineEnd: '2rem !important',
              ':first-of-type': {
                paddingTop: 120,
                paddingBottom: 120,
              },
            },
            [theme.breakpoints.up('lg')]: {
              paddingTop: 120,
              paddingBottom: 120,
              paddingInlineStart: 'calc((100vw - 1000px) / 2) !important',
              paddingInlineEnd: 'calc((100vw - 1000px) / 2) !important',
            },
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: 'inherit',
            textDecorationColor: 'inherit',

            '&:hover': {
              textDecorationColor: theme.palette.primary.dark,
            },

            '&.MuiLink-button.MuiTypography-body1': {
              paddingBottom: '3px',
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          root: {
            h2: {
              backgroundColor: theme.palette.background.paper,
            },
            '.MuiDialogActions-root': {
              backgroundColor: theme.palette.background.paper,
            },
            '.MuiDialogContent-root': {
              backgroundColor: theme.palette.background.paper,
            },
            button: {
              color: '#000000',
              '&:hover': {
                backgroundColor: lighten(theme.palette.secondary.main, 0.1),
              },
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            // Label/Large at the default size, Title/Medium at `large`.
            fontFamily: headingFontFamily(direction),
            fontWeight: 500,
            borderRadius: '100px',
            textTransform: 'unset',
            paddingInline: 24,
            maxWidth: '25rem',

            '&:hover': {
              backgroundColor: lighten(theme.palette.primary.main, 0.1),
            },
            '& .MuiTouchRipple-root span': {
              backgroundColor: theme.palette.primary.dark,
              opacity: 0.1,
            },
            '@media (min-width:900px)': {
              '&.MuiButton-sizeLarge': {
                fontSize: '1.125rem',
                letterSpacing: '0.15px',
              },
            },
          },
          // MUI hard-codes physical margins on the button icons (startIcon: marginRight/Left,
          // endIcon: the mirror). Those don't flip for RTL because this app relies on CSS
          // logical properties + `dir` rather than stylis-plugin-rtl, so in Arabic the icon
          // and label overlap. Re-express the same offsets with logical margins (identical in
          // LTR, correctly mirrored in RTL). See getLocaleDirection for the RTL locale list.
          // Comfortable touch targets; `small` keeps its compact size for inline actions.
          sizeMedium: { minHeight: 44 },
          sizeLarge: { minHeight: 48 },
          startIcon: ({ ownerState }: { ownerState: { size?: string } }) => ({
            marginLeft: 0,
            marginRight: 0,
            marginInlineEnd: 8,
            marginInlineStart: ownerState.size === 'small' ? -2 : -4,
          }),
          endIcon: ({ ownerState }: { ownerState: { size?: string } }) => ({
            marginLeft: 0,
            marginRight: 0,
            marginInlineEnd: ownerState.size === 'small' ? -2 : -4,
            marginInlineStart: 8,
          }),
        },
        variants: [
          // The companion to the primary CTA, so it hovers on the same beat: a tint that fills the
          // pill and a border that stays put.
          {
            props: { variant: 'outlined', color: 'primary' },
            style: {
              color: theme.palette.primary.dark,
              borderColor: theme.palette.primary.dark,
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
                borderColor: theme.palette.primary.dark,
              },
            },
          },
          {
            props: { variant: 'contained', color: 'primary' },
            style: {
              borderColor: 'transparent',
              '&.Mui-disabled': {
                backgroundColor: lighten(theme.palette.primary.main, 0.2),
                color: theme.palette.grey[800],
              },
            },
          },
          {
            props: { variant: 'contained', color: 'secondary' },
            style: {
              borderColor: 'transparent',
              backgroundColor: theme.palette.secondary.dark,
              '&:hover': {
                backgroundColor: lighten(theme.palette.secondary.dark, 0.2),
              },
              '& .MuiTouchRipple-root span': {
                backgroundColor: theme.palette.secondary.dark,
                opacity: 0.1,
              },
              '&.Mui-disabled': {
                backgroundColor: lighten(theme.palette.secondary.main, 0.2),
                color: theme.palette.grey[800],
              },
            },
          },
          {
            props: { variant: 'outlined', color: 'secondary' },
            style: {
              color: '#000000',
              borderColor: theme.palette.secondary.dark,
              '& .MuiTouchRipple-root span': {
                backgroundColor: theme.palette.secondary.dark,
                opacity: 0.1,
              },
              '&:hover': {
                backgroundColor: theme.palette.secondary.light,
                borderColor: theme.palette.secondary.dark,
              },
            },
          },
          // Bloom's primary call-to-action, and the only definition of it. Static buttons opt in
          // with `variant="contained" color="error"`; CMS buttons map their `primary.dark` choice
          // onto the same pair via getButtonStyleProps. Hover deepens the pink rather than
          // lightening it, which would drop the white label below its contrast floor.
          {
            props: { variant: 'contained', color: 'error' },
            style: {
              borderColor: 'transparent',
              backgroundColor: theme.palette.primary.dark,
              color: theme.palette.common.white,
              transition: theme.transitions.create(
                ['background-color', 'box-shadow', 'transform'],
                { duration: theme.transitions.duration.short },
              ),
              '&:hover': {
                backgroundColor: darken(theme.palette.primary.dark, 0.2),
                boxShadow: `0 4px 12px 0 ${alpha(theme.palette.primary.dark, 0.3)}`,
                transform: 'translateY(-1px)',
              },
              '&:active': {
                backgroundColor: darken(theme.palette.primary.dark, 0.32),
                boxShadow: `0 1px 3px 0 ${alpha(theme.palette.primary.dark, 0.3)}`,
                transform: 'translateY(0)',
              },
              // The fill is the focus colour, so the ring sits just outside it against the page.
              '&.Mui-focusVisible': {
                outline: `2px solid ${theme.palette.primary.dark}`,
                outlineOffset: 2,
              },
              // The themed primary.dark ripple is invisible on a primary.dark fill.
              '& .MuiTouchRipple-root span': {
                backgroundColor: theme.palette.common.white,
                opacity: 0.2,
              },
              '&.Mui-disabled': {
                backgroundColor: lighten(theme.palette.primary.dark, 0.3),
                color: `${theme.palette.common.white} !important`,
                boxShadow: 'none',
                transform: 'none',
              },
            },
          },
        ],
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: theme.palette.primary.main,
            },
            '& .MuiTouchRipple-root span': {
              backgroundColor: theme.palette.primary.main,
              opacity: 0.2,
            },
          },
          focusHighlight: {
            backgroundColor: lighten(theme.palette.primary.main, 0.2),
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          root: {
            top: 4,

            [theme.breakpoints.up('sm')]: {
              top: 12,
            },
          },
          paper: {
            borderRadius: 14,
          },
          list: {
            padding: 6,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            minHeight: 32,
            minWidth: 60,
            padding: 0,
            borderRadius: 16,

            '&:hover': {
              borderColor: theme.palette.primary.main,
            },

            '& button, & a': {
              display: 'flex',
              justifyContent: 'flex-start',
              width: '100%',
              paddingX: 6,
              paddingY: 12,
              color: theme.palette.text.primary,
              fontWeight: 400,

              ':hover': { backgroundColor: theme.palette.background.default },

              '& .MuiTouchRipple-root span': {
                backgroundColor: theme.palette.primary.main,
                opacity: 0.2,
              },
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            paddingY: 4,
            '&:hover': {
              backgroundColor: theme.palette.background.default,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: theme.palette.background.default,
            boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.12);',
            marginTop: 20,

            [theme.breakpoints.up('md')]: {
              marginTop: 0,
            },
          },
        },
      },

      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: 24,
            paddingTop: 30,

            [theme.breakpoints.up('md')]: {
              padding: 40,

              ':last-child': {
                paddingBottom: 32,
              },
            },
          },
        },
      },
      MuiCardActionArea: {
        styleOverrides: {
          root: {
            backgroundColor: theme.palette.background.default,
            '&:hover': { backgroundColor: theme.palette.common.white },
            '.Mui-disabled &:hover': { backgroundColor: theme.palette.common.white },
            '& .MuiTouchRipple-root span': {
              display: 'none',
            },
          },
          focusHighlight: {
            backgroundColor: theme.palette.secondary.main,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            marginBottom: 18,
          },
        },
      },
      MuiFormControl: {
        styleOverrides: {
          root: {
            marginBottom: 18,
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            fontSize: 16,
            marginTop: '0.5rem !important',
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          paper: {
            backgroundColor: theme.palette.background.default,
          },
          option: {
            '&.Mui-focused': {
              backgroundColor: `${theme.palette.secondary.light} !important`,
            },
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            color: theme.palette.secondary.dark,

            '&.Mui-checked': {
              color: theme.palette.secondary.dark,
            },
          },
        },
      },
      MuiInput: {
        styleOverrides: {
          underline: {
            ':after': {
              borderColor: theme.palette.secondary.dark,
            },
            '&:hover:not(.Mui-disabled)::before': {
              borderColor: theme.palette.secondary.main,
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: theme.palette.grey[800],

            '&.Mui-focused': {
              color: theme.palette.text.primary,
              transform: 'translate(0, -1.5px) scale(0.875) !important',
            },
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: {
            top: -4,
            color: theme.palette.grey[800],

            '&.Mui-focused': {
              color: theme.palette.common.black,
            },
          },
          filled: {
            transform: 'translate(0, -1.5px) scale(0.875) !important',
          },
        },
      },
      MuiFormControlLabel: {
        styleOverrides: {
          root: {
            '& .MuiCheckbox-root': {
              color: theme.palette.text.primary,
              paddingTop: 0,
              paddingBottom: 0,
              marginBottom: 'auto',

              '&.Mui-checked': {
                color: theme.palette.primary.dark,
              },
            },
          },
        },
      },
      MuiSlider: {
        styleOverrides: {
          root: {
            '& .MuiSlider-valueLabel': {
              lineHeight: 1.2,
              fontSize: 12,
              background: 'unset',
              padding: 0,
              width: 32,
              height: 32,
              // Teardrop bubble — the pointed corner faces the thumb; mirror it for RTL.
              borderRadius: isRtl ? '50% 50% 0 50%' : '50% 50% 50% 0',
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.text.primary,
              transformOrigin: isRtl ? 'bottom right' : 'bottom left',
              transform: isRtl ? 'rotate(-45deg) scale(0)' : 'rotate(45deg) scale(0)',
              '&:before': { display: 'none' },
              '&.MuiSlider-valueLabel': {
                top: '-22px',
                insetInlineEnd: '-34px',
              },
              '&.MuiSlider-valueLabelOpen': {
                transform: isRtl ? 'rotate(-45deg) scale(1)' : 'rotate(45deg) scale(1)',
              },
              '& > *': {
                transform: isRtl ? 'rotate(45deg)' : 'rotate(-45deg)',
              },
            },
          },
        },
      },
    },
  });

  return responsiveFontSizes(theme);
};

export const ltrTheme = createAppTheme('ltr');
export const rtlTheme = createAppTheme('rtl');

export const getTheme = (direction: Direction): Theme =>
  direction === 'rtl' ? rtlTheme : ltrTheme;

export default ltrTheme;
