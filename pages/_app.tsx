import { CacheProvider, EmotionCache } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { NextIntlProvider } from 'next-intl';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { wrapper } from '../app/store';
import Footer from '../components/Footer';
import LeaveSiteButton from '../components/LeaveSiteButton';
import TopBar from '../components/TopBar';
import createEmotionCache from '../config/emotionCache';
import '../styles/globals.css';
import theme from '../styles/theme';
import { AuthGuard } from '../utils/authGuard';

// For SSG compatibility with MUI
// Client-side emotion cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
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

  return (
    <NextIntlProvider messages={pageProps.messages}>
      <CacheProvider value={emotionCache}>
        <Head>
          <title>Bloom</title>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </Head>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <TopBar />
          <LeaveSiteButton />
          {Component.requireAuth ? (
            <AuthGuard>
              <Component {...pageProps} />
            </AuthGuard>
          ) : (
            <Component {...pageProps} />
          )}{' '}
          <Footer />
        </ThemeProvider>
      </CacheProvider>
    </NextIntlProvider>
  );
}

export default wrapper.withRedux(MyApp);
