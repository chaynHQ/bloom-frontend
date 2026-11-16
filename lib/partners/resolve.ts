import type { PartnerContent } from '@/lib/constants/partners';

// By display name, as the backend and `included_for_partners` give it.
export function findPartner(partners: PartnerContent[], name?: string | null) {
  if (!name) return undefined;
  const match = name.toLowerCase();
  return partners.find((partner) => partner.name.toLowerCase() === match);
}

// By slug, from a URL, UTM link or referral cookie. Only launched partners can be reached this way.
export function resolveLaunchedPartner(launched: PartnerContent[], slug?: string | null) {
  if (!slug) return undefined;
  const match = slug.toLowerCase();
  return launched.find((partner) => partner.slug === match);
}
