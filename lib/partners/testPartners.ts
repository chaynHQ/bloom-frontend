// Unit-test fixtures: Bumble, Badoo and Fruitz as they are today, plus the plan's test partners.
// Slug and name differ only for the test partners, and "Test Partner" is inside "Test Partner Plus".
import { toPartnerBrand, toPartnerContent } from './mapping';
import { ActivePartner } from './types';

const asset = (file: string) => ({
  id: 1,
  filename: `https://a.storyblok.com/f/123/200x60/abc/${file}`,
});
const emptyAsset = { id: null, filename: '' };

const partnerStory = (slug: string, name: string, legalName: string, published = true) => ({
  slug,
  full_slug: `partners/${slug}`,
  published_at: published ? '2026-11-01T00:00:00.000Z' : null,
  content: {
    component: 'partner',
    name,
    legal_name: legalName,
    logo: asset(`${slug}_logo.svg`),
    brand_color: '#FFC700',
    partnership_logo: asset(`bloom_${slug}_logo.svg`),
    illustration: asset(`illustration_${slug}.svg`),
    website: `https://${slug}.example`,
    facebook: '',
    instagram: `https://www.instagram.com/${slug}`,
    twitter: '',
    youtube: '',
    tiktok: '',
  },
});

export const partnerStories = [
  partnerStory('bumble', 'Bumble', 'BUMBLE HOLDING LTD'),
  partnerStory('badoo', 'Badoo', 'BADOO LTD'),
  partnerStory('fruitz', 'Fruitz', 'FRUITZ LTD'),
  partnerStory('test-partner', 'Test Partner', 'TEST PARTNER LTD', false),
  partnerStory('test-partner-plus', 'Test Partner Plus', 'TEST PARTNER PLUS LTD', false),
  partnerStory('retired-partner', 'Retired Partner', 'RETIRED PARTNER LTD', false),
];

// "Old Partner" is active with a welcome page but has no partner story.
export const activePartners: ActivePartner[] = [
  { id: 'id-bumble', name: 'Bumble', slug: 'bumble' },
  { id: 'id-badoo', name: 'Badoo', slug: 'badoo' },
  { id: 'id-fruitz', name: 'Fruitz', slug: 'fruitz' },
  { id: 'id-test-partner', name: 'Test Partner', slug: 'test-partner' },
  { id: 'id-test-partner-plus', name: 'Test Partner Plus', slug: 'test-partner-plus' },
  { id: 'id-old-partner', name: 'Old Partner', slug: 'old-partner' },
];

const welcomeLink = (slug: string, published = true) => ({
  slug: `welcome/${slug}`,
  is_folder: false,
  published,
});

export const welcomeLinks = {
  folder: { slug: 'welcome', is_folder: true, published: true },
  bumble: welcomeLink('bumble'),
  badoo: welcomeLink('badoo'),
  'test-partner': welcomeLink('test-partner', false),
  'test-partner-plus': welcomeLink('test-partner-plus', false),
  'retired-partner': welcomeLink('retired-partner', false),
  'old-partner': welcomeLink('old-partner'),
};

export const emptyPartnershipLogoStory = {
  ...partnerStories[0],
  content: { ...partnerStories[0].content, partnership_logo: emptyAsset, illustration: null },
};

const brandBySlug = (slug: string) =>
  toPartnerBrand(partnerStories.find((story) => story.slug === slug)!);

export const brandedPartners = partnerStories.map((story) =>
  toPartnerContent(toPartnerBrand(story)),
);

export const launchedPartners = ['bumble', 'badoo', 'test-partner', 'test-partner-plus'].map(
  (slug) => toPartnerContent(brandBySlug(slug), `id-${slug}`),
);
