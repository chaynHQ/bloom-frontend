import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

// A titled group of filter rows. Disabled greys the heading while its rows are inert.
export function FilterGroup({
  title,
  disabled,
  children,
}: {
  title: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Box sx={{ mb: 4, '&:last-of-type': { mb: 0 } }}>
      {/* No margin here: the first filter row's own top padding supplies the gap. */}
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: '0.875rem',
          color: disabled ? 'grey.500' : 'grey.800',
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}
