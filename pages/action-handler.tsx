import { CircularProgress, Container } from '@mui/material';
import { GetStaticPropsContext, NextPage } from 'next';
import { useRouter } from 'next/router';

const ActionHandler: NextPage = () => {
  const router = useRouter();

  if (router.isReady) {
    let modeParam = router.query.mode;
    if (modeParam && modeParam === 'resetPassword') {
      router.replace(`/reset-password?oobCode=${router.query.oobCode}`);
    } else {
      router.replace('/404');
    }
  }
  return (
    <Container
      sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}
    >
      <CircularProgress color="error" />
    </Container>
  );
};

export function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: {
        ...require(`../messages/shared/${locale}.json`),
        ...require(`../messages/navigation/${locale}.json`),
        ...require(`../messages/auth/${locale}.json`),
      },
    },
  };
}

export default ActionHandler;
