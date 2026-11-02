import { COURSE_COMPLETED, COURSE_STARTED } from '@/lib/constants/events';
import { type CourseProgressChange, type SessionProgressResponse } from '@/lib/store/coursesSlice';
import logEvent from '@/lib/utils/logEvent';

// Where the action that started or completed the course happened: an old course's session page, a
// piece opened inside a modular course, or a piece opened on its own (library or its own page).
export type CourseTrigger = 'session' | 'course_item' | 'standalone';

// Logs one COURSE_STARTED / COURSE_COMPLETED per change the backend reports, so GA counts match the
// course records. `course_name` is the backend name, the same in every locale.
export function logCourseProgressEvents(
  changes: CourseProgressChange[] | undefined,
  trigger: CourseTrigger,
  eventData: Record<string, unknown> = {},
) {
  changes?.forEach((change) => {
    const data = {
      ...eventData,
      course_name: change.name,
      course_storyblok_uuid: change.storyblokUuid,
      course_trigger: trigger,
    };
    if (change.started) logEvent(COURSE_STARTED, data);
    if (change.completed) logEvent(COURSE_COMPLETED, data);
  });
}

export function sessionCourseProgressChanges(
  response: SessionProgressResponse,
): CourseProgressChange[] {
  return [
    {
      storyblokUuid: response.storyblokUuid,
      name: response.name,
      started: Boolean(response.courseStarted),
      completed: Boolean(response.courseCompleted),
    },
  ];
}
