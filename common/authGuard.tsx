// AuthGuard.tsx
import { CircularProgress, Container } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useGetUserMutation } from '../app/api';
import { useUser } from '../hooks/useUser';

export function AuthGuard({ children }: { children: JSX.Element }) {
  const router = useRouter();
  const [verified, setVerified] = useState(false);
  const { user } = useUser();
  const [getUser, { isLoading: getUserIsLoading }] = useGetUserMutation();

  useEffect(() => {
    async function callGetUser() {
      const userResponse = await getUser('');

      if ('data' in userResponse && userResponse.data.user.id) {
        setVerified(true);
      } else {
        localStorage.removeItem('accessToken');
        router.replace('/login');
      }
    }
    if (user.id) {
      setVerified(true);
    }
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      router.replace('/login');
    } else {
      callGetUser();
    }
  }, [getUser, router]);

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
