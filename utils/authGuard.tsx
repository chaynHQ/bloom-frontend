import { CircularProgress, Container } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useGetUserMutation } from '../app/api';
import { RootState } from '../app/store';
import Crisp from '../components/Crisp';
import rollbar from '../config/rollbar';
import { GET_USER_ERROR, GET_USER_REQUEST, GET_USER_SUCCESS } from '../constants/events';
import { useAppDispatch, useTypedSelector } from '../hooks/store';
import { getErrorMessage } from './errorMessage';
import logEvent, { getEventUserData } from './logEvent';

export function AuthGuard({ children }: { children: JSX.Element }) {
  const router = useRouter();
  const { user, partnerAccesses } = useTypedSelector((state: RootState) => state);
  const [verified, setVerified] = useState(false);

  const loadingContainerStyle = {
    display: 'flex',
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
  } as const;

  const [getUser] = useGetUserMutation();
  const dispatch: any = useAppDispatch();

  useEffect(() => {
    async function callGetUser() {
      console.log('authgruard callGetUser');
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

    if (user.id) {
      setVerified(true);
      return;
    }

    if (user.loading) {
      return;
    }

    if (!user.token) {
      router.replace('/auth/login');
      return;
    }

    callGetUser();
  }, [getUser, router, user]);

  if (user.loading || !verified) {
    return (
      <Container sx={loadingContainerStyle}>
        <CircularProgress color="error" />
      </Container>
    );
  }

  const liveChatAccess = partnerAccesses.find(function (partnerAccess) {
    return partnerAccess.featureLiveChat === true;
  });

  return (
    <>
      {liveChatAccess && process.env.NEXT_PUBLIC_ENV !== 'production' && (
        <Crisp email={user.email} />
      )}
      {children}
    </>
  );
}
