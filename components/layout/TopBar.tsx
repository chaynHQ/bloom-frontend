'use client';

import { Link as i18nLink } from '@/i18n/routing';
import { HEADER_HOME_LOGO_CLICKED, HEADER_LOGIN_CLICKED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { getImageSizes } from '@/lib/utils/imageSizes';
import logEvent from '@/lib/utils/logEvent';
import { getIsMaintenanceMode } from '@/lib/utils/maintenanceMode';
import bloomLogo from '@/public/bloom_logo_white.svg';
import { rowStyle, topBarSpacerStyle } from '@/styles/common';
import {
  AppBar,
  Box,
  Button,
  Container,
  Link,
  Theme,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import DesktopMainNav from './DesktopMainNav';
import DesktopTopNav from './DesktopTopNav';
import LanguageMenu from './LanguageMenu';
import MobileTopNav from './MobileTopNav';
import UserMenu from './UserMenu';

const isMaintenanceMode = getIsMaintenanceMode();

const appBarStyle = {
  bgcolor: 'primary.dark',
  zIndex: (theme: Theme) => theme.zIndex.drawer + 1,
} as const;

const appBarContainerStyles = {
  ...rowStyle,
  alignItems: 'center',
  alignContent: 'center',
  height: { xs: 52, sm: 64 },
  padding: '0 !important',
} as const;

const logoContainerStyle = {
  position: 'relative',
  width: { xs: 80, sm: 120 },
  marginLeft: { xs: 3, md: 0 },
  height: 48,
} as const;

const menusContainerStyle = {
  ...rowStyle,
  alignItems: 'center',
  alignContent: 'center',
  mr: { xs: 1, sm: -1 },
} as const;

export const navDrawerButtonStyle = {
  color: 'common.white',
  ':hover': { backgroundColor: 'background.default', color: 'primary.dark' },
  '& .MuiButton-startIcon': { mx: 0 },
  '& .MuiTouchRipple-root span': {
    backgroundColor: 'primary.main',
    opacity: 0.2,
  },
  px: 1,
  minWidth: 'unset',
  width: 38,
  height: 38,
} as const;

const TopBar = () => {
  const t = useTranslations('Navigation');
  const tS = useTranslations('Shared');
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [welcomeUrl, setWelcomeUrl] = useState<string>('/');

  const userId = useTypedSelector((state) => state.user.id);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

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
            component={i18nLink}
            qa-id="home-logo-link"
            href={welcomeUrl}
            aria-label={t('home')}
            sx={logoContainerStyle}
            onClick={() => {
              logEvent(HEADER_HOME_LOGO_CLICKED);
            }}
          >
            <Image
              alt={tS('alt.bloomLogo')}
              src={bloomLogo}
              fill
              sizes={getImageSizes(logoContainerStyle.width)}
              style={{
                objectFit: 'contain',
              }}
            />
          </Link>
          <Box sx={menusContainerStyle}>
            {!isSmallScreen && <DesktopTopNav />}
            {isSmallScreen && <LanguageMenu />}
            {userId && !isMaintenanceMode && <UserMenu />}
            {!isSmallScreen && <LanguageMenu />}
            {!isMaintenanceMode && (
              <>
                {!isSmallScreen && !userId && (
                  <Button
                    variant="contained"
                    size="medium"
                    qa-id="login-menu-button"
                    sx={{ width: 'auto', ml: 1 }}
                    component={i18nLink}
                    href="/auth/login"
                    onClick={() => {
                      logEvent(HEADER_LOGIN_CLICKED);
                    }}
                  >
                    {t('login')}
                  </Button>
                )}
                {isSmallScreen && <MobileTopNav />}
              </>
            )}
          </Box>
        </Container>
        {!isSmallScreen && !isMaintenanceMode && <DesktopMainNav />}
      </AppBar>
      <Box sx={topBarSpacerStyle} marginTop={0} />
    </>
  );
};

export default TopBar;
