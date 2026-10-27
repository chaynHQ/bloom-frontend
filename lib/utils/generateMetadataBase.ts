import { routing } from '@/i18n/routing';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SITE_URL } from '../constants/common';
import { toPlainText } from './libraryData';

const META_DESCRIPTION_MAX = 160;

interface MetadataBasic {
  title: string;
  titleParent?: string;
  // A plain string or a Storyblok rich-text document; trimmed to META_DESCRIPTION_MAX.
  description?: unknown;
  locale: string;
  // With `path` (locale-free, e.g. "/courses/anxiety"), the page gets its own canonical URL,
  // hreflang links and share URL. Without it, none are set rather than inheriting the homepage's.
  path?: string;
  // A Storyblok story's `languages` field; leave unset for pages that exist in every locale.
  languages?: string[];
  // A Storyblok image asset URL for the share card.
  image?: string;
  // Private, utility and not-yet-launched pages, kept out of search results.
  noIndex?: boolean;
}

const NO_INDEX = { index: false, follow: true } as const;

const SHARE_IMAGE = { width: 1200, height: 630 } as const;
const SHARE_IMAGE_MIN_WIDTH = 600;

// Appends "• Bloom" and the section (e.g. "• Video") after the title, so search results and
// browser tabs lead with the topic.
export function generateMetadataTitle(title: string, parent?: string): string {
  return parent ? `${title} • ${parent} • Bloom` : `${title} • Bloom`;
}

function openGraphLocale(locale: string) {
  if (locale === 'en') return 'en_GB';
  if (locale === 'hi') return 'hi_IN';
  return `${locale}_${locale.toUpperCase()}`;
}

export function localisedPath(locale: string, path: string) {
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  return `${prefix}${path}` || '/';
}

// Storyblok marks the source language "default"; no languages set means English only.
export function storyLocales(languages?: string[]): string[] {
  if (!languages?.length) return [routing.defaultLocale];
  return routing.locales.filter((locale) =>
    languages.includes(locale === routing.defaultLocale ? 'default' : locale),
  );
}

function trimDescription(text: string) {
  const plain = text.replace(/\s+/g, ' ').trim();
  if (plain.length <= META_DESCRIPTION_MAX) return plain || undefined;
  const cut = plain.slice(0, META_DESCRIPTION_MAX - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s.,;:!?—–-]+$/, '')}…`;
}

// A Storyblok image cropped to the share card's shape by Storyblok's image service, read from the
// size in its asset path. SVGs and small images return undefined: social platforms don't render
// the first and blur the second, so the default share image is better.
export function storyblokShareImage(url?: string) {
  const size = url?.match(/^https:\/\/a\.storyblok\.com\/f\/\d+\/(\d+)x(\d+)\//);
  if (!url || !size || /\.svg$/i.test(url)) return undefined;
  const [width, height] = [Number(size[1]), Number(size[2])];
  const cropWidth = Math.min(
    SHARE_IMAGE.width,
    width,
    Math.floor((height * SHARE_IMAGE.width) / SHARE_IMAGE.height),
  );
  if (cropWidth < SHARE_IMAGE_MIN_WIDTH) return undefined;
  const cropHeight = Math.round((cropWidth * SHARE_IMAGE.height) / SHARE_IMAGE.width);
  return { url: `${url}/m/${cropWidth}x${cropHeight}/smart`, width: cropWidth, height: cropHeight };
}

function alternatesFor(locale: string, path: string, languages?: string[]) {
  const available = languages ? storyLocales(languages) : [...routing.locales];
  const languageLinks: Record<string, string> = Object.fromEntries(
    available.map((l) => [l, localisedPath(l, path)]),
  );
  languageLinks['x-default'] = localisedPath(available[0] ?? routing.defaultLocale, path);
  // A locale the story isn't published in shows a "not in your language" notice, which is kept
  // out of the index. It gets no canonical: one pointing at another locale alongside noindex is a
  // conflicting signal, and Google may carry the noindex over to that page.
  const isAvailable = available.includes(locale);
  return {
    canonical: isAvailable ? localisedPath(locale, path) : undefined,
    languages: languageLinks,
    isAvailable,
  };
}

// Overrides the title, description, canonical, hreflang and Open Graph tags of the inherited
// generateMetadataBase. Open Graph is rebuilt whole because Next replaces, not merges, that object.
export async function generateMetadataBasic({
  title,
  titleParent,
  description,
  locale,
  path,
  languages,
  image,
  noIndex,
}: MetadataBasic): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Shared.metadata' });
  const metaDescription = trimDescription(toPlainText(description));
  const alternates = path === undefined ? undefined : alternatesFor(locale, path, languages);
  const shareImage = storyblokShareImage(image);

  return {
    title: generateMetadataTitle(title, titleParent),
    description: metaDescription,
    ...(alternates && {
      alternates: { canonical: alternates.canonical, languages: alternates.languages },
    }),
    ...((noIndex || alternates?.isAvailable === false) && { robots: NO_INDEX }),
    openGraph: {
      title,
      description: metaDescription,
      url: path === undefined ? undefined : localisedPath(locale, path),
      siteName: 'Bloom',
      locale: openGraphLocale(locale),
      type: 'website',
      images: [
        shareImage
          ? { ...shareImage, alt: title }
          : { url: '/preview.png', ...SHARE_IMAGE, alt: t('imageAlt') },
      ],
    },
  };
}

// Creates the base metadata to be applied to layout and inherited by all pages. It sets no
// canonical or hreflang links: inherited, those would mark every page a copy of the homepage.
export async function generateMetadataBase(locale: string) {
  const t = await getTranslations({ locale, namespace: 'Shared.metadata' });

  return {
    metadataBase: new URL(SITE_URL),
    title: generateMetadataTitle(t('title')),
    description: t('description'),
    applicationName: 'Bloom',
    manifest: '/manifest.json',
    referrer: 'origin-when-cross-origin',
    creator: 'Chayn',
    publisher: 'Chayn',
    openGraph: {
      title: t('title'),
      url: localisedPath(locale, ''),
      siteName: 'Bloom',
      images: [
        {
          url: '/preview.png',
          width: 1200,
          height: 630,
          alt: t('imageAlt'),
        },
      ],
      locale: openGraphLocale(locale),
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
