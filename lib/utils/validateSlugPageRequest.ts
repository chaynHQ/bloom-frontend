import { routing } from '@/i18n/routing';

// Storyblok slugs are lowercase letters, digits, hyphens and underscores, so paths crawlers try,
// such as /favicon.png or /wp-login.php, can't be a page.
const SLUG_PATTERN = /^[a-z0-9_-]+$/;

/**
 * Returns true when the [locale]/[slug] segments can't resolve to a page story, so
 * app/[locale]/[slug]/page.tsx can 404 without asking the CMS. Unbuilt slugs render on demand,
 * so this covers an unsupported locale (crawler requests like /.well-known/assetlinks.json land
 * here with locale=".well-known"), a slug Storyblok can't produce, and a story served by its own
 * route, which would otherwise render here too (the home story at /home).
 */
export function isInvalidSlugPageRequest(locale: string, slug: string): boolean {
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) return true;

  return !SLUG_PATTERN.test(slug) || DEDICATED_ROUTE_FOLDERS.includes(slug);
}

// Storyblok folders and stories served by their own routes rather than app/[locale]/[slug].
const DEDICATED_ROUTE_FOLDERS = [
  'home',
  'welcome',
  'meet-the-team',
  'courses',
  'about-our-courses',
  'messaging',
  'video',
  'audio',
  'written',
  'activity',
  'grounding',
  'policies',
  'library',
];

export interface StoryblokLink {
  slug: string;
  is_folder: boolean;
  published: boolean;
}

// Whether app/[locale]/[slug] serves a Storyblok link: a published top-level story outside the
// folders above. Nested stories (e.g. subscription/whatsapp) have routes of their own.
export function isSlugPageLink(link: StoryblokLink): boolean {
  return (
    link.published &&
    !link.is_folder &&
    !link.slug.includes('/') &&
    !DEDICATED_ROUTE_FOLDERS.includes(link.slug)
  );
}
