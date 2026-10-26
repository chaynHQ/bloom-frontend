'use client';

import { useSearchParams } from 'next/navigation';
import { ComponentType, ReactElement, Suspense } from 'react';

export type SearchParams = Pick<URLSearchParams, 'get' | 'toString'>;

const NO_SEARCH_PARAMS = new URLSearchParams();

// useSearchParams() on a statically rendered page leaves everything up to the nearest Suspense
// boundary out of the server HTML. Here that boundary's fallback is the same component without
// search params, so the cached HTML keeps the full page and the browser renders it with the URL's.
export function withSearchParams<P extends object>(
  Component: ComponentType<P & { searchParams: SearchParams }>,
) {
  function WithUrlSearchParams(props: P) {
    const searchParams = useSearchParams();
    return <Component {...props} searchParams={searchParams} />;
  }

  function SearchParamsBoundary(props: P) {
    return (
      <Suspense fallback={<Component {...props} searchParams={NO_SEARCH_PARAMS} />}>
        <WithUrlSearchParams {...props} />
      </Suspense>
    );
  }

  // Callers pass every prop but searchParams, which the boundary supplies.
  return SearchParamsBoundary as (props: Omit<P, 'searchParams'>) => ReactElement;
}
