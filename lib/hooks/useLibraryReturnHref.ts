'use client';

import { useSyncExternalStore } from 'react';

let returnPath = '/library';
const listeners = new Set<() => void>();

// Called by the library page whenever its filters change.
export function rememberLibraryPath(path: string) {
  returnPath = path;
  listeners.forEach((notify) => notify());
}

// `/library` on the server, then the library URL the visitor last had open (filters and all), so a
// content page's "back to library" link returns them to their place rather than a blank library.
export function useLibraryReturnHref() {
  return useSyncExternalStore(
    (notify) => {
      listeners.add(notify);
      return () => listeners.delete(notify);
    },
    () => returnPath,
    () => '/library',
  );
}
