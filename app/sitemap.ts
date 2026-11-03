import { routing } from '@/i18n/routing';
import { SITE_URL, STORYBLOK_ENVIRONMENT } from '@/lib/constants/common';
import { getStoryblokApi } from '@/lib/storyblok';
import { localisedPath, storyLocales } from '@/lib/utils/generateMetadataBase';
import { getLibraryStories } from '@/lib/utils/getLibraryStories';
import { normaliseSlug, parentCourseSlug, type LibraryStory } from '@/lib/utils/libraryData';
import { isPublicContent } from '@/lib/utils/partnerContentAccess';
import { isSlugPageLink, type StoryblokLink } from '@/lib/utils/validateSlugPageRequest';
import type { MetadataRoute } from 'next';

export const revalidate = 14400; // matches the content pages

const STATIC_PATHS = [
  '',
  '/library',
  '/grounding',
  '/meet-the-team',
  '/messaging',
  '/subscription/whatsapp',
];

// One story deep in a folder with its own route, e.g. policies/terms-of-service.
const FOLDER_PAGE = /^(policies|welcome)\/[^/]+$/;

function entries(
  path: string,
  locales: readonly string[],
  lastModified?: string | null,
): MetadataRoute.Sitemap {
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((locale) => [locale, `${SITE_URL}${localisedPath(locale, path)}`]),
  );
  const urls = Object.values(languages);
  // Matches the x-default the page's own hreflang links name.
  languages['x-default'] = urls[0];
  return urls.map((url) => ({
    url,
    ...(lastModified && { lastModified }),
    alternates: { languages },
  }));
}

function storyEntries(story: LibraryStory) {
  return entries(
    `/${normaliseSlug(story.full_slug)}`,
    storyLocales(story.content.languages),
    story.published_at,
  );
}

async function getPublishedLinks(): Promise<StoryblokLink[]> {
  const { data } = await getStoryblokApi().get('cdn/links/', { version: STORYBLOK_ENVIRONMENT });
  return Object.values(data.links as Record<string, StoryblokLink>).filter(
    (link) => link.published && !link.is_folder,
  );
}

// Every page in every language it's published in. A locale a story isn't published in only shows
// a "not in your language" notice, so it is left out, as are coming-soon courses and content only
// some partners' members can open, which the pages themselves mark noindex.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ courses, courseSessions, resources }, links] = await Promise.all([
    getLibraryStories(routing.defaultLocale),
    getPublishedLinks(),
  ]);

  const liveCourses = courses.filter(
    (story) => !story.content.coming_soon && isPublicContent(story.content.included_for_partners),
  );
  const publicResources = resources.filter((story) =>
    isPublicContent(story.content.included_for_partners),
  );
  const liveCourseSlugs = new Set(liveCourses.map((story) => normaliseSlug(story.full_slug)));
  const sessions = courseSessions.filter(
    (story) => !story.content.coming_soon && liveCourseSlugs.has(parentCourseSlug(story.full_slug)),
  );

  const pages = links.filter((link) => isSlugPageLink(link) || FOLDER_PAGE.test(link.slug));

  return [
    ...STATIC_PATHS.flatMap((path) => entries(path, routing.locales)),
    ...pages.flatMap((link) => entries(`/${link.slug}`, routing.locales)),
    ...[...liveCourses, ...sessions, ...publicResources].flatMap(storyEntries),
  ];
}
