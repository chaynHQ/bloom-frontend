import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Button, Drawer } from '@mui/material';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { RootState } from '../../app/store';
import {
  HEADER_NAVIGATION_MENU_CLOSED,
  HEADER_NAVIGATION_MENU_OPENED,
} from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import PrimaryNavigationDrawerLinks from './PrimaryNavigationDrawerLinks';
import SecondaryNavigationDrawerLinks from './SecondaryNavigationDrawerLinks';

const logoContainerStyle = {
  position: 'relative',
  width: 120,
  height: 60,
  marginLeft: 2,
} as const;

const buttonStyle = {
  color: 'common.white',
  ':hover': { backgroundColor: 'background.default', color: 'primary.dark' },
  '& .MuiButton-startIcon': { marginX: -2 },
  '& .MuiTouchRipple-root span': {
    backgroundColor: 'primary.main',
    opacity: 0.2,
  },
} as const;

const closeButtonStyle = {
  ...buttonStyle,
  marginLeft: 'auto',
  minWidth: 40,
} as const;

const NavigationDrawer = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const t = useTranslations('Navigation');
  const tS = useTranslations('Shared');
  const { user, partnerAccesses, partnerAdmin } = useTypedSelector((state: RootState) => state);
  const eventUserData = getEventUserData({ user, partnerAccesses, partnerAdmin });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    logEvent(HEADER_NAVIGATION_MENU_OPENED, eventUserData);
  };
  const handleClose = () => {
    setAnchorEl(null);
    logEvent(HEADER_NAVIGATION_MENU_CLOSED, eventUserData);
  };

  return (
    <Box>
      {open ? (
        <Button
          aria-label={t('menuClose')}
          onClick={handleClose}
          startIcon={<CloseIcon />}
          size="large"
          sx={closeButtonStyle}
        ></Button>
      ) : (
        <Button
          aria-controls="navigation-menu"
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          aria-label={t('menuOpen')}
          onClick={handleClick}
          startIcon={<MenuIcon />}
          size="large"
          sx={buttonStyle}
        ></Button>
      )}
      <Drawer
        hideBackdrop={false}
        PaperProps={{
          sx: { backgroundColor: 'primary.dark', color: 'common.white', top: { xs: 48, sm: 64 } },
        }}
        sx={{ width: '100%', top: { xs: 48, sm: 64 } }}
        anchor="top"
        open={open}
        onClose={handleClose}
      >
        <PrimaryNavigationDrawerLinks setAnchorEl={setAnchorEl} />
        <SecondaryNavigationDrawerLinks setAnchorEl={setAnchorEl} />
      </Drawer>
    </Box>
  );
};
export default NavigationDrawer;
