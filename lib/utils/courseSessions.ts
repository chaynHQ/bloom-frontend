import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import { ISbStoryData } from '@storyblok/react/rsc';

// A course's sessions as both the course overview and the session playlist present them:
// flattened across the course's weeks and numbered continuously.
export interface CourseSession {
  uuid: string;
  name: string;
  description: string;
  href: string;
  position: number; // 1-based, continuous across weeks
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
    }));
}
