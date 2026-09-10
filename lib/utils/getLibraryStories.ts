import { STORYBLOK_ENVIRONMENT } from '@/lib/constants/common';
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

const baseProps = (locale: string): Partial<ISbStoriesParams> => ({
  language: locale,
  version: STORYBLOK_ENVIRONMENT,
  sort_by: 'position:asc',
});

// Server-only. Locale and partner-access filtering happens client-side in useLibraryItems.
export async function getCourseStories(locale: string): Promise<LibraryStory[]> {
  return getAllStoryblokStories(locale, {
    ...baseProps(locale),
    starts_with: 'courses/',
    filter_query: { component: { in: 'Course' } },
  });
}

const dedupeByUuid = (stories: LibraryStory[]): LibraryStory[] => {
  const seen = new Set<string>();
  return stories.filter((story) => {
    if (seen.has(story.uuid)) return false;
    seen.add(story.uuid);
    return true;
  });
};

// Server-only. Locale and partner-access filtering happens client-side in useLibraryItems.
export async function getLibraryStories(locale: string): Promise<LibraryStories> {
  // `video/` + `audio/` are queried alongside the old `shorts/` `videos/` `conversations/`
  // folders until step 7c finishes moving stories; a story caught mid-move can appear in both,
  // hence the uuid dedupe. The old-folder queries drop in step 7d. The `somatics` tag filter is
  // gone: after the merge every `videos/` story is just a video.
  const [
    courses,
    courseSessions,
    video,
    audio,
    shorts,
    somaticVideos,
    conversations,
    written,
    activity,
  ] = await Promise.all([
    getCourseStories(locale),
    getAllStoryblokStories(locale, {
      ...baseProps(locale),
      starts_with: 'courses/',
      filter_query: { component: { in: 'Session,session_iba' } },
    }),
    getAllStoryblokStories(locale, { ...baseProps(locale), starts_with: 'video/' }),
    getAllStoryblokStories(locale, { ...baseProps(locale), starts_with: 'audio/' }),
    getAllStoryblokStories(locale, { ...baseProps(locale), starts_with: 'shorts/' }),
    getAllStoryblokStories(locale, { ...baseProps(locale), starts_with: 'videos/' }),
    getAllStoryblokStories(locale, { ...baseProps(locale), starts_with: 'conversations/' }),
    getAllStoryblokStories(locale, { ...baseProps(locale), starts_with: 'written/' }),
    getAllStoryblokStories(locale, { ...baseProps(locale), starts_with: 'activity/' }),
  ]);

  return {
    courses,
    courseSessions,
    resources: dedupeByUuid([
      ...video,
      ...audio,
      ...shorts,
      ...somaticVideos,
      ...conversations,
      ...written,
      ...activity,
    ]),
  };
}
