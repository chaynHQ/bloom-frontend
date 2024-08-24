'use client';

import { useRouter } from 'next/router';
import LoadingContainer from '../components/common/LoadingContainer';
import { useTypedSelector } from '../hooks/store';
import useLoadUser from '../hooks/useLoadUser';
import { default as generateReturnUrlQuery } from '../utils/generateReturnQuery';
import { getIsMaintenanceMode } from '../utils/maintenanceMode';
import { PartnerAdminGuard } from './PartnerAdminGuard';
import { SuperAdminGuard } from './SuperAdminGuard';
import { TherapyAccessGuard } from './TherapyAccessGuard';

const publicPathHeads = [
  '',
  'index',
  'welcome',
  'auth',
  'maintenance',
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
  '/courses/image-based-abuse-and-rebuilding-ourselves',
  '/courses/recovering-from-toxic-and-abusive-relationships',
  '/courses/society-patriarchy-and-sexual-trauma',
  '/courses/healing-from-sexual-trauma',
  '/courses/dating-boundaries-and-relationships',
  '/courses/reclaiming-resilience-in-your-trauma-story',
  '/activities',
  '/grounding',
  '/subscription/whatsapp',
  '/chat',
];

// Adds required permissions guard to pages, redirecting where required permissions are missing
// New pages will default to requiring authenticated and public pages must be added to the array above
export function AuthGuard({ children }: { children: JSX.Element }) {
  const router = useRouter();

  const userId = useTypedSelector((state) => state.user.id);
  const userLoading = useTypedSelector((state) => state.user.loading);
  const userAuthLoading = useTypedSelector((state) => state.user.authStateLoading);

  const isMaintenanceMode = getIsMaintenanceMode();
  const { userResourceError } = useLoadUser();
  const unauthenticated = userResourceError || (!userAuthLoading && !userLoading && !userId);

  // Get top level directory of path e.g pathname /courses/course_name has pathHead courses
  const pathHead = router.pathname.split('/')[1]; // E.g. courses | therapy | partner-admin

  // If app is in maintenance mode, redirect all pages to /maintenance
  if (isMaintenanceMode && router.pathname !== '/maintenance') {
    if (typeof window !== 'undefined') {
      router.replace(`/maintenance`);
    }
    return <LoadingContainer />;
  }

  // If app is not in maintenance mode, redirect /maintenance to home page
  if (!isMaintenanceMode && router.pathname === '/maintenance') {
    if (typeof window !== 'undefined') {
      router.replace(`/`);
    }
    return <LoadingContainer />;
  }

  // Page does not require authenticated user, return content without guards
  if (publicPathHeads.includes(pathHead) || partiallyPublicPages.includes(router.asPath)) {
    return <>{children}</>;
  }

  // Page requires authenticated user
  if (unauthenticated && typeof window !== 'undefined') {
    router.push(`/auth/login${generateReturnUrlQuery(router.asPath)}`);
  }

  if (userId) {
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
