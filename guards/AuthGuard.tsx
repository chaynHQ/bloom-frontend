'use client';

import { useRouter } from 'next/router';
import LoadingContainer from '../components/common/LoadingContainer';
import useAuth from '../hooks/useAuth';
import useLoadUser from '../hooks/useLoadUser';
import { default as generateReturnUrlQuery } from '../utils/generateReturnQuery';
import { PartnerAdminGuard } from './PartnerAdminGuard';
import { SuperAdminGuard } from './SuperAdminGuard';
import { TherapyAccessGuard } from './TherapyAccessGuard';

const publicPathHeads = [
  '',
  'index',
  'welcome',
  'auth',
  'action-handler',
  '404',
  '500',
  'faqs',
  'meet-the-team',
  'partnership',
  'about-our-courses',
];

// As the subpages of courses are not public and these pages are only partially public,
// they are treated differently as they are not public path heads
const partiallyPublicPages = [
  '/courses',
  '/activities',
  '/grounding',
  '/subscription/whatsapp',
  '/chat',
];

// Adds required permissions guard to pages, redirecting where required permissions are missing
// New pages will default to requiring authenticated and public pages must be added to the array above
export function AuthGuard({ children }: { children: JSX.Element }) {
  const { onLogout } = useAuth();
  const router = useRouter();

  const { user, userResourceError } = useLoadUser();
  const unauthenticated =
    userResourceError || (!user.authStateLoading && !user.loading && !user.id);

  // Get top level directory of path e.g pathname /courses/course_name has pathHead courses
  const pathHead = router.pathname.split('/')[1]; // E.g. courses | therapy | partner-admin

  // Page does not require authenticated user, return content without guards
  if (publicPathHeads.includes(pathHead) || partiallyPublicPages.includes(router.asPath)) {
    return <>{children}</>;
  }

  // Page requires authenticated user
  if (unauthenticated) {
    if (typeof window !== 'undefined') {
      router.replace(`/auth/login${generateReturnUrlQuery(router.asPath)}`);
    }
  }

  if (user.id) {
    if (pathHead === 'therapy') {
      return <TherapyAccessGuard>{children}</TherapyAccessGuard>;
    }
    if (pathHead === 'partner-admin') {
      return <PartnerAdminGuard>{children}</PartnerAdminGuard>;
    }
    if (pathHead === 'admin') {
      return <SuperAdminGuard>{children}</SuperAdminGuard>;
    }
    return <>{children}</>;
  }
  return <LoadingContainer />;
}
