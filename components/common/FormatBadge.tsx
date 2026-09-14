import { type ContentType } from '@/lib/utils/libraryData';
import type { SvgIconComponent } from '@mui/icons-material';
import ArticleRounded from '@mui/icons-material/ArticleRounded';
import EditNoteRounded from '@mui/icons-material/EditNoteRounded';
import RouteRounded from '@mui/icons-material/RouteRounded';
import SmartDisplayRounded from '@mui/icons-material/SmartDisplayRounded';
import SpaRounded from '@mui/icons-material/SpaRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

export const CONTENT_TYPE_ICON: Record<ContentType, SvgIconComponent> = {
  course: RouteRounded,
  audio: VolumeUpRounded,
  written: ArticleRounded,
  video: SmartDisplayRounded,
  activity: EditNoteRounded,
  grounding: SpaRounded,
};

// Courses take the peach brand tint, grounding the pink one; every other format shares the blue.
const BADGE_COLOR: Partial<Record<ContentType, { backgroundColor: string; borderColor: string }>> =
  {
    course: { backgroundColor: 'secondary.light', borderColor: 'secondary.main' },
    grounding: { backgroundColor: 'primary.light', borderColor: 'primary.main' },
  };
const DEFAULT_BADGE_COLOR = {
  backgroundColor: 'badgeBlue',
  borderColor: 'badgeBlueBorder',
} as const;

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
  alignSelf: 'flex-start',
  height: 32,
  mb: 2,
  pl: 1,
  pr: 1.5,
  borderRadius: '8px',
  border: '1px solid',
} as const;

const labelStyle = {
  fontFamily: 'headingFontFamily',
  fontSize: '0.875rem',
  fontWeight: 500,
  lineHeight: 1.4,
  color: 'grey.700',
} as const;

export function FormatBadge({ type }: { type: ContentType }) {
  const t = useTranslations('Library.contentTypes');
  const Icon = CONTENT_TYPE_ICON[type];

  return (
    <Box sx={{ ...badgeStyle, ...(BADGE_COLOR[type] ?? DEFAULT_BADGE_COLOR) }}>
      <Icon sx={{ fontSize: 16, color: 'grey.700' }} />
      <Typography component="span" sx={labelStyle}>
        {t(type)}
      </Typography>
    </Box>
  );
}
