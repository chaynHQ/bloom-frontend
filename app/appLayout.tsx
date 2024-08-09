'use client';

import { Analytics } from '@mui/icons-material';
import { usePathname } from 'next/navigation';
import { Hotjar } from 'nextjs-hotjar';
import { useEffect } from 'react';
import { AppBarSpacer } from '../components/layout/AppBarSpacer';
import Consent from '../components/layout/Consent';
import Footer from '../components/layout/Footer';
import LanguageMenuAppRoute from '../components/layout/LanguageMenuAppRoute';
import LeaveSiteButton from '../components/layout/LeaveSiteButton';
import TopBar from '../components/layout/TopBar';
import firebase from '../config/firebase';
import { AuthGuard } from '../guards/AuthGuard';

interface AppLayoutProps {
  children?: React.ReactNode;
}

// Init firebase
firebase;

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  // Get top level directory of path e.g pathname /courses/course_name has pathHead courses
  const pathHead = pathname?.split('/')[1]; // E.g. courses | therapy | partner-admin

  useEffect(() => {
    // Check if entry path is from a partner referral and if so, store referring partner in local storage
    // This enables us to redirect a user to the correct sign up page later (e.g. in SignUpBanner)
    const path = pathname;

    if (path?.includes('/welcome/')) {
      const referralPartner = path.split('/')[2]; // Gets "bumble" from /welcome/bumble

      if (referralPartner) {
        window.localStorage.setItem('referralPartner', referralPartner);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <TopBar>
        <LanguageMenuAppRoute />
      </TopBar>
      <AppBarSpacer />
      {pathHead !== 'partner-admin' && <LeaveSiteButton />}
      <AuthGuard>{children as JSX.Element}</AuthGuard>
      <Footer />
      <Consent />
      {!!process.env.NEXT_PUBLIC_HOTJAR_ID && process.env.NEXT_PUBLIC_ENV !== 'local' && (
        <Hotjar id={process.env.NEXT_PUBLIC_HOTJAR_ID} sv={6} strategy="lazyOnload" />
      )}
      {/* Vercel analytics */}
      <Analytics />
    </>
  );
}
