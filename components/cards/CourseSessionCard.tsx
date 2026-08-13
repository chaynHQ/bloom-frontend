'use client';

import { CardStatusBadge, type CardProgress } from '@/components/cards/CardStatusBadge';
import { Link as i18nLink } from '@/i18n/routing';
import { type CourseSession } from '@/lib/utils/courseSessions';
import { cardShadow } from '@/styles/common';
import { Box, Card, CardActionArea, Typography } from '@mui/material';
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

// The design insets the content from the top whether or not a corner badge is present, so cards
// keep a consistent height as progress and lock states come and go.
const contentStyle = {
  display: 'flex',
  flexDirection: 'column',
  p: 2,
  pt: 7,
} as const;

const descriptionStyle = {
  color: 'grey.800',
  mt: 1.5,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
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
        </Box>
      </CardActionArea>
    </Card>
  );
}
