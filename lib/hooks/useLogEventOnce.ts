'use client';

import logEvent from '@/lib/utils/logEvent';
import { useEffect, useRef } from 'react';

// Fires `eventName` exactly once — on the first render where `ready` is true. Used for the
// page-view events (LIBRARY_VIEWED, SESSION_VIEWED, RESOURCE_*_VIEWED, …): callers pass `ready`
// false until auth has settled, so a signed-in visitor is never reported as anonymous. The
// `logged` guard means a later change to `eventData` never re-fires the event, so whatever it
// holds when `ready` first flips true is what gets sent.
export function useLogEventOnce(
  eventName: string,
  eventData: Record<string, unknown>,
  ready = true,
) {
  const logged = useRef(false);

  useEffect(() => {
    if (logged.current || !ready) return;
    logged.current = true;
    logEvent(eventName, eventData);
  }, [eventName, eventData, ready]);
}
