import { AuthGuard } from '@/components/guards/AuthGuard';
import ConsentedAnalytics from '@/components/layout/ConsentedAnalytics';
import CookieBanner from '@/components/layout/CookieBanner';
import Footer from '@/components/layout/Footer';
import LeaveSiteButton from '@/components/layout/LeaveSiteButton';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import ReferralPartnerTracker from '@/components/layout/ReferralPartnerTracker';
import TopBar from '@/components/layout/TopBar';
import AppThemeProvider from '@/components/providers/AppThemeProvider';
import { ReduxProvider } from '@/components/providers/ReduxProvider';
import StoryblokProvider from '@/components/providers/StoryblokProvider';
import { mobileBottomNavHeight } from '@/lib/constants/banners';
import { ENVIRONMENT } from '@/lib/constants/common';
import { ENVIRONMENTS } from '@/lib/constants/enums';
import firebase from '@/lib/firebase';
import { clientConfig } from '@/lib/rollbar';
import { getLocaleDirection } from '@/lib/utils/getLocaleDirection';
import '@/styles/globals.css';
import '@/styles/hotjarNPS.css';
import { Box } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Provider as RollbarProvider } from '@rollbar/react';
import { Analytics } from '@vercel/analytics/react';
import newrelic from 'newrelic';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Montserrat, Noto_Sans_Arabic, Open_Sans } from 'next/font/google';
import Script from 'next/script';
import { ReactNode, Suspense } from 'react';
import { DesktopPwaBanner } from '../banner/DesktopPwaBanner';
import { FruitzRetirementBanner } from '../banner/FruitzRetirementBanner';
import UserResearchBanner from '../banner/UserResearchBanner';

// 'latin-ext' adds the glyphs Turkish needs (ç, ğ, ı, ş, ö, ü).
const openSans = Open_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-open-sans',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-montserrat',
  display: 'swap',
});

// Arabic glyph coverage for RTL locales — Latin fonts above cannot render Arabic.
const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500'],
  variable: '--font-arabic',
  display: 'swap',
});

export interface BaseLayoutProps {
  children: ReactNode;
  locale: string;
}

firebase;

export default async function BaseLayout({ children, locale }: BaseLayoutProps) {
  const messages = await getMessages();
  const direction = getLocaleDirection(locale);

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
      <html
        lang={locale}
        dir={direction}
        className={`${openSans.variable} ${montserrat.variable} ${notoSansArabic.variable}`}
      >
        {browserTimingHeader && (
          <Script id="nr-browser-agent" dangerouslySetInnerHTML={{ __html: browserTimingHeader }} />
        )}
        <NextIntlClientProvider messages={messages} timeZone="Europe/London">
          <ReduxProvider>
            <AppRouterCacheProvider>
              <AppThemeProvider direction={direction}>
                <StoryblokProvider>
                  <body>
                    {/*
                      Google Consent Mode default. Runs during HTML parse — before the GA tag,
                      which <GoogleAnalytics/> loads after `</body>` — so GA sets no cookies until
                      the visitor accepts. CookieBanner sends the `consent` `update` on accept/decline.
                    */}
                    <script
                      dangerouslySetInnerHTML={{
                        __html:
                          'window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}' +
                          "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});" +
                          "gtag('set','ads_data_redaction',true);",
                      }}
                    />
                    {/*
                      PWA installation events (like `beforeinstallprompt`) must be captured
                      before React hydration. These events fire only once and are lost if not 
                      handled early. That's why we include this script before hydration — 
                      to bind the event listener in time.
                    */}
                    <script src="/deffer-pwa.js" async></script>
                    <Suspense fallback={null}>
                      <ReferralPartnerTracker />
                    </Suspense>
                    <TopBar />
                    {/* Sits at the top of the page flow, directly beneath the fixed TopBar. */}
                    <UserResearchBanner />
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
                    {ENVIRONMENT !== ENVIRONMENTS.LOCAL && (
                      <ConsentedAnalytics hotjarId={process.env.NEXT_PUBLIC_HOTJAR_ID} />
                    )}
                    <Analytics />
                  </body>
                  <GoogleAnalytics
                    debugMode={ENVIRONMENT !== ENVIRONMENTS.PRODUCTION}
                    gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ''}
                  />
                </StoryblokProvider>
              </AppThemeProvider>
            </AppRouterCacheProvider>
          </ReduxProvider>
        </NextIntlClientProvider>
      </html>
    </RollbarProvider>
  );
}
