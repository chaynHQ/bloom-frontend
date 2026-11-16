import type { PartnerContent } from '@/lib/constants/partners';

// GET /v1/partner/active
export type ActivePartner = {
  id: string;
  name: string;
  slug: string;
};

// A `partners/<slug>` story. Asset fields are Storyblok asset URLs.
export type PartnerBrand = {
  slug: string;
  name: string;
  legalName: string;
  logo: string;
  brandColor: string;
  partnershipLogo: string | null;
  illustration: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  tiktok: string | null;
};

export type PartnerSets = {
  // Every partner with a partner story: branding for its members and partner admins.
  branded: PartnerContent[];
  // Branded, active in the backend and with a welcome story: the only partners a URL can reach.
  launched: PartnerContent[];
};
