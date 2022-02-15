import { createTheme, lighten, responsiveFontSizes } from '@mui/material/styles';

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
      default: '#FDF3EF',
    },
    error: {
      main: '#EA0050',
    },
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
      marginBottom: '1rem',
    },
    h2: {
      fontFamily: 'Montserrat, sans-serif',
      fontSize: '1.875rem',
      fontWeight: 400,
      marginBottom: '1rem',
    },
    h3: {
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
          paddingTop: 50,
          paddingBottom: 50,

          [theme.breakpoints.up('lg')]: {
            paddingTop: 80,
            paddingBottom: 80,
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
          textDecorationColor: theme.palette.text.primary,

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
        },
        containedSecondary: {
          borderColor: 'transparent',
          '&:hover': {
            backgroundColor: lighten(theme.palette.secondary.main, 0.2),
          },
          '& .MuiTouchRipple-root span': {
            backgroundColor: theme.palette.secondary.dark,
            opacity: 0.1,
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
      },
    },
    MuiMenu: {
      styleOverrides: {
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

          '& a': {
            display: 'block',
            width: '100%',
            padding: '6px 10px',
            textAlign: 'center',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
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
          padding: 20,

          [theme.breakpoints.up('md')]: {
            padding: 40,
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
          '&.Mui-focused': {
            color: theme.palette.text.primary,
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          marginBottom: 8,

          '&.Mui-focused': {
            color: theme.palette.common.black,
          },
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
  },
});
theme = responsiveFontSizes(theme);

export default theme;
