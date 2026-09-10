'use client';

import { useCompleteResourceMutation, useStartResourceMutation } from '@/lib/api';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent from '@/lib/utils/logEvent';
import { useRollbar } from '@rollbar/react';
import { useCallback } from 'react';

// Every resource type shares one event-name shape: `<prefix>_STARTED_REQUEST`,
// `<prefix>_COMPLETE_SUCCESS`, etc. Passing the prefix keeps this hook type-agnostic.
export type ResourceEventPrefix =
  'RESOURCE_VIDEO' | 'RESOURCE_AUDIO' | 'RESOURCE_WRITTEN' | 'RESOURCE_ACTIVITY';

// The `complete` callback returned below: resolves `{ ok }` so callers can surface a retry.
export type CompleteResource = (method?: 'media_complete' | 'manual') => Promise<{ ok: boolean }>;

interface UseResourceProgressArgs {
  storyUuid: string;
  eventPrefix: ResourceEventPrefix;
  resourceProgress: PROGRESS_STATUS;
  eventData: Record<string, unknown>;
}

// Records "started" the first time a signed-in user engages with a resource (plays the media or
// opens the transcript) and "completed" when the media finishes or they mark it done.
export function useResourceProgress({
  storyUuid,
  eventPrefix,
  resourceProgress,
  eventData,
}: UseResourceProgressArgs) {
  const isLoggedIn = useTypedSelector((state) => Boolean(state.user.id));
  const rollbar = useRollbar();
  const [startResource] = useStartResourceMutation();
  const [completeResource] = useCompleteResourceMutation();

  const start = useCallback(async () => {
    if (!isLoggedIn || resourceProgress !== PROGRESS_STATUS.NOT_STARTED) return;

    logEvent(`${eventPrefix}_STARTED_REQUEST`, eventData);
    const response = await startResource({ storyblokUuid: storyUuid });

    if (response.data) logEvent(`${eventPrefix}_STARTED_SUCCESS`, eventData);
    if (response.error) {
      logEvent(`${eventPrefix}_STARTED_ERROR`, eventData);
      rollbar.error('Resource started error', response.error);
    }
  }, [isLoggedIn, resourceProgress, eventPrefix, eventData, startResource, storyUuid, rollbar]);

  const complete = useCallback(
    async (method: 'media_complete' | 'manual' = 'media_complete') => {
      if (!isLoggedIn || resourceProgress === PROGRESS_STATUS.COMPLETED) return { ok: true };

      const completeEventData = { ...eventData, resource_completion_method: method };
      logEvent(`${eventPrefix}_COMPLETE_REQUEST`, completeEventData);
      const response = await completeResource({ storyblokUuid: storyUuid });

      if (response.data) {
        logEvent(`${eventPrefix}_COMPLETE_SUCCESS`, completeEventData);
        return { ok: true };
      }
      logEvent(`${eventPrefix}_COMPLETE_ERROR`, completeEventData);
      rollbar.error('Resource complete error', response.error);
      return { ok: false };
    },
    [isLoggedIn, resourceProgress, eventPrefix, eventData, completeResource, storyUuid, rollbar],
  );

  return { start, complete };
}
