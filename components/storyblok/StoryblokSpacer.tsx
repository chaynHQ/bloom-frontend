import { Box } from '@mui/system';
interface StoryblokSpacerProps {
  size: string;
}

const StoryblokSpacer = ({ size = 'small' }: StoryblokSpacerProps) => {
  const style = {
    ...(size === 'small' ? { height: 1 } : size === 'medium' ? { height: 2 } : { height: 3 }),
  };
  return <Box sx={style} />;
};

export default StoryblokSpacer;
