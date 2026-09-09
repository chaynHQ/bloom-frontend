'use client';

import {
  REDESIGN_BANNER_DISMISSED,
  REDESIGN_BANNER_FEEDBACK_CLICKED,
  REDESIGN_BANNER_VIEWED,
} from '@/lib/constants/events';
import { FeatureFlag } from '@/lib/featureFlag';
import { useTopBannerHeight } from '@/lib/hooks/useTopBannerHeight';
import logEvent from '@/lib/utils/logEvent';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Collapse, IconButton, Typography } from '@mui/material';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

// Full-bleed background. On desktop the content box shrink-wraps to its natural one-line width
// (`fit-content`), centred, and only widens up to the rail cap — past which the message wraps.
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
  paddingBlock: { xs: 1.5, md: 1.75 },
  paddingInline: { xs: '1rem', md: '2.5rem' },
  width: { md: 'fit-content' },
  maxWidth: 1600,
  marginInline: 'auto',
} as const;

// The flex-basis drives the wrapping: the actions stay alongside the message until both no longer
// fit, then drop to their own row.
const messageStyle = {
  flex: '1 1 12rem',
  minWidth: 0,
  margin: 0,
  fontSize: { xs: '0.875rem', md: '1.0625rem' },
  lineHeight: 1.4,
} as const;

const actionsStyle = {
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  gap: { xs: 1, md: 1.5 },
} as const;

const ctaStyle = {
  paddingInline: { xs: 2, md: 3 },
  paddingBlock: { xs: 0.5, md: 0.75 },
  minWidth: 'auto',
  fontSize: { xs: '0.875rem', md: '0.9375rem' },
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

const FEEDBACK_FORM_LINK =
  'https://form.typeform.com/to/OY9Wdk4h?typeform-source=chayn.typeform.com';

export default function RedesignNewsBanner() {
  const [open, setOpen] = useState(true);
  const t = useTranslations('RedesignBanner');
  const sectionRef = useRef<HTMLDivElement>(null);

  // The dismissal cookie is client-only, so assume "not interacted" for SSR and the first paint:
  // the banner is then in the initial HTML and doesn't shove the page down once it resolves. A
  // visitor who already dismissed it sees it collapse away rather than a reserved gap.
  const [interacted, setInteracted] = useState(false);

  const showBanner = FeatureFlag.isRedesignNewsBannerEnabled();

  const viewLogged = useRef(false);
  useEffect(() => {
    if (Cookies.get(REDESIGN_NEWS_BANNER_INTERACTED)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInteracted(true);
    } else if (showBanner && !viewLogged.current) {
      viewLogged.current = true;
      logEvent(REDESIGN_BANNER_VIEWED);
    }
  }, [showBanner]);

  useTopBannerHeight(sectionRef, showBanner && open && !interacted);

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
      <Box component="aside" ref={sectionRef} aria-label={t('regionLabel')} sx={sectionStyle}>
        <Box sx={sectionContentStyle}>
          <Typography sx={messageStyle}>
            <Box component="strong" sx={{ fontWeight: 500 }}>
              {t('headline')}
            </Box>{' '}
            {t('supportingText')}
          </Typography>
          <Box sx={actionsStyle}>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              sx={ctaStyle}
              onClick={handleClickFeedback}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {t('feedback')}
              </Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                {t('feedbackShort')}
              </Box>
            </Button>
            <IconButton
              size="small"
              aria-label={t('dismiss')}
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
