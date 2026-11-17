import type { BrandedPartner } from './types';

// By display name, as the backend and `included_for_partners` give it.
export function findPartner(partners: BrandedPartner[], name?: string | null) {
  if (!name) return undefined;
  const match = name.toLowerCase();
  return partners.find((partner) => partner.name.toLowerCase() === match);
}

// A parent and its sub-brands share a logo, so they count as one brand, keyed by the parent's name.
export function brandKey(partner: { name: string; parent?: string }) {
  return (partner.parent || partner.name).toLowerCase();
}

// Each brand's partners, in order of first appearance, with the parent first.
export function groupByBrand(partners: BrandedPartner[]): BrandedPartner[][] {
  const groups = new Map<string, BrandedPartner[]>();
  for (const partner of partners) {
    const key = brandKey(partner);
    const group = groups.get(key) ?? [];
    if (key === partner.name.toLowerCase()) group.unshift(partner);
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
