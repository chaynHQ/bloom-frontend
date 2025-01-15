import type { Metadata, Viewport } from 'next';
import { getTranslations } from 'next-intl/server';
import theme from '../styles/theme';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to Next.js',
};

type Params = Promise<{ locale: string }>;

export const viewport: Viewport = {
  themeColor: theme.palette.primary.main,
};

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'Shared.metadata' });
  const localeString =
    locale === 'en'
      ? 'en_GB'
      : locale === 'hi'
        ? 'hi-IN'
        : `${locale}-${String(locale).toUpperCase()}`;

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

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
