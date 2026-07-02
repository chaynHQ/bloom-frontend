'use client';

import { useIsRtl } from '@/lib/hooks/useIsRtl';
import { Box } from '@mui/material';
import { ReactNode } from 'react';

interface DirectionalIconProps {
  children: ReactNode;
}

/**
 * Horizontally mirrors a directional icon (back/forward/next/previous arrows and
 * chevrons) when the active direction is RTL. Icons point the "wrong" way in RTL
 * otherwise — a left-pointing "back" chevron must point right in Arabic.
 *
 * Use only for icons whose meaning depends on reading direction. Do NOT wrap
 * non-directional icons (e.g. close, check, expand/collapse chevrons that rotate
 * on the vertical axis).
 */
const DirectionalIcon = ({ children }: DirectionalIconProps) => {
  const isRtl = useIsRtl();

  return (
    <Box component="span" sx={{ display: 'inline-flex', transform: isRtl ? 'scaleX(-1)' : 'none' }}>
      {children}
    </Box>
  );
};

export default DirectionalIcon;
