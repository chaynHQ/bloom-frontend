import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/router';
import * as React from 'react';
import { RootState } from '../../app/store';
import { useTypedSelector } from '../../hooks/store';
import bloomLogo from '../../public/bloom_logo.svg';
import { rowStyle } from '../../styles/common';
import Link from '../common/Link';
import NavigationDrawer from './NavigationDrawer';
import NavigationMenu from './NavigationMenu';
import UserMenu from './UserMenu';

const appBarStyle = {
  bgcolor: 'primary.light',
  '+ div': { marginTop: { xs: 6, md: 8 } },
} as const;

const appBarContainerStyles = {
  ...rowStyle,
  alignItems: 'center',
  alignContent: 'center',
  height: { xs: 48, sm: 64 },
  paddingTop: '0 !important',
  paddingBottom: '0 !important',
} as const;

const logoContainerStyle = {
  position: 'relative',
  width: { xs: 80, sm: 120 },
  height: 48,
} as const;

const TopBar = () => {
  const t = useTranslations('Navigation');
  const tS = useTranslations('Shared');
  const theme = useTheme();
  const router = useRouter();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const { user } = useTypedSelector((state: RootState) => state);

  return (
    <AppBar sx={appBarStyle} elevation={0}>
      <Container sx={appBarContainerStyles}>
        {isSmallScreen && <NavigationDrawer />}
        <Link href="/" aria-label={t('home')} sx={logoContainerStyle}>
          <Image alt={tS('alt.bloomLogo')} src={bloomLogo} layout="fill" objectFit="contain" />
        </Link>
        {!isSmallScreen && <NavigationMenu />}
        {user.token && <UserMenu />}
        {/* <LanguageMenu /> */}
      </Container>
    </AppBar>
  );
};

export default TopBar;
