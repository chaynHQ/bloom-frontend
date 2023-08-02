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

  useEffect(() => {
    // Only called where a firebase token exist but user data not loaded, e.g. app reload
    async function callGetUser() {
      logEvent(GET_USER_REQUEST); // deprecated event
      logEvent(GET_AUTH_USER_REQUEST);
      setUserLoading(true);
      const userResponse = await getUser('');

      if ('data' in userResponse && userResponse.data.user.id) {
        logEvent(GET_USER_SUCCESS, { ...getEventUserData(userResponse.data) }); // deprecated event
        logEvent(GET_AUTH_USER_SUCCESS, { ...getEventUserData(userResponse.data) });

        setVerified(true);
      } else {
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
    if (loading || user.loading || (!user.firebaseUpdateApplied && user.id)) {
      return;
    }

    if (user.id) {
      // User already authenticated and loaded
      if (process.env.NEXT_PUBLIC_ENV !== 'local') {
        hotjar.identify('USER_ID', { userProperty: user.id });
      }

      setVerified(true);
      return;
    }

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
