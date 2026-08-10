import { STORYBLOK_ENVIRONMENT } from '@/lib/constants/common';
import { STORYBLOK_TAGS } from '@/lib/constants/enums';
import { getStoryblokStories } from '@/lib/storyblok';
import { ISbStoriesParams, ISbStoryData } from '@storyblok/react/rsc';
import type { LibraryStories } from './libraryData';

// Storyblok's page size caps at 100 and defaults to 25, so these queries page to exhaustion
// rather than silently truncating.
const PER_PAGE = 100;

// Runaway guard: 20 pages is 2000 stories, far beyond anything Bloom holds.
const MAX_PAGES = 20;

// Fetches every story matching `params`, following Storyblok's pagination to the end. A short
// final page means there is nothing after it.
async function getAllStoryblokStories(
  locale: string,
  params: Partial<ISbStoriesParams>,
): Promise<ISbStoryData[]> {
  const stories: ISbStoryData[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await getStoryblokStories(locale, { ...params, per_page: PER_PAGE, page });

    // getStoryblokStories returns undefined on error, which is not an empty page. Fail the request
    // so a transient error surfaces to the error boundary instead of serving half the content.
    if (!batch) {
      throw new Error(
        `Storyblok request failed for library stories (starts_with: ${params.starts_with}, page: ${page})`,
      );
    }

    stories.push(...batch);
    if (batch.length < PER_PAGE) break;
  }

  return stories;
}

// Server-only: fetches the raw Storyblok stories that make up the library — courses, their
// lessons, and the standalone resources presented as single sessions (shorts, somatic videos,
// audio conversations). Locale + partner-access filtering happens client-side in useLibraryItems,
// since it depends on the logged-in user's Redux state.
export async function getLibraryStories(locale: string): Promise<LibraryStories> {
  const baseProps: Partial<ISbStoriesParams> = {
    language: locale,
    version: STORYBLOK_ENVIRONMENT,
    sort_by: 'position:asc',
  };

  const [courses, courseSessions, shorts, somatics, conversations] = await Promise.all([
    getAllStoryblokStories(locale, {
      ...baseProps,
      starts_with: 'courses/',
      filter_query: { component: { in: 'Course' } },
    }),
    // Individual lessons within a course; useLibraryItems couples their visibility to the parent.
    getAllStoryblokStories(locale, {
      ...baseProps,
      starts_with: 'courses/',
      filter_query: { component: { in: 'Session,session_iba' } },
    }),
    getAllStoryblokStories(locale, { ...baseProps, starts_with: 'shorts/' }),
    getAllStoryblokStories(locale, {
      ...baseProps,
      starts_with: 'videos/',
      with_tag: STORYBLOK_TAGS.SOMATICS,
    }),
    getAllStoryblokStories(locale, { ...baseProps, starts_with: 'conversations/' }),
  ]);

  return { courses, courseSessions, shorts, somatics, conversations };
}
