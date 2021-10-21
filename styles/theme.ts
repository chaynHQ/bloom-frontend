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
      fontFamily: 'Montserrat Semibold, sans-serif',
      fontSize: '2.75rem',
    },
    h2: {
      fontSize: '2.25rem',
    },
    h3: {
      fontFamily: 'Open Sans Semibold, sans-serif',
      fontSize: '1.75rem',
    },
    h4: {
      fontSize: '1.5rem',
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
