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
import { HEADER_HOME_LOGO_CLICKED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import bloomLogo from '../../public/bloom_logo.svg';
import { rowStyle } from '../../styles/common';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import Link from '../common/Link';
import LanguageMenu from './LanguageMenu';
import NavigationDrawer from './NavigationDrawer';
import NavigationMenu from './NavigationMenu';
import UserMenu from './UserMenu';

const appBarStyle = {
  bgcolor: 'primary.light',
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
    </>
  );
};

export default TopBar;
