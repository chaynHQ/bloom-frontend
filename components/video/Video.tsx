'use client';

import { useCreateEventLogMutation } from '@/lib/api';
import { EVENT_LOG_NAME } from '@/lib/constants/enums';
import logEvent from '@/lib/utils/logEvent';
import { Box, SxProps, Theme, debounce } from '@mui/material';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Dispatch, SetStateAction, SyntheticEvent, useRef, useState } from 'react';
import { Config } from 'react-player/types';
// See React Player Hydration issue https://github.com/cookpete/react-player/issues/1474
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

export const videoContainerStyle = {
  position: 'relative',
  paddingTop: '56.25%',
} as const;

export const videoStyle = {
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
  title?: string;
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
    title,
  } = props;
  const pathname = usePathname();
  const [createEventLog] = useCreateEventLogMutation();

  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoCompleted, setVideoCompleted] = useState<boolean>(false);
  const [videoTimePlayed, setVideoTimePlayed] = useState<number>(0);

  const player = useRef<HTMLVideoElement>(null);
  const videoStarted = () => {
    setVideoStarted && setVideoStarted(true);
    if (pathname.includes('grounding')) {
      createEventLog({
        event: EVENT_LOG_NAME.GROUNDING_EXERCISE_STARTED,
        metadata: { title: title || url },
      });
    }
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
  const handleTimeUpdate = debounce((event: SyntheticEvent<HTMLMediaElement>) => {
    setVideoTimePlayed(event.currentTarget.currentTime);
  }, 300);

  const containerStyle = {
    ...containerStyles,
    maxWidth: 514, // <515px prevents the "Watch on youtube" button
  } as const;

  // Convert YouTube URLs to privacy-enhanced youtube-nocookie.com domain
  const getPrivacyEnhancedUrl = (url: string): string => {
    // Handle standard youtube.com URLs
    if (url.includes('youtube.com') && !url.includes('youtube-nocookie.com')) {
      return url.replace('youtube.com', 'youtube-nocookie.com');
    }
    // Handle youtu.be short URLs - convert to youtube-nocookie.com format
    const youtuBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (youtuBeMatch) {
      return `https://www.youtube-nocookie.com/watch?v=${youtuBeMatch[1]}`;
    }
    return url;
  };

  const getVideoConfig = (url: string): Config | undefined => {
    return url.indexOf('youtu.be') > -1 || url.indexOf('youtube') > -1
      ? {
          youtube: {
            rel: 0, // don't show related videos
          },
        }
      : undefined;
  };

  const videoSrc = getPrivacyEnhancedUrl(url);
  const videoConfig = getVideoConfig(url);

  return (
    <Box sx={containerStyle}>
      <Box sx={videoContainerStyle}>
        <ReactPlayer
          ref={player}
          light={lightMode}
          autoPlay={autoplay}
          onDurationChange={(event) => setVideoDuration(event.currentTarget.duration)}
          onStart={videoStarted}
          onEnded={videoEnded}
          onPause={() => videoPausedOrPlayed(false)}
          onPlay={() => videoPausedOrPlayed(true)}
          onTimeUpdate={handleTimeUpdate}
          style={videoStyle}
          width="100%"
          height="100%"
          src={videoSrc}
          controls
          config={videoConfig}
        />
      </Box>
    </Box>
  );
};

export default Video;
