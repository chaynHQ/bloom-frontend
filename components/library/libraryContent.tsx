'use client';

import { Link as i18nLink } from '@/i18n/routing';
import type { SvgIconComponent } from '@mui/icons-material';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import ArticleRounded from '@mui/icons-material/ArticleRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import ExtensionRounded from '@mui/icons-material/ExtensionRounded';
import LockRounded from '@mui/icons-material/LockRounded';
import PlaylistPlayRounded from '@mui/icons-material/PlaylistPlayRounded';
import RouteRounded from '@mui/icons-material/RouteRounded';
import SmartDisplayRounded from '@mui/icons-material/SmartDisplayRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import { Box, Card, CardActionArea, Divider, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image, { type StaticImageData } from 'next/image';
import type { ReactNode } from 'react';

import { type ContentType, type LibraryItem } from './libraryData';

// Re-export the pure data/types so existing imports `from './libraryContent'` keep working.
export * from './libraryData';

// The Montserrat heading font, exposed as a CSS var by next/font (see styles/theme.ts). Used
// directly in a few places where the design calls for Montserrat on non-heading elements
// (card titles, badges, meta) that aren't MUI Typography heading variants.
export const HEADING_FONT = 'var(--font-montserrat)';

// Shared card surface tokens taken from the Figma design so every library card, the secondary
// theme card, and the theme options read as one system. In the design the content cards carry
// a soft two-layer elevation rather than a border (the secondary theme card is the exception —
// it uses the CARD_BORDER outline).
export const CARD_SURFACE = '#FFFCFA';
export const CARD_BORDER = '#EBE0E1';
export const CARD_SHADOW = '0px 1px 3px 1px rgba(0,0,0,0.08), 0px 1px 2px 0px rgba(0,0,0,0.08)';

// ---------------------------------------------------------------------------
// Content-type metadata (illustrations for the filter list and card badges). The labels are
// translated at the point of use, under `Library.contentTypes.<key>`.
// ---------------------------------------------------------------------------

// Simple glyph icons for the card badges, matching the design's session cards. A course badge
// leads with a "route" glyph — it's a guided path to follow, not a single thing to press play
// on; single sessions use their format glyph. The "playlist" glyph is reserved for the session
// count in the card meta, where it reads as "how many parts, and what they are". It deliberately
// shares a play triangle with the video format glyph so the two read as a family — "one video"
// and "several videos" — rather than as one symbol meaning two things.
export const CONTENT_TYPE_ICON: Record<ContentType, SvgIconComponent> = {
  course: RouteRounded,
  audio: VolumeUpRounded,
  written: ArticleRounded,
  video: SmartDisplayRounded,
  activity: ExtensionRounded,
};

// ---------------------------------------------------------------------------
// Card primitives
// ---------------------------------------------------------------------------

// A small pill badge (format or course) shown under a card title. Format badges use the soft
// blue from the design; a course badge uses the peach secondary so the two kinds read apart.
// Both are built the same way — a pale fill with a one-step-deeper border — so they sit as a
// pair, and both keep grey label text, which peach-on-peach couldn't carry.
function TypeBadge({ type }: { type: ContentType }) {
  const t = useTranslations('Library');
  const isCourse = type === 'course';
  const Icon = CONTENT_TYPE_ICON[type];
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        alignSelf: 'flex-start',
        height: 32,
        pl: 1,
        pr: 1.5,
        borderRadius: '8px',
        border: '1px solid',
        backgroundColor: isCourse ? 'secondary.light' : '#DFF0F5',
        borderColor: isCourse ? 'secondary.main' : '#CCE7F0',
      }}
    >
      <Icon sx={{ fontSize: 16, color: 'grey.700' }} />
      <Typography
        sx={{
          fontFamily: HEADING_FONT,
          fontSize: '0.875rem',
          fontWeight: 500,
          lineHeight: 1.4,
          color: 'grey.700',
        }}
      >
        {t(`contentTypes.${type}`)}
      </Typography>
    </Box>
  );
}

export function LibraryCard({ item }: { item: LibraryItem }) {
  const t = useTranslations('Library');
  // "Started" / "Completed" already exist as shared progress vocabulary, translated everywhere
  // the app reports course progress — the card badge says the same thing, so it says it the
  // same way rather than introducing a second set of strings to keep in sync.
  const tS = useTranslations('Shared');
  const isCourse = item.kind === 'course';
  const badgeType: ContentType = isCourse ? 'course' : (item.format ?? 'video');

  return (
    <Card
      sx={{
        m: 0,
        height: '100%',
        position: 'relative',
        borderRadius: '16px',
        boxShadow: CARD_SHADOW,
        backgroundColor: CARD_SURFACE,
        // Held transparent at rest so the hover/focus peach doesn't resize the card.
        border: '1px solid transparent',
        transition: 'border-color 150ms ease',
        '&:hover, &:focus-within': { borderColor: 'secondary.dark' },
      }}
    >
      <CardActionArea
        component={i18nLink}
        href={item.href}
        aria-label={item.title}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          backgroundColor: CARD_SURFACE,
          '&:hover': { backgroundColor: 'common.white' },
        }}
      >
        {/* Progress badge — pinned top-inline-end, mirroring the design's corner badge slot. */}
        {item.progress && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              insetInlineEnd: 0,
              zIndex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              py: 1,
              pl: 1,
              pr: 1.5,
              backgroundColor: '#FCF8F8',
              borderInlineStart: '1px solid',
              borderBottom: '1px solid',
              borderColor: CARD_BORDER,
              borderEndStartRadius: '8px',
            }}
          >
            {item.progress === 'completed' ? (
              <CheckCircleRounded sx={{ fontSize: 16, color: 'secondary.dark' }} />
            ) : (
              <LockRounded sx={{ fontSize: 14, color: 'grey.700' }} />
            )}
            <Typography
              sx={{
                fontFamily: HEADING_FONT,
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'grey.800',
              }}
            >
              {tS(`progressStatus.${item.progress}`)}
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            p: 2,
            // 56px, matching the design — a fixed top inset, not clearance for the corner badge.
            // It holds whether or not a badge is present, so cards stay aligned across the grid.
            pt: 7,
          }}
        >
          {/* Copy: theme eyebrow, title, type badge, supporting text. The eyebrow gets a hair of
              air beneath it so it reads as a label for the title rather than part of it, and the
              badge is given equal space above and below so it sits as its own band between the
              title and the description. */}
          <Typography variant="body2" sx={{ color: 'grey.800', mb: 0.5 }}>
            {item.themes.map((theme) => t(`themes.${theme}.label`)).join(' · ')}
          </Typography>
          <Typography
            sx={{
              fontFamily: HEADING_FONT,
              fontSize: '1.125rem',
              fontWeight: 500,
              lineHeight: 1.33,
              letterSpacing: '0.15px',
              mb: 1.5,
            }}
          >
            {item.title}
          </Typography>
          <TypeBadge type={badgeType} />
          <Typography
            variant="body2"
            sx={{
              color: 'grey.800',
              mt: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.description}
          </Typography>

          {/* Meta pinned to the bottom, above a divider — the line that makes course vs single
              session unmistakable. */}
          <Box sx={{ flexGrow: 1 }} />
          <Divider sx={{ my: 2, borderColor: CARD_BORDER }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isCourse ? (
              <Meta
                icon={<PlaylistPlayRounded sx={{ fontSize: 16 }} />}
                text={t('sessionCount', { count: item.sessionCount ?? 0 })}
              />
            ) : (
              item.minutes != null && (
                <Meta
                  icon={<AccessTimeRounded sx={{ fontSize: 16 }} />}
                  text={t('duration', { minutes: item.minutes })}
                />
              )
            )}
            <Box sx={{ flexGrow: 1 }} />
            <ArrowForwardRounded sx={{ fontSize: 18, color: 'secondary.dark' }} />
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
}

export function Meta({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'grey.800' }}>
      {icon}
      <Typography sx={{ fontFamily: HEADING_FONT, fontSize: '0.875rem', fontWeight: 500 }}>
        {text}
      </Typography>
    </Box>
  );
}

// Two-tone "Get support" card from the design: a light body (illustration inline with the
// title, supporting text below) and a soft-pink panel on the trailing edge holding the arrow.
export function SupportCard({
  title,
  description,
  iconSrc,
  href,
}: {
  title: string;
  description: string;
  iconSrc?: StaticImageData;
  href: string;
}) {
  return (
    <Card sx={{ m: 0, borderRadius: '16px', boxShadow: CARD_SHADOW, overflow: 'hidden' }}>
      <CardActionArea
        component={i18nLink}
        href={href}
        aria-label={title}
        sx={{
          p: 0,
          display: 'flex',
          alignItems: 'stretch',
          minHeight: { xs: 132, md: 180 },
          backgroundColor: '#FCF8F8',
          '&:hover': { backgroundColor: 'common.white' },
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 0.75,
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {iconSrc && (
              <Image src={iconSrc} alt="" width={44} height={44} style={{ objectFit: 'contain' }} />
            )}
            <Typography
              sx={{
                fontFamily: HEADING_FONT,
                fontSize: '1.125rem',
                fontWeight: 500,
                letterSpacing: '0.15px',
              }}
            >
              {title}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'grey.800' }}>
            {description}
          </Typography>
        </Box>
        <Box
          sx={{
            flexShrink: 0,
            width: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F9E2E3',
          }}
        >
          <ArrowForwardRounded sx={{ color: 'grey.700' }} />
        </Box>
      </CardActionArea>
    </Card>
  );
}
