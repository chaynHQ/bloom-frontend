'use client';

import logEvent from '@/lib/utils/logEvent';
import { debounce } from '@mui/material';
import dynamic from 'next/dynamic';
import { Dispatch, SetStateAction, SyntheticEvent, useRef, useState } from 'react';
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
  const audioStarted = () => {
    setAudioStarted && setAudioStarted(true);
    if (player.current) {
      logEvent(`${eventPrefix}_AUDIO_STARTED`, { ...eventData, audio_duration: audioDuration });
    }
  };

  const audioEnded = () => {
    if (!!audioCompleted) return;

    setAudioFinished && setAudioFinished(true);

    if (player.current) {
      logEvent(`${eventPrefix}_AUDIO_FINISHED`, {
        ...eventData,
        audio_duration: audioDuration,
      });
    }
    setAudioCompleted(true);
  };

  const audioPausedOrPlayed = (played: boolean) => {
    if (player.current) {
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
    }
  };
  const handleTimeUpdate = debounce((event: SyntheticEvent<HTMLMediaElement>) => {
    setAudioTimePlayed(event.currentTarget.currentTime);
  }, 300);

  return (
    <ReactPlayer
      ref={player}
      onDurationChange={(event) => setAudioDuration(event.currentTarget.duration)}
      onStart={audioStarted}
      onEnded={audioEnded}
      onPause={() => audioPausedOrPlayed(false)}
      onPlay={() => audioPausedOrPlayed(true)}
      onTimeUpdate={handleTimeUpdate}
      width="100%"
      height="50px"
      src={url}
      controls
    />
  );
};

export default Audio;
