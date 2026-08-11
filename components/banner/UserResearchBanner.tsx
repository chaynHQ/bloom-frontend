'use client';

import { USER_BANNER_DISMISSED, USER_BANNER_INTERESTED } from '@/lib/constants/events';
import { FeatureFlag } from '@/lib/featureFlag';
import logEvent from '@/lib/utils/logEvent';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Collapse, IconButton, Typography } from '@mui/material';
import Cookies from 'js-cookie';
import { useLocale } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

// Full-bleed: the background runs edge to edge while the content keeps the page Container's
// gutters (see the MuiContainer overrides in styles/theme.ts).
const sectionStyle = {
  width: '100%',
  backgroundColor: 'secondary.main',
  color: 'text.primary',
  borderBottom: '1px solid',
  borderBottomColor: 'secondary.dark',
} as const;

const sectionContentStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: { xs: 'wrap', md: 'nowrap' },
  gap: { xs: 1.5, md: 3 },
  paddingBlock: { xs: 1.5, md: 1 },
  paddingInline: {
    xs: '1.5rem',
    sm: '2rem',
    lg: 'calc((100vw - 1000px) / 2)',
  },
} as const;

// The flex-basis drives the small-screen wrapping: flexbox wraps on the hypothetical main size, so
// the actions stay alongside the message until both no longer fit, then drop to their own row. A
// fixed `100%` would force that break at every width.
const messageStyle = {
  flex: '1 1 10rem',
  minWidth: { xs: 'auto', md: 0 },
  margin: 0,
  fontSize: { xs: '0.875rem', md: '0.9375rem' },
  lineHeight: 1.4,
  whiteSpace: { xs: 'normal', md: 'nowrap' },
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const;

const supportingTextStyle = { display: { xs: 'none', lg: 'inline' } } as const;

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

const USER_RESEARCH_BANNER_INTERACTED = 'user_research_banner_interacted';
const USER_RESEARCH_FORM_LINK =
  'https://docs.google.com/forms/d/e/1FAIpQLSfBwYdXRKDX_IKtcShgYvNu835BqtI5PbIC-GrmBBVIZDpQgw/viewform?usp=sf_link';

const TOP_BANNER_HEIGHT_VARIABLE = '--top-banner-height';

// The study runs in English only, so the banner is gated on the `en` locale and its copy is not
// translated. Move this to i18n/messages if the study opens up to other languages.
const COPY = {
  regionLabel: 'Bloom user research',
  headline: 'Take part in Bloom research for $75',
  supportingText: ' — test new designs and help us make Bloom better for survivors.',
  accept: 'I\u2019m interested',
  dismiss: 'Dismiss',
} as const;

export default function UserResearchBanner() {
  const [open, setOpen] = useState(true);
  const locale = useLocale();
  const sectionRef = useRef<HTMLDivElement>(null);

  // Resolved after mount to avoid a hydration mismatch; `null` means not yet known.
  const [bannerInteracted, setBannerInteracted] = useState<boolean | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBannerInteracted(Boolean(Cookies.get(USER_RESEARCH_BANNER_INTERACTED)));
  }, []);

  const isBannerFeatureEnabled = FeatureFlag.isUserResearchBannerEnabled();
  const isEnglish = locale === 'en';

  const showBanner = isBannerFeatureEnabled && isEnglish && bannerInteracted === false;

  // The floating back / "Leave site" buttons are fixed below the TopBar and must move down by
  // however tall this renders, which varies with breakpoint and wrapping. See
  // breadcrumbPositionStyle in styles/common.ts.
  useEffect(() => {
    const section = sectionRef.current;
    const root = document.documentElement;

    const clear = () => root.style.removeProperty(TOP_BANNER_HEIGHT_VARIABLE);

    if (!section || !open) {
      clear();
      return;
    }

    const sync = () =>
      root.style.setProperty(TOP_BANNER_HEIGHT_VARIABLE, `${section.offsetHeight}px`);

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(section);

    return () => {
      observer.disconnect();
      clear();
    };
  }, [open, showBanner]);

  const handleClickAccepted = () => {
    Cookies.set(USER_RESEARCH_BANNER_INTERACTED, 'true');
    logEvent(USER_BANNER_INTERESTED);
    setOpen(false);

    window.open(USER_RESEARCH_FORM_LINK, '_blank', 'noopener,noreferrer');
  };

  const handleClickDeclined = () => {
    Cookies.set(USER_RESEARCH_BANNER_INTERACTED, 'true');
    logEvent(USER_BANNER_DISMISSED);
    setOpen(false);
  };

  if (!showBanner) return null;

  return (
    <Collapse in={open}>
      <Box component="aside" ref={sectionRef} aria-label={COPY.regionLabel} sx={sectionStyle}>
        <Box sx={sectionContentStyle}>
          <Typography sx={messageStyle}>
            <Box component="strong" sx={{ fontWeight: 600 }}>
              {COPY.headline}
            </Box>
            <Box component="span" sx={supportingTextStyle}>
              {COPY.supportingText}
            </Box>
          </Typography>
          <Box sx={actionsStyle}>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              sx={ctaStyle}
              onClick={handleClickAccepted}
            >
              {COPY.accept}
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
