'use client';

import LoadingContainer from '@/components/common/LoadingContainer';
import { redirect, usePathname, useRouter } from '@/i18n/routing';
import { useTypedSelector } from '@/lib/hooks/store';
import useLoadUser from '@/lib/hooks/useLoadUser';
import { getIsMaintenanceMode } from '@/lib/utils/maintenanceMode';
import { useLocale } from 'next-intl';
import { ReactNode } from 'react';
import LoginDialog from '../layout/LoginDialog';
import { PartnerAdminGuard } from './PartnerAdminGuard';
import { SuperAdminGuard } from './SuperAdminGuard';
import { TherapyAccessGuard } from './TherapyAccessGuard';

const authenticatedPathHeads = [
  'admin',
  'partner-admin',
  'therapy',
  'account',
  'conversations',
  'videos',
];
const shouldNotShowPreview = ['admin', 'partner-admin', 'therapy', 'account'];

// Adds required permissions guard to pages, redirecting where required permissions are missing
// New pages will default to requiring authenticated and public pages must be added to the array above
export function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const userId = useTypedSelector((state) => state.user.id);
  const userLoading = useTypedSelector((state) => state.user.loading);
  const userAuthLoading = useTypedSelector((state) => state.user.authStateLoading);

  const isMaintenanceMode = getIsMaintenanceMode();
  const { userResourceError } = useLoadUser();
  const unauthenticated = userResourceError || (!userAuthLoading && !userLoading && !userId);
  // Get top level directory of path e.g pathname /courses/course_name has pathHead courses
  const pathHead = pathname.split('/')[1]; // E.g. courses | therapy | partner-admin

  // If app is in maintenance mode, redirect all pages to /maintenance
  if (isMaintenanceMode && pathname !== '/maintenance') {
    if (typeof window !== 'undefined') {
      router.replace('/maintenance', { locale });
    }
    return <LoadingContainer />;
  }

  // If app is not in maintenance mode, redirect /maintenance to home page
  if (!isMaintenanceMode && pathname === '/maintenance') {
    if (typeof window !== 'undefined') {
      redirect({ href: '/', locale });
    }
    return <LoadingContainer />;
  }

  const isSessionPage = pathname.includes('courses') && pathname.split('/').length > 3;
  const isPublicPage = !authenticatedPathHeads.includes(pathHead) && !isSessionPage;

  // Page does not require authenticated user, return content without guards
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Page requires authenticated user
  if (unauthenticated && typeof window !== 'undefined') {
    if (shouldNotShowPreview.includes(pathHead)) {
      router.replace({ pathname: '/auth/login', query: { return_url: pathname } }, { locale });
    } else {
      return (
        <>
          <LoginDialog />
          {children}
        </>
      );
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
