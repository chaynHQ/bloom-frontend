import { expect } from '@jest/globals';
import { publicContent } from '@/lib/constants/partners';
import { findPartner, getFooterPartners, groupByBrand, resolveLaunchedPartner } from './resolve';
import { brandedPartners, launchedPartners, launchedPartnersWithBff } from './partnerFixtures';

describe('findPartner', () => {
  it('finds a branded partner by name, ignoring case', () => {
    expect(findPartner(brandedPartners, 'Bumble')?.slug).toBe('bumble');
    expect(findPartner(brandedPartners, 'BADOO')?.slug).toBe('badoo');
    expect(findPartner(brandedPartners, 'Fruitz')?.slug).toBe('fruitz');
  });

  it('matches whole names only', () => {
    expect(findPartner(brandedPartners, 'Bumble For Friends')?.slug).toBe('bff');
    expect(findPartner(brandedPartners, 'Bumble')?.slug).toBe('bumble');
    expect(findPartner(brandedPartners, 'umble')).toBeUndefined();
    expect(findPartner(brandedPartners, null)).toBeUndefined();
  });
});

describe('resolveLaunchedPartner', () => {
  it('resolves a launched slug', () => {
    expect(resolveLaunchedPartner(launchedPartners, 'bumble')?.name).toBe('Bumble');
    expect(resolveLaunchedPartner(launchedPartnersWithBff, 'bff')?.name).toBe('Bumble For Friends');
  });

  it('ignores case, so an existing ?partner=Bumble link keeps working', () => {
    expect(resolveLaunchedPartner(launchedPartners, 'Bumble')?.name).toBe('Bumble');
  });

  it('ignores an inactive Bumble For Friends', () => {
    expect(resolveLaunchedPartner(launchedPartners, 'bff')).toBeUndefined();
  });

  it.each(['fruitz', 'nonsense', 'Bumble For Friends', '', null, undefined])(
    'ignores %p',
    (slug) => {
      expect(resolveLaunchedPartner(launchedPartnersWithBff, slug)).toBeUndefined();
    },
  );
});

describe('groupByBrand', () => {
  const slugs = (groups: { slug: string }[][]) => groups.map((group) => group.map((p) => p.slug));
  const bff = launchedPartnersWithBff.find((partner) => partner.slug === 'bff')!;

  it('keeps a partner without a parent on its own', () => {
    expect(slugs(groupByBrand(launchedPartners))).toEqual([['bumble'], ['badoo']]);
  });

  it('puts a sub-brand with its parent, parent first, whatever the order', () => {
    expect(slugs(groupByBrand(launchedPartnersWithBff))).toEqual([['bumble', 'bff'], ['badoo']]);
    expect(slugs(groupByBrand([bff, ...launchedPartners]))).toEqual([['bumble', 'bff'], ['badoo']]);
  });

  it('shows a sub-brand alone when its parent is not in the list', () => {
    expect(slugs(groupByBrand([bff]))).toEqual([['bff']]);
  });
});

describe('getFooterPartners', () => {
  const footerFor = (sources: Partial<Parameters<typeof getFooterPartners>[0]>) =>
    getFooterPartners({
      branded: brandedPartners,
      launched: launchedPartners,
      partnerNames: [],
      visitorSlugs: [],
      ...sources,
    }).map((partner) => ('slug' in partner ? partner.slug : partner.name));

  it('shows only Chayn when nothing points to a partner', () => {
    expect(footerFor({})).toEqual([publicContent.name]);
  });

  it('brands a signed-out visitor with the partner they were referred by', () => {
    expect(footerFor({ visitorSlugs: [null, 'bumble'] })).toEqual([publicContent.name, 'bumble']);
  });

  it('brands a signed-in member with only their own partner', () => {
    // The Footer passes no visitor slugs once someone is signed in, whatever their cookie says.
    expect(footerFor({ partnerNames: ['Badoo'] })).toEqual([publicContent.name, 'badoo']);
  });

  it('adds the partner of the welcome page a signed-in member is on', () => {
    expect(footerFor({ partnerNames: ['Badoo'], welcomePageSlug: 'bumble' })).toEqual([
      publicContent.name,
      'badoo',
      'bumble',
    ]);
  });

  it('shows a partner once when a member is on their own welcome page', () => {
    expect(footerFor({ partnerNames: ['Bumble'], welcomePageSlug: 'bumble' })).toEqual([
      publicContent.name,
      'bumble',
    ]);
  });

  it('ignores welcome pages and slugs of partners that have not launched', () => {
    expect(footerFor({ welcomePageSlug: 'fruitz', visitorSlugs: ['unknown'] })).toEqual([
      publicContent.name,
    ]);
  });
});
