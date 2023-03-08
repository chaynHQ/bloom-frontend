import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { api, useGetUserMutation } from '../app/api';
import { clearCoursesSlice } from '../app/coursesSlice';
import { clearPartnerAccessesSlice } from '../app/partnerAccessSlice';
import { clearPartnerAdminSlice } from '../app/partnerAdminSlice';
import { RootState } from '../app/store';
import { clearUserSlice } from '../app/userSlice';
import rollbar from '../config/rollbar';
import { GET_AUTH_USER_ERROR, GET_AUTH_USER_SUCCESS } from '../constants/events';
import { useAppDispatch, useTypedSelector } from '../hooks/store';
import { getErrorMessage } from '../utils/errorMessage';
import generateReturnQuery from '../utils/generateReturnQuery';
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

  useEffect(() => {
    async function callGetUser() {
      setLoading(true);

      const userResponse = await getUser('');

      if ('data' in userResponse && userResponse.data.user.id) {
        logEvent(GET_AUTH_USER_SUCCESS, { ...getEventUserData(userResponse.data) });
      } else {
        if ('error' in userResponse) {
          rollbar.error('LoadUserDataIfAvailable: get user error', userResponse.error);
          logEvent(GET_AUTH_USER_ERROR, { message: getErrorMessage(userResponse.error) });
        }
        await dispatch(clearPartnerAccessesSlice());
        await dispatch(clearPartnerAdminSlice());
        await dispatch(clearCoursesSlice());
        await dispatch(clearUserSlice());
        await dispatch(api.util.resetApiState());

        router.replace(`/auth/login${generateReturnQuery(router.asPath)}`);
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
