'use client';

import { usePathname, useRouter } from '@/i18n/routing';
import { Icon, Tab, Tabs } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { HTMLAttributes } from 'react';

import { useTypedSelector } from '@/lib/hooks/store';
import { getMainNavItems, MainNavItem } from '@/lib/navigation/navigationConfig';
import { getImageSizes } from '@/lib/utils/imageSizes';
import logEvent from '@/lib/utils/logEvent';
import theme from '@/styles/theme';

interface ProcessedNavItem {
  label: string;
  href: string;
  icon: React.ReactElement;
  ariaLabel: string;
  event: string;
  qaId: string;
}

interface DesktopMainNavIconType {
  alt: string;
  src: string;
}

const tabsStyle = {
  display: { xs: 'none', md: 'flex' },
  backgroundColor: theme.palette.palePrimaryLight,
} as const;

const tabStyle = {
  flexDirection: 'row',
  textTransform: 'none',
  fontSize: theme.typography.body1.fontSize,
  fontweight: 500,
  padding: 0.25,
  color: 'text.primary',
  '& .material-icons ': { mb: 0, mr: 1.5 },

  '&.Mui-selected': {
    color: 'text.secondary',
  },
  ':hover': {
    borderBottom: '2px solid',
    borderColor: 'primary.dark',
  },
} as const;

export const DesktopMainNavIcon = ({ alt, src }: DesktopMainNavIconType) => (
  <Icon
    sx={{
      position: 'relative',
      fontSize: 35,
      marginBottom: 0,
    }}
  >
    <Image
      alt={alt}
      src={src}
      fill
      sizes={getImageSizes(35)}
      style={{
        objectFit: 'contain',
      }}
    />
  </Icon>
);

const DesktopMainNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const t = useTranslations('Navigation');

  const therapyAccess = partnerAccesses.find(
    (partnerAccess) => partnerAccess.featureTherapy === true,
  );

  // Get navigation items using shared configuration
  const navigationItems = getMainNavItems({
    includeTherapy: !!therapyAccess,
    qaIdSuffix: 'secondary-nav',
    isMobile: false,
  });

  // Transform navigation items for desktop component
  const navItems: ProcessedNavItem[] = navigationItems.map((item: MainNavItem) => ({
    label: t(item.translationKey as any),
    href: item.href,
    icon: <DesktopMainNavIcon src={item.icon} alt={t(item.altTranslationKey as any)} />,
    ariaLabel: t(item.translationKey as any),
    event: item.event,
    qaId: `secondary-nav-${item.qaIdPrefix}-button`,
  }));

  const tabIndex = navItems.findIndex((navItem) => navItem.href === pathname);
  const tabValue = tabIndex === -1 ? false : tabIndex;

  const onTabClick = (navItem: ProcessedNavItem) => {
    router.push(navItem.href);
    logEvent(navItem.event);
  };

  return (
    <Tabs
      value={tabValue}
      aria-label={t('secondaryNavigationMenu')}
      sx={tabsStyle}
      variant="fullWidth"
      qa-id="secondary-nav"
      // Weird type errors for this prop
      TabIndicatorProps={
        {
          sx: {
            backgroundColor: 'primary.dark',
          },
        } as Partial<HTMLAttributes<HTMLDivElement>>
      }
    >
      {navItems.map((navItem) => {
        return (
          <Tab
            qa-id={navItem.qaId}
            key={navItem.label}
            icon={navItem.icon}
            sx={tabStyle}
            aria-label={navItem.ariaLabel}
            label={navItem.label}
            onClick={() => onTabClick(navItem)}
          />
        );
      })}
    </Tabs>
  );
};

export default DesktopMainNav;
