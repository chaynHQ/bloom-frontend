import { Box } from '@mui/system';
import ReactPlayer from 'react-player';
import { richtextContentStyle } from '../../styles/common';

const videoContainerStyle = {
  position: 'relative',
  paddingTop: '56.25%',
} as const;

const videoStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
} as const;

interface StoryblokVideoProps {
  video: { url: string };
  size: string;
  alignment: string;
}

const StoryblokVideo = (props: StoryblokVideoProps) => {
  const { video, size = 'extra-large', alignment = 'left' } = props;

  if (!video) return <></>;

  const containerStyle = {
    maxWidth: 514, // <515px prevents the "Watch on youtube" button
    width:
      size === 'extra-small'
        ? { xs: 80, md: 120 }
        : size === 'small'
        ? { xs: 140, md: 180 }
        : size === 'medium'
        ? { xs: 200, md: 250 }
        : size === 'large'
        ? { xs: 400, md: 480 }
        : '100%',
    marginY:
      size === 'extra-small'
        ? 2
        : size === 'small'
        ? 3
        : size === 'medium'
        ? 4
        : size === 'large'
        ? 5
        : 6,
    marginLeft: alignment === 'center' || alignment === 'right' ? 'auto' : 0,
    marginRight: alignment === 'center' ? 'auto' : 0,

    ...richtextContentStyle,
  } as const;

  return (
    <Box sx={containerStyle}>
      <Box sx={videoContainerStyle}>
        <ReactPlayer
          style={videoStyle}
          width="100%"
          height="100%"
          url={video.url}
          controls
          modestbranding={1}
        />
      </Box>
    </Box>
  );
};

export default StoryblokVideo;
