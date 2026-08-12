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

// The sessions and courses a page leads with. Drawn from the same filtered set the library is
// built from, so a page cannot surface an item the visitor has no access to.
export function useFeaturedLibraryItems(stories: LibraryStories, content?: FeaturedContent) {
  const items = useLibraryItems(stories);

  return useMemo(() => {
    const byUuid = new Map(items.map((item) => [item.id, item]));
    // An editor's picks come first, falling back to the first few items of that kind.
    const pick = (uuids: string[] | undefined, fallback: LibraryItem[]) => {
      const chosen = (uuids ?? [])
        .map((uuid) => byUuid.get(uuid))
        .filter((item): item is LibraryItem => Boolean(item));
      return (chosen.length ? chosen : fallback).slice(0, SECTION_SIZE);
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
