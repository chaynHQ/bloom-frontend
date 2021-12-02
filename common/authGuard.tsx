// AuthGuard.tsx
import { CircularProgress, Container } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useCurrent } from '../hooks/useCurrent';
import { useUser } from '../hooks/useUser';

export function AuthGuard({ children }: { children: JSX.Element }) {
  const { user } = useUser();
  const { current } = useCurrent();
  const router = useRouter();

  useEffect(() => {
    if (!current.loading && !user.id) {
      // TODO: set redirect
      // setRedirect(router.route);

      // TODO: set/get token and recall user data if valid token in localstorage
      // const accessToken = localStorage.getItem('accessToken');
      // //   // if no accessToken was found,then we redirect to "/" page.
      // if (!accessToken) {
      //   console.log('token doesnt exists');
      //   router.replace('/register');
      // } else {
      //   const { data, error, isLoading } = useGetUserQuery('');
      // }

      router.push('/register');
    }
  }, [router, user]);

  if (current.loading) {
    return (
      <Container
        sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}
      >
        <CircularProgress color="error" />
      </Container>
    );
  }

  if (user.id && !current.loading) {
    return <>{children}</>;
  }

  return null;
}
