'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

type RecordingState = 'idle' | 'recording' | 'stopping';

const pickMimeType = (): string | undefined => {
  if (typeof MediaRecorder === 'undefined') return undefined;
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
};

const noopSubscribe = () => () => {};
const getIsSupported = () =>
  typeof navigator !== 'undefined' &&
  !!navigator.mediaDevices?.getUserMedia &&
  typeof MediaRecorder !== 'undefined' &&
  !!pickMimeType();
const getServerIsSupported = () => false;

interface UseVoiceRecorderResult {
  state: RecordingState;
  isSupported: boolean;
  start: () => Promise<void>;
  stop: () => Promise<Blob>;
  cancel: () => void;
}

export function useVoiceRecorder(): UseVoiceRecorderResult {
  const [state, setState] = useState<RecordingState>('idle');
  // useSyncExternalStore with a noop subscribe gives SSR-safe browser capability detection
  const isSupported = useSyncExternalStore(noopSubscribe, getIsSupported, getServerIsSupported);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (state !== 'idle') return;
    const mimeType = pickMimeType();
    if (!mimeType) throw new Error('UNSUPPORTED');

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType });
    } catch (err) {
      releaseStream();
      throw err;
    }
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.start();
    recorderRef.current = recorder;
    setState('recording');
  }, [state, releaseStream]);

  const stop = useCallback(
    () =>
      new Promise<Blob>((resolve, reject) => {
        const recorder = recorderRef.current;
        if (!recorder || recorder.state === 'inactive') {
          reject(new Error('NOT_RECORDING'));
          return;
        }
        setState('stopping');
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
          chunksRef.current = [];
          recorderRef.current = null;
          releaseStream();
          setState('idle');
          resolve(blob);
        };
        recorder.stop();
      }),
    [releaseStream],
  );

  const cancel = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null;
      try {
        recorder.stop();
      } catch {
        // MediaRecorder.stop() throws if already stopped — safe to ignore
      }
    }
    chunksRef.current = [];
    recorderRef.current = null;
    releaseStream();
    setState('idle');
  }, [releaseStream]);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return { state, isSupported, start, stop, cancel };
}
