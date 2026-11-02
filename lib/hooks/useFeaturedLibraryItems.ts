'use client';

import { useLibraryItems } from '@/lib/hooks/useLibraryItems';
import { type LibraryItem, type LibraryStories } from '@/lib/utils/libraryData';
import { useMemo } from 'react';

const SECTION_SIZE = 3;

interface FeaturedContent {
  featured_courses?: string[];
  featured_sessions?: string[];
  [key: string]: unknown;
}

export function useFeaturedLibraryItems(stories: LibraryStories, content?: FeaturedContent) {
  const items = useLibraryItems(stories);

  return useMemo(() => {
    const byUuid = new Map(items.map((item) => [item.id, item]));
    // Picks this viewer can't see (other language, partner-only) are skipped, and the section is
    // topped up from the fallback so it stays full.
    const pick = (uuids: string[] | undefined, fallback: LibraryItem[]) => {
      const chosen = [...new Set(uuids ?? [])]
        .map((uuid) => byUuid.get(uuid))
        .filter((item): item is LibraryItem => Boolean(item));
      const chosenIds = new Set(chosen.map((item) => item.id));
      return [...chosen, ...fallback.filter((item) => !chosenIds.has(item.id))].slice(
        0,
        SECTION_SIZE,
      );
    };

    return {
      courses: pick(
        content?.featured_courses,
        items.filter((item) => item.kind === 'course'),
      ),
      sessions: pick(
        content?.featured_sessions,
        items.filter((item) => item.kind === 'session'),
      ),
      inProgress: items.filter((item) => item.progress === 'started').slice(0, SECTION_SIZE),
    };
  }, [items, content]);
}
