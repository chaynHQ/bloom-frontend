'use client';

import { useTypedSelector } from '@/lib/hooks/store';
import { useIsUserLoading } from '@/lib/hooks/useIsUserLoading';

export type UserAuthStatus = 'resolving' | 'signedOut' | 'signedIn';

/**
 * The visitor's auth state as three explicit cases, for UI that differs by whether someone is
 * signed in. A plain `isSignedIn` boolean folds `'resolving'` into `'signedOut'`, so the page
 * renders the signed-out variant and then visibly rewrites it once auth settles; `'resolving'` lets
 * the caller hold that region on a placeholder until the answer is known. A visitor with no
 * Firebase token skips `'resolving'`, so genuinely-signed-out people never wait.
 *
 * For a page that shows or withholds its whole body, use `useContentAccessStatus` instead. Reach
 * for this hook directly only for a single control — a CTA, a badge — or for a rule that one can't
 * express (a public course's first session plays for everyone).
 */
export function useUserAuthStatus(): UserAuthStatus {
  const userId = useTypedSelector((state) => state.user.id);
  const isUserLoading = useIsUserLoading();

  if (isUserLoading) return 'resolving';
  return userId ? 'signedIn' : 'signedOut';
}
