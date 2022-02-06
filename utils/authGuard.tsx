import { CircularProgress, Container } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useGetUserMutation } from '../app/api';
import { RootState } from '../app/store';
import rollbar from '../config/rollbar';
import { GET_USER_ERROR, GET_USER_REQUEST, GET_USER_SUCCESS } from '../constants/events';
import { useTypedSelector } from '../hooks/store';
import { getErrorMessage } from './errorMessage';
import logEvent, { getEventUserData } from './logEvent';

export function AuthGuard({ children }: { children: JSX.Element }) {
  const router = useRouter();
  const { user, partnerAccesses } = useTypedSelector((state: RootState) => state);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [getUser] = useGetUserMutation();

  const loadingContainerStyle = {
    display: 'flex',
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
  } as const;

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
      setLoading(false);
    }

    if (loading || user.loading) {
      return;
    }

    if (user.id) {
      // User already authenticated and loaded
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
  }, [getUser, router, user, loading]);

  if (!verified) {
    return (
      <Container sx={loadingContainerStyle}>
        <CircularProgress color="error" />
      </Container>
    );
  }

  return <>{children}</>;
}
