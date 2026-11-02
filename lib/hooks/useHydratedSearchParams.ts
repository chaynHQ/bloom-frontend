'use client';

import { useSearchParams } from 'next/navigation';
import { useSyncExternalStore } from 'react';

export type SearchParams = Pick<URLSearchParams, 'get' | 'toString'>;

const noopSubscribe = () => () => {};

// Never called on the server: there, on a statically rendered page, useSearchParams() leaves
// everything up to the nearest Suspense boundary to be rendered from scratch in the browser, and
// that server HTML ignores clicks until it is replaced.
const useUrlSearchParams = typeof window === 'undefined' ? () => null : useSearchParams;

// The URL's search params, or null until hydration has finished: the server HTML was rendered
// without them, so the hydrating render must be too. Anything that acts on a param once (an
// effect, an analytics event, an initial state) should wait for non-null rather than read null as
// "no params".
export function useHydratedSearchParams(): SearchParams | null {
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const searchParams = useUrlSearchParams();
  return hydrated ? searchParams : null;
}
