'use client';

import { INLINE_ALIGNMENT, TEXT_ALIGNMENT } from '@/lib/utils/alignment';
import { Box } from '@mui/material';

interface ColumnProps {
  children: any;
  width?: string;
  horizontalAlignment?: string;
}

// The named column widths an editor picks from, as a share of the row. Below `md` a column takes
// the full row unless it was authored to stay narrow.
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

const Column = (props: ColumnProps) => {
  const { width, children, horizontalAlignment } = props;
  const size = width ? COLUMN_WIDTHS[width] : undefined;

  const columnStyles = {
    'h3:only-child': { marginBottom: 0 },
    ...(horizontalAlignment && {
      textAlign: TEXT_ALIGNMENT[horizontalAlignment] ?? 'start',
      justifyContent: INLINE_ALIGNMENT[horizontalAlignment] ?? 'flex-start',
    }),
    // Long words shouldn't be able to push a column past its share of the row.
    minWidth: 0,
    ...(size
      ? {
          width: { xs: size.xs, md: 'auto' },
          // From `md` the authored width is the column's share of the row rather than a fixed
          // percentage, so columns tile the full width and the gap comes out of the shared space.
          flexBasis: { md: 0 },
          flexGrow: { md: parseFloat(size.md) },
          // A column standing alone keeps the width it was authored at.
          '&:only-child': { flexGrow: 0, flexBasis: 'auto', width: size },
        }
      : { width: { xs: '100%', md: 'auto' }, flex: { md: 1 } }),
  };
  return <Box sx={columnStyles}>{children}</Box>;
};

export default Column;
