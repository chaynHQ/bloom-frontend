'use client';

import logEvent from '@/utils/logEvent';
import { Box, SxProps, Theme, debounce } from '@mui/material';
import dynamic from 'next/dynamic';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import { OnProgressProps } from 'react-player/base';
import { YouTubeConfig } from 'react-player/youtube';
// See React Player Hydration issue https://github.com/cookpete/react-player/issues/1474
const ReactPlayer = dynamic(() => import('react-player/youtube'), { ssr: false });

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
  autoplay?: boolean;
  eventData: { [key: string]: any };
  eventPrefix: string;
  containerStyles?: SxProps<Theme>;
  setVideoStarted?: Dispatch<SetStateAction<boolean>>;
  setVideoFinished?: Dispatch<SetStateAction<boolean>>;
  lightMode?: boolean;
}

const Video = (props: VideoProps) => {
  const {
    url,
    autoplay = false,
    eventData,
    eventPrefix,
    containerStyles,
    setVideoStarted,
    setVideoFinished,
    lightMode = true,
  } = props;

  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoCompleted, setVideoCompleted] = useState<boolean>(false);
  const [videoTimePlayed, setVideoTimePlayed] = useState<number>(0);

  const player = useRef<typeof ReactPlayer>(null);
  const videoStarted = () => {
    setVideoStarted && setVideoStarted(true);
    if (player.current) {
      logEvent(`${eventPrefix}_VIDEO_STARTED`, { ...eventData, video_duration: videoDuration });
    }
  };

  const videoEnded = () => {
    if (!!videoCompleted) return;

    setVideoFinished && setVideoFinished(true);

    if (player.current) {
      logEvent(`${eventPrefix}_VIDEO_FINISHED`, {
        ...eventData,
        video_duration: videoDuration,
      });
    }
    setVideoCompleted(true);
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

      if (!played && playedPercentage > 95) {
        videoEnded();
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

  const videoConfig = (video: { url: string }): YouTubeConfig => {
    return video.url.indexOf('youtu.be') > -1 || video.url.indexOf('youtube') > -1
      ? {
          embedOptions: {
            host: 'https://www.youtube-nocookie.com',
          },
          ...(autoplay && {
            playerVars: {
              autoplay: 1, // note this doesnt work consistently as autoplay is often blocked by browsers
            },
          }),
        }
      : {};
  };

  return (
    <Box sx={containerStyle}>
      <Box sx={videoContainerStyle}>
        <ReactPlayer
          ref={player}
          light={lightMode}
          onDuration={(duration) => setVideoDuration(duration)}
          onStart={videoStarted}
          onEnded={videoEnded}
          onPause={() => videoPausedOrPlayed(false)}
          onPlay={() => videoPausedOrPlayed(true)}
          onProgress={handleProgress}
          style={videoStyle}
          width="100%"
          height="100%"
          url={url}
          controls
          modestbranding={1}
          {...videoConfig({ url })}
        />
      </Box>
    </Box>
  );
};

export default Video;
