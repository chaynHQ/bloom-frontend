import { STORYBLOK_ENVIRONMENT } from '@/lib/constants/common';
import { STORYBLOK_TAGS } from '@/lib/constants/enums';
import { getStoryblokStories } from '@/lib/storyblok';
import { ISbStoriesParams, ISbStoryData } from '@storyblok/react/rsc';
import type { LibraryStories } from './libraryData';

// Storyblok's page size caps at 100 and — crucially — DEFAULTS TO 25. The other content pages
// each fetch a single folder that has always been smaller than that, so they never had to think
// about it; the library fetches every course lesson in the CMS (57 today) and would silently
// show only the first 25 of them. Every library query therefore pages to exhaustion.
const PER_PAGE = 100;

// A runaway guard, not a real limit: 20 pages is 2000 stories, far beyond anything Bloom holds.
// If we ever hit it, the loop stops rather than hammering Storyblok forever.
const MAX_PAGES = 20;

// Fetches every story matching `params`, following Storyblok's pagination to the end. A short
// final page means there is nothing after it, so no separate count request is needed.
async function getAllStoryblokStories(
  locale: string,
  params: Partial<ISbStoriesParams>,
): Promise<ISbStoryData[]> {
  const stories: ISbStoryData[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await getStoryblokStories(locale, { ...params, per_page: PER_PAGE, page });

    // getStoryblokStories swallows its own errors and returns undefined, which is NOT the same as
    // an empty page. Treating the two alike would turn a transient Storyblok 5xx on page 2 into a
    // library that quietly serves half its content and looks perfectly healthy. Fail the request
    // instead: a page that errors is an error, and the caller's error boundary should see it.
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

// Server-only: fetches the raw Storyblok stories that make up the library — courses, the
// individual lessons inside them, and the standalone resources presented as "single sessions"
// (shorts, somatic videos, and audio conversations). Mirrors the query shape the courses page
// used so the library draws from exactly the same content. Locale + partner-access filtering
// happens client-side in useLibraryItems, since it depends on the logged-in user's Redux state.
export async function getLibraryStories(locale: string): Promise<LibraryStories> {
  const baseProps: Partial<ISbStoriesParams> = {
    language: locale,
    version: STORYBLOK_ENVIRONMENT,
    sort_by: 'position:description',
  };

  const [courses, courseSessions, shorts, somatics, conversations] = await Promise.all([
    getAllStoryblokStories(locale, {
      ...baseProps,
      starts_with: 'courses/',
      filter_query: { component: { in: 'Course' } },
    }),
    // Individual lessons within a course ("Session" / "session_iba" blocks). Presented in the
    // library as single sessions so they can be searched alongside courses and standalone
    // resources; useLibraryItems couples their visibility to their parent course.
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
