import { Button } from '@mui/material';
import { Box, lighten } from '@mui/system';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { LEAVE_SITE_BUTTON_CLICKED } from '../constants/events';
import logEvent from '../utils/logEvent';

const containerStyles = {
  position: 'fixed',
  textAlign: 'right',
  right: { xs: 16, lg: 80 },
  top: { xs: 15, md: 25 },
  zIndex: 100,
} as const;

const buttonStyle = {
  backgroundColor: 'primary.dark',
  color: 'common.white',

  '&:hover': {
    backgroundColor: lighten('#EA0050', 0.3),
  },
} as const;

const LeaveSiteButton = () => {
  const tS = useTranslations('Shared');

  const hideSite = () => {
    logEvent(LEAVE_SITE_BUTTON_CLICKED);
    window.open('https://en.wikipedia.org/wiki/Main_Page', '_newtab');
    location.replace(
      'https://www.google.co.uk/search?tbm=isch&sa=1&ei=esSCW4LPH4WugQaZsbqoDw&q=cute+baby+animal+memes&oq=cute+baby+animal+memes&gs_l=',
    );
  };

  return (
    <Box sx={containerStyles}>
      <Button color="primary" onClick={hideSite} sx={buttonStyle}>
        {tS('leaveSiteButton')}
      </Button>
    </Box>
  );
};

export default LeaveSiteButton;
