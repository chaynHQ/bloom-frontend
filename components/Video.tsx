import Box from '@mui/material/Box';
import { ResponsiveStyleValue } from '@mui/system';
import * as React from 'react';
import ReactPlayer from 'react-player/youtube';

interface VideoProps {
  url: string;
  width?: string | number | ResponsiveStyleValue<string | number>;
}

const videoContainerStyle = {
  position: 'relative',
  paddingTop: '56.25%',
} as const;

const videoStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
} as const;

const Video = (props: VideoProps) => {
  const { url, width = '100%' } = props;

  return (
    <Box width={width}>
      <Box sx={videoContainerStyle}>
        <ReactPlayer
          style={videoStyle}
          width="100%"
          height="100%"
          url={url}
          controls
          modestbranding={1}
        />
      </Box>
    </Box>
  );
};

export default Video;
