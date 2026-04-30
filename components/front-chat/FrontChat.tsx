'use client';

import { CHAT_VIEWED } from '@/lib/constants/events';
import logEvent from '@/lib/utils/logEvent';
import ImageIcon from '@mui/icons-material/Image';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import StopIcon from '@mui/icons-material/Stop';
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { ChatMessage } from './types';
import { MAX_ATTACHMENT_BYTES, useFrontChat } from './useFrontChat';
import { useVoiceRecorder } from './useVoiceRecorder';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '450px',
  maxHeight: '70vh',
  marginTop: { md: -2 },
  marginBottom: 3,
  borderRadius: 4,
  border: '1px solid',
  borderColor: 'divider',
  backgroundColor: 'common.white',
  overflow: 'hidden',
} as const;

const transcriptStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: 2,
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
} as const;

const composerStyle = {
  borderTop: '1px solid',
  borderColor: 'divider',
  padding: 1.5,
  display: 'flex',
  alignItems: 'flex-end',
  gap: 1,
  backgroundColor: 'background.paper',
} as const;

const bubbleStyleBase = {
  padding: 1.5,
  borderRadius: 3,
  maxWidth: '80%',
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
} as const;

const userBubbleStyle = {
  ...bubbleStyleBase,
  alignSelf: 'flex-end',
  backgroundColor: 'primary.light',
  color: 'text.primary',
};

const agentBubbleStyle = {
  ...bubbleStyleBase,
  alignSelf: 'flex-start',
  backgroundColor: 'secondary.light',
  color: 'text.primary',
};

interface MessageBubbleProps {
  message: ChatMessage;
  failedLabel: string;
  sendingLabel: string;
}

const MessageBubble = ({ message, failedLabel, sendingLabel }: MessageBubbleProps) => {
  const isUser = message.direction === 'user';
  return (
    <Box sx={isUser ? userBubbleStyle : agentBubbleStyle}>
      {!isUser && message.authorName && (
        <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, mb: 0.5 }}>
          {message.authorName}
        </Typography>
      )}
      <Typography variant="body2">{message.text}</Typography>
      {message.status === 'sending' && (
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}>
          {sendingLabel}
        </Typography>
      )}
      {message.status === 'failed' && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
          {failedLabel}
        </Typography>
      )}
    </Box>
  );
};

export const FrontChat = () => {
  const t = useTranslations('Messaging.frontChat');
  const { messages, connectionState, sendText, sendAttachment } = useFrontChat();
  const recorder = useVoiceRecorder();

  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    logEvent(CHAT_VIEWED);
  }, []);

  useEffect(() => {
    const node = transcriptRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages]);

  const isDisabled = connectionState !== 'connected';

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim() || isDisabled) return;
    setError(null);
    sendText(draft);
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
      setError(t('errors.unsupportedImage'));
      return;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setError(t('errors.fileTooLarge'));
      return;
    }
    setError(null);
    try {
      await sendAttachment(file, 'image', t('imageAttachment'));
    } catch {
      setError(t('errors.uploadFailed'));
    }
  };

  const handleVoiceClick = async () => {
    setError(null);
    if (recorder.state === 'recording') {
      try {
        const blob = await recorder.stop();
        if (blob.size === 0) return;
        if (blob.size > MAX_ATTACHMENT_BYTES) {
          setError(t('errors.fileTooLarge'));
          return;
        }
        await sendAttachment(blob, 'voice', t('voiceNote'));
      } catch {
        setError(t('errors.uploadFailed'));
      }
      return;
    }

    try {
      await recorder.start();
    } catch {
      setError(t('errors.micPermission'));
    }
  };

  return (
    <Stack sx={containerStyle} aria-label={t('ariaChat')}>
      {connectionState !== 'connected' && (
        <Alert
          severity={connectionState === 'error' ? 'error' : 'info'}
          icon={connectionState === 'connecting' ? <CircularProgress size={18} /> : undefined}
          sx={{ borderRadius: 0 }}
        >
          {connectionState === 'connecting' && t('status.connecting')}
          {connectionState === 'disconnected' && t('status.disconnected')}
          {connectionState === 'error' && t('status.error')}
          {connectionState === 'idle' && t('status.connecting')}
        </Alert>
      )}

      <Box ref={transcriptRef} sx={transcriptStyle} role="log" aria-live="polite">
        {messages.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ alignSelf: 'center', mt: 'auto', mb: 'auto', opacity: 0.7 }}
          >
            {t('empty')}
          </Typography>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              failedLabel={t('messageFailed')}
              sendingLabel={t('messageSending')}
            />
          ))
        )}
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: 0 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={composerStyle}>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          hidden
          onChange={handleImageSelected}
        />
        <Tooltip title={t('attachImage')}>
          <span>
            <IconButton
              aria-label={t('attachImage')}
              onClick={() => fileInputRef.current?.click()}
              disabled={isDisabled || recorder.state === 'recording'}
              size="small"
            >
              <ImageIcon />
            </IconButton>
          </span>
        </Tooltip>

        {recorder.isSupported && (
          <Tooltip
            title={recorder.state === 'recording' ? t('stopRecording') : t('startRecording')}
          >
            <span>
              <IconButton
                aria-label={
                  recorder.state === 'recording' ? t('stopRecording') : t('startRecording')
                }
                onClick={handleVoiceClick}
                disabled={isDisabled || recorder.state === 'stopping'}
                color={recorder.state === 'recording' ? 'error' : 'default'}
                size="small"
              >
                {recorder.state === 'recording' ? <StopIcon /> : <MicIcon />}
              </IconButton>
            </span>
          </Tooltip>
        )}

        <TextField
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('placeholder')}
          aria-label={t('placeholder')}
          multiline
          maxRows={4}
          fullWidth
          size="small"
          disabled={isDisabled || recorder.state === 'recording'}
          slotProps={{ htmlInput: { maxLength: 10_000 } }}
        />

        <Tooltip title={t('send')}>
          <span>
            <IconButton
              type="submit"
              aria-label={t('send')}
              disabled={isDisabled || !draft.trim() || recorder.state === 'recording'}
              color="primary"
              size="small"
            >
              <SendIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Stack>
  );
};
