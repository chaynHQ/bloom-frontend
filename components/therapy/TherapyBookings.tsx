'use client';

import { SIMPLYBOOK_ACTION_ENUM } from '@/lib/constants/enums';
import { TherapySession } from '@/lib/store/therapySessionsSlice';
import { getDateLocale } from '@/lib/utils/dates';
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
import { format, formatRelative } from 'date-fns';
import { useLocale, useTranslations } from 'next-intl';
import React, { useMemo, useState } from 'react';

type SessionStatus = 'upcoming' | 'past' | 'cancelled';

const mockBookings: TherapySession[] = [
  {
    id: '1',
    serviceName: 'Therapy Session',
    serviceProviderName: 'Paola',
    startDateDime: new Date('2025-04-24T17:00:00+01:00'),
    endDateDime: new Date('2025-04-24T18:00:00+01:00'),
    clientTimezone: 'Europe/London',
    action: SIMPLYBOOK_ACTION_ENUM.NEW_BOOKING,
  },
  {
    id: '2',
    serviceName: 'Cognitive Behavioural Therapy',
    serviceProviderName: 'Dr. Smith',
    startDateDime: new Date('2025-04-28T10:00:00+01:00'),
    endDateDime: new Date('2025-04-28T11:00:00+01:00'),
    clientTimezone: 'Europe/London',
    action: SIMPLYBOOK_ACTION_ENUM.NEW_BOOKING,
  },
  {
    id: '3',
    serviceName: 'Therapy Session',
    serviceProviderName: 'Paola',
    startDateDime: new Date('2025-02-17T14:00:00Z'),
    endDateDime: new Date('2025-02-17T15:00:00Z'),
    clientTimezone: 'Europe/London',
    completedAt: new Date('2025-02-17T15:05:00Z'),
    action: SIMPLYBOOK_ACTION_ENUM.NEW_BOOKING,
  },
  {
    id: '4',
    serviceName: 'Therapy Session',
    serviceProviderName: 'Dr. Jones',
    startDateDime: new Date('2025-02-08T09:30:00Z'),
    endDateDime: new Date('2025-02-08T10:30:00Z'),
    clientTimezone: 'Europe/London',
    cancelledAt: new Date('2025-02-07T11:00:00Z'),
    action: SIMPLYBOOK_ACTION_ENUM.NEW_BOOKING,
  },
  {
    id: '5',
    serviceName: 'Therapy Session',
    serviceProviderName: 'Dr. Evans',
    startDateDime: new Date('2025-04-23T09:00:00+01:00'),
    endDateDime: new Date('2025-04-23T10:00:00+01:00'),
    clientTimezone: 'Europe/London',
    action: SIMPLYBOOK_ACTION_ENUM.NEW_BOOKING,
  },
];

// Helper function to determine the status of a session
const determineSessionStatus = (session: TherapySession, now: Date): SessionStatus => {
  if (session.cancelledAt) {
    return 'cancelled';
  }
  // If startDateDime is missing or invalid, treat as past (or handle as error)
  if (
    !session.startDateDime ||
    !(session.startDateDime instanceof Date) ||
    isNaN(session.startDateDime.getTime())
  ) {
    console.warn(`Invalid or missing startDateDime for session ID: ${session.id}`);
    return 'past';
  }
  if (session.startDateDime > now) {
    return 'upcoming';
  }
  return 'past';
};
interface BookingItemProps {
  session: TherapySession;
  onCancel: (id: string) => void;
}

const BookingItem: React.FC<BookingItemProps> = ({ session, onCancel }) => {
  const t = useTranslations('Therapy.bookingItem');
  const currentLocaleString = useLocale();
  const dateLocale = getDateLocale(currentLocaleString);
  const now = new Date();

  const [isExpanded, setIsExpanded] = useState(false);

  const status = determineSessionStatus(session, now);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCancelClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (session.id) {
      onCancel(session.id);
    } else {
      console.error('Cannot cancel session: ID is missing.');
    }
  };

  const isValidStartDate =
    session.startDateDime instanceof Date && !isNaN(session.startDateDime.getTime());
  const isValidEndDate =
    session.endDateDime instanceof Date && !isNaN(session.endDateDime.getTime());

  const formattedDateDetails = isValidStartDate
    ? format(session.startDateDime || 'NA', 'EEEE do MMMM', { locale: dateLocale })
    : t('invalidDate');
  const formattedStartTime = isValidStartDate
    ? format(session.startDateDime || 'NA', 'p', { locale: dateLocale })
    : '--:--';
  const formattedEndTime = isValidEndDate
    ? format(session.endDateDime || 'NA', 'p', { locale: dateLocale })
    : '--:--';
  const formattedDateTitle = isValidStartDate
    ? format(session.startDateDime || 'NA', 'do MMMM', { locale: dateLocale })
    : t('invalidDate');
  const relativeTimeText = isValidStartDate
    ? formatRelative(session.startDateDime || 'NA', now, { locale: dateLocale })
    : '';

  let titleText = '';
  let IconComponent = EventAvailable;

  switch (status) {
    case 'upcoming':
      titleText = t('upcomingSessionTitle', { relativeTime: relativeTimeText });
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
              <strong>{t('therapistLabel')}:</strong>
              {session.serviceProviderName || t('notAssigned')}
            </Typography>
            {status === 'upcoming' && (
              <Box sx={{ textAlign: 'right', pt: 1 }}>
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
};

interface TherapyBookingsProps {
  sessions?: TherapySession[] | null;
  therapySessionsRemaining: number;
}

const TherapyBookings: React.FC<TherapyBookingsProps> = ({
  sessions: initialSessions,
  therapySessionsRemaining,
}) => {
  const t = useTranslations('Therapy.therapyBookings');
  const now = new Date();

  // Use mock data only if initialSessions is not provided
  const sessions = initialSessions ?? mockBookings;

  const handleCancelBooking = (id: string) => {
    console.log('Cancel booking requested for ID:', id);
    alert(t('cancelAlert', { id }));
    // TODO: Implement actual API call to cancel the booking
    // TODO: Update UI state upon successful cancellation (e.g., filter out the booking or refetch)
  };

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
      const dateA = a.startDateDime instanceof Date ? a.startDateDime.getTime() : 0;
      const dateB = b.startDateDime instanceof Date ? b.startDateDime.getTime() : 0;

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
        {therapySessionsRemaining > 0
          ? t.rich('bookingSummary', {
              remainingTotal: () => (
                <strong id="therapy-sessions-remaining">{therapySessionsRemaining}</strong>
              ),
              upcomingTotal: () => (
                <strong id="therapy-sessions-upcoming">{totalUpcomingSessions}</strong>
              ),
            })
          : t('noBookingSummary')}
      </Typography>

      {sortedBookings.length > 0 ? (
        sortedBookings.map((session) => (
          <BookingItem
            key={session.id || `session-${Math.random()}`}
            session={session}
            onCancel={handleCancelBooking}
          />
        ))
      ) : (
        <Typography>{t('noBookings')}</Typography>
      )}
    </Box>
  );
};

export default TherapyBookings;
