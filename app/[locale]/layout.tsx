import { ThemeProvider } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Analytics } from '@vercel/analytics/react';
import type { Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Montserrat, Open_Sans } from 'next/font/google';
import { notFound } from 'next/navigation';
import { Hotjar } from 'nextjs-hotjar';
import { ReactNode } from 'react';
import Consent from '../../components/layout/Consent';
import Footer from '../../components/layout/Footer';
import LeaveSiteButton from '../../components/layout/LeaveSiteButton';
import TopBar from '../../components/layout/TopBar';
import { ReduxProvider } from '../../components/providers/ReduxProvider';
import StoryblokProvider from '../../components/providers/StoryblokProvider';
import { AuthGuard } from '../../guards/AuthGuard';
import { routing } from '../../i18n/routing';
import firebase from '../../lib/firebase';
import theme from '../../styles/theme';

firebase;
type Params = Promise<{ locale: string }>;

export const viewport: Viewport = {
  themeColor: '#F3D6D8',
};

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'Shared.metadata' });
  const localeString =
    locale === 'en'
      ? 'en_GB'
      : locale === 'hi'
        ? 'hi_IN'
        : `${locale}_${String(locale).toUpperCase()}`;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://bloom.chayn.co'),
    alternates: {
      canonical: '/',
      languages: {
        'en-GB': '/en',
        'de-DE': '/de',
        'es-ES': '/es',
        'pt-PT': '/pt',
        'fr-FR': '/fr',
        'hi-IN': '/hi',
      },
    },
    title: t('title'),
    description: t('description'),
    applicationName: 'Bloom',
    manifest: '/manifest.json',
    referrer: 'origin-when-cross-origin',
    creator: 'Chayn',
    publisher: 'Chayn',
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: '/',
      siteName: 'Bloom',
      images: [
        {
          url: '/preview.png',
          width: 1200,
          height: 630,
          alt: t('imageAlt'),
        },
      ],
      locale: localeString,
      type: 'website',
    },
    twitter: {
      // Defaults to openGraph values for title, description, and image
      card: 'summary_large_image',
      creator: '@ChaynHQ',
      creatorId: '1976769696',
    },
    appleWebApp: {
      title: 'Bloom',
      startupImage: [
        '/icons/apple/startup-image-768x1004.png',
        {
          url: '/icons/apple/startup-image-1536x2008.png',
          media: '(device-width: 768px) and (device-height: 1024px)',
        },
      ],
    },
  };
}

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

export interface RootLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout(props: RootLayoutProps) {
  const { locale } = await props.params;
  const { children } = props;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${openSans.variable} ${montserrat.variable}`}>
      <NextIntlClientProvider messages={messages}>
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
                  {!!process.env.NEXT_PUBLIC_HOTJAR_ID &&
                    process.env.NEXT_PUBLIC_ENV !== 'local' && (
                      <Hotjar id={process.env.NEXT_PUBLIC_HOTJAR_ID} sv={6} strategy="lazyOnload" />
                    )}
                  <Analytics />
                </body>
              </StoryblokProvider>
            </ThemeProvider>
          </AppRouterCacheProvider>
        </ReduxProvider>
      </NextIntlClientProvider>
    </html>
  );
}
