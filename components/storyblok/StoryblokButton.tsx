import { Button } from '@mui/material';
import { STORYBLOK_COLORS } from '../../constants/enums';
import Link from '../common/Link';

interface StoryblokLink {
  cached_url: string;
}
interface StoryblokButtonProps {
  text: string;
  color: STORYBLOK_COLORS;
  link: StoryblokLink;
}

const StoryblokButton = (props: StoryblokButtonProps) => {
  const { text, color = 'secondary.main', link } = props;

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
    <Button
      component={Link}
      sx={buttonStyle}
      variant="contained"
      color={color.includes('primary') ? 'primary' : 'secondary'}
      href={link.cached_url}
    >
      {text}
    </Button>
  );
};

export default StoryblokButton;
