import { expect } from '@jest/globals';
import { FeatureFlag } from './featureFlag';

describe('featureFlag', () => {

  it('should return user research banner value when environment variable set', () => {
    process.env.NEXT_PUBLIC_FF_USER_RESEARCH_BANNER = 'true';

    expect(FeatureFlag.isUserResearchBannerEnabled()).toEqual(true);
  });

  it('should return false when user research banner environment variable is not set', () => {
    process.env.NEXT_PUBLIC_FF_USER_RESEARCH_BANNER = '';

    expect(FeatureFlag.isUserResearchBannerEnabled()).toEqual(false);
  });
});
