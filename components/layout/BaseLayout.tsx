import { AuthGuard } from '@/components/guards/AuthGuard';
import CookieBanner from '@/components/layout/CookieBanner';
import Footer from '@/components/layout/Footer';
import LeaveSiteButton from '@/components/layout/LeaveSiteButton';
import MobileBottomNav, { mobileBottomNavHeight } from '@/components/layout/MobileBottomNav';
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
import { Box, ThemeProvider } from '@mui/material';
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
import { DesktopPwaBanner } from '../banner/DesktopPwaBanner';
import { FruitzRetirementBanner } from '../banner/FruitzRetirementBanner';

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
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

  if (
    ENVIRONMENT === ENVIRONMENTS.PRODUCTION &&
    // @ts-ignore - newrelic types don't match runtime API
    typeof newrelic.getBrowserTimingHeader === 'function'
  ) {
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
                    {/*
                      PWA installation events (like `beforeinstallprompt`) must be captured 
                      before React hydration. These events fire only once and are lost if not 
                      handled early. That's why we include this script before hydration — 
                      to bind the event listener in time.
                    */}
                    <script src="/deffer-pwa.js" async></script>
                    <TopBar />
                    <LeaveSiteButton />
                    <DesktopPwaBanner />

                    <main>
                      <FruitzRetirementBanner />

                      <AuthGuard>{children}</AuthGuard>
                    </main>
                    <Footer />
                    <Box sx={{ height: { xs: mobileBottomNavHeight, md: 0 } }} />
                    <MobileBottomNav />
                    <CookieBanner />
                    {!!process.env.NEXT_PUBLIC_HOTJAR_ID && ENVIRONMENT !== ENVIRONMENTS.LOCAL && (
                      <Hotjar id={process.env.NEXT_PUBLIC_HOTJAR_ID} sv={6} strategy="lazyOnload" />
                    )}
                    <Analytics />
                  </body>
                  <GoogleAnalytics
                    debugMode={true}
                    gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ''}
                  />
                </StoryblokProvider>
              </ThemeProvider>
            </AppRouterCacheProvider>
          </ReduxProvider>
        </NextIntlClientProvider>
      </html>
    </RollbarProvider>
  );
}
