import { Box } from '@mui/system';
import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';

interface StoryblokVideoProps {
  video: { url: string };
  size: string;
  alignment: string;
}

const StoryblokVideo = (props: StoryblokVideoProps) => {
  const { video, size, alignment } = props;

  // default full width, left alignment
  const [width, setWidth] = useState<string>('100%');
  const [marginLeft, setMarginLeft] = useState<number | string>(0);
  const [marginRight, setMarginRight] = useState<number | string>(0);
  const [marginY, setMarginY] = useState<number | string>(4);

  useEffect(() => {
    switch (size) {
      case 'x-small':
        setWidth('30%');
        setMarginY(1);
        break;
      case 'small':
        setWidth('40%');
        setMarginY(2);
        break;
      case 'medium':
        setWidth('50%');
        setMarginY(3);
        break;
      case 'large':
        setWidth('80%');
        setMarginY(4);
        break;
    }
    switch (alignment) {
      case 'center':
        setMarginLeft('auto');
        setMarginRight('auto');
        break;
      case 'right':
        setMarginLeft('auto');
        setMarginRight('0');
        break;
    }
  }, [setWidth, size, setMarginLeft, setMarginRight, setMarginY, alignment]);

  if (!video) return <></>;

  const containerStyle = {
    width: width,
    marginLeft: marginLeft,
    marginRight: marginRight,
    marginY: marginY,
    maxWidth: 514, // <515px prevents the "Watch on youtube" button
  } as const;

  const videoContainerStyle = {
    position: 'relative',
    paddingTop: '56.25%',
  } as const;

  const videoStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
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
