import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import * as React from 'react';
import { RootState } from '../app/store';
import { useTypedSelector } from '../hooks/store';
import bloomLogo from '../public/bloom_logo.svg';
import { rowStyle } from '../styles/common';
import Link from './Link';
import UserMenu from './UserMenu';

const appBarStyle = {
  bgcolor: 'primary.light',
  '+ div': { marginTop: { xs: 6, md: 8 } },
} as const;

const appBarContainerStyles = {
  ...rowStyle,
  justifyContent: 'space-between',
  alignItems: 'center',
  height: { xs: 48, md: 64 },
  paddingTop: '0 !important',
  paddingBottom: '0 !important',
} as const;

const logoContainerStyle = {
  position: 'relative',
  width: { xs: 80, md: 120 },
  height: 48,
} as const;

const TopBar = () => {
  const t = useTranslations('Navigation');
  const tS = useTranslations('Shared');
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const { user } = useTypedSelector((state: RootState) => state);

  return (
    <AppBar sx={appBarStyle} elevation={0}>
      <Container sx={appBarContainerStyles}>
        {/* {isSmallScreen && <NavigationDrawer />} */}
        <Link href="/" aria-label={t('home')} sx={logoContainerStyle}>
          <Image alt={tS('alt.bloomLogo')} src={bloomLogo} layout="fill" objectFit="contain" />
        </Link>
        {user.id && localStorage.getItem('accessToken') && <UserMenu />}
        {/* {!isSmallScreen && <NavigationMenu />} */}
        {/* <LanguageMenu /> */}
      </Container>
    </AppBar>
  );
};

export default TopBar;
