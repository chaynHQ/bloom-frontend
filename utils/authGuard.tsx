// AuthGuard.tsx
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
  const [verified, setVerified] = useState(false);
  const { user } = useTypedSelector((state: RootState) => state);

  const [getUser, { isLoading: getUserIsLoading }] = useGetUserMutation();

  useEffect(() => {
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
        localStorage.removeItem('accessToken');
        router.replace('/login');
      }
    }
    if (user.id) {
      console.log('found user id');
      setVerified(true);
    }
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      router.replace('/login');
    } else {
      callGetUser();
    }
  }, [getUser, router, user.id]);

  if (!verified || getUserIsLoading) {
    return (
      <Container
        sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}
      >
        <CircularProgress color="error" />
      </Container>
    );
  }

  if (verified) {
    return <>{children}</>;
  } else {
    return null;
  }
}
