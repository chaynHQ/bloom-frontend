import type { PartnerContent } from '@/lib/constants/partners';

// GET /v1/partner/active
export type ActivePartner = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
};

// A partner from its `partners/<slug>` story. Only Chayn's own content has no slug. `parentSlug` is
// set while a sub-brand shares its parent's logo, which shows them as one brand.
export type BrandedPartner = PartnerContent & { slug: string; parentSlug?: string };

export type PartnerSets = {
  // Every partner with a partner story: branding for its members and partner admins.
  branded: BrandedPartner[];
  // Branded, active in the backend and with a welcome story: the only partners a URL can reach.
  launched: BrandedPartner[];
};
