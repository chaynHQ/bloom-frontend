import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import * as React from 'react';
import bloomLogo from '../../public/bloom_logo.svg';
import { columnStyle } from '../../styles/common';
import Link from '../common/Link';
import NavigationMenu from './NavigationMenu';

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

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
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
          <NavigationMenu setAnchorEl={setAnchorEl} />
        </Container>
      </Drawer>
    </Box>
  );
};
export default NavigationDrawer;
