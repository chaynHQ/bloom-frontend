// Pure data + types for the library prototype. NO 'use client' here on purpose: this
// module is imported by both Server Components (the route page, for validating search
// params) and Client Components (the page UIs). Anything that needs MUI/icons/hooks lives
// in libraryContent.tsx (a client module) instead. All values are static dummy data.

export type Kind = 'course' | 'session';

// Grounding is intentionally NOT a library format. The library is a learning space
// (courses + single sessions); grounding/relaxation lives in its own "Grounding" space,
// offered after intense content rather than searched for like a lesson.
export type Format = 'audio' | 'written' | 'video' | 'activity';

export type ThemeKey =
  | 'recognising-harm'
  | 'why-harm-happens'
  | 'body-after-trauma'
  | 'setting-boundaries'
  | 'healing-journey'
  | 'staying-safe';

export interface ThemeMeta {
  key: ThemeKey;
  label: string;
  blurb: string;
}

export const THEMES: ThemeMeta[] = [
  {
    key: 'recognising-harm',
    label: 'Recognising harm',
    blurb: 'Naming harm in relationships and everyday life',
  },
  {
    key: 'why-harm-happens',
    label: 'Why harm happens',
    blurb: 'The social and systemic forces behind abuse',
  },
  {
    key: 'body-after-trauma',
    label: 'Your body after trauma',
    blurb: 'How trauma lives in the body',
  },
  {
    key: 'setting-boundaries',
    label: 'Setting boundaries',
    blurb: 'Emotional, physical, sexual, and digital boundaries',
  },
  {
    key: 'healing-journey',
    label: 'Your healing journey',
    blurb: 'Finding your way through grief, growth, and recovery',
  },
  {
    key: 'staying-safe',
    label: 'Staying safe now',
    blurb: 'Safety planning and coping with ongoing abuse',
  },
];

export const THEME_LABEL: Record<ThemeKey, string> = Object.fromEntries(
  THEMES.map((t) => [t.key, t.label]),
) as Record<ThemeKey, string>;

export type LengthBucket = 'under10' | '10to20' | 'over20';
export const LENGTHS: { key: LengthBucket; label: string }[] = [
  { key: 'under10', label: 'Under 10 min' },
  { key: '10to20', label: '10–20 min' },
  { key: 'over20', label: 'Over 20 min' },
];

export interface LibraryItem {
  id: string;
  kind: Kind;
  theme: ThemeKey;
  title: string;
  description: string;
  // sessions (single resources)
  format?: Format;
  minutes?: number;
  // courses (multi-part)
  sessionCount?: number;
  totalLength?: string;
  progress?: 'started' | 'completed';
}

export const ITEMS: LibraryItem[] = [
  {
    id: 'c1',
    kind: 'course',
    theme: 'recognising-harm',
    title: 'Image-based abuse and rebuilding ourselves',
    description:
      'A guided course to understand image-based abuse and gently rebuild a sense of safety.',
    sessionCount: 8,
    totalLength: '~2hrs 30min',
    progress: 'started',
  },
  {
    id: 'c2',
    kind: 'course',
    theme: 'healing-journey',
    title: 'Reclaiming resilience in your trauma story',
    description:
      'Learn, reflect, and process what you have been through in a safe and empowering space.',
    sessionCount: 8,
    totalLength: '~2hrs 30min',
  },
  {
    id: 'c3',
    kind: 'course',
    theme: 'setting-boundaries',
    title: 'Recovering from toxic and abusive relationships',
    description:
      'Tools and affirming words to help you recognise patterns and set boundaries that protect you.',
    sessionCount: 8,
    totalLength: '~2hrs 30min',
    progress: 'completed',
  },
  {
    id: 's1',
    kind: 'session',
    theme: 'body-after-trauma',
    title: 'Understanding your nervous system after trauma',
    description:
      'A short audio explaining why the body reacts the way it does, and what that means for healing.',
    format: 'audio',
    minutes: 8,
    progress: 'started',
  },
  {
    id: 's2',
    kind: 'session',
    theme: 'why-harm-happens',
    title: 'Understanding the cycle of abuse',
    description: 'A written reflection on the social and systemic forces behind abuse.',
    format: 'written',
    minutes: 12,
  },
  {
    id: 's3',
    kind: 'session',
    theme: 'recognising-harm',
    title: 'Naming what happened to you',
    description: 'A video on recognising harm in relationships and everyday life.',
    format: 'video',
    minutes: 18,
  },
  {
    id: 's4',
    kind: 'session',
    theme: 'body-after-trauma',
    title: 'How trauma shapes memory',
    description:
      'A written piece on why memories of harm can feel fragmented, and why that is normal.',
    format: 'written',
    minutes: 9,
  },
  {
    id: 's5',
    kind: 'session',
    theme: 'staying-safe',
    title: 'Building your safety plan',
    description: 'A guided activity for safety planning and coping with ongoing abuse.',
    format: 'activity',
    minutes: 22,
  },
  {
    id: 's6',
    kind: 'session',
    theme: 'setting-boundaries',
    title: 'Boundaries in digital spaces',
    description: 'A written guide to emotional, physical, sexual, and digital boundaries.',
    format: 'written',
    minutes: 14,
  },
  {
    id: 's7',
    kind: 'session',
    theme: 'healing-journey',
    title: 'Sitting with grief',
    description: 'An audio companion for finding your way through grief, growth, and recovery.',
    format: 'audio',
    minutes: 24,
  },
  {
    id: 's8',
    kind: 'session',
    theme: 'staying-safe',
    title: 'Coping when things feel unsafe',
    description: 'A short video on grounding techniques for moments of crisis.',
    format: 'video',
    minutes: 6,
  },
];

export function bucketOf(minutes: number): LengthBucket {
  if (minutes < 10) return 'under10';
  if (minutes <= 20) return '10to20';
  return 'over20';
}

export function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
