import { ISbStoryData } from '@storyblok/react/rsc';
import {
  bucketOf,
  filterLibraryItems,
  storyToLibraryItem,
  toggle,
  type LibraryFilters,
  type LibraryItem,
} from './libraryData';

// A Storyblok story, trimmed to the fields the library reads. `content` is deliberately loose:
// the real payloads differ per component, and that variation is what these tests are about.
const story = (content: Record<string, unknown>, full_slug = 'shorts/what-are-boundaries') =>
  ({
    uuid: 'uuid-1',
    full_slug,
    content: { name: 'What are boundaries', ...content },
  }) as unknown as ISbStoryData;

describe('storyToLibraryItem', () => {
  describe('courses', () => {
    it('counts the sessions across every week, not the weeks themselves', () => {
      const item = storyToLibraryItem(
        story(
          {
            component: 'Course',
            themes: ['setting-boundaries'],
            weeks: [{ sessions: [{}, {}, {}] }, { sessions: [{}, {}] }],
          },
          'courses/managing-anxiety',
        ),
        'en',
      );

      expect(item.kind).toBe('course');
      expect(item.sessionCount).toBe(5);
      // A course has no format or duration of its own — the filters rely on that.
      expect(item.format).toBeUndefined();
      expect(item.minutes).toBeUndefined();
    });

    it('reports no sessions rather than NaN when a course has no weeks yet', () => {
      const item = storyToLibraryItem(story({ component: 'Course' }, 'courses/coming-soon'), 'en');

      expect(item.sessionCount).toBe(0);
    });
  });

  describe('sessions', () => {
    it.each([
      ['resource_conversation', 'audio'],
      ['resource_short_video', 'video'],
      ['resource_single_video', 'video'],
      // Course lessons are video-led, and are mapped explicitly rather than falling through.
      ['Session', 'video'],
      ['session_iba', 'video'],
    ])('maps the %s component to the %s format', (component, format) => {
      const item = storyToLibraryItem(story({ component }), 'en');

      expect(item.kind).toBe('session');
      expect(item.format).toBe(format);
    });

    it('reads the duration Storyblok stores as free text', () => {
      expect(storyToLibraryItem(story({ duration: '20' }), 'en').minutes).toBe(20);
    });

    // Storyblok's duration is a free-text field editors sometimes leave blank.
    it.each([[''], [undefined], ['0'], ['soon']])(
      'leaves the duration unset when Storyblok has %p, so a length filter cannot match it',
      (duration) => {
        expect(storyToLibraryItem(story({ duration }), 'en').minutes).toBeUndefined();
      },
    );
  });

  it('falls back to a theme so a card never renders untagged', () => {
    expect(storyToLibraryItem(story({ themes: [] }), 'en').themes).toEqual(['healing-journey']);
    expect(storyToLibraryItem(story({ themes: ['staying-safe'] }), 'en').themes).toEqual([
      'staying-safe',
    ]);
  });

  it('flattens a rich-text description to the plain text the card and search need', () => {
    const richText = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Boundaries are' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'yours to set.' }] },
      ],
    };

    expect(storyToLibraryItem(story({ description: richText }), 'en').description).toBe(
      'Boundaries are yours to set.',
    );
  });

  it('keeps a plain-string description as it is', () => {
    expect(storyToLibraryItem(story({ description: 'A short video.' }), 'en').description).toBe(
      'A short video.',
    );
  });

  it('strips the locale prefix from the href so links do not repeat it', () => {
    expect(storyToLibraryItem(story({}, 'de/shorts/what-are-boundaries'), 'de').href).toBe(
      '/shorts/what-are-boundaries',
    );
    expect(storyToLibraryItem(story({}, 'shorts/what-are-boundaries'), 'en').href).toBe(
      '/shorts/what-are-boundaries',
    );
  });
});

describe('bucketOf', () => {
  it.each([
    [5, 'under10'],
    [9, 'under10'],
    [10, '10to20'],
    [20, '10to20'],
    [21, 'over20'],
  ])('puts %i minutes in the %s bucket', (minutes, bucket) => {
    expect(bucketOf(minutes)).toBe(bucket);
  });
});

describe('toggle', () => {
  it('adds a value that is absent and removes one that is present', () => {
    expect(toggle(['audio'], 'video')).toEqual(['audio', 'video']);
    expect(toggle(['audio', 'video'], 'audio')).toEqual(['video']);
  });

  it('does not mutate the list it is given', () => {
    const formats = ['audio'];
    toggle(formats, 'video');

    expect(formats).toEqual(['audio']);
  });
});

describe('filterLibraryItems', () => {
  const item = (overrides: Partial<LibraryItem>): LibraryItem => ({
    id: 'uuid',
    kind: 'session',
    themes: ['healing-journey'],
    title: 'A session',
    description: '',
    href: '/shorts/a-session',
    format: 'video',
    minutes: 5,
    ...overrides,
  });

  const course = item({ id: 'course', kind: 'course', format: undefined, minutes: undefined });
  const audio = item({ id: 'audio', format: 'audio', minutes: 25 });
  const video = item({ id: 'video', format: 'video', minutes: 5 });
  // Course lessons come out of Storyblok with no duration at all.
  const lesson = item({ id: 'lesson', minutes: undefined, courseTitle: 'Managing anxiety' });

  const items = [course, audio, video, lesson];
  const noFilters: LibraryFilters = {
    keyword: '',
    kind: 'all',
    themes: [],
    formats: [],
    lengths: [],
  };
  const idsFrom = (filters: Partial<LibraryFilters>) =>
    filterLibraryItems(items, { ...noFilters, ...filters }).map((i) => i.id);

  it('returns everything when no filter is set', () => {
    expect(idsFrom({})).toEqual(['course', 'audio', 'video', 'lesson']);
  });

  it('narrows to courses, or to sessions, by kind', () => {
    expect(idsFrom({ kind: 'course' })).toEqual(['course']);
    expect(idsFrom({ kind: 'session' })).toEqual(['audio', 'video', 'lesson']);
  });

  it('widens within the format group and excludes courses, which have no format', () => {
    expect(idsFrom({ formats: ['audio'] })).toEqual(['audio']);
    expect(idsFrom({ formats: ['audio', 'video'] })).toEqual(['audio', 'video', 'lesson']);
  });

  it('excludes items of unknown length whenever a length is chosen', () => {
    // The lesson is a video and would match `formats: ['video']`, but no bucket can claim it.
    expect(idsFrom({ lengths: ['under10'] })).toEqual(['video']);
    expect(idsFrom({ lengths: ['over20'] })).toEqual(['audio']);
    expect(idsFrom({ lengths: ['under10', 'over20'] })).toEqual(['audio', 'video']);
    expect(idsFrom({ lengths: ['10to20'] })).toEqual([]);
  });

  it('combines groups with AND', () => {
    expect(idsFrom({ formats: ['video'], lengths: ['under10'] })).toEqual(['video']);
    // A course can never satisfy a session-only filter, so the combination returns nothing.
    expect(idsFrom({ kind: 'course', formats: ['video'] })).toEqual([]);
  });

  it('matches a theme when the item carries it among several', () => {
    const multi = item({ id: 'multi', themes: ['staying-safe', 'healing-journey'] });

    expect(filterLibraryItems([multi], { ...noFilters, themes: ['staying-safe'] })).toHaveLength(1);
    expect(filterLibraryItems([multi], { ...noFilters, themes: ['why-harm-happens'] })).toEqual([]);
  });

  it('searches the title and the description, ignoring case and surrounding space', () => {
    const anxiety = item({ id: 'anxiety', title: 'Managing anxiety', description: '' });
    const boundaries = item({ id: 'boundaries', title: 'Boundaries', description: 'Feeling calm' });
    const both = [anxiety, boundaries];

    expect(filterLibraryItems(both, { ...noFilters, keyword: '  ANXIETY ' })).toEqual([anxiety]);
    expect(filterLibraryItems(both, { ...noFilters, keyword: 'calm' })).toEqual([boundaries]);
    expect(filterLibraryItems(both, { ...noFilters, keyword: 'nothing here' })).toEqual([]);
  });
});
