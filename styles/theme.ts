import { createTheme, responsiveFontSizes } from '@mui/material/styles';

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
      fontWeight: 500,
      marginBottom: '1rem',
    },
    h3: {
      fontSize: '1.5rem',
      marginBottom: '1rem',
    },
    h4: {
      fontSize: '1rem',
      fontWeight: 600,
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
          paddingTop: 40,
          paddingBottom: 40,

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
          color: '#000000',
          textDecorationColor: theme.palette.primary.dark,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 'bolder',
          borderRadius: '100px',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'transparent',
          textTransform: 'unset',

          '&:hover': {
            backgroundColor: theme.palette.primary.light,
            borderColor: theme.palette.primary.dark,
          },
          '& .MuiTouchRipple-root span': {
            backgroundColor: theme.palette.primary.dark,
            opacity: 0.1,
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
            backgroundColor: theme.palette.secondary.light,
            borderColor: theme.palette.secondary.dark,
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
  },
});
theme = responsiveFontSizes(theme);

export default theme;
