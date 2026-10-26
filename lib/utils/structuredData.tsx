import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/constants/common';
import { getPartnerContent } from '@/lib/constants/partners';
import { localisedPath } from '@/lib/utils/generateMetadataBase';
import { toPlainText } from '@/lib/utils/libraryData';
import { getYouTubeVideoId } from '@/lib/utils/youtube';
import type { ISbStoryData } from '@storyblok/react/rsc';
import { getTranslations } from 'next-intl/server';

const chayn = getPartnerContent('public')!;

const ORGANIZATION_ID = `${chayn.website}/#organization`;

// Page schemas carry the name as well as the @id, so each still reads on its own.
const CHAYN = { '@type': 'NGO', '@id': ORGANIZATION_ID, name: chayn.name } as const;

const pageUrl = (locale: string, path: string) => `${SITE_URL}${localisedPath(locale, path)}`;

const rasterImage = (url?: string) => (url && !/\.svg$/i.test(url) ? url : undefined);

// Storyblok stores durations as free-text minutes.
function isoMinutes(duration: unknown) {
  const minutes = Number(duration);
  return Number.isFinite(minutes) && minutes > 0 ? `PT${minutes}M` : undefined;
}

function describe(story: ISbStoryData) {
  return story.content.seo_description || toPlainText(story.content.description) || undefined;
}

// Rendered on every page by BaseLayout.
export const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      ...CHAYN,
      url: chayn.website,
      logo: `${SITE_URL}/chayn_logo.png`,
      sameAs: [chayn.facebook, chayn.twitter, chayn.instagram, chayn.youtube, chayn.github].filter(
        Boolean,
      ),
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Bloom',
      url: SITE_URL,
      inLanguage: routing.locales,
      publisher: { '@id': ORGANIZATION_ID },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/library?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

// None for a course that is coming soon, so it isn't promoted before launch.
export function courseJsonLd(story: ISbStoryData, locale: string, path: string) {
  if (story.content.coming_soon) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: story.content.name,
    description: describe(story),
    url: pageUrl(locale, path),
    image: rasterImage(story.content.image?.filename),
    inLanguage: locale,
    isAccessibleForFree: true,
    provider: CHAYN,
    hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'Online' },
  };
}

// Google needs a thumbnail and an upload date for a video result. A YouTube video without a
// preview image uses YouTube's own thumbnail.
export function videoJsonLd(story: ISbStoryData, locale: string, path: string) {
  const videoUrl: string | undefined = story.content.video?.url || story.content.video?.cached_url;
  const youTubeId = videoUrl ? getYouTubeVideoId(videoUrl) : null;
  const thumbnail =
    rasterImage(story.content.preview_image?.filename) ??
    (youTubeId ? `https://i.ytimg.com/vi/${youTubeId}/hqdefault.jpg` : undefined);
  if (!videoUrl || !thumbnail) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: story.content.name,
    description: describe(story),
    thumbnailUrl: thumbnail,
    uploadDate: story.first_published_at ?? story.created_at,
    embedUrl: youTubeId ? `https://www.youtube.com/embed/${youTubeId}` : videoUrl,
    url: pageUrl(locale, path),
    inLanguage: locale,
    duration: isoMinutes(story.content.duration),
    isAccessibleForFree: true,
    publisher: CHAYN,
  };
}

// Audio, written and activity resources. The audio file itself is left out: most resources are
// for signed-in members only.
export function resourceJsonLd(
  type: 'AudioObject' | 'Article' | 'LearningResource',
  story: ISbStoryData,
  locale: string,
  path: string,
) {
  const duration = isoMinutes(story.content.duration);

  return {
    '@context': 'https://schema.org',
    '@type': type,
    name: story.content.name,
    ...(type === 'Article' && { headline: story.content.name, author: CHAYN }),
    description: describe(story),
    url: pageUrl(locale, path),
    image: rasterImage(story.content.header_image?.filename),
    inLanguage: locale,
    datePublished: story.first_published_at ?? undefined,
    dateModified: story.published_at ?? undefined,
    ...(type === 'AudioObject' ? { duration } : { timeRequired: duration }),
    isAccessibleForFree: true,
    publisher: CHAYN,
  };
}

// Library › …trail. The last crumb is the current page, which Google lets go unlinked.
export async function breadcrumbJsonLd(locale: string, trail: { name: string; path?: string }[]) {
  const t = await getTranslations({ locale, namespace: 'Navigation' });
  const crumbs = [{ name: t('library'), path: '/library' }, ...trail];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.path !== undefined && { item: pageUrl(locale, crumb.path) }),
    })),
  };
}

export function JsonLd({ data }: { data: object | null }) {
  if (!data) return null;
  // Escaped so a "</script>" in CMS text can't close the tag early.
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
