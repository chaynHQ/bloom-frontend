'use client';

import { Link as i18nLink } from '@/i18n/routing';
import { HEADER_HOME_LOGO_CLICKED, HEADER_LOGIN_CLICKED } from '@/lib/constants/events';
import { useAutoHideOnScroll } from '@/lib/hooks/useAutoHideOnScroll';
import { useTypedSelector } from '@/lib/hooks/store';
import { getImageSizes } from '@/lib/utils/imageSizes';
import logEvent from '@/lib/utils/logEvent';
import { getIsMaintenanceMode } from '@/lib/utils/maintenanceMode';
import bloomLogo from '@/public/bloom_logo_white.svg';
import { navRetractTransform, rowStyle, topBarSpacerStyle } from '@/styles/common';
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
import { useEffect, useMemo } from 'react';
import DesktopMainNav from './DesktopMainNav';
import DesktopTopNav from './DesktopTopNav';
import LanguageMenu from './LanguageMenu';
import MobileTopNav from './MobileTopNav';
import UserMenu from './UserMenu';

const isMaintenanceMode = getIsMaintenanceMode();

const appBarStyle = {
  bgcolor: 'primary.dark',
  zIndex: (theme: Theme) => theme.zIndex.drawer + 1,
  transition: 'transform 0.3s ease',
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
} as const;

// Slides the top row (logo + menus) off the top of the viewport. On desktop the
// DesktopMainNav strip below it stays put at the top edge; on mobile the whole
// bar clears the screen.
const hiddenAppBarStyle = {
  transform: navRetractTransform,
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
  marginInlineStart: { xs: 3, sm: 0 },
  height: 48,
} as const;

const menusContainerStyle = {
  ...rowStyle,
  alignItems: 'center',
  alignContent: 'center',
  gap: { xs: 1, sm: 1.5 },
  paddingInlineEnd: { xs: 2, sm: 0 },
} as const;

const TopBar = () => {
  const t = useTranslations('Navigation');
  const tS = useTranslations('Shared');
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const navHidden = useAutoHideOnScroll();

  // Lets fixed elements pinned below the nav (breadcrumb, "Leave this site") ride
  // up with it — see breadcrumbPositionStyle in styles/common.ts.
  useEffect(() => {
    document.documentElement.dataset.navHidden = navHidden ? 'true' : 'false';
  }, [navHidden]);

  const userLoading = useTypedSelector(
    (state) => state.user.authStateLoading || state.user.loading,
  );
  const userId = useTypedSelector((state) => state.user.id);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  const welcomeUrl = useMemo(() => {
    if (partnerAdmin && partnerAdmin.partner) {
      return `/welcome/${partnerAdmin.partner.name.toLowerCase()}`;
    }
    if (partnerAccesses.length > 0) {
      return `/welcome/${partnerAccesses[0].partner.name.toLowerCase()}`;
    }
    return '/';
  }, [partnerAccesses, partnerAdmin]);

  return (
    <>
      <AppBar qa-id="nav-bar" sx={[appBarStyle, navHidden && hiddenAppBarStyle]} elevation={0}>
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
            {!userLoading && userId && !isMaintenanceMode && <UserMenu />}
            {!isSmallScreen && <LanguageMenu />}
            {!isMaintenanceMode && (
              <>
                {!userLoading && !userId && (
                  <Button
                    variant="contained"
                    size={isSmallScreen ? 'small' : 'medium'}
                    qa-id="login-menu-button"
                    sx={{
                      width: 'auto',
                      height: { xs: 32, sm: 38 },
                      marginInlineStart: 1,
                      px: { xs: 1.5, sm: 2 },
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    }}
                    component={i18nLink}
                    href="/auth/login"
                    onClick={() => {
                      logEvent(HEADER_LOGIN_CLICKED);
                    }}
                  >
                    {t('login')}
                  </Button>
                )}
              </>
            )}
            {isSmallScreen && <MobileTopNav />}
          </Box>
        </Container>
        {!isSmallScreen && !isMaintenanceMode && <DesktopMainNav />}
      </AppBar>
      <Box
        sx={[
          {
            marginTop: 0,
          },
          ...(Array.isArray(topBarSpacerStyle) ? topBarSpacerStyle : [topBarSpacerStyle]),
        ]}
      />
    </>
  );
};

export default TopBar;
