import type { PartnerContent } from '@/lib/constants/partners';
import type { PartnerBrand } from './types';

type StoryblokAsset = { filename?: string | null } | null;

export interface PartnerStory {
  slug: string;
  content: {
    name: string;
    legal_name: string;
    logo?: StoryblokAsset;
    brand_color: string;
    partnership_logo?: StoryblokAsset;
    illustration?: StoryblokAsset;
    website?: string | null;
    facebook?: string | null;
    instagram?: string | null;
    twitter?: string | null;
    youtube?: string | null;
    tiktok?: string | null;
  };
}

// Storyblok keeps an emptied asset field as an asset with an empty filename.
const assetUrl = (asset?: StoryblokAsset) => asset?.filename || null;
const text = (value?: string | null) => value || null;

export function toPartnerBrand(story: PartnerStory): PartnerBrand {
  const { content } = story;
  return {
    slug: story.slug,
    name: content.name,
    legalName: content.legal_name,
    logo: assetUrl(content.logo) ?? '',
    brandColor: content.brand_color,
    partnershipLogo: assetUrl(content.partnership_logo),
    illustration: assetUrl(content.illustration),
    website: text(content.website),
    facebook: text(content.facebook),
    instagram: text(content.instagram),
    twitter: text(content.twitter),
    youtube: text(content.youtube),
    tiktok: text(content.tiktok),
  };
}

// The alt and footer keys are shared strings that take the partner's `name`; `footerLine2` is the
// legal name itself, shown as written.
export function toPartnerContent(brand: PartnerBrand, id?: string): PartnerContent {
  return {
    id,
    slug: brand.slug,
    name: brand.name,
    logo: brand.logo,
    logoAlt: 'alt.partnerLogo',
    partnershipLogo: brand.partnershipLogo ?? undefined,
    partnershipLogoAlt: 'alt.partnershipLogo',
    bloomGirlIllustration: brand.illustration ?? undefined,
    website: brand.website ?? undefined,
    footerLine1: 'footer.inPartnershipWith',
    footerLine2: brand.legalName,
    facebook: brand.facebook ?? undefined,
    instagram: brand.instagram ?? undefined,
    twitter: brand.twitter ?? undefined,
    youtube: brand.youtube ?? undefined,
    tiktok: brand.tiktok ?? undefined,
  };
}
