'use client';

import { usePathname } from '@/i18n/routing';
import { LEAVE_SITE_BUTTON_CLICKED } from '@/lib/constants/events';
import logEvent from '@/lib/utils/logEvent';
import { breadcrumbButtonStyle } from '@/styles/common';
import { Button } from '@mui/material';
import { useTranslations } from 'next-intl';

const buttonStyle = {
  ...breadcrumbButtonStyle,
  left: 'unset',
  right: { xs: 16, lg: 80 },
  backgroundColor: 'primary.dark',
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
    <Button sx={buttonStyle} onClick={hideSite} variant="contained" color="error" size="small">
      {tS('button')}
    </Button>
  );
};

export default LeaveSiteButton;
