'use client';

import { useIsUserLoading } from '@/lib/hooks/useIsUserLoading';
import { useTopBannerHeight } from '@/lib/hooks/useTopBannerHeight';
import logEvent from '@/lib/utils/logEvent';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Collapse, IconButton, Typography } from '@mui/material';
import Cookies from 'js-cookie';
import { ReactNode, useEffect, useRef, useState } from 'react';

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
  textWrap: 'pretty',
  '& strong': { fontWeight: 500 },
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

const wideOnlyStyle = { display: { xs: 'none', sm: 'inline' } } as const;
const narrowOnlyStyle = { display: { xs: 'inline', sm: 'none' } } as const;

// The themed IconButton hover is primary.main, which washes out against the apricot section.
const dismissStyle = {
  color: 'text.primary',
  padding: 0.5,
  '&:hover': { backgroundColor: 'secondary.dark' },
} as const;

export interface DismissibleTopBannerProps {
  // Remembers a dismissal or action click across visits.
  cookieName: string;
  regionLabel: string;
  // Wrap the emphasised part in <strong>.
  message: ReactNode;
  actionLabel: string;
  // Swapped in below `sm`, where the full label would crowd the message.
  actionShortLabel?: string;
  actionHref: string;
  dismissLabel: string;
  events: { viewed: string; actionClicked: string; dismissed: string };
  eventParams?: Record<string, string>;
}

// A dismissible announcement between the TopBar and the page. Callers decide whether it shows at
// all; this owns the look, the dismissal cookie, analytics and the `--top-banner-height` offset.
export default function DismissibleTopBanner({
  cookieName,
  regionLabel,
  message,
  actionLabel,
  actionShortLabel,
  actionHref,
  dismissLabel,
  events,
  eventParams,
}: DismissibleTopBannerProps) {
  const [open, setOpen] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);

  // The dismissal cookie is client-only, so assume "not interacted" for SSR and the first paint:
  // the banner is then in the initial HTML and doesn't shove the page down once it resolves. A
  // visitor who already dismissed it sees it collapse away rather than a reserved gap.
  const [interacted, setInteracted] = useState(false);

  // A view counts once the user has loaded: until then a partner member may be about to get a
  // different banner (see TopBanner).
  const isUserLoading = useIsUserLoading();
  const viewLogged = useRef(false);
  useEffect(() => {
    if (Cookies.get(cookieName)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInteracted(true);
    } else if (!isUserLoading && !viewLogged.current) {
      viewLogged.current = true;
      logEvent(events.viewed, eventParams);
    }
  }, [cookieName, isUserLoading, events.viewed, eventParams]);

  useTopBannerHeight(sectionRef, open && !interacted);

  const handleClick = (event: string) => {
    logEvent(event, eventParams);
    Cookies.set(cookieName, 'true');
    setOpen(false);
  };

  // Starts open; if the cookie effect finds a prior dismissal it collapses away smoothly
  // rather than the banner (and the page under it) snapping into place.
  return (
    <Collapse in={open && !interacted} unmountOnExit>
      <Box component="aside" ref={sectionRef} aria-label={regionLabel} sx={sectionStyle}>
        <Box sx={sectionContentStyle}>
          <Typography sx={messageStyle}>{message}</Typography>
          <Box sx={actionsStyle}>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              sx={ctaStyle}
              href={actionHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleClick(events.actionClicked)}
            >
              {actionShortLabel ? (
                <>
                  <Box component="span" sx={wideOnlyStyle}>
                    {actionLabel}
                  </Box>
                  <Box component="span" sx={narrowOnlyStyle}>
                    {actionShortLabel}
                  </Box>
                </>
              ) : (
                actionLabel
              )}
            </Button>
            <IconButton
              size="small"
              aria-label={dismissLabel}
              sx={dismissStyle}
              onClick={() => handleClick(events.dismissed)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Collapse>
  );
}
