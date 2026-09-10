'use client';

import { LANGUAGES, PROGRESS_STATUS, RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import { useTypedSelector } from '@/lib/hooks/store';
import { useContentAccessStatus } from '@/lib/hooks/useContentAccessStatus';
import { useLogEventOnce } from '@/lib/hooks/useLogEventOnce';
import { useResourceProgress, type ResourceEventPrefix } from '@/lib/hooks/useResourceProgress';
import { useUserAuthStatus } from '@/lib/hooks/useUserAuthStatus';
import { useUserContentPartners } from '@/lib/hooks/useUserContentPartners';
import { Resource } from '@/lib/store/resourcesSlice';
import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import hasAccessToPage from '@/lib/utils/hasAccessToPage';
import { normaliseSlug } from '@/lib/utils/libraryData';
import { toResourceContributors } from '@/lib/utils/resourceContributors';
import { useStoryblokState } from '@storyblok/react';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useLocale } from 'next-intl';
import { useMemo } from 'react';

// The fields every resource-page story shares; individual pages cast `content` to their own,
// wider prop interface for the rest.
export interface ResourceStoryContent {
  name: string;
  languages: string[];
  included_for_partners: string[];
  themes?: string[];
  login_required?: boolean;
  contributor_images?: { filename: string; alt: string }[];
  contributors_description?: string;
  related_grounding?: ISbStoryData[];
  // The session this resource excerpts. May resolve as a single inlined story or a list of them.
  related_session?: ISbStoryData | ISbStoryData[];
}

interface UseStoryblokResourcePageArgs {
  initialStory: ISbStoryData;
  category: RESOURCE_CATEGORIES;
  eventPrefix: ResourceEventPrefix;
  viewedEvent: string;
  // Fallback when a story carries no `login_required` value: `true` gates it, the default leaves
  // it open.
  loginRequiredByDefault?: boolean;
}

// Shared data/access/progress wiring for the `resource_*` pages. Everything below the media
// itself (hero, media card, grounding, related content) is assembled by `ResourcePageLayout`;
// this hook is the layer above it that each page would otherwise hand-roll identically.
export function useStoryblokResourcePage<T extends ResourceStoryContent>({
  initialStory,
  category,
  eventPrefix,
  viewedEvent,
  loginRequiredByDefault = false,
}: UseStoryblokResourcePageArgs) {
  const story = useStoryblokState(initialStory) ?? initialStory;
  const content = story.content as T;
  const {
    name,
    languages,
    included_for_partners,
    themes,
    login_required,
    contributor_images,
    contributors_description,
    related_grounding,
    related_session,
  } = content;
  const storyUuid = story.uuid;

  const locale = useLocale();
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const resources = useTypedSelector((state) => state.resources);
  const userContentPartners = useUserContentPartners();
  const userAuthStatus = useUserAuthStatus();
  const isSignedIn = userAuthStatus === 'signedIn';

  const hasPageAccess = useMemo(() => {
    const isPublicContent = included_for_partners.some((p) => p.toLowerCase() === 'public');
    const availableForLocale = locale === LANGUAGES.en || languages.includes(locale);
    return (
      (isPublicContent ||
        hasAccessToPage(isSignedIn, included_for_partners, partnerAccesses, partnerAdmin)) &&
      availableForLocale
    );
  }, [partnerAccesses, included_for_partners, isSignedIn, partnerAdmin, locale, languages]);

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
      resource_themes: Array.isArray(themes) && themes.length ? themes.join(',') : 'none',
    }),
    [category, name, storyUuid, resourceProgress, themes],
  );

  // Log the view once, after auth settles, so account and progress attribution is accurate.
  useLogEventOnce(viewedEvent, eventData, userAuthStatus !== 'resolving');

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

  const { relatedSessionHref, relatedSessionName } = useMemo(() => {
    const session = Array.isArray(related_session) ? related_session[0] : related_session;
    if (!session || typeof session !== 'object' || !session.full_slug) {
      return { relatedSessionHref: undefined, relatedSessionName: undefined };
    }
    return {
      relatedSessionHref: getDefaultFullSlug(normaliseSlug(session.full_slug), locale),
      relatedSessionName: session.name,
    };
  }, [related_session, locale]);

  const contentAccessStatus = useContentAccessStatus({
    contentRequiresLogin: login_required == null ? loginRequiredByDefault : Boolean(login_required),
    hasPageAccess,
  });

  return {
    story,
    content,
    storyUuid,
    isSignedIn,
    contentAccessStatus,
    resourceProgress,
    resourceId,
    eventData,
    contributors,
    relatedGrounding,
    relatedSessionHref,
    relatedSessionName,
    userContentPartners,
    start,
    complete,
  };
}
