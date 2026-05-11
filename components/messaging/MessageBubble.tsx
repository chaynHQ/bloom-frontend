'use client';

import { useTypedSelector } from '@/lib/hooks/store';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import MicIcon from '@mui/icons-material/Mic';
import { Box, CircularProgress, Link, Typography } from '@mui/material';
import { getDateLocale } from '@/lib/utils/dates';
import { format } from 'date-fns';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { ChatMessage, MessageAttachment } from './types';

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

// Multi-attachment messages stack their attachments vertically inside the bubble
// — gives each file a clear hit area without ballooning bubble width.
const attachmentsStackStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.75,
} as const;

const voiceRowStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.25,
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

// Renders a clickable filename that downloads the file when clicked. Uses the same auth-aware
// blob fetch as ImageAttachment so the bearer-protected proxy URL can be turned into a normal
// downloadable link.
const FileAttachment = ({ src, filename }: { src: string; filename: string }) => {
  const { blobUrl, loading } = useBlobUrl(src);
  if (loading) return <CircularProgress size={16} sx={{ mt: 0.5 }} />;
  if (!blobUrl) {
    return (
      <Box sx={filenameRowStyle}>
        <AttachFileIcon sx={{ fontSize: 15, flexShrink: 0, opacity: 0.7 }} aria-hidden="true" />
        <Typography variant="body2" sx={{ wordBreak: 'break-all', opacity: 0.6 }}>
          {filename}
        </Typography>
      </Box>
    );
  }
  return (
    <Box sx={filenameRowStyle}>
      <AttachFileIcon sx={{ fontSize: 15, flexShrink: 0 }} aria-hidden="true" />
      <Link
        href={blobUrl}
        download={filename}
        underline="hover"
        sx={{ wordBreak: 'break-all', fontSize: '0.875rem' }}
      >
        {filename}
      </Link>
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

interface AttachmentProps {
  attachment: MessageAttachment;
  audioUnavailableLabel: string;
  voiceFallbackLabel: string;
}

const AttachmentItem = ({
  attachment,
  audioUnavailableLabel,
  voiceFallbackLabel,
}: AttachmentProps) => {
  const { kind, name, url, previewUrl } = attachment;

  if (kind === 'image') {
    return (
      <Box>
        {previewUrl ? (
          <Box component="img" src={previewUrl} alt={name ?? ''} sx={imagePreviewStyle} />
        ) : url ? (
          <ImageAttachment src={url} alt={name ?? ''} />
        ) : null}
        {name && (
          <Box sx={filenameRowStyle}>
            <ImageIcon sx={{ fontSize: 14, flexShrink: 0, opacity: 0.7 }} aria-hidden="true" />
            <Typography variant="caption" sx={{ opacity: 0.8, wordBreak: 'break-all' }}>
              {name}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  if (kind === 'voice') {
    return (
      <Box sx={voiceRowStyle}>
        <Box sx={filenameRowStyle}>
          <MicIcon sx={{ fontSize: 15, flexShrink: 0 }} aria-hidden="true" />
          <Typography variant="body2">{name ?? voiceFallbackLabel}</Typography>
        </Box>
        {previewUrl ? (
          <Box sx={{ mt: 0.5 }}>
            <audio
              src={previewUrl}
              controls
              style={{ height: 32, maxWidth: 220, display: 'block' }}
            />
          </Box>
        ) : url ? (
          <AudioAttachment src={url} unavailableLabel={audioUnavailableLabel} />
        ) : null}
      </Box>
    );
  }

  return url ? <FileAttachment src={url} filename={name ?? 'attachment'} /> : null;
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
  const attachments = message.attachments ?? [];
  // Hide body text when it's only there to label a single attachment (the attachment
  // renders its own filename caption already). Multi-attachment bubbles always show
  // the body so a real message above several files isn't dropped.
  const singleAttachment = attachments.length === 1 ? attachments[0] : undefined;
  const textDuplicatesAttachment =
    !!singleAttachment && !!message.text && message.text === singleAttachment.name;
  const showText = !!message.text && !textDuplicatesAttachment;

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

      {showText && <Typography variant="body2">{message.text}</Typography>}

      {attachments.length > 0 && (
        <Box sx={{ ...attachmentsStackStyle, mt: showText ? 0.75 : 0 }}>
          {attachments.map((attachment, i) => (
            <AttachmentItem
              key={attachment.url ?? attachment.previewUrl ?? i}
              attachment={attachment}
              audioUnavailableLabel={t('audioUnavailable')}
              voiceFallbackLabel={t('voiceNote')}
            />
          ))}
        </Box>
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
