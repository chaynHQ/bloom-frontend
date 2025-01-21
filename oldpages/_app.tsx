import { EmotionCache } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
// Import the functions you need from the SDKs you need
import { Analytics } from '@vercel/analytics/react';
import { NextComponentType } from 'next';
import { IntlError, NextIntlClientProvider } from 'next-intl';
import type { AppProps } from 'next/app';
import { Montserrat, Open_Sans } from 'next/font/google';
import { useRouter } from 'next/router';
import { NextPageContext } from 'next/types';
import { Hotjar } from 'nextjs-hotjar';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import DefaultHeadMetadata from '../components/head/DefaultHeadMetadata';
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

// <link
//   href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Open+Sans:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&display=swap"
//   rel="stylesheet"
// />;

export const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-open-sans',
  display: 'swap',
});

export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-montserrat',
  display: 'swap',
});

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

  function onIntlError(error: IntlError) {
    if (error.code === 'MISSING_MESSAGE') {
      console.error(`${error.message} Page: ${router.asPath}`);
    } else {
      console.error(error);
    }
  }

  return (
    <div className={`${openSans.variable} ${montserrat.variable}`}>
      <ErrorBoundary>
        <NextIntlClientProvider
          messages={pageProps.messages}
          locale={router.locale}
          timeZone="Europe/London"
          onError={onIntlError}
        >
          <DefaultHeadMetadata />
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
    </div>
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
