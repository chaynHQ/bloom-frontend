import { Box } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { RootState } from '../../app/store';
import { FeatureFlag } from '../../config/featureFlag';
import { HEADER_HOME_LOGO_CLICKED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import bloomLogo from '../../public/bloom_logo.svg';
import { rowStyle } from '../../styles/common';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import UserResearchBanner, { userResearchBannerInteracted } from '../banner/UserResearchBanner';
import Link from '../common/Link';
import LanguageMenu from './LanguageMenu';
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

  const { user, partnerAccesses, partnerAdmin } = useTypedSelector((state: RootState) => state);
  const eventUserData = getEventUserData({ user, partnerAccesses, partnerAdmin });

  useEffect(() => {
    if (partnerAdmin && partnerAdmin.partner) {
      setWelcomeUrl(`/welcome/${partnerAdmin.partner.name.toLowerCase()}`);
    }
    if (partnerAccesses.length > 0) {
      setWelcomeUrl(`/welcome/${partnerAccesses[0].partner.name.toLowerCase()}`);
    }
  }, [setWelcomeUrl, partnerAccesses, partnerAdmin]);

  const showResearchBanner = shouldShowResearchBanner(router.pathname);

  return (
    <>
      <AppBar sx={appBarStyle} elevation={0}>
        <Container sx={appBarContainerStyles}>
          {isSmallScreen && <NavigationDrawer />}
          <Link
            href={welcomeUrl}
            aria-label={t('home')}
            sx={logoContainerStyle}
            onClick={() => {
              logEvent(HEADER_HOME_LOGO_CLICKED, eventUserData);
            }}
          >
            <Image alt={tS('alt.bloomLogo')} src={bloomLogo} layout="fill" objectFit="contain" />
          </Link>
          {!isSmallScreen && <NavigationMenu />}
          <Box sx={rowStyle}>
            {user.token && <UserMenu />}
            <LanguageMenu />
          </Box>
        </Container>
      </AppBar>
      {showResearchBanner && <UserResearchBanner />}
    </>
  );
};

/**
 * The conditional logic to show the user research banner is based here rather than in "UserResearchBanner"
 * due to a bug with the display of the "LeaveSiteButton".
 *
 * If the conditional is placed in "UserResearchBanner", null will be returned when the banner should not be shown.
 *
 * Unfortunately, when null is returned, the display of the "LeaveSiteButton" changes so that the button takes up the full width of
 * the page rather only displaying on the right hand side of the page.
 *
 * As the user research banner is a temporary addition, this solution is left in for now.
 *
 */
const shouldShowResearchBanner = (pathname: string) => {
  const isCoursesPage = pathname.includes('courses');
  const isBannerInteracted = userResearchBannerInteracted();
  const isBannerFeatureEnabled = FeatureFlag.isUserResearchBannerEnabled();

  return isBannerFeatureEnabled && isCoursesPage && !isBannerInteracted;
};

export default TopBar;
