// Pure data, types, and Storyblok → LibraryItem mapping for the library.

import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import { ISbStoryData } from '@storyblok/react/rsc';

const COURSE_COMPONENT = 'Course';

// A "session" is a course lesson, a short, a somatic video, or an audio conversation.
export type Kind = 'course' | 'session';

export type KindFilter = 'all' | Kind;

// Labels live under `Library.kind.<key>`.
export const KIND_KEYS: KindFilter[] = ['all', 'course', 'session'];

export type Format = 'audio' | 'written' | 'video' | 'activity';

export type ContentType = 'course' | Format;

export type ThemeKey =
  | 'recognising-harm'
  | 'why-harm-happens'
  | 'body-after-trauma'
  | 'setting-boundaries'
  | 'healing-journey'
  | 'staying-safe';

// Each key has `label`, `blurb`, and `description` under `Library.themes.<key>`.
export const THEME_KEYS: ThemeKey[] = [
  'recognising-harm',
  'why-harm-happens',
  'body-after-trauma',
  'setting-boundaries',
  'healing-journey',
  'staying-safe',
];

export type LengthBucket = 'under10' | '10to20' | 'over20';
// Labels live under `Library.lengths.<key>`.
export const LENGTH_KEYS: LengthBucket[] = ['under10', '10to20', 'over20'];

// Labels live under `Library.contentTypes.<key>`.
export const FORMAT_KEYS: Format[] = ['audio', 'written', 'video', 'activity'];

export interface LibraryItem {
  id: string; // Storyblok uuid
  kind: Kind;
  themes: ThemeKey[]; // a story can belong to more than one theme
  title: string;
  description: string;
  href: string; // resolved, locale-aware app path
  format?: Format;
  minutes?: number; // absent when Storyblok has no duration (all course lessons)
  // On a course lesson: the title of the course it belongs to.
  courseTitle?: string;
  sessionCount?: number; // courses only
  progress?: 'started' | 'completed'; // logged-in users who have started/completed the item
  // The course illustration on its background, shown by the card's `illustrated` layout.
  imageSrc?: string;
  // Whether opening the item puts a signed-out user in front of the login dialog.
  requiresAccount: boolean;
}

// A Storyblok story trimmed to the fields the library reads, as sent from the route to the page.
export interface LibraryStory {
  uuid: string;
  full_slug: string;
  content: {
    name: string;
    component?: string;
    description?: unknown; // plain string on a course, rich-text document on a resource
    themes?: string[];
    duration?: unknown; // free-text minutes
    languages?: string[];
    included_for_partners?: string[];
    coming_soon?: boolean;
    weeks?: { sessions?: unknown[] }[];
    image_with_background?: { filename?: string };
  };
}

// Narrows a Storyblok story to the fields above.
export function toLibraryStory(story: ISbStoryData): LibraryStory {
  const {
    name,
    component,
    description,
    themes,
    duration,
    languages,
    included_for_partners,
    coming_soon,
    weeks,
    image_with_background,
  } = story.content;

  return {
    uuid: story.uuid,
    full_slug: story.full_slug,
    content: {
      name,
      component,
      description,
      themes,
      duration,
      languages,
      included_for_partners,
      coming_soon,
      weeks,
      image_with_background,
    },
  };
}

// The Storyblok stories the library is built from, grouped by content type.
export interface LibraryStories {
  courses: LibraryStory[];
  // Lessons nested inside a course (Session / session_iba blocks), surfaced as single sessions.
  courseSessions: LibraryStory[];
  shorts: LibraryStory[];
  somatics: LibraryStory[];
  conversations: LibraryStory[];
}

// Storyblok component → library format.
const FORMAT_BY_COMPONENT: Record<string, Format> = {
  resource_conversation: 'audio',
  resource_short_video: 'video',
  resource_single_video: 'video',
  Session: 'video',
  session_iba: 'video',
};

// Fallback for a story with no themes set.
const DEFAULT_THEME: ThemeKey = 'healing-journey';

// Storyblok's `themes` is a multi-option field.
function themesForStory(story: LibraryStory): ThemeKey[] {
  const themes = story.content.themes;
  return Array.isArray(themes) && themes.length ? (themes as ThemeKey[]) : [DEFAULT_THEME];
}

// Storyblok duration is free-text minutes that is sometimes blank.
function parseMinutes(duration: unknown): number | undefined {
  const minutes = Number(duration);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : undefined;
}

// A description is a plain string on courses but a rich-text document on resources.
function toPlainText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  const node = value as { text?: string; content?: unknown[] };
  if (typeof node.text === 'string') return node.text;
  if (Array.isArray(node.content)) {
    return node.content.map(toPlainText).join(' ').replace(/\s+/g, ' ').trim();
  }
  return '';
}

// Path heads that AuthGuard treats as authenticated, of the ones the library can link to.
const AUTHENTICATED_PATH_HEADS = ['videos', 'conversations'];

// Mirrors the rules in components/guards/AuthGuard.tsx: somatic videos and audio conversations
// always need an account, as does a lesson inside a course (`courses/<course>/<lesson>`). Course
// overviews and shorts are public.
//
// Takes an app path, not a Storyblok `full_slug`: a translated story's slug is prefixed with its
// locale (`de/videos/…`), which would hide the path head this reads.
export function pathRequiresAccount(path: string): boolean {
  const segments = normaliseSlug(path).split('/');
  if (AUTHENTICATED_PATH_HEADS.includes(segments[0])) return true;
  return segments[0] === 'courses' && segments.length > 2;
}

// Maps a Storyblok story to a LibraryItem. Progress is attached in useLibraryItems.
export function storyToLibraryItem(story: LibraryStory, locale: string): LibraryItem {
  const content = story.content;
  const href = getDefaultFullSlug(normaliseSlug(story.full_slug), locale);
  const base = {
    id: story.uuid,
    themes: themesForStory(story),
    title: content.name,
    description: toPlainText(content.description),
    href,
    requiresAccount: pathRequiresAccount(href),
  };

  if (content.component === COURSE_COMPONENT) {
    // `weeks` is a grouping wrapper; the sessions are counted across all of them.
    const weeks = (content.weeks ?? []) as { sessions?: unknown[] }[];
    return {
      ...base,
      kind: 'course',
      sessionCount: weeks.reduce((total, week) => total + (week.sessions?.length ?? 0), 0),
      imageSrc: content.image_with_background?.filename,
    };
  }

  return {
    ...base,
    kind: 'session',
    format: FORMAT_BY_COMPONENT[content.component ?? ''] ?? 'video',
    minutes: parseMinutes(content.duration),
  };
}

export function bucketOf(minutes: number): LengthBucket {
  if (minutes < 10) return 'under10';
  if (minutes <= 20) return '10to20';
  return 'over20';
}

// Storyblok returns course slugs with a trailing slash and lesson slugs without one.
export function normaliseSlug(fullSlug: string): string {
  return fullSlug.replace(/^\/+|\/+$/g, '');
}

// The slug of the course a lesson belongs to, read from its path (`<course slug>/<lesson>`).
export function parentCourseSlug(lessonFullSlug: string): string {
  return normaliseSlug(lessonFullSlug).split('/').slice(0, -1).join('/');
}

// The state of every filter on the page. Empty array = that filter is off (matches everything).
export interface LibraryFilters {
  keyword: string;
  kind: KindFilter;
  themes: ThemeKey[];
  formats: Format[];
  lengths: LengthBucket[];
}

// Filters combine as AND across groups and OR within a group. A keyword puts title matches first;
// otherwise the Storyblok order is kept.
export function filterLibraryItems(items: LibraryItem[], filters: LibraryFilters): LibraryItem[] {
  const { keyword, kind, themes, formats, lengths } = filters;
  const search = keyword.trim().toLowerCase();

  const matches = items.filter((item) => {
    if (kind !== 'all' && item.kind !== kind) return false;
    if (themes.length && !item.themes.some((theme) => themes.includes(theme))) return false;
    if (search && !`${item.title} ${item.description}`.toLowerCase().includes(search)) return false;

    if (formats.length && (item.format == null || !formats.includes(item.format))) return false;
    if (lengths.length && (item.minutes == null || !lengths.includes(bucketOf(item.minutes))))
      return false;

    return true;
  });

  if (!search) return matches;

  const titleMatchesFirst = (item: LibraryItem) =>
    item.title.toLowerCase().includes(search) ? 0 : 1;
  return matches.sort((a, b) => titleMatchesFirst(a) - titleMatchesFirst(b));
}

export function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

// A LibraryItem's `progress` is a translation key ('started'); analytics reports a PROGRESS_STATUS
// ('Started'), as the course and resource progress events do.
export const PROGRESS_STATUS_BY_ITEM_PROGRESS: Record<
  NonNullable<LibraryItem['progress']> | 'none',
  PROGRESS_STATUS
> = {
  started: PROGRESS_STATUS.STARTED,
  completed: PROGRESS_STATUS.COMPLETED,
  none: PROGRESS_STATUS.NOT_STARTED,
};
