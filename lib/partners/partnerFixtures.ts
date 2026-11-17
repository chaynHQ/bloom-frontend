// Unit-test fixtures for the plan's "Partners used for testing": Bumble, Badoo and Fruitz as they
// are today, and Bumble For Friends, whose slug (bff) differs from its name, which contains "Bumble".
import { toPartnerContent } from './mapping';
import { ActivePartner } from './types';

const asset = (file: string) => ({
  id: 1,
  filename: `https://a.storyblok.com/f/123/200x60/abc/${file}`,
});
const emptyAsset = { id: null, filename: '' };

const partnerStory = (
  slug: string,
  name: string,
  legalName: string,
  published = true,
  parent = '',
) => ({
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
    parent,
  },
});

// Bumble For Friends' partner story is still a draft, and shares Bumble's logo as its sub-brand.
export const partnerStories = [
  partnerStory('bumble', 'Bumble', 'BUMBLE HOLDING LTD'),
  partnerStory('badoo', 'Badoo', 'BADOO LTD'),
  partnerStory('fruitz', 'Fruitz', 'FRUITZ LTD'),
  partnerStory('bff', 'Bumble For Friends', 'BUMBLE HOLDING LTD', false, 'Bumble'),
];

const bumble: ActivePartner = { id: 'id-bumble', name: 'Bumble', slug: 'bumble' };
const badoo: ActivePartner = { id: 'id-badoo', name: 'Badoo', slug: 'badoo' };
const fruitz: ActivePartner = { id: 'id-fruitz', name: 'Fruitz', slug: 'fruitz' };
const bumbleForFriends: ActivePartner = {
  id: 'id-bff',
  name: 'Bumble For Friends',
  slug: 'bff',
};

// GET /v1/partner/active before and after a super admin activates Bumble For Friends.
export const activePartners = [bumble, badoo, fruitz];
export const activePartnersWithBff = [...activePartners, bumbleForFriends];

const welcomeLink = (slug: string, published = true) => ({
  slug: `welcome/${slug}`,
  is_folder: false,
  published,
});

// Fruitz has no welcome page; Bumble For Friends' is a draft.
export const welcomeLinks = {
  folder: { slug: 'welcome', is_folder: true, published: true },
  bumble: welcomeLink('bumble'),
  badoo: welcomeLink('badoo'),
  bff: welcomeLink('bff', false),
};

export const emptyPartnershipLogoStory = {
  ...partnerStories[0],
  content: { ...partnerStories[0].content, partnership_logo: emptyAsset, illustration: null },
};

const contentFor = (slug: string, id?: string) =>
  toPartnerContent(
    partnerStories.find((story) => story.slug === slug)!,
    id,
  );

export const brandedPartners = partnerStories.map((story) => toPartnerContent(story));

// The launched set today, and once Bumble For Friends is activated.
export const launchedPartners = ['bumble', 'badoo'].map((slug) => contentFor(slug, `id-${slug}`));
export const launchedPartnersWithBff = [...launchedPartners, contentFor('bff', 'id-bff')];
