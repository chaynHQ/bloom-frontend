import { expect } from '@jest/globals';
import { brandKey, findPartner, groupByBrand, resolveLaunchedPartner } from './resolve';
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
  const bumble = launchedPartners.find((partner) => partner.slug === 'bumble')!;

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

  it('matches the parent by name, ignoring case', () => {
    expect(brandKey({ ...bff, parent: 'BUMBLE' })).toBe(brandKey(bumble));
  });
});
