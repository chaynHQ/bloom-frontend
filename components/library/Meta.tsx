import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

import { HEADING_FONT } from './libraryTokens';

// An icon + label pair, used in a card's bottom meta row.
export function Meta({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'grey.800' }}>
      {icon}
      <Typography sx={{ fontFamily: HEADING_FONT, fontSize: '0.875rem', fontWeight: 500 }}>
        {text}
      </Typography>
    </Box>
  );
}
