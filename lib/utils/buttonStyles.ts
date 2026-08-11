import { STORYBLOK_COLORS } from '@/lib/constants/enums';
import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

export type ButtonVariant = 'contained' | 'outlined';
type MuiButtonColor = 'primary' | 'secondary' | 'error';

interface ButtonStyleProps {
  muiColor: MuiButtonColor;
  // A plain style object rather than SxProps, so callers can spread their own layout styles
  // alongside it.
  sx: SystemStyleObject<Theme>;
}

/**
 * Maps a CMS-authored colour choice onto the MUI colour the theme already styles, so buttons
 * written in Storyblok render and behave exactly like the hard-coded ones.
 *
 * `primary.dark` is Bloom's primary call-to-action and the theme owns its fill, label colour and
 * hover, so it returns no colour overrides — an `sx` background would beat the theme's hover rule.
 */
export const getButtonStyleProps = (
  color: STORYBLOK_COLORS | string,
  variant: ButtonVariant = 'contained',
): ButtonStyleProps => {
  if (color === STORYBLOK_COLORS.PRIMARY_DARK) {
    return { muiColor: variant === 'contained' ? 'error' : 'primary', sx: {} };
  }

  const muiColor: MuiButtonColor = color.includes('primary') ? 'primary' : 'secondary';

  // An outlined button draws the chosen colour as its border and label; a filled one uses it as
  // the background, with the pale tints bumped up to their readable siblings.
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
