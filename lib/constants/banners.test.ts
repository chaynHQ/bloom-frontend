import { expect } from '@jest/globals';
import {
  floatingBannerGap,
  floatingBannerZIndex,
  getFloatingBannerPosition,
  mobileBottomNavHeight,
} from './banners';

describe('getFloatingBannerPosition', () => {
  it('should anchor to the bottom inline end corner on screens without the mobile bottom nav', () => {
    expect(getFloatingBannerPosition(false)).toEqual({
      position: 'fixed',
      insetInlineEnd: floatingBannerGap,
      bottom: floatingBannerGap,
      zIndex: floatingBannerZIndex,
    });
  });

  it('should sit above the mobile bottom nav on smaller screens', () => {
    expect(getFloatingBannerPosition(true).bottom).toBe(mobileBottomNavHeight + floatingBannerGap);
  });

  it('should give every floating banner the same anchor, so they cannot overlap', () => {
    expect(getFloatingBannerPosition(true)).toEqual(getFloatingBannerPosition(true));
    expect(getFloatingBannerPosition(false)).toEqual(getFloatingBannerPosition(false));
  });

  it('should stack above the mobile bottom nav', () => {
    // MobileBottomNav uses a z-index of 1100.
    expect(floatingBannerZIndex).toBeGreaterThan(1100);
  });
});
