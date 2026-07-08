'use client';

import { useGetUserCoursesQuery } from '@/lib/api';
import { useTypedSelector } from '@/lib/hooks/store';
import { useCookieReferralPartner } from '@/lib/hooks/useCookieReferralPartner';
import filterStoriesForLocaleAndPartnerAccess from '@/lib/utils/filterStoryByLanguageAndPartnerAccess';
import userHasAccessToPartnerContent from '@/lib/utils/userHasAccessToPartnerContent';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import { storyToLibraryItem, type LibraryItem, type LibraryStories } from './libraryData';

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

    const courseItems = accessible(stories.courses)
      .filter((story) => !story.content.coming_soon)
      .map((story) => withProgress(storyToLibraryItem(story, locale), coursesProgress));

    const resourceStories = [...stories.shorts, ...stories.somatics, ...stories.conversations];
    const sessionItems = accessible(resourceStories).map((story) =>
      withProgress(storyToLibraryItem(story, locale), resourcesProgress),
    );

    return [...courseItems, ...sessionItems];
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
