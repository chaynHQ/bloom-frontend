'use client';

import { useCreateEventLogMutation } from '@/lib/api';
import { EVENT_LOG_NAME } from '@/lib/constants/enums';
import logEvent from '@/lib/utils/logEvent';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Box, SxProps, Theme, debounce } from '@mui/material';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import {
  Dispatch,
  SetStateAction,
  SyntheticEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Config } from 'react-player/types';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

export const videoContainerStyle = {
  position: 'relative',
  paddingTop: '56.25%', // 16:9 aspect ratio
} as const;

export const videoStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
} as const;

const videoThumbnailStyle = {
  ...videoStyle,
  width: '100%',
  height: '100%',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
} as const;

const videoThumbnailButtonStyle = {
  width: 68,
  height: 68,
  borderRadius: '50%',
  backgroundColor: 'secondary.light',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  transition: 'transform 0.2s',
  '&:hover': { transform: 'scale(1.1)' },
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

// Extract video ID from various YouTube URL formats
const getYouTubeVideoId = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    const allowedYouTubeHostnames = [
      'youtu.be',
      'youtube.com',
      'www.youtube.com',
      'm.youtube.com',
      'youtube-nocookie.com',
      'www.youtube-nocookie.com',
    ];

    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1);
    }

    if (allowedYouTubeHostnames.includes(parsed.hostname)) {
      return parsed.searchParams.get('v');
    }
  } catch {
    // Invalid URL
  }
  return null;
};

// Convert YouTube URLs to privacy-enhanced youtube-nocookie.com domain
const getPrivacyEnhancedUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    const youtubeHostnames = ['youtube.com', 'www.youtube.com', 'm.youtube.com'];

    if (youtubeHostnames.includes(parsed.hostname)) {
      return `${parsed.protocol}//www.youtube-nocookie.com${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
    if (parsed.hostname === 'youtu.be') {
      const videoId = parsed.pathname.slice(1);
      return videoId ? `https://www.youtube-nocookie.com/watch?v=${videoId}` : url;
    }
  } catch {
    // Invalid URL
  }
  return url;
};

const isYouTubeUrl = (url: string): boolean => url.includes('youtu.be') || url.includes('youtube');

const Video = ({
  url,
  eventData,
  eventPrefix,
  containerStyles,
  setVideoStarted,
  setVideoFinished,
  lightMode = true,
  title,
}: VideoProps) => {
  const pathname = usePathname();
  const [createEventLog] = useCreateEventLogMutation();
  const player = useRef<HTMLVideoElement>(null);

  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [videoTimePlayed, setVideoTimePlayed] = useState(0);
  const [showPlayer, setShowPlayer] = useState(!lightMode);

  const debouncedSetVideoTimePlayed = useMemo(
    () => debounce((time: number) => setVideoTimePlayed(time), 300),
    [],
  );

  const handlePlayClick = useCallback(() => setShowPlayer(true), []);

  const videoStarted = useCallback(() => {
    setVideoStarted?.(true);
    if (pathname.includes('grounding')) {
      createEventLog({
        event: EVENT_LOG_NAME.GROUNDING_EXERCISE_STARTED,
        metadata: { title: title || url },
      });
    }
    logEvent(`${eventPrefix}_VIDEO_STARTED`, { ...eventData, video_duration: videoDuration });
  }, [
    pathname,
    createEventLog,
    title,
    url,
    eventPrefix,
    eventData,
    videoDuration,
    setVideoStarted,
  ]);

  const videoEnded = useCallback(() => {
    if (videoCompleted) return;
    setVideoFinished?.(true);
    logEvent(`${eventPrefix}_VIDEO_FINISHED`, { ...eventData, video_duration: videoDuration });
    setVideoCompleted(true);
  }, [videoCompleted, setVideoFinished, eventPrefix, eventData, videoDuration]);

  const videoPausedOrPlayed = useCallback(
    (played: boolean) => {
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
    },
    [videoTimePlayed, videoDuration, eventPrefix, eventData, videoEnded],
  );

  const handleTimeUpdate = useCallback(
    (event: SyntheticEvent<HTMLMediaElement>) => {
      const currentTime = event.currentTarget?.currentTime;
      if (typeof currentTime === 'number') {
        debouncedSetVideoTimePlayed(currentTime);
      }
    },
    [debouncedSetVideoTimePlayed],
  );

  const handleDurationChange = useCallback((event: SyntheticEvent<HTMLVideoElement>) => {
    const duration = event.currentTarget?.duration;
    if (typeof duration === 'number' && !isNaN(duration)) {
      setVideoDuration(duration);
    }
  }, []);

  const videoSrc = getPrivacyEnhancedUrl(url);
  const videoId = getYouTubeVideoId(url);
  const thumbnailUrl = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;

  const videoConfig: Config | undefined = isYouTubeUrl(url)
    ? {
        youtube: {
          rel: 0, // No related videos at end
          modestbranding: 1, // Minimal YouTube branding
        } as Config['youtube'],
      }
    : ({
        file: {
          attributes: {
            preload: 'none', // Prevent preloading to save user data
          },
        },
      } as Config);

  const containerStyle = { ...containerStyles, maxWidth: 514 } as const;

  return (
    <Box sx={containerStyle}>
      <Box sx={videoContainerStyle}>
        {!showPlayer && thumbnailUrl ? (
          <Box
            onClick={handlePlayClick}
            onKeyDown={(e) =>
              (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), handlePlayClick())
            }
            role="button"
            tabIndex={0}
            aria-label={title ? `Play video: ${title}` : 'Play video'}
            sx={{ ...videoThumbnailStyle, backgroundImage: `url(${thumbnailUrl})` }}
          >
            <Box sx={videoThumbnailButtonStyle}>
              <PlayArrowIcon sx={{ fontSize: 40, color: 'primary.dark' }} />
            </Box>
          </Box>
        ) : (
          <ReactPlayer
            ref={player}
            wrapper="div"
            autoPlay
            controls
            src={videoSrc}
            config={videoConfig}
            style={videoStyle}
            width="100%"
            height="100%"
            onDurationChange={handleDurationChange}
            onStart={videoStarted}
            onEnded={videoEnded}
            onPause={() => videoPausedOrPlayed(false)}
            onPlay={() => videoPausedOrPlayed(true)}
            onTimeUpdate={handleTimeUpdate}
          />
        )}
      </Box>
    </Box>
  );
};

export default Video;
