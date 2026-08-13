export const mobileBottomNavHeight = 100;

export const floatingBannerGap = 16;

// Sits above the mobile bottom nav (1100) so banners are never hidden behind it.
export const floatingBannerZIndex = 1200;

export const getFloatingBannerPosition = (hasMobileBottomNav: boolean) =>
  ({
    position: 'fixed',
    // Logical inset, so the banner sits bottom-right in LTR and bottom-left in RTL locales.
    insetInlineEnd: floatingBannerGap,
    bottom: hasMobileBottomNav ? mobileBottomNavHeight + floatingBannerGap : floatingBannerGap,
    zIndex: floatingBannerZIndex,
  }) as const;
