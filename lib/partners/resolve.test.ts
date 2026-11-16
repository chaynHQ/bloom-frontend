import { expect } from '@jest/globals';
import { findPartner, resolveLaunchedPartner } from './resolve';
import { brandedPartners, launchedPartners } from './testPartners';

describe('findPartner', () => {
  it('finds a branded partner by name, ignoring case, as getPartnerContent did', () => {
    expect(findPartner(brandedPartners, 'Bumble')?.slug).toBe('bumble');
    expect(findPartner(brandedPartners, 'BADOO')?.slug).toBe('badoo');
    expect(findPartner(brandedPartners, 'Fruitz')?.slug).toBe('fruitz');
  });

  it('matches whole names only', () => {
    expect(findPartner(brandedPartners, 'Test Partner')?.slug).toBe('test-partner');
    expect(findPartner(brandedPartners, 'umble')).toBeUndefined();
    expect(findPartner(brandedPartners, null)).toBeUndefined();
  });
});

describe('resolveLaunchedPartner', () => {
  it('resolves a launched slug', () => {
    expect(resolveLaunchedPartner(launchedPartners, 'bumble')?.name).toBe('Bumble');
    expect(resolveLaunchedPartner(launchedPartners, 'test-partner')?.name).toBe('Test Partner');
    expect(resolveLaunchedPartner(launchedPartners, 'test-partner-plus')?.name).toBe(
      'Test Partner Plus',
    );
  });

  it('ignores case, so an existing ?partner=Bumble link keeps working', () => {
    expect(resolveLaunchedPartner(launchedPartners, 'Bumble')?.name).toBe('Bumble');
  });

  it.each(['retired-partner', 'fruitz', 'nonsense', 'Test Partner', '', null, undefined])(
    'ignores %p',
    (slug) => {
      expect(resolveLaunchedPartner(launchedPartners, slug)).toBeUndefined();
    },
  );
});
