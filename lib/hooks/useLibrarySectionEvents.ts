'use client';

import { COURSE_CARD_CLICKED, RESOURCE_CARD_CLICKED } from '@/lib/constants/events';
import { PROGRESS_STATUS_BY_ITEM_PROGRESS, type LibraryItem } from '@/lib/utils/libraryData';
import logEvent from '@/lib/utils/logEvent';
import { useCallback } from 'react';

export function useLibrarySectionEvents(surface: string, eventData: object) {
  const logCardClick = useCallback(
    (section: string) => (item: LibraryItem, index: number) => {
      logEvent(item.kind === 'course' ? COURSE_CARD_CLICKED : RESOURCE_CARD_CLICKED, {
        card_surface: surface,
        card_section: section,
        card_item_name: item.title,
        card_item_storyblok_uuid: item.id,
        card_item_kind: item.kind,
        card_item_format: item.format ?? null,
        card_item_progress: PROGRESS_STATUS_BY_ITEM_PROGRESS[item.progress ?? 'none'],
        card_item_position: index + 1, // 1-based rank within the section
        ...eventData,
      });
    },
    [surface, eventData],
  );

  const logBrowseAll = useCallback(
    (eventName: string, section: string) => () =>
      logEvent(eventName, { card_surface: surface, card_section: section, ...eventData }),
    [surface, eventData],
  );

  return { logCardClick, logBrowseAll };
}
