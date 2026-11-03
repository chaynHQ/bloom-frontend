'use client';

import { useGetUserCoursesQuery } from '@/lib/api';
import { PROGRESS_STATUS, RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import { useTypedSelector } from '@/lib/hooks/store';
import { useContentAccessStatus } from '@/lib/hooks/useContentAccessStatus';
import { useLogEventOnce } from '@/lib/hooks/useLogEventOnce';
import { useResourceProgress, type ResourceEventPrefix } from '@/lib/hooks/useResourceProgress';
import { useUserAuthStatus } from '@/lib/hooks/useUserAuthStatus';
import { useUserContentPartners } from '@/lib/hooks/useUserContentPartners';
import { Resource } from '@/lib/store/resourcesSlice';
import { determineCourseProgress } from '@/lib/utils/courseProgress';
import {
  resourceProgressByUuid,
  type CourseSession,
  type SessionProgress,
} from '@/lib/utils/courseSessions';
import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import hasAccessToPage from '@/lib/utils/hasAccessToPage';
import { normaliseSlug, type LibraryStory } from '@/lib/utils/libraryData';
import {
  filterStoriesForLocaleAndPartnerAccess,
  storyAvailableInLocale,
} from '@/lib/utils/partnerContentAccess';
import { toResourceContributors } from '@/lib/utils/resourceContributors';
import { type BonusContent } from '@/components/session/MultipleBonusContent';
import { useStoryblokState } from '@storyblok/react';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useLocale } from 'next-intl';
import { useCallback, useMemo } from 'react';
import { type StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

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
  // Shown wherever the resource appears, on its own page and inside a course.
  activity?: StoryblokRichtext;
  bonus?: BonusContent[];
}

// What a resource route passes a page on top of the story.
export interface ResourcePageContextProps {
  courseContext?: CourseContext;
  // Course stories that list this resource, before locale and partner filtering.
  partOfCourseStories?: LibraryStory[];
}

// The modular course a resource is open in, when reached through `/courses/<course>/<folder>/<slug>`.
export interface CourseContext {
  courseName: string;
  courseHref: string;
  courseUuid: string;
  courseIncludedForPartners: string[];
  resources: CourseSession[];
}

// What the page layout needs to show the course around the resource.
export interface CourseNav extends CourseContext {
  progressByUuid: Record<string, SessionProgress>;
  nextResource?: CourseSession;
}

interface UseStoryblokResourcePageArgs {
  initialStory: ISbStoryData;
  category: RESOURCE_CATEGORIES;
  eventPrefix: ResourceEventPrefix;
  viewedEvent: string;
  // Fallback when a story carries no `login_required` value: `true` gates it, the default leaves
  // it open.
  loginRequiredByDefault?: boolean;
  courseContext?: CourseContext;
  partOfCourseStories?: LibraryStory[];
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
  courseContext,
  partOfCourseStories,
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
  const courses = useTypedSelector((state) => state.courses);
  const userContentPartners = useUserContentPartners();
  const userAuthStatus = useUserAuthStatus();
  const isSignedIn = userAuthStatus === 'signedIn';

  // Inside a course the playlist shows course progress, and `start` needs to know whether the
  // course is started; only a subscribed query refetches when progress invalidates it.
  useGetUserCoursesQuery(undefined, { skip: !isSignedIn || !courseContext });

  // A resource can exist in some languages only (including not yet in English). Signing in can't
  // change that, so pages show "not available in your language" before any auth/partner gating.
  const availableInLocale = storyAvailableInLocale(languages, locale);

  // Inside a course, the course's partner access applies first, then the resource's own.
  const hasPageAccess = useMemo(() => {
    const isOpenTo = (partners: string[]) =>
      partners.some((p) => p.toLowerCase() === 'public') ||
      hasAccessToPage(isSignedIn, partners, partnerAccesses, partnerAdmin);
    return (
      (!courseContext || isOpenTo(courseContext.courseIncludedForPartners)) &&
      isOpenTo(included_for_partners) &&
      availableInLocale
    );
  }, [
    partnerAccesses,
    included_for_partners,
    isSignedIn,
    partnerAdmin,
    availableInLocale,
    courseContext,
  ]);

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

  const courseNav = useMemo<CourseNav | undefined>(() => {
    if (!courseContext) return undefined;
    const currentIndex = courseContext.resources.findIndex(
      (resource) => resource.uuid === storyUuid,
    );
    return {
      ...courseContext,
      progressByUuid: resourceProgressByUuid(resources),
      nextResource: currentIndex === -1 ? undefined : courseContext.resources[currentIndex + 1],
    };
  }, [courseContext, resources, storyUuid]);

  const eventData = useMemo(
    () => ({
      resource_category: category,
      resource_name: name,
      resource_storyblok_uuid: storyUuid,
      resource_progress: resourceProgress,
      resource_themes: Array.isArray(themes) && themes.length ? themes.join(',') : 'none',
      ...(courseContext && {
        course_name: courseContext.courseName,
        course_storyblok_uuid: courseContext.courseUuid,
        course_resource_position:
          courseContext.resources.find((resource) => resource.uuid === storyUuid)?.position ?? null,
      }),
    }),
    [category, name, storyUuid, resourceProgress, themes, courseContext],
  );

  const contentAccessStatus = useContentAccessStatus({
    contentRequiresLogin: login_required == null ? loginRequiredByDefault : Boolean(login_required),
    hasPageAccess,
  });

  // Written pages start on view, before any gating. Inside a course, progress waits until the
  // member can see the resource, so one start carries the course.
  const awaitingCourseAccess = !!courseContext && contentAccessStatus !== 'accessGranted';
  const courseStarted =
    !!courseContext &&
    determineCourseProgress(courses, courseContext.courseUuid) !== PROGRESS_STATUS.NOT_STARTED;

  // Log the view once, after auth settles, so account and progress attribution is accurate.
  useLogEventOnce(viewedEvent, eventData, userAuthStatus !== 'resolving');

  const { start: startResource, complete } = useResourceProgress({
    storyUuid,
    eventPrefix,
    resourceProgress,
    eventData,
    courseStoryblokUuid: courseContext?.courseUuid,
    courseStarted,
  });
  const start = useCallback(async () => {
    if (!awaitingCourseAccess) await startResource();
  }, [awaitingCourseAccess, startResource]);

  // Linked as "Part of" under the content card: the other courses this viewer can see that list it.
  const partOfCourses = useMemo(
    () =>
      filterStoriesForLocaleAndPartnerAccess(partOfCourseStories ?? [], locale, userContentPartners)
        // Inside a course, that course is already named by the playlist.
        .filter(
          (course) => !course.content.coming_soon && course.uuid !== courseContext?.courseUuid,
        )
        .map((course) => ({
          name: course.content.name,
          href: getDefaultFullSlug(normaliseSlug(course.full_slug), locale),
        })),
    [partOfCourseStories, locale, userContentPartners, courseContext],
  );

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

  return {
    story,
    content,
    storyUuid,
    isSignedIn,
    availableInLocale,
    contentAccessStatus,
    resourceProgress,
    resourceId,
    eventData,
    contributors,
    relatedGrounding,
    relatedSessionHref,
    relatedSessionName,
    userContentPartners,
    courseNav,
    partOfCourses,
    start,
    complete,
  };
}
