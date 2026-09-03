'use client';

import { formatMediaTime } from '@/lib/utils/formatMediaTime';
import logEvent from '@/lib/utils/logEvent';
import Forward10Rounded from '@mui/icons-material/Forward10Rounded';
import PauseRounded from '@mui/icons-material/PauseRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import Replay10Rounded from '@mui/icons-material/Replay10Rounded';
import { Box, IconButton, Slider, Typography } from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import { useCallback, useRef, useState } from 'react';

const SKIP_SECONDS = 10;

const panelStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  p: 2,
  borderRadius: '8px',
  border: '1px solid',
  borderColor: 'audioTrack',
  backgroundColor: 'sectionSurface',
} as const;

const timeRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  color: 'grey.700',
  fontSize: '0.875rem',
} as const;

const sliderStyle = (theme: Theme) => ({
  py: 0,
  height: 6,
  color: 'primary.dark',
  '& .MuiSlider-rail': { opacity: 1, backgroundColor: theme.palette.audioTrack },
  '& .MuiSlider-thumb': {
    width: 12,
    height: 12,
    '&:hover, &.Mui-focusVisible': {
      boxShadow: `0 0 0 6px ${alpha(theme.palette.primary.dark, 0.16)}`,
    },
  },
});

const controlsStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4.5,
} as const;

const skipButtonStyle = { color: 'grey.800', '& svg': { fontSize: 30 } } as const;

const playButtonStyle = {
  width: 48,
  height: 48,
  backgroundColor: 'primary.dark',
  color: 'common.white',
  '& svg': { fontSize: 28 },
  '&:hover': { backgroundColor: 'primary.dark', opacity: 0.9 },
} as const;

interface ResourceAudioPlayerProps {
  url: string;
  eventPrefix: string;
  eventData: Record<string, unknown>;
  onStart?: () => void;
  onFinish?: () => void;
}

export const ResourceAudioPlayer = ({
  url,
  eventPrefix,
  eventData,
  onStart,
  onFinish,
}: ResourceAudioPlayerProps) => {
  const t = useTranslations('Resources.audioPlayer');
  const audioRef = useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const hasStarted = useRef(false);
  const hasFinished = useRef(false);

  const eventPayload = useCallback(
    () => ({
      ...eventData,
      audio_duration: duration,
      audio_current_time: currentTime,
      audio_current_percentage: duration ? Math.round((currentTime / duration) * 100) : 0,
    }),
    [eventData, duration, currentTime],
  );

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play().catch(() => setPlaying(false));
    else audio.pause();
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(
      Math.max(audio.currentTime + seconds, 0),
      duration || audio.duration,
    );
  };

  const handlePlay = () => {
    setPlaying(true);
    if (!hasStarted.current) {
      hasStarted.current = true;
      onStart?.();
      logEvent(`${eventPrefix}_AUDIO_STARTED`, { ...eventData, audio_duration: duration });
    } else {
      logEvent(`${eventPrefix}_AUDIO_PLAYED`, eventPayload());
    }
  };

  const handlePause = () => {
    setPlaying(false);
    // The `ended` event also fires a pause; let `handleEnded` own that transition.
    if (audioRef.current && !audioRef.current.ended) {
      logEvent(`${eventPrefix}_AUDIO_PAUSED`, eventPayload());
    }
  };

  const handleEnded = () => {
    setPlaying(false);
    if (hasFinished.current) return;
    hasFinished.current = true;
    onFinish?.();
    logEvent(`${eventPrefix}_AUDIO_FINISHED`, { ...eventData, audio_duration: duration });
  };

  return (
    <Box sx={panelStyle}>
      <audio
        ref={audioRef}
        src={url}
        preload="none"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
      />
      <Box sx={timeRowStyle}>
        <Typography component="span" sx={{ fontSize: 'inherit' }}>
          {formatMediaTime(currentTime)}
        </Typography>
        <Typography component="span" sx={{ fontSize: 'inherit' }}>
          {formatMediaTime(duration)}
        </Typography>
      </Box>
      <Slider
        aria-label={t('scrubber')}
        size="small"
        min={0}
        max={duration || 100}
        value={currentTime}
        onChange={(_, value) => {
          const next = Array.isArray(value) ? value[0] : value;
          setCurrentTime(next);
          if (audioRef.current) audioRef.current.currentTime = next;
        }}
        sx={sliderStyle}
      />
      <Box sx={controlsStyle}>
        <IconButton
          aria-label={t('back', { seconds: SKIP_SECONDS })}
          onClick={() => skip(-SKIP_SECONDS)}
          sx={skipButtonStyle}
        >
          <Replay10Rounded />
        </IconButton>
        <IconButton
          aria-label={playing ? t('pause') : t('play')}
          onClick={togglePlay}
          sx={playButtonStyle}
        >
          {playing ? <PauseRounded /> : <PlayArrowRounded />}
        </IconButton>
        <IconButton
          aria-label={t('forward', { seconds: SKIP_SECONDS })}
          onClick={() => skip(SKIP_SECONDS)}
          sx={skipButtonStyle}
        >
          <Forward10Rounded />
        </IconButton>
      </Box>
    </Box>
  );
};
