'use client';

import logEvent from '@/lib/utils/logEvent';
import { debounce } from '@mui/material';
import dynamic from 'next/dynamic';
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
// See React Player Hydration issue https://github.com/cookpete/react-player/issues/1474
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

interface AudioProps {
  url: string;
  eventData: { [key: string]: any };
  eventPrefix: string;
  setAudioStarted?: Dispatch<SetStateAction<boolean>> | void;
  setAudioFinished?: Dispatch<SetStateAction<boolean>> | void;
}

const Audio = (props: AudioProps) => {
  const { url, eventData, eventPrefix, setAudioStarted, setAudioFinished } = props;
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [audioCompleted, setAudioCompleted] = useState<boolean>(false);
  const [audioTimePlayed, setAudioTimePlayed] = useState<number>(0);

  const player = useRef<HTMLVideoElement>(null);

  const audioStarted = useCallback(() => {
    setAudioStarted && setAudioStarted(true);
    logEvent(`${eventPrefix}_AUDIO_STARTED`, { ...eventData, audio_duration: audioDuration });
  }, [setAudioStarted, eventPrefix, eventData, audioDuration]);

  const audioEnded = useCallback(() => {
    if (audioCompleted) return;

    setAudioFinished && setAudioFinished(true);
    logEvent(`${eventPrefix}_AUDIO_FINISHED`, {
      ...eventData,
      audio_duration: audioDuration,
    });
    setAudioCompleted(true);
  }, [audioCompleted, setAudioFinished, eventPrefix, eventData, audioDuration]);

  const audioPausedOrPlayed = useCallback(
    (played: boolean) => {
      const playedPercentage = Math.round((audioTimePlayed / audioDuration) * 100);

      logEvent(played ? `${eventPrefix}_AUDIO_PLAYED` : `${eventPrefix}_AUDIO_PAUSED`, {
        ...eventData,
        audio_duration: audioDuration,
        audio_current_time: audioTimePlayed,
        audio_current_percentage: playedPercentage,
      });

      if (!played && playedPercentage > 95) {
        audioEnded();
      }
    },
    [audioTimePlayed, audioDuration, eventPrefix, eventData, audioEnded],
  );

  // Debounced state setter - memoized to prevent recreation on each render
  const debouncedSetAudioTimePlayed = useMemo(
    () => debounce((time: number) => setAudioTimePlayed(time), 300),
    [],
  );

  // Extract value immediately before debouncing to avoid stale event reference
  const handleTimeUpdate = useCallback(
    (event: SyntheticEvent<HTMLMediaElement>) => {
      const currentTime = event.currentTarget?.currentTime;
      if (typeof currentTime === 'number') {
        debouncedSetAudioTimePlayed(currentTime);
      }
    },
    [debouncedSetAudioTimePlayed],
  );

  const handleDurationChange = useCallback((event: SyntheticEvent<HTMLVideoElement>) => {
    const duration = event.currentTarget?.duration;
    if (typeof duration === 'number' && !isNaN(duration)) {
      setAudioDuration(duration);
    }
  }, []);

  const audioConfig: Config = {
    file: {
      attributes: {
        preload: 'none', // Prevent preloading to save user data
      },
    },
  } as Config;

  return (
    <ReactPlayer
      ref={player}
      onDurationChange={handleDurationChange}
      onStart={audioStarted}
      onEnded={audioEnded}
      onPause={() => audioPausedOrPlayed(false)}
      onPlay={() => audioPausedOrPlayed(true)}
      onTimeUpdate={handleTimeUpdate}
      width="100%"
      height="50px"
      src={url}
      controls
      config={audioConfig}
    />
  );
};

export default Audio;
