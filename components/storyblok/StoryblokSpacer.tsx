import { useTheme } from '@mui/material';
import { Box } from '@mui/system';
interface StoryblokSpacerProps {
  size: string;
}

const StoryblokSpacer = ({ size = 'small' }: StoryblokSpacerProps) => {
  const theme = useTheme();
  const style = {
    ...(size === 'small'
      ? { height: theme.spacing(1) }
      : size === 'medium'
      ? { height: theme.spacing(2) }
      : { height: theme.spacing(3) }),
  };
  return <Box sx={style} />;
};

export default StoryblokSpacer;
