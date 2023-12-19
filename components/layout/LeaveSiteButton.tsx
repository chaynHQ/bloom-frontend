import { Button } from '@mui/material';
import { Box } from '@mui/system';
import { useTranslations } from 'next-intl';
import { LEAVE_SITE_BUTTON_CLICKED } from '../../constants/events';
import logEvent from '../../utils/logEvent';

const leaveThisSiteStyles = {
  position: 'fixed',
  textAlign: 'right',
  right: { xs: 16, lg: 80 },
  zIndex: 100,
  top: { xs: 60, sm: 80, md: 150, lg: 160 },
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
    <Box sx={leaveThisSiteStyles}>
      <Button onClick={hideSite} variant="contained" color="error">
        {tS('leaveSiteButton')}
      </Button>
    </Box>
  );
};

export default LeaveSiteButton;
