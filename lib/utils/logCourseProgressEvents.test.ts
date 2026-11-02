import { COURSE_COMPLETED, COURSE_STARTED } from '@/lib/constants/events';
import { type SessionProgressResponse } from '@/lib/store/coursesSlice';
import logEvent from '@/lib/utils/logEvent';
import { logCourseProgressEvents, sessionCourseProgressChanges } from './logCourseProgressEvents';

jest.mock('@/lib/utils/logEvent', () => jest.fn());

beforeEach(() => jest.clearAllMocks());

describe('logCourseProgressEvents', () => {
  it('logs one event per change, with the backend course name and the trigger', () => {
    logCourseProgressEvents(
      [{ storyblokUuid: 'c1', name: 'Healing basics', started: true, completed: true }],
      'course_item',
      { course_name: 'İyileşmenin temelleri', resource_name: 'Piece' },
    );

    const expected = {
      course_name: 'Healing basics',
      course_storyblok_uuid: 'c1',
      course_trigger: 'course_item',
      resource_name: 'Piece',
    };
    expect(logEvent).toHaveBeenCalledWith(COURSE_STARTED, expected);
    expect(logEvent).toHaveBeenCalledWith(COURSE_COMPLETED, expected);
  });

  it('logs nothing when nothing changed', () => {
    logCourseProgressEvents(undefined, 'standalone');
    logCourseProgressEvents(
      [{ storyblokUuid: 'c1', name: 'A', started: false, completed: false }],
      'standalone',
    );
    expect(logEvent).not.toHaveBeenCalled();
  });
});

describe('sessionCourseProgressChanges', () => {
  it('reads the course flags from a session response', () => {
    const response = {
      storyblokUuid: 'c1',
      name: 'Course',
      courseStarted: true,
    } as unknown as SessionProgressResponse;

    expect(sessionCourseProgressChanges(response)).toEqual([
      { storyblokUuid: 'c1', name: 'Course', started: true, completed: false },
    ]);
  });
});
