import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import { parseMinutes } from '@/lib/utils/libraryData';
import { ISbStoryData } from '@storyblok/react/rsc';

// A course's sessions as both the course overview and the session playlist present them:
// flattened across the course's weeks and numbered continuously.
export interface CourseSession {
  uuid: string;
  name: string;
  description: string;
  href: string;
  position: number; // 1-based, continuous across weeks
  minutes?: number; // from the session's free-text `duration` field, absent when unset
}

interface CourseWeek {
  name: string;
  // Bare uuids unless the Storyblok query resolved the `week.sessions` relation.
  sessions: (ISbStoryData | string)[];
}

export function getCourseSessions(
  course: ISbStoryData | undefined,
  locale: string,
): CourseSession[] {
  const weeks = (course?.content?.weeks ?? []) as CourseWeek[];

  return weeks
    .flatMap((week) => week.sessions ?? [])
    .filter((session): session is ISbStoryData => typeof session === 'object' && session !== null)
    .map((session, index) => ({
      uuid: session.uuid,
      name: session.content?.name ?? session.name,
      description: session.content?.description ?? '',
      href: getDefaultFullSlug(session.full_slug, locale),
      position: index + 1,
      minutes: parseMinutes(session.content?.duration),
    }));
}

// Total runtime across a course's sessions, or undefined when none carry a duration.
export function getCourseTotalMinutes(sessions: CourseSession[]): number | undefined {
  const total = sessions.reduce((sum, session) => sum + (session.minutes ?? 0), 0);
  return total > 0 ? total : undefined;
}

// Splits a minute total for the hour/minute translation forms (e.g. "~2hrs 30mins").
export function splitDuration(totalMinutes: number): { hours: number; minutes: number } {
  return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 };
}
