import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { type ContentType } from '@/lib/utils/libraryData';
import { BADGE_BLUE, BADGE_BLUE_BORDER, CONTENT_TYPE_ICON, HEADING_FONT } from './libraryTokens';

// A small pill badge (format or course) shown under a card title. Format badges use the soft blue
// from the design; a course badge uses the peach secondary so the two kinds read apart. Both keep
// grey label text, which peach-on-peach couldn't carry.
export function TypeBadge({ type }: { type: ContentType }) {
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
        backgroundColor: isCourse ? 'secondary.light' : BADGE_BLUE,
        borderColor: isCourse ? 'secondary.main' : BADGE_BLUE_BORDER,
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
