import { CircularProgress, Container } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useGetUserMutation } from '../app/api';
import { RootState } from '../app/store';
import Crisp from '../components/Crisp';
import rollbar from '../config/rollbar';
import { GET_USER_ERROR, GET_USER_REQUEST, GET_USER_SUCCESS } from '../constants/events';
import { useTypedSelector } from '../hooks/store';
import { getErrorMessage } from './errorMessage';
import logEvent, { getEventUserData } from './logEvent';

export function AuthGuard({ children }: { children: JSX.Element }) {
  const router = useRouter();
  const [verified, setVerified] = useState(false);
  const { user, partnerAccess } = useTypedSelector((state: RootState) => state);
  const [getUser, { isLoading: getUserIsLoading }] = useGetUserMutation();

  const loadingContainerStyle = {
    display: 'flex',
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
  } as const;

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
        router.replace('/auth/login');
      }
    }

    if (user.id) {
      setVerified(true);
      return;
    }

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      router.replace('/auth/login');
    } else {
      callGetUser();
    }
  }, [getUser, router, user]);

  if (!verified || !user.id || getUserIsLoading) {
    return (
      <Container sx={loadingContainerStyle}>
        <CircularProgress color="error" />
      </Container>
    );
  }

  return (
    <>
      {/* Include live chat widget if user's access allows. For now only show on staging for testing */}
      {partnerAccess.featureLiveChat && process.env.NEXT_PUBLIC_ENV !== 'production' && (
        <Crisp email={user.email} />
      )}
      {children}
    </>
  );
}
