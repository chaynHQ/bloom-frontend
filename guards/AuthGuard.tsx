'use client';

import { usePathname, useRouter } from 'next/navigation';
import LoadingContainer from '../components/common/LoadingContainer';
import { useTypedSelector } from '../hooks/store';
import useLoadUser from '../hooks/useLoadUser';
import { locales } from '../i18n/config';
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
  // Added for testing purpouse until a route is migrated to app router
  'approutetest',
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
  const router = useRouter();
  const pathname = usePathname() as string;
  const userId = useTypedSelector((state) => state.user.id);
  const userLoading = useTypedSelector((state) => state.user.loading);
  const userAuthLoading = useTypedSelector((state) => state.user.authStateLoading);

  const { userResourceError } = useLoadUser();
  const unauthenticated = userResourceError || (!userAuthLoading && !userLoading && !userId);

  const pathnameParts = pathname?.split('/') ?? ['/'];
  const pathNamePartsWithoutLocale = pathnameParts.filter((part) => !locales.includes(part));
  // Get top level directory of path e.g pathname /courses/course_name has pathHead courses
  const pathHead = pathNamePartsWithoutLocale?.[1] ?? '/'; // E.g. courses | therapy | partner-admin

  // Page does not require authenticated user, return content without guards
  if (
    publicPathHeads.includes(pathHead) ||
    partiallyPublicPages.includes(pathNamePartsWithoutLocale.join('/'))
  ) {
    return <>{children}</>;
  }

  // Page requires authenticated user
  if (unauthenticated) {
    if (typeof window !== 'undefined') {
      router.push(`/auth/login${generateReturnUrlQuery(pathname)}`);
    }
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
