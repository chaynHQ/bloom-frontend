'use client';

import { useTypedSelector } from '@/lib/hooks/store';
import ImageIcon from '@mui/icons-material/Image';
import MicIcon from '@mui/icons-material/Mic';
import { Box, CircularProgress, Typography } from '@mui/material';
import { getDateLocale } from '@/lib/utils/dates';
import { format } from 'date-fns';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { ChatMessage } from './types';

const imagePreviewStyle = {
  display: 'block',
  maxWidth: '100%',
  maxHeight: 120,
  borderRadius: 1,
  mb: 0.75,
  objectFit: 'contain',
} as const;

const bubbleBaseStyle = {
  padding: '10px 14px',
  borderRadius: '14px',
  maxWidth: '80%',
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
} as const;

// secondary.main (#FFBFA4) is the warm peach — readable against white, clearly "sent"
const userBubbleStyle = {
  ...bubbleBaseStyle,
  alignSelf: 'flex-end',
  backgroundColor: 'secondary.main',
  borderBottomRightRadius: '4px',
} as const;

// secondary.light (#FFEAE1) with a secondary.main border — visually paired with user bubbles
const agentBubbleStyle = {
  ...bubbleBaseStyle,
  alignSelf: 'flex-start',
  backgroundColor: 'secondary.light',
  border: '1px solid',
  borderColor: 'secondary.main',
  borderBottomLeftRadius: '4px',
} as const;

const metaRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  mt: 0.5,
  justifyContent: 'flex-end',
} as const;

const filenameRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
} as const;

const useBlobUrl = (src: string) => {
  const token = useTypedSelector((state) => state.user.token);
  const [blobUrl, setBlobUrl] = useState<string>();
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    let objectUrl = '';

    fetch(src, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        setBlobUrl(undefined);
        setLoading(true);
      }
    };
  }, [src, token]);

  return { blobUrl, loading };
};

const ImageAttachment = ({ src, alt }: { src: string; alt: string }) => {
  const { blobUrl, loading } = useBlobUrl(src);
  if (loading) return <CircularProgress size={20} />;
  if (!blobUrl) return <ImageIcon sx={{ fontSize: 32, opacity: 0.5 }} aria-hidden="true" />;
  return (
    <Box
      component="a"
      href={blobUrl}
      download={alt || 'image'}
      sx={{ display: 'block', lineHeight: 0 }}
    >
      <Box component="img" src={blobUrl} alt={alt} sx={imagePreviewStyle} />
    </Box>
  );
};

const AudioAttachment = ({ src, unavailableLabel }: { src: string; unavailableLabel: string }) => {
  const { blobUrl, loading } = useBlobUrl(src);

  if (loading) return <CircularProgress size={16} sx={{ mt: 0.5 }} />;
  if (!blobUrl)
    return (
      <Typography variant="caption" sx={{ opacity: 0.5, mt: 0.5, display: 'block' }}>
        {unavailableLabel}
      </Typography>
    );
  return (
    <Box sx={{ mt: 0.5 }}>
      <audio src={blobUrl} controls style={{ height: 32, maxWidth: 220, display: 'block' }} />
    </Box>
  );
};

interface Props {
  message: ChatMessage;
  failedLabel: string;
  sendingLabel: string;
}

export const MessageBubble = ({ message, failedLabel, sendingLabel }: Props) => {
  const t = useTranslations('Messaging.frontChat');
  const locale = useLocale();
  const isUser = message.direction === 'user';

  return (
    <Box sx={isUser ? userBubbleStyle : agentBubbleStyle}>
      {!isUser && message.authorName && (
        <Typography
          variant="caption"
          sx={{ display: 'block', fontWeight: 700, mb: 0.5, opacity: 0.75 }}
        >
          {message.authorName}
        </Typography>
      )}

      {message.kind === 'image' ? (
        <>
          {message.previewUrl ? (
            <Box
              component="img"
              src={message.previewUrl}
              alt={message.text ?? ''}
              sx={imagePreviewStyle}
            />
          ) : message.attachmentUrl ? (
            <ImageAttachment src={message.attachmentUrl} alt={message.text ?? ''} />
          ) : null}
          <Box sx={filenameRowStyle}>
            <ImageIcon sx={{ fontSize: 14, flexShrink: 0, opacity: 0.7 }} aria-hidden="true" />
            <Typography variant="caption" sx={{ opacity: 0.8, wordBreak: 'break-all' }}>
              {message.text}
            </Typography>
          </Box>
        </>
      ) : message.kind === 'voice' ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          <Box sx={filenameRowStyle}>
            <MicIcon sx={{ fontSize: 15, flexShrink: 0 }} aria-hidden="true" />
            <Typography variant="body2">{message.text}</Typography>
          </Box>
          {message.attachmentUrl && (
            <AudioAttachment src={message.attachmentUrl} unavailableLabel={t('audioUnavailable')} />
          )}
        </Box>
      ) : (
        <Typography variant="body2">{message.text}</Typography>
      )}

      <Box sx={metaRowStyle}>
        <Typography variant="caption" sx={{ opacity: 0.55, fontSize: '0.7rem' }}>
          {format(new Date(message.createdAt), 'p', { locale: getDateLocale(locale) })}
        </Typography>
        {message.status === 'sending' && (
          <Typography variant="caption" sx={{ opacity: 0.65, fontSize: '0.7rem' }}>
            · {sendingLabel}
          </Typography>
        )}
        {message.status === 'failed' && (
          <Typography variant="caption" color="error" sx={{ fontSize: '0.7rem' }}>
            · {failedLabel}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
