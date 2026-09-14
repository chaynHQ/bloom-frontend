'use client';

import { Link as i18nLink } from '@/i18n/routing';
import { HEADER_HOME_LOGO_CLICKED, HEADER_LOGIN_CLICKED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { useAutoHideOnScroll } from '@/lib/hooks/useAutoHideOnScroll';
import { getImageSizes } from '@/lib/utils/imageSizes';
import logEvent from '@/lib/utils/logEvent';
import { getIsMaintenanceMode } from '@/lib/utils/maintenanceMode';
import bloomLogo from '@/public/bloom_logo_white.svg';
import {
  contentRailGutter,
  navBarControlStyle,
  navRetractTransform,
  navShadow,
  onDarkNavItemFocusStyle,
  topBarSpacerStyle,
} from '@/styles/common';
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
  '--focus-ring-color': '#fff',
  zIndex: (theme: Theme) => theme.zIndex.drawer + 1,
  // Desktop only: the nav (pink bar + tabs strip) casts a soft drop onto the page below.
  // On mobile the tabs strip isn't rendered, so there's nothing to lift off the content.
  boxShadow: { xs: 'none', md: navShadow },
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
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 1,
  height: 64,
  paddingBlock: '0 !important',
  paddingInline: {
    xs: '1rem !important',
    md: '2rem !important',
    lg: `${contentRailGutter()} !important`,
  },
} as const;

const logoContainerStyle = {
  position: 'relative',
  flexShrink: 0,
  width: { xs: 88, sm: 100 },
  height: 48,
  ...onDarkNavItemFocusStyle,
} as const;

const menusContainerStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  flexShrink: 0,
  gap: { xs: 1, sm: 2 },
} as const;

const loginButtonStyle = {
  ...navBarControlStyle,
  minWidth: 100,
  bgcolor: 'common.white',
  color: 'primary.dark',
  '&:hover': { bgcolor: 'primary.light' },
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
            {!isSmallScreen && !isMaintenanceMode && !userLoading && !userId && (
              <Button
                variant="contained"
                size="small"
                disableElevation
                qa-id="login-menu-button"
                sx={loginButtonStyle}
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
          </Box>
        </Container>
        {!isSmallScreen && !isMaintenanceMode && <DesktopMainNav />}
      </AppBar>
      <Box sx={{ marginTop: 0, ...topBarSpacerStyle }} />
    </>
  );
};

export default TopBar;
