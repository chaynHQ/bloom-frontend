import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { api, useGetUserMutation } from '../app/api';
import { clearCoursesSlice } from '../app/coursesSlice';
import { clearPartnerAccessesSlice } from '../app/partnerAccessSlice';
import { clearPartnerAdminSlice } from '../app/partnerAdminSlice';
import { RootState } from '../app/store';
import {
  clearUserSlice,
  setAuthStateLoading,
  setUserLoading,
  setUserToken,
} from '../app/userSlice';
import { GET_AUTH_USER_ERROR, GET_AUTH_USER_SUCCESS } from '../constants/events';
import { useAppDispatch, useTypedSelector } from '../hooks/store';
import { getErrorMessage } from '../utils/errorMessage';
import logEvent, { getEventUserData } from '../utils/logEvent';

/**
 * Function is intended to wrap around a public page (i.e. auth not required) and pull user data if available.
 *
 * If the user is logged in (firebase token exists) when viewing the page but the user data has not been loaded,
 * this function loads the user data and then displays the public page with any relevant tweaks (e.g. therapy option in the nav bar).
 * This situation can occur on app reload, site revisit or site refresh.
 *
 * If the user is not logged in, the default public page is displayed.
 *
 * Note that this wrapper is intended only for public pages. The auth guard handles pulling user data for auth guarded pages.
 */

export function PublicPageDataWrapper({ children }: { children: JSX.Element }) {
  const router = useRouter();
  const dispatch: any = useAppDispatch();

  const { user } = useTypedSelector((state: RootState) => state);
  const [loading, setLoading] = useState(false);

  const [getUser] = useGetUserMutation();

  const auth = getAuth();

  // 1. Auth state loads and we check whether there is a user that exists and listen for a token change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authState) => {
      if (!authState) {
        dispatch(setAuthStateLoading(false));
        setLoading(false);
        return;
      }
      // authState.getIdToken Returns a JSON Web Token (JWT) used to identify the user to a Firebase service.
      // Returns the current token if it has not expired. Otherwise, this will refresh the token and return a new one.
      const authToken = await authState.getIdToken();
      dispatch(setUserToken(authToken));
      dispatch(setAuthStateLoading(false));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function callGetUser() {
      setLoading(true);
      setUserLoading(true);
      const userResponse = await getUser('');

      if ('data' in userResponse && userResponse.data.user.id) {
        logEvent(GET_AUTH_USER_SUCCESS, { ...getEventUserData(userResponse.data) });
      } else {
        if ('error' in userResponse) {
          (window as any).Rollbar?.error(
            'LoadUserDataIfAvailable: get user error',
            userResponse.error,
          );
          logEvent(GET_AUTH_USER_ERROR, { message: getErrorMessage(userResponse.error) });
        }

        signOut(auth);
        await dispatch(clearPartnerAccessesSlice());
        await dispatch(clearPartnerAdminSlice());
        await dispatch(clearCoursesSlice());
        await dispatch(clearUserSlice());
        await dispatch(api.util.resetApiState());
      }
      setLoading(false);
    }

    if (loading || user.loading) {
      return;
    }

    if (user.token && !user.id) {
      // User firebase token exists (i.e. user is logged in) but user data hasn't been loaded
      callGetUser();
    }
  }, [getUser, router, user]);

  return <>{children}</>;
}
