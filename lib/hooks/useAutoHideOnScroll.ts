'use client';

import { useEffect, useRef, useState } from 'react';

// Force the nav visible whenever the user is within this many px of the top.
// Kept at least as large as the retracting top row so that, once it does hide,
// the content underneath has already scrolled up to meet the pinned bottom menu
// (no gap on desktop).
const TOP_THRESHOLD_PX = 64;
// Ignore scroll jitter below this delta.
const SCROLL_DELTA_PX = 4;
// After the user scrolls up to reveal the nav, it lingers this long if they
// immediately reverse and scroll back down. Scrolling straight down (without a
// preceding upward scroll) hides it right away.
const LINGER_AFTER_REVEAL_MS = 2000;

/**
 * Drives the sticky-nav show/hide behaviour used across every page: the nav is
 * visible near the top and on any upward scroll, and retracts on scroll-down —
 * immediately when scrolling straight down, or 2s after a reveal if the user
 * reverses direction.
 */
export const useAutoHideOnScroll = () => {
  const [hidden, setHidden] = useState(false);
  const hiddenRef = useRef(false);
  const lastScrollY = useRef(0);
  const revealedAt = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const clearHideTimer = () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
    };

    const reveal = () => {
      clearHideTimer();
      hiddenRef.current = false;
      setHidden(false);
    };

    const hide = () => {
      hideTimer.current = null;
      hiddenRef.current = true;
      setHidden(true);
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;
      lastScrollY.current = currentScrollY;

      if (currentScrollY <= TOP_THRESHOLD_PX) {
        reveal();
        return;
      }

      if (delta < -SCROLL_DELTA_PX) {
        reveal();
        revealedAt.current = Date.now();
      } else if (delta > SCROLL_DELTA_PX && !hiddenRef.current && !hideTimer.current) {
        const wait = Math.max(0, LINGER_AFTER_REVEAL_MS - (Date.now() - revealedAt.current));
        if (wait === 0) {
          hide();
        } else {
          hideTimer.current = setTimeout(hide, wait);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearHideTimer();
    };
  }, []);

  return hidden;
};
