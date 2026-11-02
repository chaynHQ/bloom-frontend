import { expect } from '@jest/globals';
import { renderHook } from '@testing-library/react';

import { useLibraryItems } from '@/lib/hooks/useLibraryItems';
import type { LibraryItem, LibraryStories } from '@/lib/utils/libraryData';
import { useFeaturedLibraryItems } from './useFeaturedLibraryItems';

jest.mock('@/lib/hooks/useLibraryItems', () => ({ useLibraryItems: jest.fn() }));

const stories = { courses: [], courseSessions: [], resources: [] } as LibraryStories;

const item = (id: string, kind: LibraryItem['kind'] = 'course') =>
  ({ id, kind, title: id, href: `/${id}` }) as LibraryItem;

const ids = (items: LibraryItem[]) => items.map((i) => i.id);

describe('useFeaturedLibraryItems', () => {
  // The viewer's visible items: c1–c4 courses, s1 a session.
  beforeEach(() => {
    jest
      .mocked(useLibraryItems)
      .mockReturnValue([item('c1'), item('c2'), item('c3'), item('c4'), item('s1', 'session')]);
  });

  const featured = (featured_courses?: string[]) =>
    renderHook(() => useFeaturedLibraryItems(stories, { featured_courses })).result.current;

  it('shows the picks in their order', () => {
    expect(ids(featured(['c3', 'c1', 'c4']).courses)).toEqual(['c3', 'c1', 'c4']);
  });

  it('tops up with other courses when some picks are unavailable', () => {
    expect(ids(featured(['c4', 'hidden', 'gone']).courses)).toEqual(['c4', 'c1', 'c2']);
  });

  it('skips unavailable picks before taking the first three', () => {
    expect(ids(featured(['hidden', 'c2', 'c3', 'c4']).courses)).toEqual(['c2', 'c3', 'c4']);
  });

  it('ignores duplicate picks', () => {
    expect(ids(featured(['c2', 'c2']).courses)).toEqual(['c2', 'c1', 'c3']);
  });

  it('falls back to the first courses when nothing is picked', () => {
    expect(ids(featured().courses)).toEqual(['c1', 'c2', 'c3']);
  });

  it('only tops up with items of the same kind', () => {
    expect(ids(featured().sessions)).toEqual(['s1']);
  });
});
