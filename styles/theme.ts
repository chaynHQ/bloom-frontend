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
      paper: '#F7E2E4',
    },
    info: {
      main: '#F3D6D8',
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
    },
    h2: {
      fontFamily: 'Montserrat, sans-serif',
      fontSize: '1.875rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.625rem',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#000000',
          textDecorationColor: '#EA0050',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 'bolder',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'transparent',

          '&:hover': {
            backgroundColor: '#F7E2E4',
            border: '1px solid #EA0050',
          },
          '& .MuiTouchRipple-root span': {
            backgroundColor: '#EA0050',
            opacity: 0.1,
          },
        },
        outlinedPrimary: {
          color: '#000000',
          borderColor: '#F3D6D8',
        },
        containedPrimary: {
          borderColor: 'transparent',
        },
        containedSecondary: {
          borderColor: 'transparent',
          '&:hover': {
            backgroundColor: '#FFEAE1',
            border: '1px solid #FF976A',
          },
          '& .MuiTouchRipple-root span': {
            backgroundColor: '#FF976A',
            opacity: 0.1,
          },
        },
        outlinedSecondary: {
          color: '#000000',
          borderColor: '#FF976A',
          '& .MuiTouchRipple-root span': {
            backgroundColor: '#FF976A',
            opacity: 0.1,
          },
          '&:hover': {
            backgroundColor: '#FFEAE1',
            border: '1px solid #FF976A',
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
            borderColor: '#F3D6D8',
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
            backgroundColor: '#FDF3EF',
          },
        },
      },
    },
  },
});
theme = responsiveFontSizes(theme);

export default theme;
