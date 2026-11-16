import { expect } from '@jest/globals';
import { toPartnerContent } from './mapping';
import { emptyPartnershipLogoStory, partnerStories } from './partnerFixtures';

describe('toPartnerContent', () => {
  it('maps a partner story to PartnerContent, with the shared strings that take the name', () => {
    const content = toPartnerContent(partnerStories[0], 'id-bumble');
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

  it('leaves empty social links out', () => {
    const content = toPartnerContent(partnerStories[0]);
    expect(content.facebook).toBeUndefined();
    expect(content.twitter).toBeUndefined();
    expect(content.youtube).toBeUndefined();
    expect(content.tiktok).toBeUndefined();
  });

  it('leaves a missing lockup and illustration out, so pages fall back to Bloom’s', () => {
    const content = toPartnerContent(emptyPartnershipLogoStory);
    expect(content.partnershipLogo).toBeUndefined();
    expect(content.bloomGirlIllustration).toBeUndefined();
  });
});
