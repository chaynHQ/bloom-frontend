import { STORYBLOK_ENVIRONMENT } from '@/lib/constants/common';
import { getStoryblokApi, getStoryblokStories } from '@/lib/storyblok';
import { serverInstance as rollbar } from '@/lib/rollbar';
import { ISbStoriesParams, ISbStoryData } from '@storyblok/react/rsc';
import {
  sortByFolderPosition,
  toLibraryStory,
  type LibraryStories,
  type LibraryStory,
  type StoryblokFolderLink,
} from './libraryData';

// Storyblok's page size caps at 100 and defaults to 25.
const PER_PAGE = 100;

// Runaway guard: 20 pages is 2000 stories.
const MAX_PAGES = 20;

async function fetchAllStoryblokStories(
  locale: string,
  params: Partial<ISbStoriesParams>,
): Promise<ISbStoryData[]> {
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

  return stories;
}

async function getAllStoryblokStories(
  locale: string,
  params: Partial<ISbStoriesParams>,
): Promise<LibraryStory[]> {
  return (await fetchAllStoryblokStories(locale, params)).map(toLibraryStory);
}

// On error, reports to Rollbar and returns no links, so courses keep Storyblok's own order.
async function getCourseFolderLinks(): Promise<StoryblokFolderLink[]> {
  try {
    const { data } = await getStoryblokApi().get('cdn/links', {
      version: STORYBLOK_ENVIRONMENT,
      starts_with: 'courses/',
    });
    return Object.values(data?.links ?? {}) as StoryblokFolderLink[];
  } catch (error) {
    rollbar.error('Error getting storyblok course folder links', error as Error);
    return [];
  }
}

const baseProps = (locale: string): Partial<ISbStoriesParams> => ({
  language: locale,
  version: STORYBLOK_ENVIRONMENT,
  sort_by: 'position:asc',
});

// Server-only. Locale and partner-access filtering happens client-side in useLibraryItems.
export async function getCourseStories(locale: string): Promise<LibraryStory[]> {
  const [stories, folderLinks] = await Promise.all([
    fetchAllStoryblokStories(locale, {
      ...baseProps(locale),
      starts_with: 'courses/',
      filter_query: { component: { in: 'Course' } },
    }),
    getCourseFolderLinks(),
  ]);

  return sortByFolderPosition(stories, folderLinks).map(toLibraryStory);
}

// Server-only. Locale and partner-access filtering happens client-side in useLibraryItems.
export async function getLibraryStories(locale: string): Promise<LibraryStories> {
  const [courses, courseSessions, audio, video, written, activity] = await Promise.all([
    getCourseStories(locale),
    getAllStoryblokStories(locale, {
      ...baseProps(locale),
      starts_with: 'courses/',
      filter_query: { component: { in: 'Session,session_iba' } },
    }),
    getAllStoryblokStories(locale, { ...baseProps(locale), starts_with: 'audio/' }),
    getAllStoryblokStories(locale, { ...baseProps(locale), starts_with: 'video/' }),
    getAllStoryblokStories(locale, { ...baseProps(locale), starts_with: 'written/' }),
    getAllStoryblokStories(locale, { ...baseProps(locale), starts_with: 'activity/' }),
  ]);

  return {
    courses,
    courseSessions,
    resources: [...audio, ...video, ...written, ...activity],
  };
}
