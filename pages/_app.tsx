import { CacheProvider, EmotionCache } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
// Import the functions you need from the SDKs you need
import { Analytics } from '@vercel/analytics/react';
import { NextIntlClientProvider } from 'next-intl';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Hotjar } from 'nextjs-hotjar';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { wrapper } from '../app/store';
import CrispScript from '../components/crisp/CrispScript';
import { AppBarSpacer } from '../components/layout/AppBarSpacer';
import Consent from '../components/layout/Consent';
import ErrorBoundary from '../components/layout/ErrorBoundary';
import Footer from '../components/layout/Footer';
import LeaveSiteButton from '../components/layout/LeaveSiteButton';
import TopBar from '../components/layout/TopBar';
import createEmotionCache from '../config/emotionCache';
import firebase from '../config/firebase';
import { storyblok } from '../config/storyblok';
import { AuthGuard } from '../guards/authGuard';
import { PartnerAdminGuard } from '../guards/partnerAdminGuard';
import { PublicPageDataWrapper } from '../guards/publicPageDataWrapper';
import { SuperAdminGuard } from '../guards/superAdminGuard';
import { TherapyAccessGuard } from '../guards/therapyAccessGuard';
import '../public/hotjarNPS.css';
import '../styles/globals.css';
import theme from '../styles/theme';

// For SSG compatibility with MUI
// Client-side emotion cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();
// Init firebase
firebase;
// Init storyblok
storyblok;

export interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

function MyApp(props: MyAppProps) {
  const {
    Component,
    emotionCache = clientSideEmotionCache,
    pageProps,
  }: {
    Component: any;
    emotionCache?: EmotionCache;
    pageProps: any;
  } = props;

  const router = useRouter();

  // Example:
  // The url http://bloom.chayn.co/auth/register?example=true will have a pathname of /auth/register
  // This pathname split with a '/' separator will produce the array ['', 'auth', 'register']
  // The second array entry is pulled out as the pathHead and will be 'auth'
  const pathHead = router.pathname.split('/')[1]; // e.g. courses | therapy | partner-admin

  // Adds required permissions guard to pages, redirecting where required permissions are missing
  // New pages will default to requiring authenticated and public pages must be added to the array below
  const ComponentWithGuard = () => {
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
      '/account/settings',
    ];

    const component = <Component {...pageProps} />;
    let children = null;

    if (publicPathHeads.includes(pathHead) || partiallyPublicPages.includes(router.asPath)) {
      return <PublicPageDataWrapper>{component}</PublicPageDataWrapper>;
    }
    if (pathHead === 'therapy') {
      children = <TherapyAccessGuard>{component}</TherapyAccessGuard>;
    }
    if (pathHead === 'partner-admin') {
      children = <PartnerAdminGuard>{component}</PartnerAdminGuard>;
    }
    if (pathHead === 'admin') {
      children = <SuperAdminGuard>{component}</SuperAdminGuard>;
    }

    return <AuthGuard>{children || component}</AuthGuard>;
  };

  useEffect(() => {
    // Check if entry path is from a partner referral and if so, store referring partner in local storage
    // This enables us to redirect a user to the correct sign up page later (e.g. in SignUpBanner)
    const path = router.asPath;

    if (path?.includes('/welcome/')) {
      const referralPartner = path.split('/')[2]; // Gets "bumble" from /welcome/bumble

      if (referralPartner) {
        window.localStorage.setItem('referralPartner', referralPartner);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ErrorBoundary>
      <NextIntlClientProvider
        messages={pageProps.messages}
        locale={router.locale}
        timeZone="Europe/London"
      >
        <Head>
          <title>Bloom</title>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </Head>
        <CacheProvider value={emotionCache}>
          <CrispScript />
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <TopBar />
            <AppBarSpacer />
            {pathHead !== 'partner-admin' && <LeaveSiteButton />}
            <ComponentWithGuard />
            <Footer />
            <Consent />
            {!!process.env.NEXT_PUBLIC_HOTJAR_ID && process.env.NEXT_PUBLIC_ENV !== 'local' && (
              <Hotjar id={process.env.NEXT_PUBLIC_HOTJAR_ID} sv={6} strategy="lazyOnload" />
            )}
            {/* Vercel analytics */}
            <Analytics />
          </ThemeProvider>
        </CacheProvider>
      </NextIntlClientProvider>
    </ErrorBoundary>
  );
}

function AppReduxWrapper({ Component, ...rest }: MyAppProps) {
  const { store, props } = wrapper.useWrappedStore(rest);
  useEffect(() => {
    if (typeof window !== undefined) {
      if ((window as any).Cypress) {
        (window as any).store = store;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Provider store={store}>
      <MyApp Component={Component} {...props} />
    </Provider>
  );
}

export default AppReduxWrapper;
