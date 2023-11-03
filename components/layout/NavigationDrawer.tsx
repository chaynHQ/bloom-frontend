import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import { useTranslations } from 'next-intl';
import Image from 'next/legacy/image';
import * as React from 'react';
import { RootState } from '../../app/store';
import {
  HEADER_NAVIGATION_MENU_CLOSED,
  HEADER_NAVIGATION_MENU_OPENED,
} from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import bloomLogo from '../../public/bloom_logo.svg';
import { columnStyle } from '../../styles/common';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import Link from '../common/Link';
import NavigationDrawerLinks from './NavigationDrawerLinks';

const drawerContainerStyle = {
  ...columnStyle,
  width: '70vw',
  paddingTop: 2,
} as const;

const logoContainerStyle = {
  position: 'relative',
  width: 120,
  height: 60,
  marginLeft: 2,
} as const;

const buttonStyle = {
  color: 'text.primary',
  ':hover': { backgroundColor: 'background.default' },
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
      <Drawer open={open} onClose={handleClose}>
        <Container sx={drawerContainerStyle}>
          <Button
            aria-label={t('menuClose')}
            onClick={handleClose}
            startIcon={<CloseIcon />}
            size="large"
            sx={closeButtonStyle}
          ></Button>
          <Link href="/" mb={2} aria-label={t('home')} sx={logoContainerStyle}>
            <Image alt={tS('alt.bloomLogo')} src={bloomLogo} layout="fill" objectFit="contain" />
          </Link>
          <NavigationDrawerLinks setAnchorEl={setAnchorEl} />
        </Container>
      </Drawer>
    </Box>
  );
};
export default NavigationDrawer;
