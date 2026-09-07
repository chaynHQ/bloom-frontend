'use client';

import {
  REDESIGN_BANNER_DISMISSED,
  REDESIGN_BANNER_FEEDBACK_CLICKED,
} from '@/lib/constants/events';
import { FeatureFlag } from '@/lib/featureFlag';
import logEvent from '@/lib/utils/logEvent';
import { contentRailGutter } from '@/styles/common';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Collapse, IconButton, Typography } from '@mui/material';
import Cookies from 'js-cookie';
import { useLocale } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

// Full-bleed background; the content aligns to the TopBar's inline gutters so it lines up with
// the logo and nav (tighter than the page Container on mobile — see TopBar / styles/theme.ts).
const sectionStyle = {
  width: '100%',
  backgroundColor: 'secondary.main',
  color: 'text.primary',
  borderBottom: '1px solid',
  borderBottomColor: 'secondary.dark',
} as const;

const sectionContentStyle = {
  display: 'flex',
  alignItems: { xs: 'flex-start', md: 'center' },
  justifyContent: 'space-between',
  flexWrap: { xs: 'wrap', md: 'nowrap' },
  gap: { xs: 1.5, md: 3 },
  paddingBlock: { xs: 1.5, md: 1 },
  paddingInline: {
    xs: '1rem',
    md: '2rem',
    lg: contentRailGutter(),
  },
} as const;

// The flex-basis drives the wrapping: the actions stay alongside the message until both no longer
// fit, then drop to their own row.
const messageStyle = {
  flex: '1 1 12rem',
  minWidth: 0,
  margin: 0,
  fontSize: { xs: '0.875rem', md: '0.9375rem' },
  lineHeight: 1.4,
} as const;

const actionsStyle = {
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  gap: { xs: 1, md: 1.5 },
} as const;

const ctaStyle = {
  paddingInline: { xs: 2, md: 2.5 },
  paddingBlock: 0.5,
  minWidth: 'auto',
  fontSize: '0.875rem',
  lineHeight: 1.5,
  whiteSpace: 'nowrap',
  boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.12)',
} as const;

// The themed IconButton hover is primary.main, which washes out against the apricot section.
const dismissStyle = {
  color: 'text.primary',
  padding: 0.5,
  '&:hover': { backgroundColor: 'secondary.dark' },
} as const;

const REDESIGN_NEWS_BANNER_INTERACTED = 'redesign_news_banner_interacted';

const TOP_BANNER_HEIGHT_VARIABLE = '--top-banner-height';

const FEEDBACK_FORM_LINK =
  'https://form.typeform.com/to/OY9Wdk4h?typeform-source=chayn.typeform.com';

// Copy is not translated yet, so the banner is gated on the `en` locale. Move to i18n/messages
// when it needs to reach other languages.
const COPY = {
  regionLabel: 'Bloom redesign news',
  headline: 'Bloom had a makeover!',
  supportingText:
    ' All our content now lives in the Library, so it’s easier to find and filter \u{1F49C}',
  feedback: 'Share feedback',
  dismiss: 'Dismiss',
} as const;

export default function RedesignNewsBanner() {
  const [open, setOpen] = useState(true);
  const locale = useLocale();
  const sectionRef = useRef<HTMLDivElement>(null);

  // The dismissal cookie is client-only, so assume "not interacted" for SSR and the first paint:
  // the banner is then in the initial HTML and doesn't shove the page down once it resolves. A
  // visitor who already dismissed it sees it collapse away rather than a reserved gap.
  const [interacted, setInteracted] = useState(false);

  useEffect(() => {
    if (Cookies.get(REDESIGN_NEWS_BANNER_INTERACTED)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInteracted(true);
    }
  }, []);

  const showBanner = FeatureFlag.isRedesignNewsBannerEnabled() && locale === 'en';

  // Publishes how much of the banner is still visible below the fixed TopBar. The floating back /
  // "Leave site" buttons offset by it, so they ride down with the banner as it scrolls away and
  // settle just under the TopBar once it's gone — see breadcrumbPositionStyle in styles/common.ts.
  useEffect(() => {
    const section = sectionRef.current;
    const root = document.documentElement;

    const clear = () => root.style.removeProperty(TOP_BANNER_HEIGHT_VARIABLE);

    if (!section || !open || interacted) {
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
  }, [open, interacted, showBanner]);

  const handleClickFeedback = () => {
    logEvent(REDESIGN_BANNER_FEEDBACK_CLICKED);
    window.open(FEEDBACK_FORM_LINK, '_blank', 'noopener,noreferrer');
  };

  const handleClickDeclined = () => {
    Cookies.set(REDESIGN_NEWS_BANNER_INTERACTED, 'true');
    logEvent(REDESIGN_BANNER_DISMISSED);
    setOpen(false);
  };

  if (!showBanner) return null;

  // Starts open; if the cookie effect finds a prior dismissal it collapses away smoothly
  // rather than the banner (and the page under it) snapping into place.
  return (
    <Collapse in={open && !interacted} unmountOnExit>
      <Box component="aside" ref={sectionRef} aria-label={COPY.regionLabel} sx={sectionStyle}>
        <Box sx={sectionContentStyle}>
          <Typography sx={messageStyle}>
            <Box component="strong" sx={{ fontWeight: 500 }}>
              {COPY.headline}
            </Box>
            {COPY.supportingText}
          </Typography>
          <Box sx={actionsStyle}>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              sx={ctaStyle}
              onClick={handleClickFeedback}
            >
              {COPY.feedback}
            </Button>
            <IconButton
              size="small"
              aria-label={COPY.dismiss}
              sx={dismissStyle}
              onClick={handleClickDeclined}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Collapse>
  );
}
