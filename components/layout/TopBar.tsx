import { AppBar, Box, Button, Container, Theme, useMediaQuery, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { HEADER_HOME_LOGO_CLICKED, HEADER_LOGIN_CLICKED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import bloomLogo from '../../public/bloom_logo_white.svg';
import { rowStyle } from '../../styles/common';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import Link from '../common/Link';
import LanguageMenu from './LanguageMenu';
import NavigationDrawer from './NavigationDrawer';
import NavigationMenu from './NavigationMenu';
import SecondaryNav from './SecondaryNav';
import UserMenu from './UserMenu';

const appBarStyle = {
  bgcolor: 'primary.dark',
  zIndex: (theme: Theme) => theme.zIndex.drawer + 1,
} as const;

const appBarContainerStyles = {
  ...rowStyle,
  alignItems: 'center',
  alignContent: 'center',
  height: { xs: 48, sm: 64 },
  padding: '0 !important',
} as const;

const logoContainerStyle = {
  position: 'relative',
  width: { xs: 80, sm: 120 },
  marginLeft: { xs: 4, md: 0 },
  height: 48,
} as const;

const TopBar = () => {
  const t = useTranslations('Navigation');
  const tS = useTranslations('Shared');
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [welcomeUrl, setWelcomeUrl] = useState<string>('/');

  const userToken = useTypedSelector((state) => state.user.token);
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  useEffect(() => {
    if (partnerAdmin && partnerAdmin.partner) {
      setWelcomeUrl(`/welcome/${partnerAdmin.partner.name.toLowerCase()}`);
    }
    if (partnerAccesses.length > 0) {
      setWelcomeUrl(`/welcome/${partnerAccesses[0].partner.name.toLowerCase()}`);
    }
  }, [setWelcomeUrl, partnerAccesses, partnerAdmin]);

  return (
    <>
      <AppBar qa-id="nav-bar" sx={appBarStyle} elevation={0}>
        <Container sx={appBarContainerStyles}>
          <Link
            qa-id="home-logo-link"
            href={welcomeUrl}
            aria-label={t('home')}
            sx={logoContainerStyle}
            onClick={() => {
              logEvent(HEADER_HOME_LOGO_CLICKED, eventUserData);
            }}
          >
            <Image
              alt={tS('alt.bloomLogo')}
              src={bloomLogo}
              fill
              sizes="100vw"
              style={{
                objectFit: 'contain',
              }}
            />
          </Link>
          <Box sx={{ ...rowStyle, alignItems: 'center', alignContent: 'center' }}>
            {!isSmallScreen && <NavigationMenu />}
            {userToken && <UserMenu />}
            <LanguageMenu />
            {!isSmallScreen && !userToken && (
              <Button
                variant="contained"
                size="medium"
                qa-id="login-menu-button"
                sx={{ width: 'auto', ml: 1 }}
                component={Link}
                href="/auth/login"
                onClick={() => {
                  logEvent(HEADER_LOGIN_CLICKED, eventUserData);
                }}
              >
                {t('login')}
              </Button>
            )}
            {isSmallScreen && <NavigationDrawer />}
          </Box>
        </Container>
        {!isSmallScreen && <SecondaryNav currentPage={router.pathname} />}
      </AppBar>
    </>
  );
};

export default TopBar;
