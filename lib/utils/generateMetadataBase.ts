import { getTranslations } from 'next-intl/server';
import { BASE_URL } from '../constants/common';
import { LANGUAGES } from '../constants/enums';

interface MetadataBasic {
  title: string;
  titleParent?: string;
  description?: string;
}

// Appends "• Bloom" and prepends paths (e.g. "Session • ") to title
// This is helpful for browser tab information
export function generateMetadataTitle(title: string, parent?: string): string {
  return parent ? `${parent} • ${title} • Bloom` : `${title} • Bloom`;
}

// Overrides the description, title and og:title meta tags of otherwise inherited generateMetadataBase
export function generateMetadataBasic({ title, titleParent, description }: MetadataBasic) {
  return {
    title: generateMetadataTitle(title, titleParent),
    description,
    openGraph: {
      title: title,
    },
  };
}

// Creates the base metadata to be applied to layout and inherited by all pages
export async function generateMetadataBase(locale: string) {
  const t = await getTranslations({ locale, namespace: 'Shared.metadata' });
  const localeString =
    locale === 'en'
      ? 'en_GB'
      : locale === 'hi'
        ? 'hi_IN'
        : `${locale}_${String(locale).toUpperCase()}`;
  const baseUrlLocalised = locale === LANGUAGES.en ? BASE_URL : `${BASE_URL}/${locale}`;

  return {
    metadataBase: new URL(BASE_URL || 'https://bloom.chayn.co'),
    alternates: {
      canonical: baseUrlLocalised,
      languages: {
        'en-GB': '/en',
        'de-DE': '/de',
        'es-ES': '/es',
        'pt-PT': '/pt',
        'fr-FR': '/fr',
        'hi-IN': '/hi',
      },
    },
    title: generateMetadataTitle(t('title')),
    description: t('description'),
    applicationName: 'Bloom',
    manifest: '/manifest.json',
    referrer: 'origin-when-cross-origin',
    creator: 'Chayn',
    publisher: 'Chayn',
    openGraph: {
      title: t('title'),
      url: baseUrlLocalised,
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
