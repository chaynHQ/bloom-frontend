import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import { SxProps } from '@mui/system';
import * as React from 'react';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import ReactPlayer from 'react-player/youtube';
import logEvent from '../../utils/logEvent';

const videoContainerStyle = {
  position: 'relative',
  paddingTop: '56.25%',
} as const;

const videoStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
} as const;

interface VideoProps {
  url: string;
  eventData: {};
  eventPrefix: string;
  containerStyles?: SxProps<Theme>;
  setVideoStarted?: Dispatch<SetStateAction<boolean>>;
}

const Video = (props: VideoProps) => {
  const { url, eventData, eventPrefix, containerStyles, setVideoStarted } = props;
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

  const containerStyle = {
    ...containerStyles,
    maxWidth: 514, // <515px prevents the "Watch on youtube" button
  } as const;

  return (
    <Box sx={containerStyle}>
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
