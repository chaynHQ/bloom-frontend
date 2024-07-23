import { Box, useTheme } from '@mui/material';
import { storyblokEditable } from '@storyblok/react';
interface StoryblokSpacerProps {
  _uid: string;
  _editable: string;
  size: string;
}

const StoryblokSpacer = (props: StoryblokSpacerProps) => {
  const { _uid, _editable, size = 'small' } = props;

  const theme = useTheme();
  const style = {
    ...(size === 'small'
      ? { height: theme.spacing(1) }
      : size === 'medium'
        ? { height: theme.spacing(2) }
        : { height: theme.spacing(3) }),
  };
  return <Box sx={style} {...storyblokEditable({ _uid, _editable, size })} />;
};

export default StoryblokSpacer;
