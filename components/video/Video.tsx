import { debounce, Theme } from '@mui/material';
import Box from '@mui/material/Box';
import { SxProps } from '@mui/system';
import dynamic from 'next/dynamic';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import { OnProgressProps } from 'react-player/base';
import logEvent from '../../utils/logEvent';
// See React Player Hydration issue https://github.com/cookpete/react-player/issues/1474
const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });

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
  const [videoTimePlayed, setVideoTimePlayed] = useState<number>(0);

  const player = useRef<typeof ReactPlayer>(null);
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
      const playedPercentage = Math.round((videoTimePlayed / videoDuration) * 100);

      logEvent(played ? `${eventPrefix}_VIDEO_PLAYED` : `${eventPrefix}_VIDEO_PAUSED`, {
        ...eventData,
        video_duration: videoDuration,
        video_current_time: videoTimePlayed,
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
  const handleProgress: ((state: OnProgressProps) => void) | undefined = debounce(
    (state: OnProgressProps) => {
      setVideoTimePlayed(state.playedSeconds);
    },
    300,
  );

  const containerStyle = {
    ...containerStyles,
    maxWidth: 514, // <515px prevents the "Watch on youtube" button
  } as const;

  return (
    <Box sx={containerStyle}>
      <Box sx={videoContainerStyle}>
        <ReactPlayer
          ref={player}
          light={true}
          onDuration={(duration) => setVideoDuration(duration)}
          onStart={videoStarted}
          onPause={() => videoPausedOrPlayed(false)}
          onPlay={() => videoPausedOrPlayed(true)}
          onEnded={videoEnded}
          onProgress={handleProgress}
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
