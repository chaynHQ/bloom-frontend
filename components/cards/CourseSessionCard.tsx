'use client';

import { CardStatusBadge, type CardProgress } from '@/components/cards/CardStatusBadge';
import { FormatBadge } from '@/components/common/FormatBadge';
import { Link as i18nLink } from '@/i18n/routing';
import { type CourseSession } from '@/lib/utils/courseSessions';
import { interactiveCardStyle } from '@/styles/common';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import { Box, Card, CardActionArea, Divider, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

const cardStyle = {
  ...interactiveCardStyle,
  m: 0,
  flex: 1,
  minWidth: 0,
  position: 'relative',
  borderRadius: '16px',
  backgroundColor: 'cardSurface',
} as const;

const actionAreaStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  backgroundColor: 'cardSurface',
} as const;

// Top inset leaves room for the notched corner badge so it never overlaps the title.
const contentStyle = {
  display: 'flex',
  flexDirection: 'column',
  px: 2,
  pt: 6,
  pb: 2,
} as const;

const descriptionStyle = {
  color: 'grey.800',
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

        {/* Without a duration footer the copy takes extra bottom padding so the card stays balanced. */}
        <Box sx={{ ...contentStyle, pb: session.minutes != null ? 2 : 4 }}>
          <Typography variant="h4" component="h3" sx={{ mb: 1 }}>
            {session.name}
          </Typography>
          {session.hasVideo && <FormatBadge type="video" />}
          {session.description && (
            <Typography variant="body2" sx={{ ...descriptionStyle, mt: session.hasVideo ? 0 : 1 }}>
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
