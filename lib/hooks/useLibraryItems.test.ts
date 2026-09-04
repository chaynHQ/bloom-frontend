import { expect } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { useLocale } from 'next-intl';

import { useGetUserCoursesQuery } from '@/lib/api';
import { useTypedSelector } from '@/lib/hooks/store';
import { useCookieReferralPartner } from '@/lib/hooks/useCookieReferralPartner';
import type { LibraryStories, LibraryStory } from '@/lib/utils/libraryData';
import { useLibraryItems } from './useLibraryItems';

jest.mock('next-intl', () => ({ useLocale: jest.fn() }));
jest.mock('@/lib/api', () => ({ useGetUserCoursesQuery: jest.fn() }));
jest.mock('@/lib/hooks/store', () => ({ useTypedSelector: jest.fn() }));
jest.mock('@/lib/hooks/useCookieReferralPartner', () => ({
  useCookieReferralPartner: jest.fn(),
}));

// The slices useLibraryItems reads. Each test supplies only what it cares about; the rest is an
// empty, logged-out user.
interface State {
  user: { id: string | null; authStateLoading: boolean };
  partnerAccesses: { partner: { name: string } }[];
  partnerAdmin: { partner: { name: string } | null };
  courses: { storyblokUuid: string; completed: boolean; sessions?: unknown[] }[];
  resources: { storyblokUuid: string; completed: boolean }[];
}

// A lesson's parent course is read from its path, so the fixtures mirror the real story tree.
const COURSE_SLUG = 'courses/a-course';

// A Storyblok story trimmed to the fields the hook reads. Public and English by default.
const story = (overrides: Record<string, unknown> & { uuid?: string; full_slug?: string } = {}) => {
  const { uuid = 'story-uuid', full_slug = 'shorts/a-short', ...content } = overrides;
  return {
    uuid,
    full_slug,
    content: {
      name: 'A short',
      component: 'resource_short_video',
      languages: ['default'],
      included_for_partners: ['Public'],
      themes: ['healing-journey'],
      ...content,
    },
  } as unknown as LibraryStory;
};

// Storyblok returns course slugs with a trailing slash and lesson slugs without one.
const courseStory = (
  overrides: Record<string, unknown> & { uuid?: string; full_slug?: string } = {},
) =>
  story({
    uuid: 'course-uuid',
    full_slug: `${COURSE_SLUG}/`,
    component: 'Course',
    name: 'A course',
    ...overrides,
  });

const lessonStory = (
  overrides: Record<string, unknown> & { uuid?: string; full_slug?: string } = {},
) =>
  story({
    uuid: 'lesson-uuid',
    full_slug: `${COURSE_SLUG}/a-lesson`,
    component: 'Session',
    name: 'A lesson',
    ...overrides,
  });

const noStories: LibraryStories = {
  courses: [],
  courseSessions: [],
  shorts: [],
  somatics: [],
  conversations: [],
  written: [],
  activity: [],
};

const renderLibrary = (stories: Partial<LibraryStories>, state: Partial<State> = {}) => {
  const fullState: State = {
    user: { id: null, authStateLoading: false },
    partnerAccesses: [],
    partnerAdmin: { partner: null },
    courses: [],
    resources: [],
    ...state,
  };

  (useLocale as jest.Mock).mockReturnValue('en');
  (useGetUserCoursesQuery as jest.Mock).mockReturnValue({});
  (useCookieReferralPartner as jest.Mock).mockReturnValue(null);
  (useTypedSelector as unknown as jest.Mock).mockImplementation((selector: (s: State) => unknown) =>
    selector(fullState),
  );

  return renderHook(() => useLibraryItems({ ...noStories, ...stories })).result.current;
};

const titles = (items: { title: string }[]) => items.map((item) => item.title);

// A signed-in user with access to the named partner. They are not also granted 'public' access —
// see userHasAccessToPartnerContent.
const asPartnerUser = (partner: string): Partial<State> => ({
  user: { id: 'user-1', authStateLoading: false },
  partnerAccesses: [{ partner: { name: partner } }],
});

// A signed-in user with no partner, so they see Public content.
const asPublicUser: Partial<State> = {
  user: { id: 'user-1', authStateLoading: false },
  partnerAccesses: [],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useLibraryItems partner access', () => {
  const publicCourse = courseStory({
    uuid: 'public-course',
    full_slug: 'courses/a-public-course/',
    name: 'A public course',
    included_for_partners: ['Public'],
  });
  // Shares COURSE_SLUG, so the lessons below are its children.
  const bumbleCourse = courseStory({ name: 'A Bumble course', included_for_partners: ['Bumble'] });
  // A lesson of the Bumble course whose own entry is unrestricted.
  const bumbleLesson = lessonStory({ name: 'A Bumble lesson', included_for_partners: [] });

  it('hides a partner-restricted course from a public user', () => {
    const items = renderLibrary({ courses: [publicCourse, bumbleCourse] });

    expect(titles(items)).toEqual(['A public course']);
  });

  it('shows a partner-restricted course to a user with that partner access', () => {
    const items = renderLibrary({ courses: [publicCourse, bumbleCourse] }, asPartnerUser('Bumble'));

    // The partner user sees their own course, but not the Public-only one.
    expect(titles(items)).toEqual(['A Bumble course']);
  });

  it('does not leak a lesson of a partner-restricted course to a public user, even when the lesson itself is unrestricted', () => {
    const items = renderLibrary({ courses: [bumbleCourse], courseSessions: [bumbleLesson] });

    expect(titles(items)).toEqual([]);
  });

  it('surfaces a lesson once its parent course is visible, tagged with the parent course title', () => {
    const items = renderLibrary(
      { courses: [bumbleCourse], courseSessions: [bumbleLesson] },
      asPartnerUser('Bumble'),
    );

    expect(titles(items)).toEqual(['A Bumble course', 'A Bumble lesson']);
    expect(items.find((item) => item.title === 'A Bumble lesson')?.courseTitle).toBe(
      'A Bumble course',
    );
  });

  // The gate reads the parent from the story path, not from `content.course`.
  it('ignores a content.course uuid that points at a different, visible course', () => {
    const lesson = lessonStory({
      name: 'A Bumble lesson',
      included_for_partners: [],
      course: 'public-course', // points at the visible course; its path says otherwise
    });

    const items = renderLibrary({
      courses: [publicCourse, bumbleCourse],
      courseSessions: [lesson],
    });

    // publicCourse is visible, but the lesson lives under the Bumble course.
    expect(titles(items)).toEqual(['A public course']);
  });

  it('drops a lesson whose parent course is missing entirely', () => {
    const orphan = story({
      uuid: 'orphan',
      full_slug: 'courses/a-course-that-is-not-here/a-lesson',
      component: 'Session',
      name: 'An orphaned lesson',
    });

    expect(titles(renderLibrary({ courseSessions: [orphan] }))).toEqual([]);
  });
});

describe('useLibraryItems coming_soon', () => {
  it('excludes a course that is still coming soon', () => {
    const comingSoon = courseStory({ name: 'Coming soon', coming_soon: true });

    expect(titles(renderLibrary({ courses: [comingSoon] }))).toEqual([]);
  });

  it('excludes the lessons of a coming-soon course, since the course itself is not browsable', () => {
    const comingSoon = courseStory({ name: 'Coming soon', coming_soon: true });

    expect(
      titles(renderLibrary({ courses: [comingSoon], courseSessions: [lessonStory()] })),
    ).toEqual([]);
  });

  it('excludes a coming-soon lesson of a published course', () => {
    const lesson = lessonStory({ coming_soon: true });

    expect(titles(renderLibrary({ courses: [courseStory()], courseSessions: [lesson] }))).toEqual([
      'A course',
    ]);
  });
});

describe('useLibraryItems locale', () => {
  it("excludes a story that is not published in the user's language", () => {
    const german = story({ uuid: 'de', name: 'German only', languages: ['de'] });
    const english = story({ uuid: 'en', name: 'English', languages: ['default'] });

    // Locale 'en' maps to Storyblok's 'default'.
    expect(titles(renderLibrary({ shorts: [german, english] }))).toEqual(['English']);
  });

  it('matches a non-English locale against its own language code', () => {
    const german = story({ uuid: 'de', name: 'German only', languages: ['de'] });
    const english = story({ uuid: 'en', name: 'English', languages: ['default'] });

    (useLocale as jest.Mock).mockReturnValue('de');
    (useGetUserCoursesQuery as jest.Mock).mockReturnValue({});
    (useCookieReferralPartner as jest.Mock).mockReturnValue(null);
    (useTypedSelector as unknown as jest.Mock).mockImplementation(
      (selector: (s: State) => unknown) =>
        selector({
          user: { id: null, authStateLoading: false },
          partnerAccesses: [],
          partnerAdmin: { partner: null },
          courses: [],
          resources: [],
        }),
    );

    const items = renderHook(() => useLibraryItems({ ...noStories, shorts: [german, english] }))
      .result.current;

    expect(titles(items)).toEqual(['German only']);
  });
});

describe('useLibraryItems progress', () => {
  const course = courseStory();

  it('marks a course as started or completed from the courses slice', () => {
    const started = renderLibrary(
      { courses: [course] },
      { ...asPublicUser, courses: [{ storyblokUuid: 'course-uuid', completed: false }] },
    );
    expect(started[0].progress).toBe('started');

    const completed = renderLibrary(
      { courses: [course] },
      { ...asPublicUser, courses: [{ storyblokUuid: 'course-uuid', completed: true }] },
    );
    expect(completed[0].progress).toBe('completed');
  });

  it('reads lesson progress from the sessions nested under each course, not a top-level list', () => {
    const items = renderLibrary(
      { courses: [course], courseSessions: [lessonStory()] },
      {
        ...asPublicUser,
        courses: [
          {
            storyblokUuid: 'course-uuid',
            completed: false,
            sessions: [{ storyblokUuid: 'lesson-uuid', completed: true }],
          },
        ],
      },
    );

    expect(items.find((item) => item.title === 'A lesson')?.progress).toBe('completed');
  });

  it('marks a standalone resource from the resources slice', () => {
    const short = story({ uuid: 'short', name: 'A short' });

    const items = renderLibrary(
      { shorts: [short] },
      { ...asPublicUser, resources: [{ storyblokUuid: 'short', completed: false }] },
    );

    expect(items[0].progress).toBe('started');
  });

  it('leaves progress unset for an item the user has not touched', () => {
    const short = story({ uuid: 'short', name: 'A short' });

    expect(renderLibrary({ shorts: [short] }, asPublicUser)[0].progress).toBeUndefined();
  });
});
