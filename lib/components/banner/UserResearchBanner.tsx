'use client';

import { usePathname } from '@/i18n/routing';
import { USER_BANNER_DISMISSED, USER_BANNER_INTERESTED } from '@/lib/constants/events';
import { FeatureFlag } from '@/lib/featureFlag';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent from '@/lib/utils/logEvent';
import { Alert, AlertTitle, Button, Collapse, Stack } from '@mui/material';
import Cookies from 'js-cookie';
import { useState } from 'react';

const alertStyle = {
  backgroundColor: 'secondary.light',
  color: 'text.primary',
  boxShadow: 1,
  borderRadius: 0.6,
  padding: 2,
  'flex-direction': 'column',
};

const USER_RESEARCH_BANNER_INTERACTED = 'user_research_banner_interacted';
const USER_RESEARCH_FORM_LINK =
  'https://docs.google.com/forms/d/e/1FAIpQLSfBwYdXRKDX_IKtcShgYvNu835BqtI5PbIC-GrmBBVIZDpQgw/viewform?usp=sf_link';

export default function UserResearchBanner() {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();

  const userCookiesAccepted = useTypedSelector((state) => state.user.cookiesAccepted);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);

  const isBannerNotInteracted = !Boolean(Cookies.get(USER_RESEARCH_BANNER_INTERACTED));
  const isBannerFeatureEnabled = FeatureFlag.isUserResearchBannerEnabled();
  // const isPublicUser = partnerAccesses.length === 0 && !partnerAdmin.id;
  const isBadooUser = partnerAccesses.find((pa) => {
    return pa.partner.name.toLowerCase() === 'badoo';
  });

  const isTargetPage = !(pathname.includes('auth') || pathname.includes('partnerName'));

  const showBanner = isBannerFeatureEnabled && isBadooUser && isTargetPage && isBannerNotInteracted;

  const handleClickAccepted = () => {
    if (userCookiesAccepted) Cookies.set(USER_RESEARCH_BANNER_INTERACTED, 'true');
    logEvent(USER_BANNER_INTERESTED);
    setOpen(false);

    window.open(USER_RESEARCH_FORM_LINK, '_blank', 'noopener,noreferrer');
  };

  const handleClickDeclined = () => {
    if (userCookiesAccepted) Cookies.set(USER_RESEARCH_BANNER_INTERACTED, 'true');
    logEvent(USER_BANNER_DISMISSED);
    setOpen(false);
  };

  return showBanner ? (
    <Stack sx={{ width: '100%' }} spacing={2}>
      <Collapse in={open}>
        <Alert
          icon={false}
          sx={alertStyle}
          action={
            <>
              <Button color="inherit" size="medium" onClick={handleClickAccepted}>
                I’m interested
              </Button>
              <Button color="inherit" size="medium" onClick={handleClickDeclined}>
                Dismiss
              </Button>
            </>
          }
        >
          <AlertTitle>
            <strong>Take part in Bloom research for $75</strong>
          </AlertTitle>
          By testing out new designs and giving us feedback, you can help us make Bloom better and
          reach more survivors.
        </Alert>
      </Collapse>
    </Stack>
  ) : null;
}
