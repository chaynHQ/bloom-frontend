import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { type Course } from '@/lib/store/coursesSlice';
import { type Resource } from '@/lib/store/resourcesSlice';
import { determineCourseProgress } from '@/lib/utils/courseProgress';
import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import { normaliseSlug, parseMinutes, toPlainText } from '@/lib/utils/libraryData';
import { ISbStoryData } from '@storyblok/react/rsc';

export type SessionProgress = 'started' | 'completed';

export type CourseItemFormat = 'video' | 'audio' | 'written';

// A course's sessions as both the course overview and the session playlist present them:
// flattened across the course's weeks (or read from a modular course's `sessions`) and numbered
// continuously.
export interface CourseSession {
  uuid: string;
  name: string;
  description: string;
  href: string;
  position: number; // 1-based, continuous across weeks
  minutes?: number; // from the session's free-text `duration` field, absent when unset
  // Unset for a course-only session with no video yet.
  format?: CourseItemFormat;
  // `session`: a course-only Session story. `resource`: a library piece listed by a modular course.
  kind: 'session' | 'resource';
  // Resource pieces gate on their own `login_required`; sessions follow the course's rules.
  loginRequired?: boolean;
}

interface CourseWeek {
  name: string;
  // Bare uuids unless the Storyblok query resolved the `week.sessions` relation.
  sessions: (ISbStoryData | string)[];
}

const RESOURCE_FORMATS: Record<string, CourseItemFormat> = {
  resource_video: 'video',
  resource_audio: 'audio',
  resource_written: 'written',
};

// Matches each resource page's own fallback for a story with no `login_required` value.
const LOGIN_REQUIRED_BY_DEFAULT: Record<CourseItemFormat, boolean> = {
  video: true,
  audio: true,
  written: false,
};

const isResolvedStory = (item: unknown): item is ISbStoryData =>
  typeof item === 'object' && item !== null;

// A modular course lists library pieces in its `sessions` field; older courses use `weeks`.
export function isModularCourse(content: unknown): boolean {
  const sessions = (content as { sessions?: unknown } | undefined)?.sessions;
  return Array.isArray(sessions) && sessions.length > 0;
}

// The piece's page inside the course: `/courses/<course>/<folder>/<slug>`. The folder stays in the
// path because the same slug can exist in more than one folder.
export function courseItemHref(courseFullSlug: string, itemFullSlug: string, locale: string) {
  const coursePath = getDefaultFullSlug(normaliseSlug(courseFullSlug), locale);
  const itemPath = getDefaultFullSlug(normaliseSlug(itemFullSlug), locale);
  return `${coursePath}${itemPath}`;
}

export function getCourseSessions(
  course: ISbStoryData | undefined,
  locale: string,
): CourseSession[] {
  if (course && isModularCourse(course.content)) {
    return (course.content.sessions as unknown[])
      .filter(isResolvedStory)
      .flatMap((item) => {
        const format = RESOURCE_FORMATS[item.content?.component ?? ''];
        return format ? [{ item, format }] : [];
      })
      .map(({ item, format }, index) => {
        const loginRequired = item.content.login_required;
        return {
          uuid: item.uuid,
          name: item.content.name ?? item.name,
          description: toPlainText(item.content.description),
          href: courseItemHref(course.full_slug, item.full_slug, locale),
          position: index + 1,
          minutes: parseMinutes(item.content.duration),
          format,
          kind: 'resource',
          loginRequired:
            loginRequired == null ? LOGIN_REQUIRED_BY_DEFAULT[format] : Boolean(loginRequired),
        };
      });
  }

  const weeks = (course?.content?.weeks ?? []) as CourseWeek[];

  return weeks
    .flatMap((week) => week.sessions ?? [])
    .filter(isResolvedStory)
    .map((session, index) => ({
      uuid: session.uuid,
      name: session.content?.name ?? session.name,
      description: session.content?.description ?? '',
      href: getDefaultFullSlug(session.full_slug, locale),
      position: index + 1,
      minutes: parseMinutes(session.content?.duration),
      format: session.content?.video?.url ? 'video' : undefined,
      kind: 'session',
    }));
}

// The first session of a course, matched by uuid so it stays correct across locales (session
// slugs are locale-prefixed; uuids are not).
export function isFirstCourseSession(sessions: CourseSession[], sessionUuid: string): boolean {
  return sessions.length > 0 && sessions[0].uuid === sessionUuid;
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

// Each of a course's session uuids mapped to its progress, for the session cards' status badge.
export function sessionProgressByUuid(
  courses: Course[],
  courseUuid: string,
): Record<string, SessionProgress> {
  const course = courses.find((c) => c.storyblokUuid === courseUuid);
  return (course?.sessions ?? []).reduce<Record<string, SessionProgress>>((map, session) => {
    map[session.storyblokUuid] = session.completed ? 'completed' : 'started';
    return map;
  }, {});
}

// Progress for every item the member has touched, keyed by Storyblok uuid: library pieces from
// `resources`, course-only sessions from each course. A piece done anywhere is ticked everywhere.
export function itemProgressByUuid(
  courses: Course[],
  resources: Resource[],
): Record<string, SessionProgress> {
  const progress: Record<string, SessionProgress> = {};
  const record = (uuid: string, completed: boolean) => {
    if (progress[uuid] !== 'completed') progress[uuid] = completed ? 'completed' : 'started';
  };
  courses.forEach((course) =>
    (course.sessions ?? []).forEach((session) => record(session.storyblokUuid, session.completed)),
  );
  resources.forEach((resource) => record(resource.storyblokUuid, resource.completed));
  return progress;
}

// A course is in progress once the member has started it inside the course (the backend's
// course record). A modular course also shows as completed when every listed piece is done,
// wherever it was done — display only, so it never counts as a completion in reporting.
export function getCourseProgress(
  courses: Course[],
  courseUuid: string,
  modularItemUuids: string[] | undefined,
  itemProgress: Record<string, SessionProgress>,
): PROGRESS_STATUS {
  const progress = determineCourseProgress(courses, courseUuid);
  const allItemsCompleted =
    !!modularItemUuids?.length &&
    modularItemUuids.every((uuid) => itemProgress[uuid] === 'completed');
  return allItemsCompleted ? PROGRESS_STATUS.COMPLETED : progress;
}
