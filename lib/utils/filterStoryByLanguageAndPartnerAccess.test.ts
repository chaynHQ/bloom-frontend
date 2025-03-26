import { ISbStoryData } from '@storyblok/react/rsc';
import filterResourcesForLocaleAndPartnerAccess from './filterStoryByLanguageAndPartnerAccess';

describe('filterResourcesForLocaleAndPartnerAccess', () => {
  const mockResources: ISbStoryData[] = [
    {
      uuid: '1',
      content: {
        languages: ['en', 'es'],
        included_for_partners: ['partner1', 'partner2'],
      },
    },
    {
      uuid: '2',
      content: {
        languages: ['fr'],
        included_for_partners: ['partner3'],
      },
    },
    {
      uuid: '3',
      content: {
        languages: ['en'],
        included_for_partners: ['partner1'],
      },
    },
    {
      uuid: '4',
      content: {
        languages: ['es'],
        included_for_partners: ['partner4'],
      },
    },
  ] as unknown as ISbStoryData[];

  it('should filter resources by locale and partner access', () => {
    const locale = 'en';
    const userPartners = ['partner1', 'partner3'];
    const result = filterResourcesForLocaleAndPartnerAccess(mockResources, locale, userPartners);

    expect(result).equal([
      {
        uuid: '1',
        content: {
          languages: ['en', 'es'],
          included_for_partners: ['partner1', 'partner2'],
        },
      },
      {
        uuid: '3',
        content: {
          languages: ['en'],
          included_for_partners: ['partner1'],
        },
      },
    ]);
  });

  it('should return an empty array if no resources match the locale', () => {
    const locale = 'de';
    const userPartners = ['partner1', 'partner3'];
    const result = filterResourcesForLocaleAndPartnerAccess(mockResources, locale, userPartners);

    expect(result).equal([]);
  });

  it('should return an empty array if no resources match the partner access', () => {
    const locale = 'en';
    const userPartners = ['partner5'];
    const result = filterResourcesForLocaleAndPartnerAccess(mockResources, locale, userPartners);

    expect(result).equal([]);
  });

  it('should handle the "default" language for English locale', () => {
    const locale = 'en';
    const userPartners = ['partner2'];
    const result = filterResourcesForLocaleAndPartnerAccess(mockResources, locale, userPartners);

    expect(result).equal([
      {
        uuid: '1',
        content: {
          languages: ['en', 'es'],
          included_for_partners: ['partner1', 'partner2'],
        },
      },
    ]);
  });

  it('should be case-insensitive for partner names', () => {
    const locale = 'fr';
    const userPartners = ['PARTNER3'];
    const result = filterResourcesForLocaleAndPartnerAccess(mockResources, locale, userPartners);

    expect(result).equal([
      {
        uuid: '2',
        content: {
          languages: ['fr'],
          included_for_partners: ['partner3'],
        },
      },
    ]);
  });
});
