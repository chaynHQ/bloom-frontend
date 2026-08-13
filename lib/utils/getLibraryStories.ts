import { STORYBLOK_ENVIRONMENT } from '@/lib/constants/common';
import { STORYBLOK_TAGS } from '@/lib/constants/enums';
import { getStoryblokStories } from '@/lib/storyblok';
import { ISbStoriesParams, ISbStoryData } from '@storyblok/react/rsc';
import { toLibraryStory, type LibraryStories, type LibraryStory } from './libraryData';

// Storyblok's page size caps at 100 and defaults to 25.
const PER_PAGE = 100;

// Runaway guard: 20 pages is 2000 stories.
const MAX_PAGES = 20;

async function getAllStoryblokStories(
  locale: string,
  params: Partial<ISbStoriesParams>,
): Promise<LibraryStory[]> {
  const stories: ISbStoryData[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await getStoryblokStories(locale, { ...params, per_page: PER_PAGE, page });

    // getStoryblokStories reports to Rollbar and returns undefined on error. Keep the pages
    // already fetched rather than failing the render — every surface here degrades to fewer
    // cards, and no one content group should be able to take the page down.
    if (!batch) break;

    stories.push(...batch);
    if (batch.length < PER_PAGE) break;
  }

  return stories.map(toLibraryStory);
}

// Server-only. Locale and partner-access filtering happens client-side in useLibraryItems.
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
