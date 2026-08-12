'use client';

import { INLINE_ALIGNMENT, TEXT_ALIGNMENT } from '@/lib/utils/alignment';
import { Box } from '@mui/material';

interface ColumnProps {
  children: any;
  width?: string;
  horizontalAlignment?: string;
  // Treat `width` as the column's share of the row rather than a fixed percentage, so a row's
  // columns tile its full width instead of wrapping once they no longer fit. Off by default —
  // every pre-redesign story is laid out around the fixed percentages.
  fill?: boolean;
}

// The named column widths an editor picks from, as a percentage of the row.
const COLUMN_WIDTHS: Record<string, { xs: string; md: string }> = {
  'extra-small': { xs: '20%', md: '5%' },
  small: { xs: '100%', md: '20%' },
  'small-medium': { xs: '100%', md: '30%' },
  medium: { xs: '100%', md: '40%' },
  large: { xs: '100%', md: '60%' },
  'extra-large': { xs: '100%', md: '80%' },
  'full-width': { xs: '100%', md: '100%' },
  'mobile-large-desktop-full': { xs: '60%', md: '100%' },
  'mobile-med-desktop-full': { xs: '40%', md: '100%' },
};

// A filled column's authored width is its share of the row rather than a fixed percentage, so the
// columns tile the row's full width and the gap comes out of the shared space. A lone column has
// no one to share with, so it keeps its authored width.
const fillWidth = (size: { xs: string; md: string }) => ({
  width: { xs: size.xs, md: 'auto' },
  flexBasis: { md: 0 },
  flexGrow: { md: parseFloat(size.md) },
  '&:only-child': { flexGrow: 0, flexBasis: 'auto', width: size },
});

const Column = (props: ColumnProps) => {
  const { width, children, horizontalAlignment, fill } = props;
  const size = width ? COLUMN_WIDTHS[width] : undefined;

  const columnStyles = {
    'h3:only-child': { marginBottom: 0 },
    ...(horizontalAlignment && {
      textAlign: TEXT_ALIGNMENT[horizontalAlignment] ?? 'start',
      justifyContent: INLINE_ALIGNMENT[horizontalAlignment] ?? 'flex-start',
    }),
    minWidth: 0,
    ...(size
      ? fill
        ? fillWidth(size)
        : { width: size }
      : { width: { xs: '100%', md: 'auto' }, flex: { md: 1 } }),
  };
  return <Box sx={columnStyles}>{children}</Box>;
};

export default Column;
