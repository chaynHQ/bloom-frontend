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
