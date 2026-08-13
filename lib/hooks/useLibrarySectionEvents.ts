'use client';

import { PROGRESS_STATUS_BY_ITEM_PROGRESS, type LibraryItem } from '@/lib/utils/libraryData';
import logEvent from '@/lib/utils/logEvent';
import { useCallback } from 'react';

export function useLibrarySectionEvents(prefix: string, eventData: object) {
  const logCardClick = useCallback(
    (eventName: string, section: string) => (item: LibraryItem, index: number) => {
      logEvent(eventName, {
        [`${prefix}_section`]: section,
        [`${prefix}_item_name`]: item.title,
        [`${prefix}_item_storyblok_uuid`]: item.id,
        [`${prefix}_item_kind`]: item.kind,
        [`${prefix}_item_format`]: item.format ?? null,
        [`${prefix}_item_progress`]: PROGRESS_STATUS_BY_ITEM_PROGRESS[item.progress ?? 'none'],
        [`${prefix}_item_position`]: index + 1, // 1-based rank within the section
        ...eventData,
      });
    },
    [prefix, eventData],
  );

  const logBrowseAll = useCallback(
    (eventName: string, section: string) => () =>
      logEvent(eventName, { [`${prefix}_section`]: section, ...eventData }),
    [prefix, eventData],
  );

  return { logCardClick, logBrowseAll };
}
