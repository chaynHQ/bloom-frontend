import { STORYBLOK_ENVIRONMENT } from '@/lib/constants/common';
import { getStoryblokApi, getStoryblokStories } from '@/lib/storyblok';
import { serverInstance as rollbar } from '@/lib/rollbar';
import { ISbStoriesParams, ISbStoryData } from '@storyblok/react/rsc';
import {
  sortByFolderPosition,
  toLibraryStory,
  toPlainText,
  type LibraryStories,
  type LibraryStory,
  type StoryblokFolderLink,
} from './libraryData';
import { buildTranscriptVocabulary, type LibraryTranscripts } from './librarySearch';
import { storyAvailableInLocale } from './partnerContentAccess';

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

    // getStoryblokStories reports to Rollbar and returns undefined on error. Every caller is cached,
    // so throw rather than cache a listing with stories missing: a failed revalidation keeps the
    // last good page, and a build fails rather than deploying it.
    if (!batch) throw new Error(`Storyblok stories request failed (${locale}, page ${page})`);

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

// Empty on error, so courses fall back to Storyblok's own order.
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

// Where each content type keeps the bulk of its words. Course stories are left out: their intro
// transcript is mostly presenter small talk, and the course's own fields describe it better.
const TRANSCRIPT_FIELDS = ['video_transcript', 'audio_transcript', 'body', 'activity', 'bonus'];

function transcriptText(story: ISbStoryData): string {
  return TRANSCRIPT_FIELDS.map((field) => toPlainText(story.content[field])).join(' ');
}

// Server-only. Every library story's transcript vocabulary for the locale, for library search.
export async function getLibraryTranscripts(locale: string): Promise<LibraryTranscripts> {
  const groups = await Promise.all([
    fetchAllStoryblokStories(locale, {
      ...baseProps(locale),
      starts_with: 'courses/',
      filter_query: { component: { in: 'Session,session_iba' } },
    }),
    ...['audio/', 'video/', 'written/', 'activity/'].map((starts_with) =>
      fetchAllStoryblokStories(locale, { ...baseProps(locale), starts_with }),
    ),
  ]);

  const texts = Object.fromEntries(
    groups
      .flat()
      .filter((story) => storyAvailableInLocale(story.content.languages, locale))
      .map((story) => [story.uuid, transcriptText(story)]),
  );
  return buildTranscriptVocabulary(texts, locale);
}
