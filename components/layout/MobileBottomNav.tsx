'use client';

import { usePathname, useRouter } from '@/i18n/routing';
import { Box, ButtonBase, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { getMainNavItems, MainNavItem } from '@/lib/navigation/navigationConfig';
import { getImageSizes } from '@/lib/utils/imageSizes';
import logEvent from '@/lib/utils/logEvent';
import { getIsMaintenanceMode } from '@/lib/utils/maintenanceMode';

interface ProcessedMobileNavItem {
  label: string;
  href: string;
  icon: string;
  iconAlt: string;
  ariaLabel: string;
  event: string;
  qaId: string;
}

const illustrationSize = 40;

const mobileBottomNavStyle = {
  display: { xs: 'flex', md: 'none' },
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'linear-gradient(180deg, #F3D6D8 36.79%, #FFEAE1 73.59%)',
  borderTop: 2,
  borderColor: 'background.paper',
  boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
  zIndex: 1100,
  py: 1.5,
  overflow: 'scroll',
} as const;

const navContainerStyle = {
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  maxWidth: '100%',
} as const;

const navItemStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  px: 0.25,
  textDecoration: 'none',
  borderRadius: 2,
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
  color: 'text.primary',

  '&:hover, &:active': {
    transform: 'scale(1.05)',
    '& .nav-icon': {
      transform: 'scale(1.1)',
    },
  },

  // Focus state for accessibility
  '&:focus-visible': {
    '& .nav-label': {
      color: 'text.primary',
      backgroundColor: 'white',
      fontWeight: 500,
      outline: '1px solid',
      outlineColor: 'primary.dark',
      outlineOffset: '2px',
    },
  },

  // Selected (current page) state
  '&.selected': {
    '& .nav-label': {
      color: 'text.primary',
      backgroundColor: 'white',
      fontWeight: 500,
    },
  },
} as const;

const navIconStyle = {
  marginBottom: 0.5,
  position: 'relative',
  transition: 'transform 0.2s ease-in-out',
} as const;

const navLabelStyle = {
  fontSize: '0.75rem',
  lineHeight: 1.2,
  px: 1,
  py: 0.5,
  borderRadius: 3,
  textAlign: 'center',
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  transition: 'font-weight 0.2s ease-in-out',
  '@media (max-width: 349px)': {
    fontSize: '0.625rem',
  },
} as const;

const MobileBottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Navigation');

  const isMaintenanceMode = getIsMaintenanceMode();

  if (isMaintenanceMode) {
    return null;
  }

  const navigationItems = getMainNavItems({
    includeTherapy: false, // Therapy link is in UserMenu on mobile
    qaIdSuffix: 'mobile-nav',
    isMobile: true,
  });

  const navItems: ProcessedMobileNavItem[] = navigationItems.map((item: MainNavItem) => ({
    label: t(item.translationKey as any),
    href: item.href,
    icon: item.icon,
    iconAlt: t(item.altTranslationKey as any),
    ariaLabel: t(item.translationKey as any),
    event: item.event,
    qaId: `mobile-nav-${item.qaIdPrefix}-button`,
  }));

  const handleNavClick = (navItem: ProcessedMobileNavItem) => {
    router.push(navItem.href);
    logEvent(navItem.event);
  };

  return (
    <Box
      component="nav"
      sx={mobileBottomNavStyle}
      role="navigation"
      aria-label={t('secondaryNavigationMenu')}
    >
      <Box sx={navContainerStyle}>
        {navItems.map((navItem) => {
          const isActive = pathname === navItem.href;

          return (
            <ButtonBase
              key={navItem.href}
              className={isActive ? 'selected' : ''}
              sx={navItemStyle}
              onClick={() => handleNavClick(navItem)}
              aria-label={navItem.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
              aria-pressed={isActive}
              qa-id={navItem.qaId}
              disableRipple={true}
            >
              <Box className="nav-icon" sx={navIconStyle}>
                <Image
                  src={navItem.icon}
                  alt={navItem.iconAlt}
                  width={illustrationSize}
                  height={illustrationSize}
                  sizes={getImageSizes(illustrationSize)}
                  style={{ objectFit: 'contain' }}
                />
              </Box>
              <Typography variant="caption" className="nav-label" sx={navLabelStyle}>
                {navItem.label}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
};

export default MobileBottomNav;
