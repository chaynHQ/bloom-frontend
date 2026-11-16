import { API_URL, PARTNERS_CACHE_TAG, STORYBLOK_ENVIRONMENT } from '@/lib/constants/common';
import { getStoryblokApi } from '@/lib/storyblok';
import { unstable_cache } from 'next/cache';
import { type PartnerStory, toPartnerBrand, toPartnerContent } from './mapping';
import type { ActivePartner, PartnerSets } from './types';

async function getActivePartners(): Promise<ActivePartner[]> {
  const response = await fetch(`${API_URL}/partner/active`);
  if (!response.ok) throw new Error(`GET /partner/active failed with ${response.status}`);

  // A backend without this endpoint routes it to GET /partner/:name, which doesn't return a list.
  const partners = await response.json();
  if (!Array.isArray(partners)) throw new Error('GET /partner/active did not return a list');
  return partners;
}

async function getPartnerStories(locale: string): Promise<PartnerStory[]> {
  const { data } = await getStoryblokApi().get('cdn/stories', {
    version: STORYBLOK_ENVIRONMENT,
    language: locale,
    starts_with: 'partners/',
    content_type: 'partner',
    per_page: 100,
  });
  return data.stories;
}

async function getWelcomeSlugs(): Promise<Set<string>> {
  const { data } = await getStoryblokApi().get('cdn/links', {
    version: STORYBLOK_ENVIRONMENT,
    starts_with: 'welcome/',
  });
  const links = Object.values(data.links as Record<string, { slug: string; is_folder: boolean }>);
  return new Set(links.filter((link) => !link.is_folder).map((link) => link.slug.split('/')[1]));
}

// Server-only. Drafts count outside production, so the test partners launch on staging.
//
// Any failed request throws, and no caller catches it: pages are cached, so partial or empty sets
// would be saved into them for hours (a welcome page cached as not found, referrals dropped). A
// throw keeps the last good page instead, and nothing is cached, so the next request retries.
export async function loadPartnerSets(locale: string): Promise<PartnerSets> {
  const [stories, activePartners, welcomeSlugs] = await Promise.all([
    getPartnerStories(locale),
    getActivePartners(),
    getWelcomeSlugs(),
  ]);

  const activeBySlug = new Map(activePartners.map((partner) => [partner.slug, partner]));
  const brands = stories.map(toPartnerBrand);

  return {
    branded: brands.map((brand) => toPartnerContent(brand)),
    launched: brands
      .filter((brand) => activeBySlug.has(brand.slug) && welcomeSlugs.has(brand.slug))
      .map((brand) => toPartnerContent(brand, activeBySlug.get(brand.slug)!.id)),
  };
}

// Per locale, since `partnership_logo` is translatable.
export const getPartnerSets = unstable_cache(loadPartnerSets, ['partners', STORYBLOK_ENVIRONMENT], {
  revalidate: 14400,
  tags: [PARTNERS_CACHE_TAG],
});
