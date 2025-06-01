import { isValid } from 'date-fns';
import { TherapySession } from '../store/therapySessionsSlice';

type SessionStatus = 'upcoming' | 'past' | 'cancelled';

export function getTherapySessionStatus(session: TherapySession, now: Date): SessionStatus {
  if (session.cancelledAt) {
    return 'cancelled';
  }
  const startDate = new Date(session.startDateTime || 0);
  if (isValid(startDate) && startDate > now) {
    return 'upcoming';
  }
  return 'past';
}

export const sortTherapyBookings = (
  sessions: TherapySession[],
  now: Date,
): { sorted: TherapySession[]; upcomingCount: number } => {
  const enrichedSessions = sessions.map((session) => ({
    ...session,
    status: getTherapySessionStatus(session, now),
    sortTimestamp: isValid(new Date(session.startDateTime || 0))
      ? new Date(session.startDateTime || 0).getTime()
      : 0,
  }));

  const sorted = [...enrichedSessions].sort((a, b) => {
    const statusOrder = { upcoming: 1, past: 2, cancelled: 3 };
    const statusComparison = statusOrder[a.status] - statusOrder[b.status];
    if (statusComparison !== 0) return statusComparison;

    if (a.sortTimestamp === 0 && b.sortTimestamp === 0) return 0;
    if (a.sortTimestamp === 0) return 1;
    if (b.sortTimestamp === 0) return -1;

    return a.status === 'upcoming'
      ? a.sortTimestamp - b.sortTimestamp
      : b.sortTimestamp - a.sortTimestamp;
  });

  const upcomingCount = sorted.filter((s) => s.status === 'upcoming').length;
  return { sorted, upcomingCount };
};
