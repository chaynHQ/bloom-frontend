'use client';

import { CHAT_MESSAGE_COMPOSED, CHAT_VIEWED } from '@/lib/constants/events';
import logEvent from '@/lib/utils/logEvent';
import {
  Alert,
  Avatar,
  Box,
  CircularProgress,
  Divider,
  Fade,
  Stack,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { MAX_ATTACHMENT_BYTES, useMessaging } from '../../lib/hooks/useMessaging';
import { MessageComposer } from './MessageComposer';
import { MessageBubble } from './MessageBubble';

// ── Styles ────────────────────────────────────────────────────────────────────

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '540px',
  maxHeight: '72vh',
  marginBottom: 3,
  borderRadius: 1,
  border: '1.5px solid',
  borderColor: 'secondary.main',
  backgroundColor: 'common.white',
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
} as const;

const transcriptStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: 2,
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
  backgroundColor: 'common.white',
} as const;

const welcomeStyleBase = {
  display: 'flex',
  gap: 2,
  alignSelf: 'stretch',
  borderRadius: 2,
  padding: '14px 16px',
  flexShrink: 0,
} as const;

const welcomeAvatarStyle = {
  bgcolor: 'secondary.dark',
  color: 'common.white',
  width: 40,
  height: 40,
  fontSize: '1rem',
  fontWeight: 700,
  flexShrink: 0,
} as const;

// Sits just above the composer — unobtrusive, doesn't interrupt reading the chat
const connectionStatusStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 0.75,
  py: 0.75,
  flexShrink: 0,
  borderTop: '1px solid',
  borderColor: 'divider',
  backgroundColor: 'secondary.light',
} as const;

const emptyPromptStyle = {
  textAlign: 'center',
  color: 'text.secondary',
  mt: 2,
  opacity: 0.7,
} as const;

// ── Welcome message ───────────────────────────────────────────────────────────

interface WelcomeMessageProps {
  author: string;
  message: string;
  sx?: object;
}

const WelcomeMessage = ({ author, message, sx }: WelcomeMessageProps) => (
  <Box sx={{ ...welcomeStyleBase, ...sx }} role="note">
    <Avatar sx={welcomeAvatarStyle} aria-hidden="true">
      B
    </Avatar>
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
        {author}
      </Typography>
      {message.split('\n\n').map((paragraph, i) => (
        <Typography key={i} variant="body2" sx={{ lineHeight: 1.6, mt: i > 0 ? 1 : 0 }}>
          {paragraph}
        </Typography>
      ))}
    </Box>
  </Box>
);

// ── Main component ────────────────────────────────────────────────────────────

export const MessageThread = () => {
  const t = useTranslations('Messaging.frontChat');
  const theme = useTheme();
  const { messages, connectionState, sendText, sendAttachment, markAsRead } = useMessaging();
  const [error, setError] = useState<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const welcomeStyle = {
    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.light} 100%)`,
  };

  useEffect(() => {
    logEvent(CHAT_VIEWED);
    markAsRead();
  }, [markAsRead]);

  // Scroll to latest message whenever messages update
  useEffect(() => {
    const node = transcriptRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages]);

  const isDisabled = connectionState !== 'connected';

  return (
    <Stack sx={containerStyle} aria-label={t('ariaChat')}>
      {/* Message transcript */}
      <Box ref={transcriptRef} sx={transcriptStyle} role="log" aria-live="polite">
        {/* Welcome notice is always pinned at the top of the conversation */}
        <WelcomeMessage
          author={t('welcomeAuthor')}
          message={t('welcomeMessage')}
          sx={welcomeStyle}
        />

        {messages.length > 0 && <Divider sx={{ my: 0.5, opacity: 0.5 }} />}

        {messages.length === 0 ? (
          <Typography variant="body2" sx={emptyPromptStyle}>
            {t('empty')}
          </Typography>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              failedLabel={t('messageFailed')}
              sendingLabel={t('messageSending')}
            />
          ))
        )}
      </Box>

      {/* Subtle connection status — sits just above the composer, not a jarring top banner */}
      <Fade in={connectionState !== 'connected'}>
        <Box sx={connectionStatusStyle} aria-live="polite">
          {(connectionState === 'connecting' || connectionState === 'idle') && (
            <>
              <CircularProgress size={11} thickness={5} sx={{ color: 'text.disabled' }} />
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {t('status.connecting')}
              </Typography>
            </>
          )}
          {connectionState === 'disconnected' && (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {t('status.disconnected')}
            </Typography>
          )}
          {connectionState === 'error' && (
            <Typography variant="caption" color="error">
              {t('status.error')}
            </Typography>
          )}
        </Box>
      </Fade>

      {/* Inline error alert from attachment/voice operations */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ borderRadius: 0, flexShrink: 0 }}
        >
          {error}
        </Alert>
      )}

      <MessageComposer
        isDisabled={isDisabled}
        onSendText={sendText}
        onSendAttachment={sendAttachment}
        onError={setError}
        maxAttachmentBytes={MAX_ATTACHMENT_BYTES}
        onCompose={() => logEvent(CHAT_MESSAGE_COMPOSED)}
      />
    </Stack>
  );
};
