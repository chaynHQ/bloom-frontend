'use client';

import { useEffect, type RefObject } from 'react';

const TOP_BANNER_HEIGHT_VARIABLE = '--top-banner-height';

// Publishes how much of a top banner is still visible below the fixed TopBar as
// `--top-banner-height` on <html>. The floating back / "Leave site" buttons offset by it, so they
// ride down with the banner as it scrolls away and settle just under the TopBar once it's gone —
// see breadcrumbPositionStyle in styles/common.ts. Pass `active: false` once the banner is
// hidden or dismissed so the variable is cleared.
export function useTopBannerHeight(sectionRef: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    const section = sectionRef.current;
    const root = document.documentElement;

    const clear = () => root.style.removeProperty(TOP_BANNER_HEIGHT_VARIABLE);

    if (!section || !active) {
      clear();
      return;
    }

    const sync = () => {
      const topBarBottom =
        document.querySelector('[qa-id="nav-bar"]')?.getBoundingClientRect().bottom ?? 0;
      const visible = Math.max(
        0,
        Math.min(section.offsetHeight, section.getBoundingClientRect().bottom - topBarBottom),
      );
      root.style.setProperty(TOP_BANNER_HEIGHT_VARIABLE, `${visible}px`);
    };

    let frame = 0;
    const scheduleSync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(section);
    window.addEventListener('scroll', scheduleSync, { passive: true });
    window.addEventListener('resize', scheduleSync);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', scheduleSync);
      window.removeEventListener('resize', scheduleSync);
      clear();
    };
  }, [sectionRef, active]);
}
