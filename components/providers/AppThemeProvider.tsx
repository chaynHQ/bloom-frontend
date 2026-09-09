'use client';

import { Direction } from '@/lib/utils/getLocaleDirection';
import { getTheme } from '@/styles/theme';
import { GlobalStyles, ThemeProvider } from '@mui/material';
import { ReactNode } from 'react';

interface AppThemeProviderProps {
  direction: Direction;
  children: ReactNode;
}

/**
 * Client wrapper that selects the LTR/RTL MUI theme. `getTheme` lives in a
 * 'use client' module, so it must be invoked on the client — the server layout
 * passes the (serializable) direction string and this component resolves it.
 */
export default function AppThemeProvider({ direction, children }: AppThemeProviderProps) {
  const theme = getTheme(direction);

  return (
    <ThemeProvider theme={theme}>
      {/* There is no CssBaseline, so without this inherited text — CMS rich text especially —
          falls back to browser black rather than the palette's body colour. */}
      <GlobalStyles styles={{ body: { color: theme.palette.text.primary } }} />
      {children}
    </ThemeProvider>
  );
}
