'use client';

import { Link as i18nLink } from '@/i18n/routing';
import { BASE_URL } from '@/lib/constants/common';
import { STORYBLOK_COLORS } from '@/lib/constants/enums';
import { generateStoryblokButtonEvent } from '@/lib/constants/events';
import { getButtonStyleProps } from '@/lib/utils/buttonStyles';
import logEvent from '@/lib/utils/logEvent';
import { Box, Button } from '@mui/material';
import { storyblokEditable } from '@storyblok/react/rsc';

interface StoryblokLink {
  cached_url: string;
}
interface StoryblokButtonProps {
  _uid: string;
  _editable: string;
  text: string;
  color: STORYBLOK_COLORS;
  link: StoryblokLink;
  size: 'small' | 'medium' | 'large' | undefined;
  variant: 'contained' | 'outlined' | undefined;
}

const StoryblokButton = (props: StoryblokButtonProps) => {
  const {
    _uid,
    _editable,
    text,
    color = 'secondary.main',
    link,
    size = 'medium',
    variant = 'contained',
  } = props;

  if (!link || !link.cached_url) return <></>;

  const { muiColor, sx } = getButtonStyleProps(color, variant);

  return (
    <Box {...storyblokEditable({ _uid, _editable, text, color, link, size, variant })}>
      <Button
        sx={{ marginY: 2, ...sx }}
        variant={variant}
        color={muiColor}
        href={link.cached_url}
        component={link.cached_url.startsWith(BASE_URL || '/') ? i18nLink : 'a'}
        size={size}
        onClick={() => {
          logEvent(generateStoryblokButtonEvent(text));
        }}
      >
        {text}
      </Button>
    </Box>
  );
};

export default StoryblokButton;
