import { NextPage } from 'next';
import { useRouter } from 'next/router';
import LoadingContainer from '../components/LoadingContainer';

// Page to handle redirects from external tools. E.g. firebase auth emails redirect to /action-handler?mode=resetPassword&oobCode....
const ActionHandler: NextPage = () => {
  const router = useRouter();

  if (router.isReady) {
    let modeParam = router.query.mode;
    if (modeParam && modeParam === 'resetPassword') {
      router.replace(`/auth/reset-password?oobCode=${router.query.oobCode}`);
    } else {
      router.replace('/404');
    }
  }
  return <LoadingContainer />;
};

export default ActionHandler;
