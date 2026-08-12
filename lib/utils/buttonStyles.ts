import { STORYBLOK_COLORS } from '@/lib/constants/enums';
import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

export type ButtonVariant = 'contained' | 'outlined';
type MuiButtonColor = 'primary' | 'secondary' | 'error';

interface ButtonStyleProps {
  muiColor: MuiButtonColor;
  sx: SystemStyleObject<Theme>;
}

// Maps a CMS-authored colour onto the MUI colour the theme already styles. `primary.dark` returns
// no overrides: an `sx` background would beat the theme's hover rule.
export const getButtonStyleProps = (
  color: STORYBLOK_COLORS | string,
  variant: ButtonVariant = 'contained',
): ButtonStyleProps => {
  if (color === STORYBLOK_COLORS.PRIMARY_DARK) {
    return { muiColor: variant === 'contained' ? 'error' : 'primary', sx: {} };
  }

  const muiColor: MuiButtonColor = color.includes('primary') ? 'primary' : 'secondary';

  if (variant === 'outlined') {
    return { muiColor, sx: { borderColor: color, color } };
  }

  return {
    muiColor,
    sx: {
      backgroundColor:
        color === STORYBLOK_COLORS.BACKGROUND_DEFAULT
          ? 'secondary.main'
          : color === STORYBLOK_COLORS.PRIMARY_LIGHT
            ? 'primary.main'
            : color === STORYBLOK_COLORS.SECONDARY_LIGHT
              ? 'secondary.main'
              : color,
      color: 'text.primary',
    },
  };
};
