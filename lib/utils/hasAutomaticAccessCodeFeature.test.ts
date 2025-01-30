import { Partner, PartnerFeature } from '@/lib/store/partnersSlice';
import { expect } from '@jest/globals';
import hasAutomaticAccessCodeFeature from './hasAutomaticAccessCodeFeature';

const partnerData = {
  id: 'partner',
  name: 'partnerName',
  partnerFeature: [],
} as Partner;

const accessCodePartnerFeature = {
  active: true,
  feature: { name: 'AUTOMATIC_ACCESS_CODE' },
} as PartnerFeature;

describe('hasAutomaticAccessFeature', () => {
  it('should return false as has no partner features', () => {
    expect(hasAutomaticAccessCodeFeature(partnerData)).toEqual(false);
  });
  it('should return true as has no partner features', () => {
    expect(
      hasAutomaticAccessCodeFeature({ ...partnerData, partnerFeature: [accessCodePartnerFeature] }),
    ).toEqual(true);
  });
});
