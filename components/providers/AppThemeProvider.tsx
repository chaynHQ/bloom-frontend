'use client';

import { Direction } from '@/lib/utils/getLocaleDirection';
import { getTheme } from '@/styles/theme';
import { ThemeProvider } from '@mui/material';
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
  return <ThemeProvider theme={getTheme(direction)}>{children}</ThemeProvider>;
}
