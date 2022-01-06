import { CacheProvider, EmotionCache } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { NextIntlProvider } from 'next-intl';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { wrapper } from '../app/store';
import Footer from '../components/Footer';
import LeaveSiteButton from '../components/LeaveSiteButton';
import TopBar from '../components/TopBar';
import createEmotionCache from '../config/emotionCache';
import '../styles/globals.css';
import theme from '../styles/theme';
import { AuthGuard } from '../utils/authGuard';
import { PartnerAdminGuard } from '../utils/partnerAdminGuard';
import { TherapyAccessGuard } from '../utils/therapyAccessGuard';

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

  const router = useRouter();
  const pathname = router.pathname.split('/')[1]; // e.g. courses | therapy | partner-admin

  // Adds required permissions guard to pages, redirecting where required permissions are missing
  // New pages will default to requiring authenticated and public pages must be added to the array below
  const ComponentWithGuard = () => {
    const publicPaths = ['index', 'welcome', 'auth', 'action-handler'];
    const component = <Component {...pageProps} />;

    if (publicPaths.includes(pathname)) {
      return component;
    }

    if (pathname === 'therapy') {
      return (
        <AuthGuard>
          <TherapyAccessGuard>{component}</TherapyAccessGuard>
        </AuthGuard>
      );
    }
    if (pathname === 'partner-admin') {
      return (
        <AuthGuard>
          <PartnerAdminGuard>{component}</PartnerAdminGuard>
        </AuthGuard>
      );
    }
    return <AuthGuard>{component}</AuthGuard>;
  };

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
          {pathname !== 'partner-admin' && <LeaveSiteButton />}
          <ComponentWithGuard />
          <Footer />
        </ThemeProvider>
      </CacheProvider>
    </NextIntlProvider>
  );
}

export default wrapper.withRedux(MyApp);
