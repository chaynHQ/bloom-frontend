'use client';

import { useGetUserCoursesQuery } from '@/lib/api';
import { useTypedSelector } from '@/lib/hooks/store';
import { useUserAuthStatus } from '@/lib/hooks/useUserAuthStatus';
import { useUserContentPartners } from '@/lib/hooks/useUserContentPartners';
import {
  normaliseSlug,
  parentCourseSlug,
  storyToLibraryItem,
  type LibraryItem,
  type LibraryStories,
  type LibraryStory,
} from '@/lib/utils/libraryData';
import { filterStoriesForLocaleAndPartnerAccess } from '@/lib/utils/partnerContentAccess';
import { useLocale } from 'next-intl';
import { useMemo } from 'react';

interface ProgressRecord {
  storyblokUuid: string;
  completed: boolean;
}

function withProgress(item: LibraryItem, progress: ProgressRecord[]): LibraryItem {
  const record = progress.find((p) => p.storyblokUuid === item.id);
  if (!record) return item;
  return { ...item, progress: record.completed ? 'completed' : 'started' };
}

// Filters the server-fetched stories by locale and partner access, then attaches Redux progress.
export function useLibraryItems(stories: LibraryStories): LibraryItem[] {
  const locale = useLocale();
  const coursesProgress = useTypedSelector((state) => state.courses);
  const resourcesProgress = useTypedSelector((state) => state.resources);
  const userPartners = useUserContentPartners();
  const isSignedIn = useUserAuthStatus() === 'signedIn';

  useGetUserCoursesQuery(undefined, { skip: !isSignedIn });

  return useMemo(() => {
    const accessible = (list: LibraryStory[]) =>
      filterStoriesForLocaleAndPartnerAccess(list, locale, userPartners);

    const courseStories = accessible(stories.courses).filter((story) => !story.content.coming_soon);
    const courseItems = courseStories.map((story) =>
      withProgress(storyToLibraryItem(story, locale), coursesProgress),
    );

    // A Public course opens its first lesson to logged-out visitors, so that lesson's library card
    // drops the "Account needed" badge. `weeks[].sessions` holds session uuids (relation unresolved).
    const freeFirstSessionUuids = new Set(
      courseStories
        .filter((story) => (story.content.included_for_partners ?? []).includes('Public'))
        .map((story) => (story.content.weeks ?? []).flatMap((week) => week.sessions ?? [])[0])
        .filter((uuid): uuid is string => typeof uuid === 'string'),
    );

    // A lesson is only browsable when its parent course is. Keyed by slug — see parentCourseSlug.
    const visibleCourseTitles = new Map(
      courseStories.map((story) => [normaliseSlug(story.full_slug), story.content.name]),
    );
    const sessionProgress = coursesProgress.flatMap((course) => course.sessions ?? []);
    const courseSessionItems = accessible(stories.courseSessions)
      .filter((story) => !story.content.coming_soon)
      .filter((story) => visibleCourseTitles.has(parentCourseSlug(story.full_slug)))
      .map((story) =>
        withProgress(
          {
            ...storyToLibraryItem(story, locale, freeFirstSessionUuids),
            courseTitle: visibleCourseTitles.get(parentCourseSlug(story.full_slug)),
          },
          sessionProgress,
        ),
      );

    const resourceStories = [
      ...stories.shorts,
      ...stories.somatics,
      ...stories.conversations,
      ...stories.written,
      ...stories.activity,
    ];
    const sessionItems = accessible(resourceStories).map((story) =>
      withProgress(storyToLibraryItem(story, locale), resourcesProgress),
    );

    return [...courseItems, ...sessionItems, ...courseSessionItems];
  }, [stories, locale, userPartners, coursesProgress, resourcesProgress]);
}
