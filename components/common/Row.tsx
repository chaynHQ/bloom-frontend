'use client';

import { INLINE_ALIGNMENT, TEXT_ALIGNMENT } from '@/lib/utils/alignment';
import { richtextContentStyle, rowStyle } from '@/styles/common';
import { Box } from '@mui/material';

interface RowProps {
  children: any;
  numberOfColumns: number;
  horizontalAlignment: string;
  verticalAlignment: string;
  gap?: string;
  mobileStackOrder?: string;
}

const ALIGN_ITEMS: Record<string, string> = { center: 'center', bottom: 'flex-end' };

const Row = (props: RowProps) => {
  const {
    children,
    horizontalAlignment,
    verticalAlignment,
    numberOfColumns,
    gap,
    mobileStackOrder,
  } = props;

  const calculatedGap =
    gap === 'none'
      ? 0
      : gap === 'small'
        ? 2.5
        : gap === 'mobile-small-desktop-default'
          ? { xs: 2, sm: 8 / numberOfColumns, md: 10 / numberOfColumns, lg: 16 / numberOfColumns }
          : { xs: 3, sm: 8 / numberOfColumns, md: 10 / numberOfColumns, lg: 16 / numberOfColumns };

  const rowStyles = {
    width: '100%',
    gap: calculatedGap,
    ...rowStyle,
    textAlign: TEXT_ALIGNMENT[horizontalAlignment] ?? 'start',
    ...(horizontalAlignment && {
      justifyContent: INLINE_ALIGNMENT[horizontalAlignment] ?? 'flex-start',
    }),
    ...(verticalAlignment && { alignItems: ALIGN_ITEMS[verticalAlignment] ?? 'flex-start' }),
    ...(mobileStackOrder === 'reverse' && {
      flexDirection: { xs: 'column-reverse', md: 'row' },
    }),
    ...richtextContentStyle,
  } as const;

  return <Box sx={rowStyles}>{children}</Box>;
};

export default Row;
