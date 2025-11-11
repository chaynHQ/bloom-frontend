'use client';

import { usePathname, useRouter } from '@/i18n/routing';
import activitiesIcon from '@/public/activities_icon.svg';
import chatIcon from '@/public/chat_icon.svg';
import courseIcon from '@/public/course_icon.svg';
import groundingIcon from '@/public/grounding_icon.svg';
import notesFromBloomIcon from '@/public/notes_from_bloom_icon.svg';
import { Box, ButtonBase, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import {
  SECONDARY_HEADER_ACTIVITIES_CLICKED,
  SECONDARY_HEADER_CHAT_CLICKED,
  SECONDARY_HEADER_COURSES_CLICKED,
  SECONDARY_HEADER_GROUNDING_CLICKED,
  SECONDARY_HEADER_NOTES_CLICKED,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { getImageSizes } from '@/lib/utils/imageSizes';
import logEvent from '@/lib/utils/logEvent';
import { getIsMaintenanceMode } from '@/lib/utils/maintenanceMode';

interface MobileNavItem {
  label: string;
  href: string;
  icon: string;
  iconAlt: string;
  ariaLabel: string;
  event: string;
  qaId: string;
}

const illustrationSize = 38;

const mobileBottomNavStyle = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'linear-gradient(180deg, #F3D6D8 36.79%, #FFEAE1 73.59%)',
  borderTop: 2,
  borderColor: 'background.paper',
  boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
  zIndex: 1100,
  py: 1,
  pt: 0.5,
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
  gap: 0.25,
  flex: 1,
  px: 1,
  py: 1,
  minHeight: 7,
  textDecoration: 'none',
  borderRadius: 2,
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
  color: 'text.secondary',

  // Default state
  backgroundColor: 'transparent',

  // Hover state
  '&:hover': {
    transform: 'scale(1.05)',
    '& .nav-icon': {
      transform: 'scale(1.1)',
    },
  },

  // Focus state for accessibility
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'primary.main',
    outlineOffset: '2px',
  },

  // Active/pressed state
  '&:active': {
    transform: 'scale(0.98)',
  },

  // Selected (current page) state
  '&.selected': {
    '& .nav-icon': {
      backgroundColor: 'background.default',
      borderRadius: 5,
      filter: 'brightness(1.1)',
    },
    '& .nav-label': {
      color: 'text.primary',
      fontWeight: 500,
    },
  },
} as const;

const navIconStyle = {
  width: illustrationSize * 1.2,
  height: illustrationSize * 1.2,
  p: 0.5,
  pt: 0.625,
  marginBottom: 0.5,
  position: 'relative',
  transition: 'transform 0.2s ease-in-out',
} as const;

const navLabelStyle = {
  fontSize: '10px',
  lineHeight: 1.2,
  textAlign: 'center',
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  transition: 'font-weight 0.2s ease-in-out',
} as const;

const MobileBottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const userId = useTypedSelector((state) => state.user.id);
  const t = useTranslations('Navigation');

  const isMaintenanceMode = getIsMaintenanceMode();

  // Don't render if not mobile, user not logged in, or in maintenance mode
  if (!isMobile || !userId || isMaintenanceMode) {
    return null;
  }

  const navItems: MobileNavItem[] = [
    {
      label: t('courses'),
      href: '/courses',
      icon: courseIcon,
      iconAlt: t('alt.courseIcon'),
      ariaLabel: t('courses'),
      event: SECONDARY_HEADER_COURSES_CLICKED,
      qaId: 'mobile-nav-courses-button',
    },
    {
      label: t('messaging'),
      href: '/messaging',
      icon: chatIcon,
      iconAlt: t('alt.chatIcon'),
      ariaLabel: t('messaging'),
      event: SECONDARY_HEADER_CHAT_CLICKED,
      qaId: 'mobile-nav-messaging-button',
    },
    {
      label: t('activities'),
      href: '/activities',
      icon: activitiesIcon,
      iconAlt: t('alt.activitiesIcon'),
      ariaLabel: t('activities'),
      event: SECONDARY_HEADER_ACTIVITIES_CLICKED,
      qaId: 'mobile-nav-activities-button',
    },
    {
      label: t('grounding'),
      href: '/grounding',
      icon: groundingIcon,
      iconAlt: t('alt.groundingIcon'),
      ariaLabel: t('grounding'),
      event: SECONDARY_HEADER_GROUNDING_CLICKED,
      qaId: 'mobile-nav-grounding-button',
    },
    {
      label: t('notes'),
      href: '/subscription/whatsapp',
      icon: notesFromBloomIcon,
      iconAlt: t('alt.notesIcon'),
      ariaLabel: t('notes'),
      event: SECONDARY_HEADER_NOTES_CLICKED,
      qaId: 'mobile-nav-notes-button',
    },
  ];

  const handleNavClick = (navItem: MobileNavItem) => {
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
