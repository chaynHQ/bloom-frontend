// Pure data, types, and Storyblok → LibraryItem mapping for the library. NO 'use client'
// here on purpose: this module is imported by both Server Components (the route pages, for
// fetching + validating search params) and Client Components (the page UIs and the
// useLibraryItems hook). Anything that needs MUI/icons/hooks lives in libraryContent.tsx
// (a client module) instead.

import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import { ISbStoryData } from '@storyblok/react/rsc';

// Storyblok component (bloktype) name for a course story — capitalised, matching the
// filter_query used when fetching courses (see getLibraryStories / courses/page.tsx).
const COURSE_COMPONENT = 'Course';

// A course is a guided journey made of several sessions; a "session" in the library is an
// individual, standalone resource (a short, a somatic video, or an audio conversation).
export type Kind = 'course' | 'session';

// Grounding is intentionally NOT a library format. The library is a learning space
// (courses + single sessions); grounding/relaxation lives in its own "Grounding" space,
// offered after intense content rather than searched for like a lesson.
export type Format = 'audio' | 'written' | 'video' | 'activity';

// The "Content type" filter unifies the old course/session toggle with the format filter:
// a library item is a whole course, or a single session in one of the formats above.
export type ContentType = 'course' | Format;

export type ThemeKey =
  | 'recognising-harm'
  | 'why-harm-happens'
  | 'body-after-trauma'
  | 'setting-boundaries'
  | 'healing-journey'
  | 'staying-safe';

// Display order of the "Explore by theme" cards. Every key has a `label`, `blurb`, and
// `description` under `Library.themes.<key>` in the message files — the blurb is the one-liner
// on the guided-entry card, the description the fuller copy shown above the results once the
// theme is selected.
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

// Display order of the "Content type" filter. Only the formats actually present in the library
// are offered (see LibraryPage); labels live under `Library.contentTypes.<key>`.
export const FORMAT_KEYS: Format[] = ['audio', 'written', 'video', 'activity'];

export interface LibraryImage {
  filename: string;
  alt: string;
}

export interface LibraryItem {
  id: string; // Storyblok uuid
  kind: Kind;
  themes: ThemeKey[]; // a story can belong to more than one theme
  title: string;
  description: string;
  href: string; // resolved, locale-aware app path
  image?: LibraryImage; // Storyblok thumbnail (a.storyblok.com); absent → icon fallback
  // sessions (single resources)
  format?: Format;
  minutes?: number;
  // courses (multi-part)
  sessionCount?: number;
  // progress, only present for logged-in users who have started/completed the item
  progress?: 'started' | 'completed';
}

// The raw Storyblok stories the library is built from, grouped by content type. Fetched
// server-side (see getLibraryStories) and filtered/mapped client-side (see useLibraryItems).
export interface LibraryStories {
  courses: ISbStoryData[];
  // Individual lessons nested inside a course (Session / session_iba blocks), surfaced as
  // single sessions in the library. Kept separate from `courses` so their parent-course
  // visibility can be enforced in useLibraryItems.
  courseSessions: ISbStoryData[];
  shorts: ISbStoryData[];
  somatics: ISbStoryData[];
  conversations: ISbStoryData[];
}

// Standalone resource components → library "format". Only audio and video exist in the CMS
// today; the format filter is rendered data-driven from what's actually present, so adding
// written/activity resources later surfaces them automatically without code changes.
const FORMAT_BY_COMPONENT: Record<string, Format> = {
  resource_conversation: 'audio',
  resource_short_video: 'video',
  resource_single_video: 'video',
};

// Fallback for the rare story that has no themes set in Storyblok yet (e.g. a newly added
// course before it's been tagged) so a card never renders without a theme.
const DEFAULT_THEME: ThemeKey = 'healing-journey';

// Storyblok's `themes` is a multi-option field, so a story can belong to several themes.
function themesForStory(story: ISbStoryData): ThemeKey[] {
  const themes = story.content.themes;
  return Array.isArray(themes) && themes.length ? (themes as ThemeKey[]) : [DEFAULT_THEME];
}

// Storyblok duration is a free-text field (minutes) that is sometimes blank; return a
// positive number or undefined so callers can hide the duration / skip length filtering.
function parseMinutes(duration: unknown): number | undefined {
  const minutes = Number(duration);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : undefined;
}

// A description is a plain string on courses but a Storyblok rich-text document on resources.
// The card shows it as a clamped blurb and it feeds keyword search, so flatten either shape
// to plain text by collecting the rich-text leaf nodes.
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

// Picks the best available Storyblok image for a card thumbnail. Resources carry
// preview_image / header_image; courses carry an illustration. The order works for both
// because the shapes are mutually exclusive across content types.
function pickImage(content: Record<string, unknown>): LibraryImage | undefined {
  for (const key of ['preview_image', 'header_image', 'image_with_background', 'image']) {
    const asset = content[key] as { filename?: string; alt?: string } | undefined;
    if (asset?.filename) return { filename: asset.filename, alt: asset.alt ?? '' };
  }
  return undefined;
}

// Maps a raw Storyblok story to a LibraryItem. Progress is attached separately (it needs
// Redux user state) in useLibraryItems.
export function storyToLibraryItem(story: ISbStoryData, locale: string): LibraryItem {
  const content = story.content;
  const base = {
    id: story.uuid,
    themes: themesForStory(story),
    title: content.name,
    description: toPlainText(content.description),
    href: getDefaultFullSlug(story.full_slug, locale),
    image: pickImage(content),
  };

  if (content.component === COURSE_COMPONENT) {
    // `weeks` is only a grouping wrapper in the CMS; the library card reports the total number
    // of sessions across all of them, not the week structure.
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
    format: FORMAT_BY_COMPONENT[content.component ?? ''] ?? 'video',
    minutes: parseMinutes(content.duration),
  };
}

export function bucketOf(minutes: number): LengthBucket {
  if (minutes < 10) return 'under10';
  if (minutes <= 20) return '10to20';
  return 'over20';
}

export function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
