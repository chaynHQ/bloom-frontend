'use client';

import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import AutoStoriesRounded from '@mui/icons-material/AutoStoriesRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import LayersRounded from '@mui/icons-material/LayersRounded';
import { Box, Card, CardActionArea, Chip, Divider, Typography } from '@mui/material';
import Image, { type StaticImageData } from 'next/image';
import type { ReactNode } from 'react';

import activitiesIcon from '@/public/activities_icon.svg';
import chatIcon from '@/public/chat_icon.svg';
import courseIcon from '@/public/course_icon.svg';
import notesFromBloomIcon from '@/public/notes_from_bloom_icon.svg';
import { THEME_LABEL, type Format, type LibraryItem } from './libraryData';

// Re-export the pure data/types so existing imports `from './libraryContent'` keep working.
export * from './libraryData';

// ---------------------------------------------------------------------------
// Format metadata (carries icon assets, so it must live in this client module)
// ---------------------------------------------------------------------------

export interface FormatMeta {
  key: Format;
  label: string;
  iconSrc: StaticImageData;
}

// Placeholder mapping to EXISTING app assets by nearest concept (no audio/video/written
// icons exist yet): audio→conversations (chat), video→course, written→notes, activity→activities.
export const FORMATS: FormatMeta[] = [
  { key: 'audio', label: 'Audio', iconSrc: chatIcon },
  { key: 'written', label: 'Written', iconSrc: notesFromBloomIcon },
  { key: 'video', label: 'Video', iconSrc: courseIcon },
  { key: 'activity', label: 'Activity', iconSrc: activitiesIcon },
];

export const FORMAT_META: Record<Format, FormatMeta> = Object.fromEntries(
  FORMATS.map((f) => [f.key, f]),
) as Record<Format, FormatMeta>;

// ---------------------------------------------------------------------------
// Card primitives
// ---------------------------------------------------------------------------

export function LibraryCard({ item }: { item: LibraryItem }) {
  const isCourse = item.kind === 'course';

  return (
    <Box sx={{ position: 'relative', pt: isCourse ? '8px' : 0, height: '100%' }}>
      {/* Stacked "peek" behind course cards — a visual cue that a course holds multiple parts. */}
      {isCourse && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            insetInline: '10px',
            height: 16,
            borderRadius: '12px 12px 0 0',
            backgroundColor: 'primary.light',
            boxShadow: '0px 1px 2px rgba(0,0,0,0.12)',
          }}
        />
      )}
      <Card
        sx={{
          m: 0,
          position: 'relative',
          height: '100%',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'common.white',
          border: '1px solid',
          borderColor: 'rgba(0,0,0,0.06)',
        }}
      >
        <CardActionArea
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            backgroundColor: 'common.white',
          }}
        >
          {/* Thumbnail band — a soft tint with a single simple icon (no busy circle scene). */}
          <Box
            sx={{
              position: 'relative',
              height: 84,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isCourse ? 'primary.light' : 'secondary.light',
            }}
          >
            <Image
              src={isCourse ? courseIcon : FORMAT_META[item.format!].iconSrc}
              alt=""
              width={48}
              height={48}
              style={{ objectFit: 'contain' }}
            />
            <Chip
              size="small"
              icon={isCourse ? <LayersRounded sx={{ fontSize: 16 }} /> : undefined}
              label={isCourse ? 'Course' : FORMAT_META[item.format!].label}
              sx={{
                position: 'absolute',
                top: 8,
                insetInlineStart: 8,
                fontWeight: 600,
                backgroundColor: isCourse ? 'primary.dark' : 'common.white',
                color: isCourse ? 'common.white' : 'text.primary',
                '& .MuiChip-icon': { color: 'common.white' },
              }}
            />
            {item.progress && (
              <Chip
                size="small"
                icon={
                  item.progress === 'completed' ? (
                    <CheckCircleRounded sx={{ fontSize: 16 }} />
                  ) : undefined
                }
                label={item.progress === 'completed' ? 'Completed' : 'Started'}
                sx={{
                  position: 'absolute',
                  top: 8,
                  insetInlineEnd: 8,
                  backgroundColor: 'common.white',
                  fontWeight: 600,
                }}
              />
            )}
          </Box>

          {/* Body */}
          <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <Typography
              variant="caption"
              sx={{
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                color: 'secondary.dark',
                fontWeight: 600,
              }}
            >
              {THEME_LABEL[item.theme]}
            </Typography>
            <Typography
              sx={{ fontWeight: 500, fontSize: '1.0625rem', mt: 0.5, mb: 1, lineHeight: 1.3 }}
            >
              {item.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'grey.700',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {item.description}
            </Typography>

            <Box sx={{ flexGrow: 1 }} />
            <Divider sx={{ my: 1.5 }} />

            {/* Meta — the line that makes "course vs single session" unmistakable */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isCourse ? (
                <>
                  <Meta
                    icon={<AutoStoriesRounded sx={{ fontSize: 16 }} />}
                    text={`${item.sessionCount} sessions`}
                  />
                  <Meta
                    icon={<AccessTimeRounded sx={{ fontSize: 16 }} />}
                    text={item.totalLength!}
                  />
                </>
              ) : (
                <Meta
                  icon={<AccessTimeRounded sx={{ fontSize: 16 }} />}
                  text={`${item.minutes} min`}
                />
              )}
              <Box sx={{ flexGrow: 1 }} />
              <ArrowForwardRounded sx={{ fontSize: 18, color: 'primary.dark' }} />
            </Box>
          </Box>
        </CardActionArea>
      </Card>
    </Box>
  );
}

export function Meta({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'grey.800' }}>
      {icon}
      <Typography variant="body2">{text}</Typography>
    </Box>
  );
}

export function SupportCard({
  title,
  description,
  iconSrc,
}: {
  title: string;
  description: string;
  iconSrc?: StaticImageData;
}) {
  return (
    <Card
      sx={{
        m: 0,
        borderRadius: '12px',
        backgroundColor: 'common.white',
        border: '1px solid',
        borderColor: 'rgba(0,0,0,0.06)',
      }}
    >
      <CardActionArea
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          backgroundColor: 'common.white',
        }}
      >
        {iconSrc && (
          <Image src={iconSrc} alt="" width={44} height={44} style={{ objectFit: 'contain' }} />
        )}
        <Box sx={{ flexGrow: 1 }}>
          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>{title}</Typography>
          <Typography variant="body2" sx={{ color: 'grey.700' }}>
            {description}
          </Typography>
        </Box>
        <ArrowForwardRounded sx={{ color: 'primary.dark' }} />
      </CardActionArea>
    </Card>
  );
}
