'use client';

import { CalendarMonth, EventAvailable, ExpandMore } from '@mui/icons-material';
import {
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  Link as MuiLink,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

interface Booking {
  id: string;
  status: 'upcoming' | 'past';
  date: Date;
  timeStart: string;
  timeEnd: string;
  timezone: string;
  therapistName: string;
  videoCallLink: string;
  relativeTimeText?: string;
}

// --- Mock Data (Replace with actual data fetching) ---
const mockBookings: Booking[] = [
  {
    id: '1',
    status: 'upcoming',
    date: new Date('2025-04-17T17:00:00'), // Today is Apr 15th in thought process
    timeStart: '17:00',
    timeEnd: '18:00',
    timezone: 'BST',
    therapistName: 'Paola',
    videoCallLink: 'https://meet.google.com/nsx-ayny-mbo',
    relativeTimeText: 'in 2 days', // Manually set for example
  },
  {
    id: '2',
    status: 'upcoming',
    date: new Date('2025-04-28T10:00:00'),
    timeStart: '10:00',
    timeEnd: '11:00',
    timezone: 'BST',
    therapistName: 'Dr. Smith',
    videoCallLink: 'https://meet.google.com/abc-defg-hij',
  },
  {
    id: '3',
    status: 'past',
    date: new Date('2025-02-17T14:00:00'),
    timeStart: '14:00',
    timeEnd: '15:00',
    timezone: 'GMT',
    therapistName: 'Paola',
    videoCallLink: '', // No link needed usually for past
  },
  {
    id: '4',
    status: 'past',
    date: new Date('2025-02-08T09:30:00'),
    timeStart: '09:30',
    timeEnd: '10:30',
    timezone: 'GMT',
    therapistName: 'Dr. Jones',
    videoCallLink: '',
  },
];
// --- End Mock Data ---

// Helper function to format date (replace with date-fns if needed)
const formatDate = (date: Date): string => {
  // Example: Monday 17th April
  // Adjust options as needed
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric', // 'numeric' or '2-digit'
    month: 'long',
  });
};

// Helper function to format date for title (e.g., "17th February")
const formatDateForTitle = (date: Date): string => {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric', // Add ordinal logic if needed
    month: 'long',
  });
};

// Helper to calculate relative time (very basic example)
const getRelativeTimeText = (date: Date): string => {
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays > 1 && diffDays <= 7) return `in ${diffDays} days`;
  // else return formatDateForTitle(date); // Fallback to date if further out
  return formatDateForTitle(date); // Defaulting to specific date as per screenshot for 28th
};

interface BookingItemProps {
  booking: Booking;
  onCancel: (id: string) => void; // Callback for cancellation
}

const BookingItem: React.FC<BookingItemProps> = ({ booking, onCancel }) => {
  // Only upcoming sessions are expandable by default in this design
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCancelClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent toggleExpand when clicking cancel
    onCancel(booking.id);
  };

  const IconComponent = booking.status === 'upcoming' ? CalendarMonth : EventAvailable;
  const titleText =
    booking.status === 'upcoming'
      ? `Upcoming therapy session ${booking.relativeTimeText || getRelativeTimeText(booking.date)}`
      : `Past therapy session ${formatDateForTitle(booking.date)}`;

  return (
    <Paper
      elevation={0} // Use 0 for flat look, adjust if needed
      sx={{
        mb: 1.5, // Margin bottom between items
        borderRadius: '12px', // Rounded corners
        backgroundColor: 'background.default', // Or a specific light color like '#FFF7F0'
        overflow: 'hidden', // Ensure collapse transition works smoothly
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: '12px 16px',
          cursor: 'pointer',
        }}
        onClick={handleToggleExpand}
        aria-expanded={isExpanded}
        aria-controls={`booking-details-${booking.id}`}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconComponent sx={{ color: 'secondary.dark' }} />
          <Typography component="div" fontWeight="medium">
            {titleText}
          </Typography>
        </Box>
        <IconButton size="small" aria-label={isExpanded ? 'Collapse' : 'Expand'}>
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
        <Divider /> {/* Optional separator */}
        <Box sx={{ p: '16px 20px', pt: 2, textAlign: 'left' }}>
          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>Date:</strong> {formatDate(booking.date)}
            </Typography>
            <Typography variant="body2">
              <strong>Time:</strong> {booking.timeStart} - {booking.timeEnd} {booking.timezone}
            </Typography>
            <Typography variant="body2">
              <strong>Therapist:</strong> {booking.therapistName}
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
              <strong>Video call link:</strong>{' '}
              <MuiLink href={booking.videoCallLink} target="_blank" rel="noopener noreferrer">
                {booking.videoCallLink}
              </MuiLink>
            </Typography>
            <Box sx={{ textAlign: 'right' }}>
              <Button variant="outlined" color="secondary" size="small" onClick={handleCancelClick}>
                Cancel
              </Button>
            </Box>
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
};

interface TherapyBookingsProps {
  bookings?: Booking[];
  therapySessionsRemaining: number;
}

const TherapyBookings: React.FC<TherapyBookingsProps> = ({
  bookings = mockBookings,
  therapySessionsRemaining,
}) => {
  const t = useTranslations('Therapy');

  const handleCancelBooking = (id: string) => {
    console.log('Cancel booking requested for ID:', id);
    // Add logic here to call API to cancel the booking
    // You might want to update the state to reflect the cancellation
    alert(`Cancellation requested for booking ID: ${id}. Implement actual cancellation logic.`);
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    if (a.status === 'upcoming' && b.status === 'past') return -1;
    if (a.status === 'past' && b.status === 'upcoming') return 1;
    // Sort by date descending (most recent first) within status groups
    return a.date.getTime() - b.date.getTime();
  });

  const totalUpcomingSessions = sortedBookings.filter(
    (booking) => booking.status === 'upcoming',
  ).length;

  return (
    <Box sx={{ maxWidth: '660px' }}>
      <Typography variant="h2" component="h2" gutterBottom>
        Your therapy bookings
      </Typography>
      <Typography mb={'2rem !important'}>
        {therapySessionsRemaining > 0
          ? t.rich('therapySessionsRemaining', {
              remainingTotal: () => (
                <strong id="therapy-sessions-remaining">{therapySessionsRemaining}</strong>
              ),
              upcomingTotal: () => (
                <strong id="therapy-sessions-upcoming">{totalUpcomingSessions}</strong>
              ),
            })
          : t('noTherapySessionsRemaining')}
      </Typography>

      {sortedBookings.length > 0 ? (
        sortedBookings.map((booking) => (
          <BookingItem key={booking.id} booking={booking} onCancel={handleCancelBooking} />
        ))
      ) : (
        <Typography>You have no therapy bookings at the moment.</Typography>
      )}
    </Box>
  );
};

export default TherapyBookings;
