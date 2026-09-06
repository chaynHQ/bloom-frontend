'use client';

import { LANGUAGES, PROGRESS_STATUS, RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import { useTypedSelector } from '@/lib/hooks/store';
import { useIsUserLoading } from '@/lib/hooks/useIsUserLoading';
import { useResourceProgress, type ResourceEventPrefix } from '@/lib/hooks/useResourceProgress';
import { Resource } from '@/lib/store/resourcesSlice';
import hasAccessToPage from '@/lib/utils/hasAccessToPage';
import logEvent from '@/lib/utils/logEvent';
import { toResourceContributors } from '@/lib/utils/resourceContributors';
import userHasAccessToPartnerContent from '@/lib/utils/userHasAccessToPartnerContent';
import { useStoryblokState } from '@storyblok/react';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useLocale } from 'next-intl';
import { useEffect, useMemo, useRef } from 'react';

// The fields every resource-page story shares; individual pages cast `content` to their own,
// wider prop interface for the rest.
export interface ResourceStoryContent {
  name: string;
  languages: string[];
  included_for_partners: string[];
  login_required?: boolean;
  contributor_images?: { filename: string; alt: string }[];
  contributors_description?: string;
  related_grounding?: ISbStoryData[];
}

interface UseStoryblokResourcePageArgs {
  initialStory: ISbStoryData;
  category: RESOURCE_CATEGORIES;
  eventPrefix: ResourceEventPrefix;
  viewedEvent: string;
}

// Shared data/access/progress wiring for the `resource_*` pages. Everything below the media
// itself (hero, media card, grounding, related content) is assembled by `ResourcePageLayout`;
// this hook is the layer above it that each page would otherwise hand-roll identically.
export function useStoryblokResourcePage<T extends ResourceStoryContent>({
  initialStory,
  category,
  eventPrefix,
  viewedEvent,
}: UseStoryblokResourcePageArgs) {
  const story = useStoryblokState(initialStory) ?? initialStory;
  const content = story.content as T;
  const {
    name,
    languages,
    included_for_partners,
    login_required,
    contributor_images,
    contributors_description,
    related_grounding,
  } = content;
  const storyUuid = story.uuid;

  const locale = useLocale();
  const userId = useTypedSelector((state) => state.user.id);
  const authStateLoading = useTypedSelector((state) => state.user.authStateLoading);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const resources = useTypedSelector((state) => state.resources);
  const isLoggedIn = !authStateLoading && Boolean(userId);
  const isUserLoading = useIsUserLoading();

  const userAccess = useMemo(() => {
    const isPublicContent = included_for_partners.some(
      (partner) => partner.toLowerCase() === 'public',
    );
    const availableForLocale = locale === LANGUAGES.en || languages.includes(locale);
    return (
      (isPublicContent ||
        hasAccessToPage(isLoggedIn, true, included_for_partners, partnerAccesses, partnerAdmin)) &&
      availableForLocale
    );
  }, [partnerAccesses, included_for_partners, isLoggedIn, partnerAdmin, locale, languages]);

  const { resourceProgress, resourceId } = useMemo(() => {
    const userResource = resources.find((r: Resource) => r.storyblokUuid === storyUuid);
    if (userResource) {
      return {
        resourceProgress: userResource.completed
          ? PROGRESS_STATUS.COMPLETED
          : PROGRESS_STATUS.STARTED,
        resourceId: userResource.id,
      };
    }
    return { resourceProgress: PROGRESS_STATUS.NOT_STARTED, resourceId: undefined };
  }, [resources, storyUuid]);

  const eventData = useMemo(
    () => ({
      resource_category: category,
      resource_name: name,
      resource_storyblok_uuid: storyUuid,
      resource_progress: resourceProgress,
    }),
    [category, name, storyUuid, resourceProgress],
  );

  // Log the view once, after the auth/user load settles, so account and progress attribution on
  // the event is accurate rather than reflecting the pre-hydration state.
  const viewLogged = useRef(false);
  useEffect(() => {
    if (viewLogged.current || isUserLoading) return;
    viewLogged.current = true;
    logEvent(viewedEvent, eventData);
  }, [isUserLoading, viewedEvent, eventData]);

  const { start, complete } = useResourceProgress({
    storyUuid,
    eventPrefix,
    resourceProgress,
    eventData,
  });

  const contributors = useMemo(
    () => toResourceContributors(contributor_images, contributors_description),
    [contributor_images, contributors_description],
  );

  const relatedGrounding = useMemo<ISbStoryData[]>(
    () => (Array.isArray(related_grounding) ? related_grounding : []),
    [related_grounding],
  );

  const userContentPartners = useMemo(
    () => userHasAccessToPartnerContent(partnerAdmin?.partner, partnerAccesses, null, userId),
    [partnerAdmin, partnerAccesses, userId],
  );

  // Held back until the auth-loading window closes so a logged-in visitor never sees the login
  // dialog flash open then dismiss while their session resolves.
  const requiresLogin = !isUserLoading && Boolean(login_required) && !isLoggedIn;

  return {
    story,
    content,
    storyUuid,
    isLoggedIn,
    isUserLoading,
    userAccess,
    requiresLogin,
    resourceProgress,
    resourceId,
    eventData,
    contributors,
    relatedGrounding,
    userContentPartners,
    start,
    complete,
  };
}
