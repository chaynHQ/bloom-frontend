import { PartnerContent } from '@/lib/constants/partners';
import { PartnerAccesses } from '@/lib/store/partnerAccessSlice';
import { expect } from '@jest/globals';
import { ISbStoryData } from '@storyblok/react/rsc';
import {
  filterStoriesForLocaleAndPartnerAccess,
  getUserContentPartners,
} from './partnerContentAccess';

const partnerAAccess = {
  id: '1',
  createdAt: new Date(),
  updatedAt: new Date(),
  partner: { name: 'PartnerA' } as PartnerContent,
};
const partnerBAccess = {
  id: '2',
  createdAt: new Date(),
  updatedAt: new Date(),
  partner: { name: 'PartnerB' } as PartnerContent,
};
const partnerAPartner = { name: 'PartnerA' } as PartnerContent;

describe('getUserContentPartners', () => {
  describe('logged out', () => {
    it('with no referral partner is a public viewer', () => {
      expect(getUserContentPartners(null, [], null, null)).toEqual(['public']);
    });
    it('with a referral partner is scoped to that partner', () => {
      expect(getUserContentPartners(null, [], 'PartnerA', null)).toEqual(['partnera']);
    });
  });

  describe('logged in', () => {
    it('with no partner access is a public viewer', () => {
      expect(getUserContentPartners(null, [], null, 'user-1')).toEqual(['public']);
    });
    it('ignores a lingering referral cookie once the account has no access', () => {
      expect(getUserContentPartners(null, [], 'partnerA', 'user-1')).toEqual(['public']);
    });
    it('uses a redeemed access code', () => {
      expect(
        getUserContentPartners(null, [partnerAAccess] as PartnerAccesses, null, 'user-1'),
      ).toEqual(['partnera']);
    });
    it('merges partner-admin and access codes without duplicates', () => {
      expect(
        getUserContentPartners(
          partnerAPartner,
          [partnerAAccess] as PartnerAccesses,
          null,
          'user-1',
        ),
      ).toEqual(['partnera']);
    });
    it('lists every partner the account can access', () => {
      expect(
        getUserContentPartners(
          partnerAPartner,
          [partnerAAccess, partnerBAccess] as PartnerAccesses,
          null,
          'user-1',
        ),
      ).toEqual(['partnera', 'partnerb']);
    });
  });
});

describe('filterStoriesForLocaleAndPartnerAccess', () => {
  const mockResources = [
    {
      uuid: '1',
      content: { languages: ['default', 'es'], included_for_partners: ['partner1', 'partner2'] },
    },
    { uuid: '2', content: { languages: ['fr'], included_for_partners: ['partner3'] } },
    { uuid: '3', content: { languages: ['default'], included_for_partners: ['partner1'] } },
    { uuid: '4', content: { languages: ['es'], included_for_partners: ['partner4'] } },
  ] as unknown as ISbStoryData[];

  it('filters by locale and partner access', () => {
    const result = filterStoriesForLocaleAndPartnerAccess(mockResources, 'default', [
      'partner1',
      'partner3',
    ]);
    expect(result.map((s) => s.uuid)).toEqual(['1', '3']);
  });

  it('returns nothing when no story matches the locale', () => {
    expect(filterStoriesForLocaleAndPartnerAccess(mockResources, 'de', ['partner1'])).toEqual([]);
  });

  it('returns nothing when no story matches the partner access', () => {
    expect(filterStoriesForLocaleAndPartnerAccess(mockResources, 'default', ['partner5'])).toEqual(
      [],
    );
  });

  it('maps the English locale onto the "default" language', () => {
    const result = filterStoriesForLocaleAndPartnerAccess(mockResources, 'default', ['partner2']);
    expect(result.map((s) => s.uuid)).toEqual(['1']);
  });

  it('treats a story with no languages set as English-only rather than hiding it everywhere', () => {
    const untagged = [
      { uuid: '5', content: { included_for_partners: [] } },
    ] as unknown as ISbStoryData[];

    expect(filterStoriesForLocaleAndPartnerAccess(untagged, 'en', ['public'])).toHaveLength(1);
    expect(filterStoriesForLocaleAndPartnerAccess(untagged, 'de', ['public'])).toEqual([]);
  });

  it('treats an empty included_for_partners list as available to everyone', () => {
    const open = [
      { uuid: '6', content: { languages: ['default'], included_for_partners: [] } },
    ] as unknown as ISbStoryData[];
    expect(filterStoriesForLocaleAndPartnerAccess(open, 'en', ['partner9'])).toHaveLength(1);
  });

  it('is case-insensitive for partner names', () => {
    const result = filterStoriesForLocaleAndPartnerAccess(mockResources, 'fr', ['PARTNER3']);
    expect(result.map((s) => s.uuid)).toEqual(['2']);
  });
});
