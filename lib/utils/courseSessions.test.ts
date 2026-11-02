import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { type Course } from '@/lib/store/coursesSlice';
import { type Resource } from '@/lib/store/resourcesSlice';
import { ISbStoryData } from '@storyblok/react/rsc';
import {
  courseResourceHref,
  getCourseProgress,
  getCourseSessions,
  isFirstCourseSession,
  isModularCourse,
  sessionAndResourceProgressByUuid,
  type CourseSession,
} from './courseSessions';

const session = (uuid: string, position: number): CourseSession => ({
  uuid,
  name: `Session ${position}`,
  description: '',
  href: `/courses/a-course/session-${position}`,
  position,
  format: 'video',
  kind: 'session',
});

const mockResource = (uuid: string, component: string, fullSlug: string, content = {}) =>
  ({
    uuid,
    name: uuid,
    full_slug: fullSlug,
    content: {
      component,
      name: `Resource ${uuid}`,
      description: { type: 'doc', content: [{ type: 'paragraph', content: [{ text: 'Desc' }] }] },
      duration: '7',
      ...content,
    },
  }) as unknown as ISbStoryData;

const story = (fullSlug: string, content: Record<string, unknown>) =>
  ({ uuid: 'course', name: 'Course', full_slug: fullSlug, content }) as unknown as ISbStoryData;

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

describe('isModularCourse', () => {
  it('needs a non-empty sessions list', () => {
    expect(isModularCourse({ sessions: ['a'] })).toBe(true);
    // An older course saved after the field was added comes back with an empty list.
    expect(isModularCourse({ sessions: [], weeks: [] })).toBe(false);
    expect(isModularCourse({ weeks: [] })).toBe(false);
    expect(isModularCourse(undefined)).toBe(false);
  });
});

describe('courseResourceHref', () => {
  it('nests the resource folder and slug under the course, without the locale prefix', () => {
    expect(courseResourceHref('courses/healing/', 'video/what-are-boundaries', 'en')).toBe(
      '/courses/healing/video/what-are-boundaries',
    );
    expect(courseResourceHref('tr/courses/healing/', 'tr/audio/what-are-boundaries', 'tr')).toBe(
      '/courses/healing/audio/what-are-boundaries',
    );
  });
});

describe('getCourseSessions', () => {
  it('reads a modular course from its sessions, keeping the folder and login defaults', () => {
    const course = story('courses/healing/', {
      sessions: [
        mockResource('v', 'resource_video', 'video/v'),
        'unresolved-uuid',
        mockResource('w', 'resource_written', 'written/w'),
        mockResource('a', 'resource_audio', 'audio/a', { login_required: false }),
        mockResource('x', 'resource_activity', 'activity/x'),
      ],
      weeks: [{ sessions: [mockResource('old', 'Session', 'courses/healing/old')] }],
    });

    expect(getCourseSessions(course, 'en')).toEqual([
      expect.objectContaining({
        uuid: 'v',
        href: '/courses/healing/video/v',
        position: 1,
        format: 'video',
        kind: 'resource',
        loginRequired: true,
        description: 'Desc',
        minutes: 7,
      }),
      expect.objectContaining({ uuid: 'w', position: 2, format: 'written', loginRequired: false }),
      expect.objectContaining({ uuid: 'a', position: 3, format: 'audio', loginRequired: false }),
    ]);
  });

  it('falls back to the flattened weeks for an older course', () => {
    const course = story('courses/old/', {
      sessions: [],
      weeks: [
        { sessions: [mockResource('s1', 'Session', 'courses/old/s1', { video: { url: 'x' } })] },
        { sessions: [mockResource('s2', 'Session', 'courses/old/s2')] },
      ],
    });

    expect(getCourseSessions(course, 'en')).toEqual([
      expect.objectContaining({ uuid: 's1', position: 1, format: 'video', kind: 'session' }),
      expect.objectContaining({ uuid: 's2', position: 2, format: undefined, kind: 'session' }),
    ]);
  });
});

const course = (storyblokUuid: string, completed: boolean, sessions: [string, boolean][] = []) =>
  ({
    storyblokUuid,
    completed,
    sessions: sessions.map(([uuid, done]) => ({ storyblokUuid: uuid, completed: done })),
  }) as unknown as Course;

const resource = (storyblokUuid: string, completed: boolean) =>
  ({ storyblokUuid, completed }) as unknown as Resource;

describe('sessionAndResourceProgressByUuid', () => {
  it('merges course sessions and resources, a completion anywhere winning', () => {
    const progress = sessionAndResourceProgressByUuid(
      [
        course('c1', false, [
          ['s1', true],
          ['shared', false],
        ]),
      ],
      [resource('r1', false), resource('shared', true)],
    );

    expect(progress).toEqual({ s1: 'completed', shared: 'completed', r1: 'started' });
  });
});

describe('getCourseProgress', () => {
  it('follows the course record when the course has no modular resources', () => {
    expect(getCourseProgress([course('c1', false)], 'c1', undefined, {})).toBe(
      PROGRESS_STATUS.STARTED,
    );
    expect(getCourseProgress([], 'c1', undefined, {})).toBe(PROGRESS_STATUS.NOT_STARTED);
  });

  it('shows a modular course completed when every resource is done, even if never started', () => {
    expect(getCourseProgress([], 'c1', ['a', 'b'], { a: 'completed', b: 'completed' })).toBe(
      PROGRESS_STATUS.COMPLETED,
    );
  });

  it('keeps a modular course not started while resources done elsewhere are incomplete', () => {
    expect(getCourseProgress([], 'c1', ['a', 'b'], { a: 'completed' })).toBe(
      PROGRESS_STATUS.NOT_STARTED,
    );
  });

  it('never shows an empty course as completed', () => {
    expect(getCourseProgress([], 'c1', [], {})).toBe(PROGRESS_STATUS.NOT_STARTED);
  });
});
