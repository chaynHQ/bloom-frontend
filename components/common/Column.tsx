'use client';

import { Box } from '@mui/material';

interface ColumnProps {
  children: any;
  width?: string;
  horizontalAlignment?: string;
}

const Column = (props: ColumnProps) => {
  const { width, children, horizontalAlignment } = props;

  const columnStyles = {
    'h3:only-child': { marginBottom: 0 },
    ...(horizontalAlignment && {
      textAlign:
        horizontalAlignment === 'center'
          ? { xs: 'center', md: 'center' }
          : horizontalAlignment === 'right'
            ? { xs: 'right', md: 'right' }
            : horizontalAlignment === 'mobile-left-desktop-center'
              ? { xs: 'left', md: 'center' }
              : { xs: 'left', md: 'left' },
    }),
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
    width:
      width === 'extra-small'
        ? {
            xs: `20%`,
            md: '5%',
          }
        : width === 'small'
          ? { xs: '100%', md: '20%' }
          : width === 'small-medium'
            ? { xs: '100%', md: '30%' }
            : width === 'medium'
              ? { xs: '100%', md: '40%' }
              : width === 'large'
                ? { xs: '100%', md: '60%' }
                : width === 'extra-large'
                  ? { xs: '100%', md: '80%' }
                  : width === 'full-width'
                    ? { xs: `100%`, md: '100%' }
                    : width === 'mobile-large-desktop-full'
                      ? { xs: `60%`, md: '100%' }
                      : width === 'mobile-med-desktop-full'
                        ? { xs: `40%`, md: '100%' }
                        : { xs: `100%`, md: 'auto' },
    ...(!width && { flex: { md: 1 } }),
  };
  return <Box sx={columnStyles}>{children}</Box>;
};

export default Column;
