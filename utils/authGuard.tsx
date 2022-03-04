import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { hotjar } from 'react-hotjar';
import { useGetUserMutation } from '../app/api';
import { RootState } from '../app/store';
import LoadingContainer from '../components/common/LoadingContainer';
import rollbar from '../config/rollbar';
import { GET_USER_ERROR, GET_USER_REQUEST, GET_USER_SUCCESS } from '../constants/events';
import { useTypedSelector } from '../hooks/store';
import { getErrorMessage } from './errorMessage';
import logEvent, { getEventUserData } from './logEvent';

export function AuthGuard({ children }: { children: JSX.Element }) {
  const router = useRouter();
  const { user } = useTypedSelector((state: RootState) => state);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [getUser] = useGetUserMutation();

  useEffect(() => {
    // Only called where a firebase token exist but user data not loaded, e.g. app reload
    async function callGetUser() {
      logEvent(GET_USER_REQUEST);
      const userResponse = await getUser('');

      if ('data' in userResponse && userResponse.data.user.id) {
        logEvent(GET_USER_SUCCESS, { ...getEventUserData(userResponse.data) });
        setVerified(true);
      } else {
        if ('error' in userResponse) {
          rollbar.error('Auth guard get user error', userResponse.error);
          logEvent(GET_USER_ERROR, { message: getErrorMessage(userResponse.error) });
        }

        router.replace('/auth/login');
      }
    }

    if (loading || user.loading) {
      return;
    }

    if (user.id) {
      // User already authenticated and loaded
      if (process.env.NEXT_PUBLIC_ENV === 'staging') {
        hotjar.identify('USER_ID', { userProperty: user.id });
      }

      setVerified(true);
      return;
    }

    if (!user.token) {
      router.replace('/auth/login');
      return;
    }

    // User firebase token exists but user data doesn't, so reload user data
    // Handles restoring user data on app reload or revisiting the site
    setLoading(true);
    callGetUser();
    setLoading(false);
  }, [getUser, router, user, loading]);

  if (!verified) {
    return <LoadingContainer />;
  }

  return <>{children}</>;
}
