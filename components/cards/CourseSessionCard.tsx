'use client';

import { CardStatusBadge, type CardProgress } from '@/components/cards/CardStatusBadge';
import { Link as i18nLink } from '@/i18n/routing';
import { type CourseSession } from '@/lib/utils/courseSessions';
import { cardShadow } from '@/styles/common';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import { Box, Card, CardActionArea, Divider, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

const cardStyle = {
  m: 0,
  flex: 1,
  minWidth: 0,
  position: 'relative',
  borderRadius: '16px',
  boxShadow: cardShadow,
  backgroundColor: 'cardSurface',
  border: '1px solid transparent',
  transition: 'border-color 150ms ease',
  '&:hover, &:focus-within': { borderColor: 'secondary.dark' },
} as const;

const actionAreaStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  backgroundColor: 'cardSurface',
  '&:hover': { backgroundColor: 'common.white' },
} as const;

// Top inset leaves room for the notched corner badge so it never overlaps the title.
const contentStyle = {
  display: 'flex',
  flexDirection: 'column',
  px: 2,
  pt: 5,
  pb: 2,
} as const;

const descriptionStyle = {
  color: 'grey.800',
  mt: 1.5,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
} as const;

// The duration sits in a footer set off from the copy by a hairline, as designed.
const metaDividerStyle = { mt: 2, borderColor: 'cardBorder' } as const;

const metaStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  mt: 2,
  color: 'grey.800',
} as const;

interface CourseSessionCardProps {
  session: CourseSession;
  progress?: CardProgress;
  accountNeeded?: boolean;
  onSelect?: () => void;
}

export function CourseSessionCard({
  session,
  progress,
  accountNeeded,
  onSelect,
}: CourseSessionCardProps) {
  const t = useTranslations('Courses');
  const tL = useTranslations('Library');

  return (
    <Card qa-id="course-session-card" sx={cardStyle}>
      <CardActionArea
        component={i18nLink}
        href={session.href}
        aria-label={`${t('navigateToSession')} ${session.name}`}
        onClick={onSelect}
        sx={actionAreaStyle}
      >
        <CardStatusBadge
          qaId="course-session-card"
          progress={progress}
          accountNeeded={accountNeeded}
        />

        <Box sx={contentStyle}>
          <Typography variant="h4" component="h3" sx={{ mb: 0.5 }}>
            {session.name}
          </Typography>
          {session.description && (
            <Typography variant="body2" sx={descriptionStyle}>
              {session.description}
            </Typography>
          )}
          {session.minutes != null && (
            <>
              <Divider sx={metaDividerStyle} />
              <Box sx={metaStyle}>
                <AccessTimeRounded sx={{ fontSize: 16 }} />
                <Typography variant="body2" component="span">
                  {tL('duration', { minutes: session.minutes })}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </CardActionArea>
    </Card>
  );
}
