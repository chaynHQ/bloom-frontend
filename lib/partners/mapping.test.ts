import { expect } from '@jest/globals';
import { toPartnerBrand, toPartnerContent } from './mapping';
import { emptyPartnershipLogoStory, partnerStories } from './testPartners';

describe('toPartnerBrand', () => {
  it('maps a partner story to camelCase fields with asset URLs', () => {
    expect(toPartnerBrand(partnerStories[0])).toEqual({
      slug: 'bumble',
      name: 'Bumble',
      legalName: 'BUMBLE HOLDING LTD',
      logo: 'https://a.storyblok.com/f/123/200x60/abc/bumble_logo.svg',
      brandColor: '#FFC700',
      partnershipLogo: 'https://a.storyblok.com/f/123/200x60/abc/bloom_bumble_logo.svg',
      illustration: 'https://a.storyblok.com/f/123/200x60/abc/illustration_bumble.svg',
      website: 'https://bumble.example',
      facebook: null,
      instagram: 'https://www.instagram.com/bumble',
      twitter: null,
      youtube: null,
      tiktok: null,
    });
  });

  it('treats empty assets as missing', () => {
    const brand = toPartnerBrand(emptyPartnershipLogoStory);
    expect(brand.partnershipLogo).toBeNull();
    expect(brand.illustration).toBeNull();
  });
});

describe('toPartnerContent', () => {
  it('fills the PartnerContent shape, with the shared strings that take the name', () => {
    const content = toPartnerContent(toPartnerBrand(partnerStories[0]), 'id-bumble');
    expect(content).toEqual({
      id: 'id-bumble',
      slug: 'bumble',
      name: 'Bumble',
      logo: 'https://a.storyblok.com/f/123/200x60/abc/bumble_logo.svg',
      logoAlt: 'alt.partnerLogo',
      partnershipLogo: 'https://a.storyblok.com/f/123/200x60/abc/bloom_bumble_logo.svg',
      partnershipLogoAlt: 'alt.partnershipLogo',
      bloomGirlIllustration: 'https://a.storyblok.com/f/123/200x60/abc/illustration_bumble.svg',
      website: 'https://bumble.example',
      footerLine1: 'footer.inPartnershipWith',
      footerLine2: 'BUMBLE HOLDING LTD',
      instagram: 'https://www.instagram.com/bumble',
    });
  });

  it('leaves a missing lockup and illustration out, so pages fall back to Bloom’s', () => {
    const content = toPartnerContent(toPartnerBrand(emptyPartnershipLogoStory));
    expect(content.partnershipLogo).toBeUndefined();
    expect(content.bloomGirlIllustration).toBeUndefined();
  });
});
