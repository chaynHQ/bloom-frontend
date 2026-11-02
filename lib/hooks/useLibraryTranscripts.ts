'use client';

import type { LibraryTranscripts } from '@/lib/utils/librarySearch';
import { useEffect, useState } from 'react';

const requests = new Map<string, Promise<LibraryTranscripts | null>>();

function loadTranscripts(locale: string): Promise<LibraryTranscripts | null> {
  let request = requests.get(locale);
  if (!request) {
    request = fetch(`/api/library-search/${locale}`)
      .then((response) => (response.ok ? response.json() : null))
      .catch(() => null)
      .then((data) => {
        // Let a later search retry rather than caching the failure.
        if (!data) requests.delete(locale);
        return data;
      });
    requests.set(locale, request);
  }
  return request;
}

// Null until loaded, and never loaded until `enabled` — search works on titles, keywords and
// descriptions meanwhile, so a failed request only costs transcript matches.
export function useLibraryTranscripts(locale: string, enabled: boolean): LibraryTranscripts | null {
  const [transcripts, setTranscripts] = useState<LibraryTranscripts | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    loadTranscripts(locale).then((data) => {
      if (!cancelled && data) setTranscripts(data);
    });
    return () => {
      cancelled = true;
    };
  }, [locale, enabled]);

  return transcripts;
}
