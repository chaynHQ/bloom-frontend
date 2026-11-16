import type { PartnerContent } from '@/lib/constants/partners';

// GET /v1/partner/active
export type ActivePartner = {
  id: string;
  name: string;
  slug: string;
};

// A partner from its `partners/<slug>` story. Only Chayn's own content has no slug.
export type BrandedPartner = PartnerContent & { slug: string };

export type PartnerSets = {
  // Every partner with a partner story: branding for its members and partner admins.
  branded: BrandedPartner[];
  // Branded, active in the backend and with a welcome story: the only partners a URL can reach.
  launched: BrandedPartner[];
};
