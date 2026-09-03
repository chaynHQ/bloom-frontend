'use client';

import { AvatarGroup, type Avatar } from '@/components/common/AvatarGroup';
import { FormatBadge } from '@/components/common/FormatBadge';
import { TranscriptAccordion } from '@/components/common/TranscriptAccordion';
import { type ContentType } from '@/lib/utils/libraryData';
import { RichTextOptions } from '@/lib/utils/richText';
import { Box, Typography } from '@mui/material';
import { type ReactNode } from 'react';
import { render, type StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

const cardStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  p: 2,
  borderRadius: '16px',
  border: '1px solid',
  borderColor: 'cardBorder',
  backgroundColor: 'cardSurface',
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
  title: string;
  name: string;
  description: string | StoryblokRichtext;
  media: ReactNode;
  transcript?: StoryblokRichtext;
  contributors?: { avatars: Avatar[]; caption: string };
  onTranscriptToggle?: (open: boolean) => void;
}

export const ResourceMediaCard = ({
  format,
  title,
  name,
  description,
  media,
  transcript,
  contributors,
  onTranscriptToggle,
}: ResourceMediaCardProps) => {
  return (
    <Box qa-id="resource-media-card" sx={cardStyle}>
      <FormatBadge type={format} />
      <Typography variant="h3" component="h2" sx={{ mb: 0 }}>
        {title}
      </Typography>
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
        <TranscriptAccordion content={transcript} name={name} onToggle={onTranscriptToggle} />
      )}
    </Box>
  );
};
