import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Create a theme instance.
let theme = createTheme({
  palette: {
    primary: {
      main: '#d81b60',
      light: '#F3D6D8',
      dark: '#a00037',
    },
    secondary: {
      main: '#ffbfa4',
      light: '#FFEAE1',
      dark: '#FF976A',
    },
    background: {
      default: '#FDF3EF',
      paper: '#F3D6D8',
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
      marginBottom: '1rem',
    },
    h2: {
      fontFamily: 'Montserrat, sans-serif',
      fontSize: '1.875rem',
      fontWeight: 500,
      marginBottom: '1rem',
    },
    h3: {
      fontSize: '1.625rem',
      marginBottom: '1rem',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      marginBottom: '0.75rem',
    },
    h5: {
      fontSize: '1.25rem',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 'bolder',
    },
  },
  components: {
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
          backgroundColor: '#a00037',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: 32,
          minWidth: 64,
          padding: 0,
          color: '#ffffff',
          fontFamily: 'Montserrat Semibold, sans-serif',
          border: '1px #a00037 solid',
          borderRadius: 16,

          '&:hover': {
            borderColor: '#F3D6D8',
          },

          '& a': {
            display: 'block',
            width: '100%',
            padding: '6px 10px',
          },
        },
      },
    },
  },
});
theme = responsiveFontSizes(theme);

export default theme;
