import { EmotionCache } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
// Import the functions you need from the SDKs you need
import { Analytics } from '@vercel/analytics/react';
import { NextComponentType } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextPageContext } from 'next/types';
import { Hotjar } from 'nextjs-hotjar';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import CrispScript from '../components/crisp/CrispScript';
import Consent from '../components/layout/Consent';
import ErrorBoundary from '../components/layout/ErrorBoundary';
import Footer from '../components/layout/Footer';
import LeaveSiteButton from '../components/layout/LeaveSiteButton';
import TopBar from '../components/layout/TopBar';
import createEmotionCache from '../config/emotionCache';
import firebase from '../config/firebase';
import { storyblok } from '../config/storyblok';
import { AuthGuard } from '../guards/AuthGuard';
import useReferralPartner from '../hooks/useReferralPartner';
import '../public/hotjarNPS.css';
import { wrapper } from '../store/store';
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
    Component: NextComponentType<NextPageContext<any>, any, any>;
    emotionCache?: EmotionCache;
    pageProps: any;
  } = props;

  useReferralPartner(); // Check and set referral partner name and code if provided in entry url
  const router = useRouter();

  // Get top level directory of path e.g pathname /courses/course_name has pathHead courses
  const pathHead = router.pathname.split('/')[1]; // E.g. courses | therapy | partner-admin

  return (
    <ErrorBoundary>
      <NextIntlClientProvider
        messages={pageProps.messages}
        locale={router.locale}
        timeZone="Europe/London"
      >
        <Head>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </Head>
        <CrispScript />
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <TopBar />
          {pathHead !== 'partner-admin' && <LeaveSiteButton />}
          <AuthGuard>
            <Component {...pageProps} />
          </AuthGuard>
          <Footer />
          <Consent />
          {!!process.env.NEXT_PUBLIC_HOTJAR_ID && process.env.NEXT_PUBLIC_ENV !== 'local' && (
            <Hotjar id={process.env.NEXT_PUBLIC_HOTJAR_ID} sv={6} strategy="lazyOnload" />
          )}
          {/* Vercel analytics */}
          <Analytics />
        </ThemeProvider>
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
