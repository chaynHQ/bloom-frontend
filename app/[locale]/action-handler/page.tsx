'use client';

import { useRouter } from '@/i18n/routing';
import LoadingContainer from '@/lib/components/common/LoadingContainer';
import { LANGUAGES } from '@/lib/constants/enums';
import { useSearchParams } from 'next/navigation';

// Page to handle redirects from external tools. E.g. firebase auth emails redirect to /action-handler?mode=resetPassword&oobCode....
export default function Page() {
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
}
