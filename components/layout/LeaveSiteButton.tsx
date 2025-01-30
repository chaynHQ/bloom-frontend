'use client';

import { usePathname } from '@/i18n/routing';
import { LEAVE_SITE_BUTTON_CLICKED } from '@/lib/constants/events';
import logEvent from '@/lib/utils/logEvent';
import { Box, Button } from '@mui/material';
import { useTranslations } from 'next-intl';

const leaveThisSiteStyles = {
  position: 'fixed',
  textAlign: 'right',
  right: { xs: 16, lg: 80 },
  zIndex: 100,
  top: { xs: 60, sm: 80, md: 150, lg: 160 },
} as const;

const LeaveSiteButton = () => {
  const tS = useTranslations('Shared.leaveSite');

  const pathname = usePathname();
  const pathHead = pathname.split('/')[1]; // E.g. courses | therapy | partner-admin

  const hideSite = () => {
    logEvent(LEAVE_SITE_BUTTON_CLICKED);
    window.open(tS('wikiLink'), '_newtab');
    location.replace(tS('googleLink'));
  };

  if (pathHead === 'partner-admin') {
    return <></>;
  }

  return (
    <Box sx={leaveThisSiteStyles}>
      <Button onClick={hideSite} variant="contained" color="error">
        {tS('button')}
      </Button>
    </Box>
  );
};

export default LeaveSiteButton;
