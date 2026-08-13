'use client';

import { useGetUserCoursesQuery } from '@/lib/api';
import { useTypedSelector } from '@/lib/hooks/store';
import { useCookieReferralPartner } from '@/lib/hooks/useCookieReferralPartner';
import filterStoriesForLocaleAndPartnerAccess from '@/lib/utils/filterStoryByLanguageAndPartnerAccess';
import {
  normaliseSlug,
  parentCourseSlug,
  storyToLibraryItem,
  type LibraryItem,
  type LibraryStories,
  type LibraryStory,
} from '@/lib/utils/libraryData';
import userHasAccessToPartnerContent from '@/lib/utils/userHasAccessToPartnerContent';
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
  const userId = useTypedSelector((state) => state.user.id);
  const authStateLoading = useTypedSelector((state) => state.user.authStateLoading);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const coursesProgress = useTypedSelector((state) => state.courses);
  const resourcesProgress = useTypedSelector((state) => state.resources);
  const referralPartner = useCookieReferralPartner();
  const isLoggedIn = !authStateLoading && Boolean(userId);

  useGetUserCoursesQuery(undefined, { skip: !isLoggedIn });

  return useMemo(() => {
    const userPartners = userHasAccessToPartnerContent(
      partnerAdmin?.partner,
      partnerAccesses,
      referralPartner,
      userId,
    );
    const accessible = (list: LibraryStory[]) =>
      filterStoriesForLocaleAndPartnerAccess(list, locale, userPartners);

    const courseStories = accessible(stories.courses).filter((story) => !story.content.coming_soon);
    const courseItems = courseStories.map((story) =>
      withProgress(storyToLibraryItem(story, locale), coursesProgress),
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
            ...storyToLibraryItem(story, locale),
            courseTitle: visibleCourseTitles.get(parentCourseSlug(story.full_slug)),
          },
          sessionProgress,
        ),
      );

    const resourceStories = [...stories.shorts, ...stories.somatics, ...stories.conversations];
    const sessionItems = accessible(resourceStories).map((story) =>
      withProgress(storyToLibraryItem(story, locale), resourcesProgress),
    );

    return [...courseItems, ...sessionItems, ...courseSessionItems];
  }, [
    stories,
    locale,
    userId,
    partnerAccesses,
    partnerAdmin,
    referralPartner,
    coursesProgress,
    resourcesProgress,
  ]);
}
