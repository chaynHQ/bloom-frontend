import { AuthGuard } from '@/components/guards/AuthGuard';
import Consent from '@/components/layout/CookieConsent';
import Footer from '@/components/layout/Footer';
import LeaveSiteButton from '@/components/layout/LeaveSiteButton';
import TopBar from '@/components/layout/TopBar';
import { ReduxProvider } from '@/components/providers/ReduxProvider';
import StoryblokProvider from '@/components/providers/StoryblokProvider';
import { ENVIRONMENT } from '@/lib/constants/common';
import { ENVIRONMENTS } from '@/lib/constants/enums';
import firebase from '@/lib/firebase';
import { clientConfig } from '@/lib/rollbar';
import '@/styles/globals.css';
import '@/styles/hotjarNPS.css';
import theme from '@/styles/theme';
import { ThemeProvider } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Provider as RollbarProvider } from '@rollbar/react';
import { Analytics } from '@vercel/analytics/react';
import newrelic from 'newrelic';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Montserrat, Open_Sans } from 'next/font/google';
import Script from 'next/script';
import { Hotjar } from 'nextjs-hotjar';
import { ReactNode } from 'react';

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-open-sans',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-montserrat',
  display: 'swap',
});

export interface BaseLayoutProps {
  children: ReactNode;
  locale: string;
}

firebase;

export default async function BaseLayout({ children, locale }: BaseLayoutProps) {
  const messages = await getMessages();

  let browserTimingHeader = undefined;

  if (ENVIRONMENT === ENVIRONMENTS.PRODUCTION) {
    // @ts-ignore
    if (newrelic.agent?.collector.isConnected() === false) {
      await new Promise((resolve) => {
        // @ts-ignore
        newrelic.agent.on('connected', resolve);
      });
    }
    // @ts-ignore
    browserTimingHeader = newrelic.getBrowserTimingHeader({
      hasToRemoveScriptWrapper: true,
      allowTransactionlessInjection: true,
    });
  }

  return (
    <RollbarProvider config={clientConfig}>
      <html lang={locale} className={`${openSans.variable} ${montserrat.variable}`}>
        {browserTimingHeader && (
          <Script id="nr-browser-agent" dangerouslySetInnerHTML={{ __html: browserTimingHeader }} />
        )}
        <NextIntlClientProvider messages={messages} timeZone="Europe/London">
          <ReduxProvider>
            <AppRouterCacheProvider>
              <ThemeProvider theme={theme}>
                <StoryblokProvider>
                  <body>
                    <TopBar />
                    <LeaveSiteButton />
                    <main>
                      <AuthGuard>{children}</AuthGuard>
                    </main>
                    <Footer />
                    <Consent />
                    {!!process.env.NEXT_PUBLIC_HOTJAR_ID && ENVIRONMENT !== ENVIRONMENTS.LOCAL && (
                      <Hotjar id={process.env.NEXT_PUBLIC_HOTJAR_ID} sv={6} strategy="lazyOnload" />
                    )}
                    <Analytics />
                  </body>
                  <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ''} />
                </StoryblokProvider>
              </ThemeProvider>
            </AppRouterCacheProvider>
          </ReduxProvider>
        </NextIntlClientProvider>
      </html>
    </RollbarProvider>
  );
}
