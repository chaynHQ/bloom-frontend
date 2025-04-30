'use client';

import { useGetTherapySessionsQuery } from '@/lib/api';
import { THERAPY_BOOKINGS_LOAD_ERROR, THERAPY_BOOKINGS_VIEWED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { PartnerAccess } from '@/lib/store/partnerAccessSlice';
import { sortTherapyBookings } from '@/lib/utils/getTherapySessions';
import logEvent from '@/lib/utils/logEvent';
import { Alert, Box, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';
import TherapyBookingItem from './TherapyBookingItem';

interface TherapyBookingsProps {
  partnerAccess: PartnerAccess;
}

const containerStyle = {
  maxWidth: '660px',
  width: '100%',
} as const;

const loadingContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  p: 4,
} as const;

const noBookingsPaperStyle = {
  p: 3,
  textAlign: 'center',
  backgroundColor: 'background.default',
  borderRadius: '12px',
} as const;

export default function TherapyBookings({ partnerAccess }: TherapyBookingsProps) {
  const t = useTranslations('Therapy.therapyBookings');
  const rollbar = useRollbar();

  const { isLoading, isError, error: loadError } = useGetTherapySessionsQuery();

  const userId = useTypedSelector((state) => state.user.id);
  const sessions = useTypedSelector((state) => state.therapySessions);

  const isLoggedIn = Boolean(userId);

  useEffect(() => {
    if (isLoggedIn && !isLoading && !isError && sessions) {
      logEvent(THERAPY_BOOKINGS_VIEWED, { count: sessions.length });
    }
  }, [isLoggedIn, isLoading, isError, sessions]);

  useEffect(() => {
    if (isError && loadError) {
      logEvent(THERAPY_BOOKINGS_LOAD_ERROR, { error: loadError });
      rollbar.error('Error loading therapy sessions', loadError);
    }
  }, [isError, loadError, rollbar]);

  const { sortedBookings, totalUpcomingSessions } = useMemo(() => {
    if (!sessions) return { sortedBookings: [], totalUpcomingSessions: 0 };

    const now = new Date();
    const { sorted, upcomingCount } = sortTherapyBookings(sessions, now);
    return { sortedBookings: sorted, totalUpcomingSessions: upcomingCount };
  }, [sessions]);

  return (
    <Box sx={containerStyle}>
      <Typography variant="h2" component="h2" gutterBottom>
        {t('header')}
      </Typography>
      <Typography mb={'2rem !important'}>
        {partnerAccess.therapySessionsRemaining > 0
          ? t.rich('bookingSummary', {
              remainingTotal: () => (
                <strong id="therapy-sessions-remaining">
                  {partnerAccess.therapySessionsRemaining}
                </strong>
              ),
              upcomingTotal: () => (
                <strong id="therapy-sessions-upcoming">{totalUpcomingSessions}</strong>
              ),
            })
          : t('noBookingSummary')}
      </Typography>
      {isLoading && (
        <Box sx={loadingContainerStyle}>
          <CircularProgress />
        </Box>
      )}

      {isError && !isLoading && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {t('loadError')}
        </Alert>
      )}

      {!isLoading && !isError && sortedBookings.length === 0 && (
        <Paper elevation={0} sx={noBookingsPaperStyle}>
          <Typography>{t('noBookings')}</Typography>
        </Paper>
      )}

      {!isLoading && !isError && sortedBookings.length > 0 && (
        <Stack spacing={0}>
          {sortedBookings.map((session) => (
            <TherapyBookingItem key={session.id} session={session} />
          ))}
        </Stack>
      )}
    </Box>
  );
}
