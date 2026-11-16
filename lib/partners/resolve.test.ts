import { expect } from '@jest/globals';
import { findPartner, resolveLaunchedPartner } from './resolve';
import { brandedPartners, launchedPartners, launchedPartnersWithBff } from './partnerFixtures';

describe('findPartner', () => {
  it('finds a branded partner by name, ignoring case, as getPartnerContent did', () => {
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
