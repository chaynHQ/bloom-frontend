import Box from '@mui/material/Box';
import { ResponsiveStyleValue } from '@mui/system/styleFunctionSx';
import * as React from 'react';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import ReactPlayer from 'react-player/youtube';
import logEvent from '../utils/logEvent';

interface VideoProps {
  url: string;
  width?: string | number | ResponsiveStyleValue<string | number>;
  eventData: any;
  eventPrefix: string;
  setVideoStarted?: Dispatch<SetStateAction<boolean>>;
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
  const { url, eventData, eventPrefix, width, setVideoStarted } = props;
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const player = useRef<ReactPlayer>(null);

  const videoStarted = () => {
    setVideoStarted && setVideoStarted(true);
    if (player.current) {
      logEvent(`${eventPrefix}_VIDEO_STARTED`, { ...eventData, video_duration: videoDuration });
    }
  };

  const videoEnded = () => {
    if (player.current) {
      logEvent(`${eventPrefix}_VIDEO_FINISHED`, {
        ...eventData,
        video_duration: videoDuration,
      });
    }
  };

  const videoPausedOrPlayed = (played: boolean) => {
    if (player.current) {
      const currentTime = Math.round(player.current.getCurrentTime());
      const playedPercentage = Math.round((currentTime / videoDuration) * 100);

      logEvent(played ? `${eventPrefix}_VIDEO_PLAYED` : `${eventPrefix}_VIDEO_PAUSED`, {
        ...eventData,
        video_duration: videoDuration,
        video_current_time: currentTime,
        video_current_percentage: playedPercentage,
      });

      if (played) {
      } else {
        if (playedPercentage > 90) {
          videoEnded();
        }
      }
    }
  };

  return (
    // maxWidth <515px prevents the "Watch on youtube" button
    <Box width={width} maxWidth={514}>
      <Box sx={videoContainerStyle}>
        <ReactPlayer
          ref={player}
          onDuration={(duration) => setVideoDuration(duration)}
          onStart={videoStarted}
          onPause={() => videoPausedOrPlayed(false)}
          onPlay={() => videoPausedOrPlayed(true)}
          onEnded={videoEnded}
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
