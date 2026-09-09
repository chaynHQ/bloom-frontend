'use client';

import {
  USER_BANNER_DISMISSED,
  USER_BANNER_INTERESTED,
  USER_BANNER_VIEWED,
} from '@/lib/constants/events';
import { FeatureFlag } from '@/lib/featureFlag';
import { useTopBannerHeight } from '@/lib/hooks/useTopBannerHeight';
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
  alignItems: 'center',
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
// fit, then drop to their own row. A fixed `100%` would force that break at every width.
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

// The study runs in English only, so the banner is gated on the `en` locale and its copy is not
// translated. Move to i18n/messages if the study opens up to other languages.
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

  // The dismissal cookie is client-only, so assume "not interacted" for SSR and the first paint:
  // the banner is then in the initial HTML and doesn't shove the page down once it resolves. A
  // visitor who already interacted sees it collapse away rather than a reserved gap.
  const [interacted, setInteracted] = useState(false);

  const isBannerFeatureEnabled = FeatureFlag.isUserResearchBannerEnabled();
  const isEnglish = locale === 'en';

  const showBanner = isBannerFeatureEnabled && isEnglish;

  const viewLogged = useRef(false);
  useEffect(() => {
    if (Cookies.get(USER_RESEARCH_BANNER_INTERACTED)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInteracted(true);
    } else if (showBanner && !viewLogged.current) {
      viewLogged.current = true;
      logEvent(USER_BANNER_VIEWED);
    }
  }, [showBanner]);

  useTopBannerHeight(sectionRef, showBanner && open && !interacted);

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

  // Starts open; if the cookie effect finds a prior interaction it collapses away smoothly
  // rather than the banner (and the page under it) snapping into place.
  return (
    <Collapse in={open && !interacted} unmountOnExit>
      <Box component="aside" ref={sectionRef} aria-label={COPY.regionLabel} sx={sectionStyle}>
        <Box sx={sectionContentStyle}>
          <Typography sx={messageStyle}>
            <Box component="strong" sx={{ fontWeight: 500 }}>
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
