import type { BrandedPartner } from './types';

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
const assetUrl = (asset?: StoryblokAsset) => asset?.filename || undefined;
const text = (value?: string | null) => value || undefined;

// The alt and footer keys are shared strings that take the partner's `name`; `footerLine2` is the
// legal name itself, shown as written.
export function toPartnerContent(story: PartnerStory, id?: string): BrandedPartner {
  const { content } = story;
  return {
    id,
    slug: story.slug,
    name: content.name,
    logo: assetUrl(content.logo) ?? '',
    logoAlt: 'alt.partnerLogo',
    partnershipLogo: assetUrl(content.partnership_logo),
    partnershipLogoAlt: 'alt.partnershipLogo',
    bloomGirlIllustration: assetUrl(content.illustration),
    website: text(content.website),
    footerLine1: 'footer.inPartnershipWith',
    footerLine2: content.legal_name,
    facebook: text(content.facebook),
    instagram: text(content.instagram),
    twitter: text(content.twitter),
    youtube: text(content.youtube),
    tiktok: text(content.tiktok),
  };
}
