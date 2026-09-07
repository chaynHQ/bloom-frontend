'use client';

import { AvatarGroup, type Avatar } from '@/components/common/AvatarGroup';
import { FormatBadge } from '@/components/common/FormatBadge';
import { TranscriptAccordion } from '@/components/common/TranscriptAccordion';
import { type ContentType } from '@/lib/utils/libraryData';
import { RichTextOptions } from '@/lib/utils/richText';
import LockOutlined from '@mui/icons-material/LockOutlined';
import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { type ReactNode } from 'react';
import { render, type StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

const cardStyle = {
  display: 'flex',
  flexDirection: 'column',
  p: 2,
  borderRadius: '16px',
  border: '1px solid',
  borderColor: 'cardBorder',
  backgroundColor: 'cardSurface',
} as const;

// FormatBadge carries its own bottom spacing; the row only needs a gap between the two badges.
const badgeRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  gap: 1,
} as const;

const accountNeededBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
  height: 32,
  pl: 1,
  pr: 1.5,
  borderRadius: '8px',
  border: '1px solid',
  borderColor: 'cardBorder',
  backgroundColor: 'panelSurface',
} as const;

const accountNeededLabelStyle = {
  fontFamily: 'headingFontFamily',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'grey.700',
} as const;

const bodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
} as const;

const contributorRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  py: 1,
  borderTop: '1px solid',
  borderBottom: '1px solid',
  borderColor: 'cardBorder',
} as const;

const captionStyle = { fontStyle: 'italic', color: 'grey.700' } as const;

interface ResourceMediaCardProps {
  format: ContentType;
  name: string;
  description: string | StoryblokRichtext;
  media?: ReactNode;
  transcript?: StoryblokRichtext;
  contributors?: { avatars: Avatar[]; caption: string };
  onTranscriptToggle?: (open: boolean) => void;
  // Signed-out preview of login-gated content: flags that the full resource needs an account.
  accountNeeded?: boolean;
}

export const ResourceMediaCard = ({
  format,
  name,
  description,
  media,
  transcript,
  contributors,
  onTranscriptToggle,
  accountNeeded,
}: ResourceMediaCardProps) => {
  const t = useTranslations('Library');

  return (
    <Box qa-id="resource-media-card" sx={cardStyle}>
      <Box sx={badgeRowStyle}>
        <FormatBadge type={format} />
        {accountNeeded && (
          <Box qa-id="resource-media-card-account-needed" sx={accountNeededBadgeStyle}>
            <LockOutlined sx={{ fontSize: 14, color: 'grey.700' }} />
            <Typography component="span" sx={accountNeededLabelStyle}>
              {t('accountNeeded')}
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={bodyStyle}>
        {typeof description === 'string' ? (
          <Typography>{description}</Typography>
        ) : (
          <Box>{render(description, RichTextOptions)}</Box>
        )}

        {contributors && contributors.avatars.length > 0 && (
          <Box sx={contributorRowStyle}>
            <AvatarGroup
              avatars={contributors.avatars}
              size="xsmall"
              bordered={false}
              frontAvatar="last"
            />
            <Typography sx={captionStyle}>{contributors.caption}</Typography>
          </Box>
        )}

        {media}

        {transcript && (
          <TranscriptAccordion
            content={transcript}
            name={name}
            mediaType={format === 'audio' ? 'audio' : 'video'}
            onToggle={onTranscriptToggle}
          />
        )}
      </Box>
    </Box>
  );
};
