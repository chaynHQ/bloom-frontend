import { type ContentType } from '@/lib/utils/libraryData';
import type { SvgIconComponent } from '@mui/icons-material';
import ArticleRounded from '@mui/icons-material/ArticleRounded';
import ExtensionRounded from '@mui/icons-material/ExtensionRounded';
import RouteRounded from '@mui/icons-material/RouteRounded';
import SmartDisplayRounded from '@mui/icons-material/SmartDisplayRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

export const CONTENT_TYPE_ICON: Record<ContentType, SvgIconComponent> = {
  course: RouteRounded,
  audio: VolumeUpRounded,
  written: ArticleRounded,
  video: SmartDisplayRounded,
  activity: ExtensionRounded,
};

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
  alignSelf: 'flex-start',
  height: 32,
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

// Courses take the peach brand tint; every content format shares the blue badge.
export function FormatBadge({ type }: { type: ContentType }) {
  const t = useTranslations('Library.contentTypes');
  const Icon = CONTENT_TYPE_ICON[type];
  const isCourse = type === 'course';

  return (
    <Box
      sx={{
        ...badgeStyle,
        backgroundColor: isCourse ? 'secondary.light' : 'badgeBlue',
        borderColor: isCourse ? 'secondary.main' : 'badgeBlueBorder',
      }}
    >
      <Icon sx={{ fontSize: 16, color: 'grey.700' }} />
      <Typography component="span" sx={labelStyle}>
        {t(type)}
      </Typography>
    </Box>
  );
}
