import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import * as React from 'react';
import bloomLogo from '../public/bloom_logo.png';
import Link from './Link';
import NavigationMenu from './NavigationMenu';

const drawerContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '70vw',
  paddingTop: 2,
} as const;

const logoContainerStyle = {
  position: 'relative',
  width: 80,
  height: 48,
  marginLeft: 2,
} as const;

const NavigationDrawer = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const t = useTranslations('Navigation');

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
        sx={{ '& .MuiButton-startIcon': { marginRight: 0 } }}
      ></Button>
      <Drawer open={open} onClose={handleClose}>
        <Container sx={drawerContainerStyle}>
          <Button
            aria-label={t('menuClose')}
            onClick={handleClose}
            startIcon={<CloseIcon />}
            size="large"
            sx={{ marginLeft: 'auto', minWidth: 40, '& .MuiButton-startIcon': { marginRight: 0 } }}
          ></Button>
          <Link href="/" aria-label={t('home')} sx={logoContainerStyle}>
            <Image alt={t('bloomLogo')} src={bloomLogo} layout="fill" objectFit="contain" />
          </Link>
          <NavigationMenu />
        </Container>
      </Drawer>
    </Box>
  );
};
export default NavigationDrawer;
