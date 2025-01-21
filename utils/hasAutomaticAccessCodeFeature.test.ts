import { FEATURES } from '../constants/enums';
import { Partner, PartnerFeature } from '../lib/store/partnersSlice';
import hasAutomaticAccessCodeFeature from './hasAutomaticAccessCodeFeature';
const partnerData = {
  id: 'partner',
  name: 'partnerName',
  partnerFeature: [],
} as Partner;

const accessCodePartnerFeature = {
  active: true,
  feature: { name: FEATURES.AUTOMATIC_ACCESS_CODE },
} as PartnerFeature;

describe('hasAutomaticAccessFeature', () => {
  it('should return false as has no partner features', () => {
    expect(hasAutomaticAccessCodeFeature(partnerData)).toBe(false);
  });
  it('should return true as has no partner features', () => {
    expect(
      hasAutomaticAccessCodeFeature({ ...partnerData, partnerFeature: [accessCodePartnerFeature] }),
    ).toBe(true);
  });
});
