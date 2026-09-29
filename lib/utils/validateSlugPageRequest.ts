import { routing } from '@/i18n/routing';

// Prefixes that crawlers/browsers request automatically (e.g. /.well-known/assetlinks.json)
// but that never correspond to a Storyblok page. Caught here so app/[locale]/[slug]/page.tsx
// can 404 immediately instead of hitting the CMS with a bogus locale/slug pair.
const RESERVED_SLUG_PREFIXES = ['.well-known'];

/**
 * Returns true when the [locale]/[slug] segments can't possibly resolve to a Storyblok
 * story, e.g. an unsupported locale (crawler requests like /.well-known/assetlinks.json
 * land here with locale=".well-known") or a reserved non-page path.
 */
export function isInvalidSlugPageRequest(locale: string, slug: string): boolean {
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) return true;

  return RESERVED_SLUG_PREFIXES.some((prefix) => slug === prefix || slug.startsWith(`${prefix}/`));
}
