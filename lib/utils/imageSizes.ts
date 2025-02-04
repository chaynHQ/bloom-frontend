import { Breakpoint } from '@mui/material';

type WidthSxProps =
  | string
  | number
  | {
      [key in Breakpoint]?: string | number;
    };

export const getImageSizes = (width: WidthSxProps): string => {
  const breakpoints: Record<Breakpoint, number> = {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  };

  const getSizes = (width: WidthSxProps): string[] => {
    if (typeof width === 'object') {
      return Object.entries(breakpoints)
        .filter(([breakpoint]) => width[breakpoint as Breakpoint] !== undefined)
        .map(
          ([breakpoint, maxWidth]) =>
            `(max-width: ${maxWidth}px) ${width[breakpoint as Breakpoint]}`,
        );
    } else {
      return [`${width}`];
    }
  };

  return getSizes(width).join(', ');
};
