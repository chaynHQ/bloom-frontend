import { Button, Box } from '@mui/material';
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
  const tS = useTranslations('Shared.leaveSite');

  const hideSite = () => {
    logEvent(LEAVE_SITE_BUTTON_CLICKED);
    window.open(tS('wikiLink'), '_newtab');
    location.replace(tS('googleLink'));
  };

  return (
    <Box sx={leaveThisSiteStyles}>
      <Button onClick={hideSite} variant="contained" color="error">
        {tS('button')}
      </Button>
    </Box>
  );
};

export default LeaveSiteButton;
