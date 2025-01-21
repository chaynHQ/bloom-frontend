import { GetStaticPropsContext, NextPage } from 'next';
import { useSearchParams } from 'next/navigation';
import LoadingContainer from '../components/common/LoadingContainer';
import { LANGUAGES } from '../constants/enums';
import { useRouter } from '../i18n/routing';

// Page to handle redirects from external tools. E.g. firebase auth emails redirect to /action-handler?mode=resetPassword&oobCode....
const ActionHandler: NextPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  let modeParam = searchParams.get('mode');
  let langParam = searchParams.get('lang');
  const options = langParam && langParam in LANGUAGES ? { locale: langParam } : undefined;

  if (modeParam && modeParam === 'resetPassword') {
    router.replace(`/auth/reset-password?oobCode=${searchParams.get('oobCode')}`, options);
  } else {
    router.replace('/404', options);
  }
  return <LoadingContainer />;
};

export function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: {
        ...require(`../messages/shared/${locale}.json`),
        ...require(`../messages/navigation/${locale}.json`),
      },
    },
  };
}

export default ActionHandler;
