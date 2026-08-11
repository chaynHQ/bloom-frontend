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

    // getStoryblokStories returns undefined on error, which is not an empty page.
    if (!batch) {
      throw new Error(
        `Storyblok request failed for library stories (starts_with: ${params.starts_with}, page: ${page})`,
      );
    }

    stories.push(...batch);
    if (batch.length < PER_PAGE) break;
  }

  return stories.map(toLibraryStory);
}

async function getOptionalStories(
  locale: string,
  params: Partial<ISbStoriesParams>,
): Promise<LibraryStory[]> {
  try {
    return await getAllStoryblokStories(locale, params);
  } catch (error) {
    console.error(
      `Library: dropping the "${params.starts_with}" content group after a Storyblok failure`,
      error,
    );
    return [];
  }
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
    getOptionalStories(locale, {
      ...baseProps,
      starts_with: 'courses/',
      filter_query: { component: { in: 'Session,session_iba' } },
    }),
    getOptionalStories(locale, { ...baseProps, starts_with: 'shorts/' }),
    getOptionalStories(locale, {
      ...baseProps,
      starts_with: 'videos/',
      with_tag: STORYBLOK_TAGS.SOMATICS,
    }),
    getOptionalStories(locale, { ...baseProps, starts_with: 'conversations/' }),
  ]);

  return { courses, courseSessions, shorts, somatics, conversations };
}
