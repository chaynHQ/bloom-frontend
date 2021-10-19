import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Create a theme instance.
let theme = createTheme({
  palette: {
    primary: {
      main: '#F3D6D8',
    },
    secondary: {
      main: '#F0244D',
    },
    background: {
      default: '#FDF3EF',
      paper: '#F3D6D8',
    },
    info: {
      main: '#F3D6D8',
    },
  },
  typography: {
    fontFamily: 'Open Sans, sans-serif',
    h1: {
      fontFamily: 'Montserrat, sans-serif',
      fontSize: '3.25rem',
    },
    h2: {
      fontSize: '2.25rem',
    },
    h3: {
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
      fontWeight: 'bold',
    },
  },
});
theme = responsiveFontSizes(theme);

export default theme;
