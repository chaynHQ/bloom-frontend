'use client';

import { useCompleteResourceMutation, useStartResourceMutation } from '@/lib/api';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { useTypedSelector } from '@/lib/hooks/store';
import { logCourseProgressEvents } from '@/lib/utils/logCourseProgressEvents';
import logEvent from '@/lib/utils/logEvent';
import { useRollbar } from '@rollbar/react';
import { useCallback, useRef } from 'react';

// Every resource type shares one event-name shape: `<prefix>_STARTED_REQUEST`,
// `<prefix>_COMPLETE_SUCCESS`, etc. Passing the prefix keeps this hook type-agnostic.
export type ResourceEventPrefix =
  | 'RESOURCE_VIDEO'
  | 'RESOURCE_AUDIO'
  | 'RESOURCE_WRITTEN'
  | 'RESOURCE_ACTIVITY'
  | 'RESOURCE_GROUNDING';

// The `complete` callback returned below: resolves `{ ok }` so callers can surface a retry.
export type CompleteResource = (method?: 'media_complete' | 'manual') => Promise<{ ok: boolean }>;

interface UseResourceProgressArgs {
  storyUuid: string;
  eventPrefix: ResourceEventPrefix;
  resourceProgress: PROGRESS_STATUS;
  eventData: Record<string, unknown>;
  // The modular course the resource is open in, if any.
  courseStoryblokUuid?: string;
  courseStarted?: boolean;
}

// Records "started" the first time a signed-in user engages with a resource (plays the media or
// opens the transcript) and "completed" when the media finishes or they mark it done.
export function useResourceProgress({
  storyUuid,
  eventPrefix,
  resourceProgress,
  eventData,
  courseStoryblokUuid,
  courseStarted = false,
}: UseResourceProgressArgs) {
  const isLoggedIn = useTypedSelector((state) => Boolean(state.user.id));
  const rollbar = useRollbar();
  const [startResource] = useStartResourceMutation();
  const [completeResource] = useCompleteResourceMutation();
  // The course's progress refetches after the start, so this stops a second start in the meantime.
  const courseStartSent = useRef(false);
  const trigger = courseStoryblokUuid ? 'course_resource' : 'standalone';

  const start = useCallback(async () => {
    if (!isLoggedIn) return;
    const resourceStarted = resourceProgress !== PROGRESS_STATUS.NOT_STARTED;
    // A resource already done elsewhere still starts the course the first time it's opened there.
    const startsCourse = Boolean(courseStoryblokUuid) && !courseStarted && !courseStartSent.current;
    if (resourceStarted && !startsCourse) return;
    if (startsCourse) courseStartSent.current = true;

    // Resource start events only count real resource starts, not a course-only start.
    if (!resourceStarted) logEvent(`${eventPrefix}_STARTED_REQUEST`, eventData);
    const response = await startResource({ storyblokUuid: storyUuid, courseStoryblokUuid });

    if (response.data) {
      if (!resourceStarted) logEvent(`${eventPrefix}_STARTED_SUCCESS`, eventData);
      logCourseProgressEvents(response.data.courseProgress, trigger, eventData);
    }
    if (response.error) {
      courseStartSent.current = false;
      logEvent(`${eventPrefix}_STARTED_ERROR`, eventData);
      rollbar.error('Resource started error', response.error);
    }
  }, [
    isLoggedIn,
    resourceProgress,
    courseStoryblokUuid,
    courseStarted,
    eventPrefix,
    eventData,
    startResource,
    storyUuid,
    trigger,
    rollbar,
  ]);

  const complete = useCallback(
    async (method: 'media_complete' | 'manual' = 'media_complete') => {
      if (!isLoggedIn || resourceProgress === PROGRESS_STATUS.COMPLETED) return { ok: true };

      const completeEventData = { ...eventData, resource_completion_method: method };
      logEvent(`${eventPrefix}_COMPLETE_REQUEST`, completeEventData);
      const response = await completeResource({ storyblokUuid: storyUuid, courseStoryblokUuid });

      if (response.data) {
        logEvent(`${eventPrefix}_COMPLETE_SUCCESS`, completeEventData);
        logCourseProgressEvents(response.data.courseProgress, trigger, eventData);
        return { ok: true };
      }
      logEvent(`${eventPrefix}_COMPLETE_ERROR`, completeEventData);
      rollbar.error('Resource complete error', response.error);
      return { ok: false };
    },
    [
      isLoggedIn,
      resourceProgress,
      eventPrefix,
      eventData,
      completeResource,
      storyUuid,
      courseStoryblokUuid,
      trigger,
      rollbar,
    ],
  );

  return { start, complete };
}
