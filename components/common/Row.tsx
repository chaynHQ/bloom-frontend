'use client';

import { richtextContentStyle, rowStyle } from '@/styles/common';
import { Box } from '@mui/material';

interface RowProps {
  children: any;
  numberOfColumns: number;
  horizontalAlignment: string;
  verticalAlignment: string;
  gap?: string;
}

const Row = (props: RowProps) => {
  const { children, horizontalAlignment, verticalAlignment, numberOfColumns, gap } = props;
  const calculatedGap =
    gap === 'none'
      ? 0
      : gap === 'mobile-small-desktop-default'
        ? { xs: 2, sm: 8 / numberOfColumns, md: 10 / numberOfColumns, lg: 16 / numberOfColumns }
        : { xs: 3, sm: 8 / numberOfColumns, md: 10 / numberOfColumns, lg: 16 / numberOfColumns };

  const rowStyles = {
    width: '100%',
    gap: calculatedGap,
    ...rowStyle,
    textAlign:
      horizontalAlignment === 'center'
        ? 'center'
        : horizontalAlignment === 'right'
          ? 'right'
          : horizontalAlignment === 'mobile-left-desktop-center'
            ? { xs: 'left', md: 'center' }
            : 'left',
    ...(horizontalAlignment && {
      justifyContent:
        horizontalAlignment === 'center'
          ? 'center'
          : horizontalAlignment === 'right'
            ? 'flex-end'
            : horizontalAlignment === 'mobile-left-desktop-center'
              ? { xs: 'flex-start', md: 'center' }
              : 'flex-start',
    }),
    ...(verticalAlignment && {
      alignItems:
        verticalAlignment === 'center'
          ? 'center'
          : verticalAlignment === 'bottom'
            ? 'flex-end'
            : 'flex-start',
    }),
    ...richtextContentStyle,
  } as const;

  return <Box sx={rowStyles}>{children}</Box>;
};

export default Row;
