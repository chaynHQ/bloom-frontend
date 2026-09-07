'use client';

import { useUserAuthStatus } from '@/lib/hooks/useUserAuthStatus';

/**
 * What a resource or course page should render for the current visitor, decided once so it can't
 * flip-flop as auth settles:
 *
 * - `'resolving'`      auth state unknown — render a placeholder, not the content or the prompt.
 * - `'signInRequired'` not signed in and the content isn't open to everyone — render the preview +
 *                      sign-up card. Covers a `login_required` block and partner-gated content alike.
 * - `'accessDenied'`   signed in, but the account lacks access — signing in again won't help, so
 *                      render "content not available".
 * - `'accessGranted'`  render the full content.
 */
export type ContentAccessStatus = 'resolving' | 'signInRequired' | 'accessDenied' | 'accessGranted';

interface UseContentAccessStatusArgs {
  // The story's CMS `login_required` flag.
  contentRequiresLogin: boolean;
  // Whether the visitor's partner/locale entitlement lets them open this page — the caller's
  // `hasAccessToPage(...)` (or the public-content shortcut) combined with its locale check,
  // evaluated treating the visitor as signed-out while auth is still resolving.
  hasPageAccess: boolean;
}

export function useContentAccessStatus({
  contentRequiresLogin,
  hasPageAccess,
}: UseContentAccessStatusArgs): ContentAccessStatus {
  const userAuthStatus = useUserAuthStatus();

  // Content anyone can open (accessible without signing in, and not login-gated) renders right
  // away — signing in only preserves that access, so there's nothing to wait for.
  const isOpenToEveryone = hasPageAccess && !contentRequiresLogin;

  if (userAuthStatus === 'resolving') {
    return isOpenToEveryone ? 'accessGranted' : 'resolving';
  }
  if (userAuthStatus === 'signedOut') {
    return isOpenToEveryone ? 'accessGranted' : 'signInRequired';
  }
  return hasPageAccess ? 'accessGranted' : 'accessDenied';
}
