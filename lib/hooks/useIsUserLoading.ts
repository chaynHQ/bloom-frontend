import { useTypedSelector } from '@/lib/hooks/store';

/**
 * True while the signed-in user is still being resolved, so callers can avoid acting on a
 * not-yet-loaded auth state (e.g. showing "no access" before partner accesses have arrived).
 *
 * The user is considered to be loading while:
 *  - Firebase auth state is still settling (`authStateLoading`), or
 *  - the `getUser` query is in flight (`user.loading`), or
 *  - we already hold a token but the user record (id + partner accesses) has not arrived yet.
 *
 * The final term closes the one-render gap between `authStateLoading` flipping to false and
 * `user.loading` being set true, during which `isLoggedIn` would briefly read as false for a
 * user who is actually signing in. A genuinely logged-out user has no token, so this stays
 * false for them and they are not made to wait.
 */
export function useIsUserLoading(): boolean {
  const userId = useTypedSelector((state) => state.user.id);
  const token = useTypedSelector((state) => state.user.token);
  const userLoading = useTypedSelector((state) => state.user.loading);
  const authStateLoading = useTypedSelector((state) => state.user.authStateLoading);

  return authStateLoading || userLoading || (Boolean(token) && !userId);
}
