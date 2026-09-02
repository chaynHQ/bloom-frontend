import { isFirstCourseSession, type CourseSession } from './courseSessions';

const session = (uuid: string, position: number): CourseSession => ({
  uuid,
  name: `Session ${position}`,
  description: '',
  href: `/courses/a-course/session-${position}`,
  position,
});

describe('isFirstCourseSession', () => {
  const sessions = [session('uuid-1', 1), session('uuid-2', 2), session('uuid-3', 3)];

  it('is true for the first session by uuid', () => {
    expect(isFirstCourseSession(sessions, 'uuid-1')).toBe(true);
  });

  it('is false for a later session', () => {
    expect(isFirstCourseSession(sessions, 'uuid-2')).toBe(false);
  });

  it('is false for a uuid not in the course', () => {
    expect(isFirstCourseSession(sessions, 'uuid-missing')).toBe(false);
  });

  it('is false when the course has no resolved sessions', () => {
    expect(isFirstCourseSession([], 'uuid-1')).toBe(false);
  });
});
