'use client';

import { Box, type BoxProps } from '@mui/material';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

const RISE_PX = 6;
const DURATION_MS = 700;
// A soft, near-linear ease — no overshoot, no sharp start.
const EASING = 'cubic-bezier(0.33, 0, 0.2, 1)';
// Show the content anyway if the observer never fires (unsupported API, unusual layout, headless quirks).
const SAFETY_MS = 3000;

// True inside a ScrollReveal that is already handling the entrance, so a nested one stays a
// plain layout wrapper rather than fading its content a second time.
const NestedContext = createContext(false);

const revealStyle = (shown: boolean, delay: number, fill: boolean) =>
  ({
    opacity: shown ? 1 : 0,
    transform: shown ? 'none' : `translateY(${RISE_PX}px)`,
    transition: `opacity ${DURATION_MS}ms ${EASING}, transform ${DURATION_MS}ms ${EASING}`,
    transitionDelay: `${delay}ms`,
    // `fill` makes the wrapper a transparent pass-through so a single child still
    // stretches to an equal-height grid cell or a flex row. `minWidth: 0` on the
    // wrapper keeps it from blowing a `1fr` grid track or a flex row wider than its
    // container when the card holds non-wrapping content.
    ...(fill && { display: 'flex', minWidth: 0, '& > *': { flexGrow: 1, minWidth: 0 } }),
    '@media (prefers-reduced-motion: reduce)': {
      opacity: 1,
      transform: 'none',
      transition: 'none',
    },
  }) as const;

interface ScrollRevealProps extends BoxProps {
  /** Stagger in ms, applied as a transition delay so a row of items cascades in. */
  delay?: number;
  /** Stretch a single card child to fill an equal-height grid cell or flex row. */
  fill?: boolean;
}

/**
 * Fades and lifts its content into place the first time it scrolls into view. Content
 * is only ever made transparent, never unmounted, so layout and SSR are unaffected;
 * a safety timer and the reduced-motion guard mean it can't get stuck hidden. Nesting
 * one inside another is a no-op — the outermost one owns the entrance.
 */
export function ScrollReveal({
  delay = 0,
  fill = false,
  sx,
  children,
  ...props
}: ScrollRevealProps) {
  const nested = useContext(NestedContext);
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (nested) return;
    const element = ref.current;
    if (!element) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShown(true);
      return;
    }

    const safety = setTimeout(() => setShown(true), SAFETY_MS);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
        clearTimeout(safety);
      },
      // Trigger a touch before the element reaches the viewport edge.
      { rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      clearTimeout(safety);
    };
  }, [nested]);

  const content = (
    <Box
      ref={ref}
      sx={[revealStyle(shown || nested, delay, fill), ...(Array.isArray(sx) ? sx : [sx])]}
      {...props}
    >
      {children}
    </Box>
  );

  return nested ? content : <NestedContext.Provider value>{content}</NestedContext.Provider>;
}
