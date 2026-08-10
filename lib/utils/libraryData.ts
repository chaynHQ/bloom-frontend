// Pure data, types, and Storyblok → LibraryItem mapping for the library. No 'use client': this
// is imported by both the route (a Server Component) and the page UI.

import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import { ISbStoryData } from '@storyblok/react/rsc';

// Storyblok component (bloktype) name for a course story, matching the fetch filter_query.
const COURSE_COMPONENT = 'Course';

// A course is a guided journey of several sessions; a "session" is a single thing to sit with —
// a course lesson, a short, a somatic video, or an audio conversation.
export type Kind = 'course' | 'session';

// The kind toggle above the results.
export type KindFilter = 'all' | Kind;

// Display order of the kind toggle; labels live under `Library.kind.<key>`.
export const KIND_KEYS: KindFilter[] = ['all', 'course', 'session'];

// Grounding is deliberately not a library format; it is offered after intense content instead.
export type Format = 'audio' | 'written' | 'video' | 'activity';

// The "Content type" filter: a library item is a whole course, or a single session in a format.
export type ContentType = 'course' | Format;

export type ThemeKey =
  | 'recognising-harm'
  | 'why-harm-happens'
  | 'body-after-trauma'
  | 'setting-boundaries'
  | 'healing-journey'
  | 'staying-safe';

// Display order of the "Explore by theme" cards; each key has `label`, `blurb`, and `description`
// under `Library.themes.<key>`.
export const THEME_KEYS: ThemeKey[] = [
  'recognising-harm',
  'why-harm-happens',
  'body-after-trauma',
  'setting-boundaries',
  'healing-journey',
  'staying-safe',
];

export type LengthBucket = 'under10' | '10to20' | 'over20';
// Display order of the "Length" filter; labels live under `Library.lengths.<key>`.
export const LENGTH_KEYS: LengthBucket[] = ['under10', '10to20', 'over20'];

// Display order of the "Content type" filter; labels live under `Library.contentTypes.<key>`.
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
  // On a course lesson: the title of the course it belongs to. Lessons carry no duration, so the
  // card reports this instead.
  courseTitle?: string;
  sessionCount?: number; // courses only
  progress?: 'started' | 'completed'; // logged-in users who have started/completed the item
}

// The raw Storyblok stories the library is built from, grouped by content type. Fetched
// server-side (getLibraryStories) and filtered/mapped client-side (useLibraryItems).
export interface LibraryStories {
  courses: ISbStoryData[];
  // Lessons nested inside a course (Session / session_iba blocks), surfaced as single sessions.
  // Kept separate so their parent-course visibility can be enforced in useLibraryItems.
  courseSessions: ISbStoryData[];
  shorts: ISbStoryData[];
  somatics: ISbStoryData[];
  conversations: ISbStoryData[];
}

// Storyblok component → library format. Only audio and video exist in the CMS today, and the
// format filter renders from what is actually present.
const FORMAT_BY_COMPONENT: Record<string, Format> = {
  resource_conversation: 'audio',
  resource_short_video: 'video',
  resource_single_video: 'video',
  Session: 'video',
  session_iba: 'video',
};

// Fallback for a story with no themes set yet, so a card never renders untagged.
const DEFAULT_THEME: ThemeKey = 'healing-journey';

// Storyblok's `themes` is a multi-option field, so a story can belong to several themes.
function themesForStory(story: ISbStoryData): ThemeKey[] {
  const themes = story.content.themes;
  return Array.isArray(themes) && themes.length ? (themes as ThemeKey[]) : [DEFAULT_THEME];
}

// Storyblok duration is free-text minutes that is sometimes blank; return a positive number or
// undefined so callers can hide the duration / skip length filtering.
function parseMinutes(duration: unknown): number | undefined {
  const minutes = Number(duration);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : undefined;
}

// A description is a plain string on courses but a Storyblok rich-text document on resources.
// Flatten either shape to plain text for the card blurb and keyword search.
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

// Maps a raw Storyblok story to a LibraryItem. Progress is attached separately (it needs Redux
// user state) in useLibraryItems.
export function storyToLibraryItem(story: ISbStoryData, locale: string): LibraryItem {
  const content = story.content;
  const base = {
    id: story.uuid,
    themes: themesForStory(story),
    title: content.name,
    description: toPlainText(content.description),
    href: getDefaultFullSlug(story.full_slug, locale),
  };

  if (content.component === COURSE_COMPONENT) {
    // `weeks` is a grouping wrapper; the card reports the total sessions across all of them.
    const weeks = (content.weeks ?? []) as { sessions?: unknown[] }[];
    return {
      ...base,
      kind: 'course',
      sessionCount: weeks.reduce((total, week) => total + (week.sessions?.length ?? 0), 0),
    };
  }

  return {
    ...base,
    kind: 'session',
    // The fallback only guards a component added to a session folder without being mapped above.
    format: FORMAT_BY_COMPONENT[content.component ?? ''] ?? 'video',
    minutes: parseMinutes(content.duration),
  };
}

export function bucketOf(minutes: number): LengthBucket {
  if (minutes < 10) return 'under10';
  if (minutes <= 20) return '10to20';
  return 'over20';
}

// Storyblok's full_slug is inconsistent about leading/trailing slashes (courses come back as
// `courses/managing-anxiety/`, lessons as `courses/managing-anxiety/what-is-anxiety`).
export function normaliseSlug(fullSlug: string): string {
  return fullSlug.replace(/^\/+|\/+$/g, '');
}

// The slug of the course a lesson belongs to, read from its path (`<course slug>/<lesson>`).
// Deliberately not `content.course`: that hand-set uuid is already wrong for one lesson in the
// CMS, and the parent course is what decides whether a lesson may be shown at all.
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

// Filters combine as AND across groups and OR within a group.
export function filterLibraryItems(items: LibraryItem[], filters: LibraryFilters): LibraryItem[] {
  const { keyword, kind, themes, formats, lengths } = filters;
  const search = keyword.trim().toLowerCase();

  return items.filter((item) => {
    if (kind !== 'all' && item.kind !== kind) return false;
    if (themes.length && !item.themes.some((theme) => themes.includes(theme))) return false;
    if (search && !`${item.title} ${item.description}`.toLowerCase().includes(search)) return false;

    // Format and length describe a single session, so either one excludes courses outright.
    if (formats.length && (item.format == null || !formats.includes(item.format))) return false;
    // An item of unknown length (course lessons, blank-duration shorts) can't fall in a bucket,
    // so choosing any length excludes it rather than guessing.
    if (lengths.length && (item.minutes == null || !lengths.includes(bucketOf(item.minutes))))
      return false;

    return true;
  });
}

export function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
