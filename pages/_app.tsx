import { CacheProvider, EmotionCache } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { NextIntlProvider } from 'next-intl';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import TopNavigation from '../components/TopNavigation';
import createEmotionCache from '../config/emotionCache';
import { wrapper } from '../store/index';
import '../styles/globals.css';
import theme from '../styles/theme';

// For SSG compatibility with MUI
// Client-side emotion cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    <NextIntlProvider messages={pageProps.messages}>
      <CacheProvider value={emotionCache}>
        <Head>
          <title>My page</title>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </Head>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <TopNavigation />
          <Component {...pageProps} />
        </ThemeProvider>
      </CacheProvider>
    </NextIntlProvider>
  );
}
export default wrapper.withRedux(MyApp);
