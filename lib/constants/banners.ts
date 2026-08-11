/** Height of the fixed mobile bottom navigation, which is rendered below the `md` breakpoint. */
export const mobileBottomNavHeight = 100;

/** Gap between a floating banner and the viewport edge, or the mobile bottom nav below it. */
export const floatingBannerGap = 16;

/** Sits above the mobile bottom nav (1100) so banners are never hidden behind it. */
export const floatingBannerZIndex = 1200;

/**
 * Bottom-end anchor shared by every floating banner (cookie consent, PWA install) so they all
 * occupy the same slot. Only one shows at a time — the PWA banner waits for the cookie banner to
 * be answered.
 */
export const getFloatingBannerPosition = (hasMobileBottomNav: boolean) =>
  ({
    position: 'fixed',
    // Logical inset, so the banner sits bottom-right in LTR and bottom-left in RTL locales.
    insetInlineEnd: floatingBannerGap,
    bottom: hasMobileBottomNav ? mobileBottomNavHeight + floatingBannerGap : floatingBannerGap,
    zIndex: floatingBannerZIndex,
  }) as const;
