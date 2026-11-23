import { publicContent, type PartnerContent } from '@/lib/constants/partners';
import type { BrandedPartner } from './types';

// By display name, as the backend and `included_for_partners` give it.
export function findPartner(partners: BrandedPartner[], name?: string | null) {
  if (!name) return undefined;
  const match = name.toLowerCase();
  return partners.find((partner) => partner.name.toLowerCase() === match);
}

// A sub-brand belongs to its parent's brand. Chayn's own content has no slug, so no brand.
export function brandKey(partner: PartnerContent & { slug?: string; parentSlug?: string }) {
  return partner.parentSlug ?? partner.slug;
}

// Each brand's partners, in order of first appearance, with the parent first.
export function groupByBrand(partners: BrandedPartner[]): BrandedPartner[][] {
  const groups = new Map<string | undefined, BrandedPartner[]>();
  for (const partner of partners) {
    const key = brandKey(partner);
    const group = groups.get(key) ?? [];
    if (!partner.parentSlug) group.unshift(partner);
    else group.push(partner);
    groups.set(key, group);
  }
  return [...groups.values()];
}

// By slug, from a URL, UTM link or referral cookie. Only launched partners can be reached this way.
export function resolveLaunchedPartner(launched: BrandedPartner[], slug?: string | null) {
  if (!slug) return undefined;
  const match = slug.toLowerCase();
  return launched.find((partner) => partner.slug === match);
}

// Chayn first, then one block per brand, from the first of its partners found: the visitor's own
// partners (as a member or partner admin) by name, then the welcome page they're on and, for
// signed-out visitors, a `?partner=` param or referral cookie, by launched slug.
export function getFooterPartners({
  branded,
  launched,
  partnerNames,
  welcomePageSlug,
  visitorSlugs,
}: {
  branded: BrandedPartner[];
  launched: BrandedPartner[];
  partnerNames: (string | null | undefined)[];
  welcomePageSlug?: string;
  visitorSlugs: (string | null | undefined)[];
}): PartnerContent[] {
  const partnersList: PartnerContent[] = [publicContent];
  const addUniquePartner = (partner?: BrandedPartner) => {
    if (partner && !partnersList.some((p) => brandKey(p) === brandKey(partner))) {
      partnersList.push(partner);
    }
  };

  partnerNames.forEach((name) => addUniquePartner(findPartner(branded, name)));
  [welcomePageSlug, ...visitorSlugs].forEach((slug) =>
    addUniquePartner(resolveLaunchedPartner(launched, slug)),
  );

  return partnersList;
}
