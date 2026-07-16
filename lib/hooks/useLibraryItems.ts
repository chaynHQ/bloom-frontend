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
} from '@/lib/utils/libraryData';
import userHasAccessToPartnerContent from '@/lib/utils/userHasAccessToPartnerContent';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useLocale } from 'next-intl';
import { useMemo } from 'react';

// Progress records in the courses/resources Redux slices share this shape, both keyed off the
// Storyblok uuid, which is a LibraryItem's id.
interface ProgressRecord {
  storyblokUuid: string;
  completed: boolean;
}

function withProgress(item: LibraryItem, progress: ProgressRecord[]): LibraryItem {
  const record = progress.find((p) => p.storyblokUuid === item.id);
  if (!record) return item;
  return { ...item, progress: record.completed ? 'completed' : 'started' };
}

// Turns the server-fetched library stories into display-ready LibraryItems: filters by locale and
// the user's partner access (anonymous users see public content), then attaches course/resource
// progress from Redux.
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

  // Refresh course progress for logged-in users.
  useGetUserCoursesQuery(undefined, { skip: !isLoggedIn });

  return useMemo(() => {
    const userPartners = userHasAccessToPartnerContent(
      partnerAdmin?.partner,
      partnerAccesses,
      referralPartner,
      userId,
    );
    const accessible = (list: ISbStoryData[]) =>
      filterStoriesForLocaleAndPartnerAccess(list, locale, userPartners);

    const courseStories = accessible(stories.courses).filter((story) => !story.content.coming_soon);
    const courseItems = courseStories.map((story) =>
      withProgress(storyToLibraryItem(story, locale), coursesProgress),
    );

    // A lesson is only browsable when its parent course is, so gate lessons on the visible
    // courses. Keyed by slug (via parentCourseSlug) rather than the hand-set `content.course`
    // uuid, which is unreliable — see parentCourseSlug. The map also supplies the parent title.
    const visibleCourseTitles = new Map(
      courseStories.map((story) => [normaliseSlug(story.full_slug), story.content.name as string]),
    );
    // Lesson completion is tracked per-course, nested under each course's `sessions`.
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
