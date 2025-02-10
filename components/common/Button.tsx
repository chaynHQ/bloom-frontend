'use client';

import { STORYBLOK_COLORS } from '@/lib/constants/enums';
import { generateStoryblokButtonEvent } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import { Button, Link } from '@mui/material';

interface BloomButtonProps {
  text: string;
  color: STORYBLOK_COLORS;
  link: string;
  size: 'small' | 'medium' | 'large' | undefined;
  clickHandler?: () => void;
}

const BloomButton = (props: BloomButtonProps) => {
  const { clickHandler, text, color = 'secondary.main', link, size = 'medium' } = props;
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  if (!link) return <></>;

  const buttonStyle = {
    marginY: 2,
    backgroundColor:
      color === 'background.default'
        ? 'secondary.main'
        : color === 'primary.light'
          ? 'primary.main'
          : color === 'secondary.light'
            ? 'secondary.main'
            : color,
    color: color === 'primary.dark' ? 'common.white' : 'text.primary',
  } as const;

  return (
    <Button
      component={Link}
      sx={buttonStyle}
      variant="contained"
      color={color.includes('primary') ? 'primary' : 'secondary'}
      href={link}
      size={size}
      onClick={() => {
        if (clickHandler) clickHandler();
        logEvent(generateStoryblokButtonEvent(text), eventUserData);
      }}
    >
      {text}
    </Button>
  );
};

export default BloomButton;
