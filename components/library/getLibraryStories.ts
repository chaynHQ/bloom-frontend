import { STORYBLOK_ENVIRONMENT } from '@/lib/constants/common';
import { STORYBLOK_TAGS } from '@/lib/constants/enums';
import { getStoryblokStories } from '@/lib/storyblok';
import { ISbStoriesParams } from '@storyblok/react/rsc';
import type { LibraryStories } from './libraryData';

// Server-only: fetches the raw Storyblok stories that make up the library — courses plus the
// standalone resources presented as "single sessions" (shorts, somatic videos, and audio
// conversations). Mirrors the query shape used by courses/page.tsx so the library draws from
// exactly the same content. Locale + partner-access filtering happens client-side in
// useLibraryItems, since it depends on the logged-in user's Redux state.
export async function getLibraryStories(locale: string): Promise<LibraryStories> {
  const baseProps: Partial<ISbStoriesParams> = {
    language: locale,
    version: STORYBLOK_ENVIRONMENT,
    sort_by: 'position:description',
  };

  const [courses, courseSessions, shorts, somatics, conversations] = await Promise.all([
    getStoryblokStories(locale, {
      ...baseProps,
      starts_with: 'courses/',
      filter_query: { component: { in: 'Course' } },
    }),
    // Individual lessons within a course ("Session" / "session_iba" blocks). Presented in the
    // library as single sessions so they can be searched alongside courses and standalone
    // resources; useLibraryItems couples their visibility to their parent course.
    getStoryblokStories(locale, {
      ...baseProps,
      starts_with: 'courses/',
      filter_query: { component: { in: 'Session,session_iba' } },
    }),
    getStoryblokStories(locale, { ...baseProps, starts_with: 'shorts/' }),
    getStoryblokStories(locale, {
      ...baseProps,
      starts_with: 'videos/',
      with_tag: STORYBLOK_TAGS.SOMATICS,
    }),
    getStoryblokStories(locale, { ...baseProps, starts_with: 'conversations/' }),
  ]);

  return {
    courses: courses ?? [],
    courseSessions: courseSessions ?? [],
    shorts: shorts ?? [],
    somatics: somatics ?? [],
    conversations: conversations ?? [],
  };
}
