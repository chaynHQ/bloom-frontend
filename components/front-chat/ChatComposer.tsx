'use client';

import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import StopIcon from '@mui/icons-material/Stop';
import { Box, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useVoiceRecorder } from './useVoiceRecorder';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const composerStyle = {
  borderTop: '2px solid',
  borderColor: 'secondary.main',
  padding: '10px 12px',
  backgroundColor: 'secondary.light',
  flexShrink: 0,
} as const;

const controlRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
} as const;

// Tinted background so secondary action buttons read as interactive, not decorative
const actionButtonStyle = {
  bgcolor: 'secondary.light',
  color: 'text.primary',
  flexShrink: 0,
  '&:hover': { bgcolor: 'secondary.main' },
  '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
} as const;

const sendButtonStyle = {
  bgcolor: 'primary.dark',
  color: 'common.white',
  borderRadius: 1.5,
  p: 0.75,
  flexShrink: 0,
  '&:hover': { bgcolor: 'primary.dark', opacity: 0.85 },
  '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
} as const;

const recordingRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  flex: 1,
  px: 1,
  py: 0.5,
  bgcolor: 'secondary.main',
  borderRadius: 1.5,
  overflow: 'hidden',
} as const;

// CSS keyframe animation defined inline for the pulsing recording dot
const pulseDotStyle = {
  width: 10,
  height: 10,
  borderRadius: '50%',
  backgroundColor: 'primary.dark',
  flexShrink: 0,
  '@keyframes chatRecordingPulse': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.2 },
  },
  animation: 'chatRecordingPulse 1.2s ease-in-out infinite',
} as const;

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// NotAllowedError means the browser has blocked or the user previously denied permission.
// Any other DOMException means hardware/availability issue — show a different message.
const isMicPermissionError = (err: unknown): boolean =>
  err instanceof DOMException &&
  (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');

interface Props {
  isDisabled: boolean;
  onSendText: (text: string) => void;
  onSendAttachment: (
    file: File | Blob,
    kind: 'image' | 'voice',
    displayText: string,
  ) => Promise<void>;
  onError: (message: string) => void;
  maxAttachmentBytes: number;
}

export const ChatComposer = ({
  isDisabled,
  onSendText,
  onSendAttachment,
  onError,
  maxAttachmentBytes,
}: Props) => {
  const t = useTranslations('Messaging.frontChat');
  const recorder = useVoiceRecorder();
  const [draft, setDraft] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Only run the interval timer while actively recording; reset happens in start/cancel
  useEffect(() => {
    if (recorder.state !== 'recording') return;
    const id = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [recorder.state]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || isDisabled) return;
    onSendText(trimmed);
    setDraft('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event as unknown as FormEvent);
    }
  };

  const handleImageSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      onError(t('errors.unsupportedImage'));
      return;
    }
    if (file.size > maxAttachmentBytes) {
      onError(t('errors.fileTooLarge'));
      return;
    }
    try {
      await onSendAttachment(file, 'image', t('imageAttachment'));
    } catch {
      onError(t('errors.uploadFailed'));
    }
  };

  const handleVoiceStop = async () => {
    try {
      const blob = await recorder.stop();
      if (blob.size === 0) return;
      if (blob.size > maxAttachmentBytes) {
        onError(t('errors.fileTooLarge'));
        return;
      }
      await onSendAttachment(blob, 'voice', t('voiceNote'));
    } catch {
      onError(t('errors.uploadFailed'));
    }
  };

  const handleVoiceStart = async () => {
    setRecordingSeconds(0);
    try {
      await recorder.start();
    } catch (err) {
      // Distinguish between permission denied (needs settings change) vs other mic failures
      onError(t(isMicPermissionError(err) ? 'errors.micPermission' : 'errors.micUnavailable'));
    }
  };

  const handleVoiceCancel = () => {
    recorder.cancel();
    setRecordingSeconds(0);
  };

  const isRecording = recorder.state === 'recording';
  const isStopping = recorder.state === 'stopping';

  return (
    <Box component="form" onSubmit={handleSubmit} sx={composerStyle}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        hidden
        onChange={handleImageSelected}
        aria-hidden="true"
      />

      <Box sx={controlRowStyle}>
        {isRecording ? (
          // Recording mode: pill-shaped indicator + timer + cancel/stop
          <Box sx={recordingRowStyle}>
            <Box sx={pulseDotStyle} aria-hidden="true" />
            <Typography
              variant="body2"
              sx={{ flex: 1, fontWeight: 500, color: 'text.primary' }}
              aria-live="polite"
            >
              {t('recordingInProgress')} · {formatDuration(recordingSeconds)}
            </Typography>
            <Tooltip title={t('cancelRecording')}>
              <IconButton
                aria-label={t('cancelRecording')}
                onClick={handleVoiceCancel}
                size="small"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('stopRecording')}>
              <IconButton
                aria-label={t('stopRecording')}
                onClick={handleVoiceStop}
                disabled={isStopping}
                size="small"
              >
                <StopIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          // Normal mode: [attach] [mic] [text field] [send]
          <>
            <Tooltip title={t('attachImage')}>
              <span>
                <IconButton
                  aria-label={t('attachImage')}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isDisabled}
                  size="small"
                  sx={actionButtonStyle}
                >
                  <ImageIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            {recorder.isSupported && (
              <Tooltip title={t('startRecording')}>
                <span>
                  <IconButton
                    aria-label={t('startRecording')}
                    onClick={handleVoiceStart}
                    disabled={isDisabled}
                    size="small"
                    sx={actionButtonStyle}
                  >
                    <MicIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            <TextField
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('placeholder')}
              aria-label={t('placeholder')}
              multiline
              maxRows={4}
              fullWidth
              size="small"
              disabled={isDisabled}
              sx={{
                mb: 0,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'common.white',
                  '& fieldset': { borderColor: 'secondary.main' },
                  '&:hover fieldset': { borderColor: 'secondary.dark' },
                  '&.Mui-focused fieldset': { borderColor: 'secondary.dark', borderWidth: '1.5px' },
                  '&.Mui-disabled fieldset': { borderColor: 'divider' },
                },
              }}
              slotProps={{ htmlInput: { maxLength: 10_000 } }}
            />

            <Tooltip title={t('send')}>
              <span>
                <IconButton
                  type="submit"
                  aria-label={t('send')}
                  disabled={isDisabled || !draft.trim()}
                  size="small"
                  sx={sendButtonStyle}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </>
        )}
      </Box>
    </Box>
  );
};
