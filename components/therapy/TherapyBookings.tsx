'use client';

import { useCancelTherapySessionMutation, useGetTherapySessionsQuery } from '@/lib/api';
import { THERAPY_BOOKING_CANCELLED, THERAPY_BOOKING_CANCELLED_ERROR } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { PartnerAccess } from '@/lib/store/partnerAccessSlice';
import { TherapySession } from '@/lib/store/therapySessionsSlice';
import { getDateLocale } from '@/lib/utils/dates';
import logEvent from '@/lib/utils/logEvent';
import { rowStyle } from '@/styles/common';
import { CalendarMonth, Cancel, EventAvailable, ExpandMore } from '@mui/icons-material';
import {
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { differenceInDays, format, formatRelative } from 'date-fns';
import { useLocale, useTranslations } from 'next-intl';
import React, { useMemo, useState } from 'react';

type SessionStatus = 'upcoming' | 'past' | 'cancelled';

// Helper function to determine the status of a session
const determineSessionStatus = (session: TherapySession, now: Date): SessionStatus => {
  if (session.cancelledAt) {
    return 'cancelled';
  }
  if (new Date(session.startDateTime || 0) > now) {
    return 'upcoming';
  }
  return 'past';
};
interface BookingItemProps {
  session: TherapySession;
}

function BookingItem(props: BookingItemProps) {
  const { session } = props;
  const t = useTranslations('Therapy.bookingItem');
  const currentLocaleString = useLocale();
  const dateLocale = getDateLocale(currentLocaleString);
  const rollbar = useRollbar();
  const [error, setError] = useState<string | null>(null);

  const [cancelTherapySession] = useCancelTherapySessionMutation();

  const now = new Date();

  const [isExpanded, setIsExpanded] = useState(false);

  const status = determineSessionStatus(session, now);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCancelClick = async (event: React.MouseEvent) => {
    event.stopPropagation();

    const cancelTherapySessionResponse = await cancelTherapySession({
      id: session.id,
    });
    if (cancelTherapySessionResponse.data) {
      logEvent(THERAPY_BOOKING_CANCELLED);
      window.scrollTo(0, 0);
    }

    if (cancelTherapySessionResponse.error) {
      const error = cancelTherapySessionResponse.error;

      logEvent(THERAPY_BOOKING_CANCELLED_ERROR);
      rollbar.error('Resource complete error', error);

      setError(t('cancelError'));
    }
  };

  const startDateTime = new Date(session.startDateTime || 0);
  const endDateTime = new Date(session.endDateTime || 0);

  const isValidStartDate = startDateTime instanceof Date && !isNaN(startDateTime.getTime());
  const isValidEndDate = endDateTime instanceof Date && !isNaN(endDateTime.getTime());

  const formattedDateDetails = isValidStartDate
    ? format(startDateTime || 'NA', 'EEEE do MMMM', { locale: dateLocale })
    : t('invalidDate');
  const formattedStartTime = isValidStartDate
    ? format(startDateTime || 'NA', 'p', { locale: dateLocale })
    : '--:--';
  const formattedEndTime = isValidEndDate
    ? format(endDateTime || 'NA', 'p', { locale: dateLocale })
    : '--:--';
  const formattedDateTitle = isValidStartDate
    ? format(startDateTime || 'NA', 'do MMMM', { locale: dateLocale })
    : t('invalidDate');
  const formattedDateTimeTitle = isValidStartDate
    ? differenceInDays(startDateTime, now) > 6
      ? format(startDateTime || 'NA', 'do MMMM', { locale: dateLocale })
      : formatRelative(startDateTime || 'NA', now, { locale: dateLocale })
    : '';

  let titleText = '';
  let IconComponent = EventAvailable;

  switch (status) {
    case 'upcoming':
      titleText = t('upcomingSessionTitle', { relativeTime: formattedDateTimeTitle });
      IconComponent = CalendarMonth;
      break;
    case 'cancelled':
      titleText = t('cancelledSessionTitle', { date: formattedDateTitle });
      IconComponent = Cancel;
      break;
    case 'past':
    default:
      titleText = t('pastSessionTitle', { date: formattedDateTitle });
      IconComponent = EventAvailable;
      break;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: 'background.default',
        mb: 1.5,
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: '12px 16px',
        }}
        aria-expanded={isExpanded}
        aria-controls={`booking-details-${session.id}`}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconComponent
            sx={{ color: status === 'cancelled' ? 'action.disabled' : 'secondary.dark' }}
          />
          <Typography component="div" fontWeight="medium">
            {titleText}
          </Typography>
        </Box>
        <IconButton
          onClick={handleToggleExpand}
          size="small"
          aria-label={isExpanded ? t('collapse') : t('expand')}
        >
          <ExpandMore
            sx={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s',
              color: 'action.active',
            }}
          />
        </IconButton>
      </Box>

      {/* Details Section (Collapsible) */}
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Divider />
        <Box sx={{ p: '16px 20px', pt: 2, textAlign: 'left' }}>
          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>{t('dateLabel')}:</strong> {formattedDateDetails}
            </Typography>
            <Typography variant="body2">
              <strong>{t('timeLabel')}:</strong> {formattedStartTime} - {formattedEndTime}
            </Typography>
            <Typography variant="body2">
              <strong>{t('therapistLabel')}:</strong>{' '}
              {session.serviceProviderName || t('notAssigned')}
            </Typography>
            <Typography variant="body2">
              <strong>{t('videoLinkLabel')}:</strong> {t('videoLink')}
            </Typography>
            {status === 'upcoming' && (
              <Box sx={{ ...rowStyle, justifyContent: 'flex-end', gap: 2, pt: 1 }}>
                {error && (
                  <Typography color="error.main" mb={2}>
                    {error}
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={handleCancelClick}
                  disabled={!session.id}
                >
                  {t('cancelButton')}
                </Button>
              </Box>
            )}
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
}

interface TherapyBookingsProps {
  partnerAccess: PartnerAccess;
}

export default function TherapyBookings(props: TherapyBookingsProps) {
  const { partnerAccess } = props;

  const t = useTranslations('Therapy.therapyBookings');
  const now = new Date();
  const sessions = useTypedSelector((state) => state.therapySessions);
  const userId = useTypedSelector((state) => state.user.id);
  const isLoggedIn = Boolean(userId);

  useGetTherapySessionsQuery(undefined, {
    skip: !isLoggedIn,
  });

  // Memoize the sorted bookings to avoid recalculation on every render
  const { sortedBookings, totalUpcomingSessions } = useMemo(() => {
    if (!sessions) return { sortedBookings: [], totalUpcomingSessions: 0 };

    const enrichedSessions = sessions.map((session) => ({
      ...session,
      // Pre-calculate status for sorting and filtering
      status: determineSessionStatus(session, now),
    }));

    const sorted = [...enrichedSessions].sort((a, b) => {
      // Group by status: upcoming -> past -> cancelled
      const statusOrder = { upcoming: 1, past: 2, cancelled: 3 };
      const statusComparison = statusOrder[a.status] - statusOrder[b.status];
      if (statusComparison !== 0) return statusComparison;

      // Within the same status group, sort by start date
      const dateA = new Date(a.startDateTime || 0).getTime();
      const dateB = new Date(b.startDateTime || 0).getTime();

      // Handle invalid dates (treat as earliest or latest depending on preference)
      if (dateA === 0 && dateB === 0) return 0;
      if (dateA === 0) return 1; // Put sessions with invalid dates last within group
      if (dateB === 0) return -1; // Put sessions with invalid dates last within group

      if (a.status === 'upcoming') {
        return dateA - dateB; // Earliest upcoming first
      } else {
        // Past and Cancelled: Most recent start date first
        return dateB - dateA;
      }
    });

    const upcomingCount = sorted.filter((s) => s.status === 'upcoming').length;

    return { sortedBookings: sorted, totalUpcomingSessions: upcomingCount };
  }, [sessions, now]);

  return (
    <Box sx={{ maxWidth: '660px' }}>
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

      {sortedBookings.length > 0 ? (
        sortedBookings.map((session) => (
          <BookingItem key={session.id || `session-${Math.random()}`} session={session} />
        ))
      ) : (
        <Typography>{t('noBookings')}</Typography>
      )}
    </Box>
  );
}
