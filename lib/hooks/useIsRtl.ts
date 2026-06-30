'use client';

import { useTheme } from '@mui/material/styles';

/**
 * Returns true when the active theme/document direction is right-to-left.
 * Use for the rare cases logical CSS properties can't cover — mirroring
 * directional icons or direction-aware transforms.
 */
export const useIsRtl = (): boolean => useTheme().direction === 'rtl';
