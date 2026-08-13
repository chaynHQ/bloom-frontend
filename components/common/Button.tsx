'use client';

import { STORYBLOK_COLORS } from '@/lib/constants/enums';
import { generateStoryblokButtonEvent } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { getButtonStyleProps } from '@/lib/utils/buttonStyles';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import { Button, Link } from '@mui/material';

interface BloomButtonProps {
  text: string;
  color: STORYBLOK_COLORS;
  link: string;
  size: 'small' | 'medium' | 'large' | undefined;
  clickHandler?: () => void;
  style?: React.CSSProperties;
}

const BloomButton = (props: BloomButtonProps) => {
  const { clickHandler, text, color = 'secondary.main', link, size = 'medium', style = {} } = props;
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  if (!link) return <></>;

  const { muiColor, sx } = getButtonStyleProps(color, 'contained');

  return (
    <Button
      component={Link}
      sx={{ marginTop: 2, marginBottom: 2, ...sx, ...style }}
      variant="contained"
      color={muiColor}
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
