'use client';

import { useGetUserCoursesQuery } from '@/lib/api';
import { useTypedSelector } from '@/lib/hooks/store';
import { useCookieReferralPartner } from '@/lib/hooks/useCookieReferralPartner';
import filterStoriesForLocaleAndPartnerAccess from '@/lib/utils/filterStoryByLanguageAndPartnerAccess';
import userHasAccessToPartnerContent from '@/lib/utils/userHasAccessToPartnerContent';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import {
  normaliseSlug,
  parentCourseSlug,
  storyToLibraryItem,
  type LibraryItem,
  type LibraryStories,
} from './libraryData';

// Progress records in the courses/resources Redux slices share this shape; both key off the
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

// Turns the raw, server-fetched library stories into display-ready LibraryItems: filters by
// the current locale and the user's partner access (anonymous users see public content), then
// attaches real course/resource progress from Redux. Shared by the library search page and
// the library homepage so both surfaces draw from identical data.
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

  // Refresh course progress for logged-in users, matching CoursesPage.
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

    // Individual course lessons are only browsable when their parent course is — a lesson of a
    // hidden, coming-soon, or partner-restricted course must not leak into the library. Gate on
    // the visible courses, then apply the lesson's own locale/coming-soon rules. The same map
    // supplies the parent course's title for the lesson's card meta.
    //
    // Courses are keyed by slug, not uuid: a lesson's parent is read from its path rather than
    // from the hand-set `content.course` uuid, which is already wrong for one lesson in the CMS.
    // See parentCourseSlug — this gate is what stops a restricted course's lessons leaking, so it
    // must not depend on a field an editor can mis-set.
    const visibleCourseTitles = new Map(
      courseStories.map((story) => [normaliseSlug(story.full_slug), story.content.name as string]),
    );
    // Lesson completion is tracked per-course in the courses slice, so its progress records live
    // nested under each course's `sessions`, not in a top-level list.
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
