'use client';

import { type CardProgress } from '@/components/cards/CardStatusBadge';
import { CourseSessionCard } from '@/components/cards/CourseSessionCard';
import { type CourseSession } from '@/lib/utils/courseSessions';
import { Box, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'secondary.light',
} as const;

const listStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  mt: 4,
  maxWidth: { md: 504 }, // 40px marker + 16px gap + a 448px card, as designed
} as const;

const itemStyle = { display: 'flex', gap: 2, alignItems: 'stretch' } as const;

// The marker column draws the timeline: a numbered disc with a connector running down to the
// next session. The last item's connector is suppressed so the line ends with the course.
const markerColumnStyle = { position: 'relative', flexShrink: 0, width: 40 } as const;

const discStyle = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: 'primary.dark',
  color: 'common.white',
  fontFamily: 'headingFontFamily',
  fontSize: '1.375rem',
  fontWeight: 500,
} as const;

const connectorStyle = {
  position: 'absolute',
  top: 40,
  bottom: -24, // spans the list gap into the next item
  insetInlineStart: '50%',
  width: '1px',
  backgroundColor: 'sectionBorder',
} as const;

interface CourseSessionListProps {
  sessions: CourseSession[];
  progressByUuid: Record<string, CardProgress>;
  accountNeeded: boolean;
  onSessionSelect: (session: CourseSession) => void;
}

export function CourseSessionList({
  sessions,
  progressByUuid,
  accountNeeded,
  onSessionSelect,
}: CourseSessionListProps) {
  const t = useTranslations('Courses');
  const tL = useTranslations('Library');

  if (sessions.length === 0) return null;

  return (
    <Container qa-id="course-sessions" sx={containerStyle}>
      <Typography variant="h2" component="h2" sx={{ mb: 0.5 }}>
        {t('courseDetail.sessionsTitle')}
      </Typography>
      <Typography variant="body2" sx={{ color: 'grey.800' }}>
        {tL('sessionCount', { count: sessions.length })}
      </Typography>

      <Box component="ol" sx={{ ...listStyle, listStyle: 'none', p: 0 }}>
        {sessions.map((session, index) => (
          <Box component="li" key={session.uuid} sx={itemStyle}>
            <Box sx={markerColumnStyle}>
              <Box aria-hidden sx={discStyle}>
                {session.position}
              </Box>
              {index < sessions.length - 1 && <Box sx={connectorStyle} />}
            </Box>
            <CourseSessionCard
              session={session}
              progress={progressByUuid[session.uuid]}
              accountNeeded={accountNeeded}
              onSelect={() => onSessionSelect(session)}
            />
          </Box>
        ))}
      </Box>
    </Container>
  );
}
