import { routing } from '@/i18n/routing';
import BaseLayout from '@/lib/components/layout/BaseLayout';
import type { Viewport } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';

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

  // Enable static rendering
  setRequestLocale(locale);

  return <BaseLayout locale={locale}>{children}</BaseLayout>;
}
