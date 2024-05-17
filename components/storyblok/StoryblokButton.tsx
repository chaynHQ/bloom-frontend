import { Box, Button } from '@mui/material';
import { storyblokEditable } from '@storyblok/react';
import { STORYBLOK_COLORS } from '../../constants/enums';
import Link from '../common/Link';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import { generateStoryblokButtonEvent } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';

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
}

const StoryblokButton = (props: StoryblokButtonProps) => {
  const { _uid, _editable, text, color = 'secondary.main', link, size = 'medium' } = props;
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  if (!link || !link.cached_url) return <></>;

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
    <Box {...storyblokEditable({ _uid, _editable, text, color, link, size })}>
      <Button
        component={Link}
        sx={buttonStyle}
        variant="contained"
        color={color.includes('primary') ? 'primary' : 'secondary'}
        href={link.cached_url}
        size={size}
        onClick={() => {
          logEvent(generateStoryblokButtonEvent(text), eventUserData);
        }}
      >
        {text}
      </Button>
    </Box>
  );
};

export default StoryblokButton;
