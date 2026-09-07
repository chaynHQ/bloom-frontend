'use client';

import { usePathname, useRouter } from '@/i18n/routing';
import { Box, ButtonBase, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { mobileBottomNavHeight } from '@/lib/constants/banners';
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
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'fixed',
  bottom: 0,
  insetInlineStart: 0,
  insetInlineEnd: 0,
  backgroundColor: 'sectionSurface',
  borderTop: 2,
  borderColor: 'supportArrowPanel',
  boxShadow: '0 -6px 10px rgba(153, 2, 53, 0.05), 0 -2px 3px rgba(0, 0, 0, 0.1)',
  zIndex: 1100,
  height: mobileBottomNavHeight,
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
  gap: '2px',
  flex: 1,
  minWidth: 0,
  pt: '8px',
  pb: '6px',
  textDecoration: 'none',
  position: 'relative',
  color: 'text.primary',

  // Focus state for accessibility
  '&:focus-visible': {
    '& .nav-label': {
      color: 'text.primary',
      backgroundColor: 'white',
      outline: '1px solid',
      outlineColor: 'primary.dark',
      outlineOffset: '2px',
    },
  },

  // Selected (current page) state: a pink bar across the top edge of the item.
  '&.selected::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    insetInlineStart: 0,
    insetInlineEnd: 0,
    height: '2px',
    backgroundColor: 'primary.dark',
  },
} as const;

const navIconStyle = {
  position: 'relative',
} as const;

const navLabelStyle = {
  fontSize: '0.875rem',
  lineHeight: '20px',
  textAlign: 'center',
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  '@media (max-width: 349px)': {
    fontSize: '0.75rem',
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
