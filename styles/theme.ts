import { createTheme, lighten, responsiveFontSizes } from '@mui/material/styles';

// If you want to declare custom colours that aren't officially in the palette, add them here
declare module '@mui/material/styles' {
  interface Palette {
    palePrimaryLight: string;
    bloomGradient: string;
  }
  interface PaletteOptions {
    palePrimaryLight?: string;
    paleSecondaryLight?: string;
    bloomGradient?: string;
  }
}
// Create a theme instance.
let theme = createTheme({
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
    error: {
      main: '#EA0050',
    },
    palePrimaryLight: '#F9eded',
    paleSecondaryLight: '#FFF8F4',
    bloomGradient: 'linear-gradient(#F3D6D8, #FFEAE1)',
  },
  shape: {
    borderRadius: 20,
  },
  typography: {
    fontFamily: 'Open Sans, sans-serif',
    h1: {
      fontFamily: 'Montserrat, sans-serif',
      fontSize: '2.25rem',
      fontWeight: 500,
      marginBottom: '1.75rem',
    },
    h2: {
      fontFamily: 'Montserrat, sans-serif',
      fontSize: '1.875rem',
      fontWeight: 400,
      marginBottom: '1rem',
    },
    h3: {
      fontFamily: 'Montserrat, sans-serif',
      fontSize: '1.375rem',
      marginBottom: '1rem',
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: '1.375rem',
      fontFamily: 'Montserrat, sans-serif',
      fontStyle: 'italic',
    },
    body1: {
      fontSize: '1rem',
      '@media (min-width:1200px)': {
        fontSize: '1.125rem',
      },
    },
    body2: {
      fontSize: '0.875rem',
      '@media (min-width:1200px)': {
        fontSize: '1rem',
      },
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
          paddingTop: 60,
          paddingBottom: 60,

          [theme.breakpoints.up('sm')]: {
            paddingTop: 80,
            paddingBottom: 80,
            paddingLeft: '5% !important',
            paddingRight: '5% !important',
          },
          [theme.breakpoints.up('lg')]: {
            paddingTop: 100,
            paddingBottom: 100,
            paddingLeft: 'calc((100vw - 1000px) / 2) !important',
            paddingRight: 'calc((100vw - 1000px) / 2) !important',
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
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 'bold',
          borderRadius: '100px',
          textTransform: 'unset',
          paddingLeft: 24,
          paddingRight: 24,

          '&:hover': {
            backgroundColor: lighten(theme.palette.primary.main, 0.1),
          },
          '& .MuiTouchRipple-root span': {
            backgroundColor: theme.palette.primary.dark,
            opacity: 0.1,
          },
          '@media (min-width:900px)': {
            '&.MuiButton-sizeMedium': {
              fontSize: '1rem',
            },
            '&.MuiButton-sizeLarge': {
              fontSize: '1.125rem',
            },
          },
        },
        outlinedPrimary: {
          color: '#000000',
          borderColor: theme.palette.primary.main,
        },
        containedPrimary: {
          borderColor: 'transparent',
          '&.Mui-disabled': {
            backgroundColor: lighten(theme.palette.primary.main, 0.2),
            color: theme.palette.grey[800],
          },
        },
        containedSecondary: {
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
        outlinedSecondary: {
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
        containedError: {
          backgroundColor: theme.palette.primary.dark,
          color: theme.palette.common.white,
          '&:hover': {
            backgroundColor: lighten(theme.palette.primary.dark, 0.3),
          },
          '&.Mui-disabled': {
            backgroundColor: lighten(theme.palette.primary.dark, 0.3),
            color: `${theme.palette.common.white} !important`,
          },
        },
      },
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
          backgroundColor: theme.palette.common.white,
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
          '& .MuiTouchRipple-root span': {
            backgroundColor: theme.palette.primary.main,
            opacity: 0.2,
          },
        },
        focusHighlight: {
          backgroundColor: theme.palette.primary.dark,
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
            '+ .MuiFormControlLabel-label': {
              fontSize: theme.typography.body2.fontSize,
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
            borderRadius: '50% 50% 50% 0',
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.text.primary,
            transformOrigin: 'bottom left',
            transform: 'rotate(45deg) scale(0)',
            '&:before': { display: 'none' },
            '&.MuiSlider-valueLabel': {
              top: '-22px',
              right: '-34px',
            },
            '&.MuiSlider-valueLabelOpen': {
              transform: 'rotate(45deg) scale(1)',
            },
            '& > *': {
              transform: 'rotate(-45deg)',
            },
          },
        },
      },
    },
  },
});
theme = responsiveFontSizes(theme);

export default theme;
