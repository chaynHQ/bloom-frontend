import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { hotjar } from 'react-hotjar';
import { api, useGetUserMutation } from '../app/api';
import { clearCoursesSlice } from '../app/coursesSlice';
import { clearPartnerAccessesSlice } from '../app/partnerAccessSlice';
import { clearPartnerAdminSlice } from '../app/partnerAdminSlice';
import { RootState } from '../app/store';
import { clearUserSlice, setUserLoading } from '../app/userSlice';
import LoadingContainer from '../components/common/LoadingContainer';

import rollbar from '../config/rollbar';
import {
  GET_AUTH_USER_ERROR,
  GET_AUTH_USER_REQUEST,
  GET_AUTH_USER_SUCCESS,
  GET_USER_ERROR,
  GET_USER_REQUEST,
  GET_USER_SUCCESS,
} from '../constants/events';
import { useAppDispatch, useTypedSelector } from '../hooks/store';
import { getErrorMessage } from '../utils/errorMessage';
import generateReturnQuery from '../utils/generateReturnQuery';
import logEvent, { getEventUserData } from '../utils/logEvent';

export function AuthGuard({ children }: { children: JSX.Element }) {
  const router = useRouter();
  const dispatch: any = useAppDispatch();

  const { user } = useTypedSelector((state: RootState) => state);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [getUser] = useGetUserMutation();

  // Function to get User details from the backend api
  async function callGetUser() {
    logEvent(GET_USER_REQUEST); // deprecated event
    logEvent(GET_AUTH_USER_REQUEST);
    setUserLoading(true);

    // Gets user from the /user/me endpoint in the backend
    const userResponse = await getUser('');

    // if there is a response from the /user/me endpoint, it logs success and says it is verified
    if ('data' in userResponse && userResponse.data.user.id) {
      logEvent(GET_USER_SUCCESS, { ...getEventUserData(userResponse.data) }); // deprecated event
      logEvent(GET_AUTH_USER_SUCCESS, { ...getEventUserData(userResponse.data) });

      setVerified(true);
    } else {
      // if no user exists, we clear all state and reset api and redirect to login
      if ('error' in userResponse) {
        rollbar.error('Auth guard get user error', userResponse.error);
        logEvent(GET_USER_ERROR, { message: getErrorMessage(userResponse.error) }); // deprecated event
        logEvent(GET_AUTH_USER_ERROR, { message: getErrorMessage(userResponse.error) });
      }
      await dispatch(clearPartnerAccessesSlice());
      await dispatch(clearPartnerAdminSlice());
      await dispatch(clearCoursesSlice());
      await dispatch(clearUserSlice());
      await dispatch(api.util.resetApiState());
      setLoading(false);

      router.replace(`/auth/login${generateReturnQuery(router.asPath)}`);
    }
  }

  useEffect(() => {
    // Only called where a firebase token exist but user data not loaded, e.g. app reload

    // If auth guard loading state is true, i.e. it has checked
    // or the getUser request has started but not finished
    // or the firebase token is being fetched
    if (loading || user.loading || user.firebaseTokenLoading) {
      return;
    }

    // You get past here in 3 states:
    // 1. When a user is logged out so we never send the getUser request
    // and the loading/ userloading/ firebaseToken Loading state is never triggered
    // 2. when a user is logged in, the firebase token has returned, the authguard has not yet been set to loading, at the end of this useEffect
    // and the get user request hasn't been started.
    // 3. When the getUser request has been called (i.e. loading is false)
    // and the getUser request has completed (user.loading is false)

    // If the User state has already been populated and ID from the backend has been given set verified as true
    if (user.id) {
      if (process.env.NEXT_PUBLIC_ENV !== 'local') {
        // TODO check consent of cookies before sending
        hotjar.identify('USER_ID', { userProperty: user.id });
      }
      setVerified(true);
      return;
    }

    // If the user state does not have a token at all (i.e. is null) and the page is not been set a loading
    // redirect to the log in page
    if (!user.token) {
      router.replace(`/auth/login${generateReturnQuery(router.asPath)}`);
      return;
    }

    // User firebase token exists but user data doesn't, so reload user data
    // Handles restoring user data on app reload or revisiting the site
    setLoading(true);
    callGetUser();
    setLoading(false);
  }, [user, loading]);

  if (!verified) {
    return <LoadingContainer />;
  }

  return <>{children}</>;
}
