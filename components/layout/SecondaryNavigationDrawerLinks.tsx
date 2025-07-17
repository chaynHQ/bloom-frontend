'use client';

import { Link as i18nLink } from '@/i18n/routing';
import {
  DRAWER_ACTIVITIES_CLICKED,
  DRAWER_CHAT_CLICKED,
  DRAWER_COURSES_CLICKED,
  DRAWER_GROUNDING_CLICKED,
  DRAWER_NOTES_CLICKED,
  DRAWER_THERAPY_CLICKED,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent from '@/lib/utils/logEvent';
import activitiesIcon from '@/public/activities_icon.svg';
import chatIcon from '@/public/chat_icon.svg';
import courseIcon from '@/public/course_icon.svg';
import groundingIcon from '@/public/grounding_icon.svg';
import notesFromBloomIcon from '@/public/notes_from_bloom_icon.svg';
import therapyIcon from '@/public/therapy_icon.svg';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { MobilePwaBanner } from '../banner/MobilePwaBanner';
import { SecondaryNavIcon } from './SecondaryNav';

const listStyle = {
  display: 'flex',
  backgroundColor: 'primary.light',
  flexDirection: { xs: 'column', md: 'row' },
  height: '100%',
  marginY: 0,
  paddingX: { xs: 0, sm: '5%' },
  pb: 30,
} as const;

const listItemStyle = {
  width: 'auto',
  mb: 0,
  marginX: 3,
  paddingX: 0,
} as const;

const listItemTextStyle = {
  span: {
    fontSize: 16,
    fontweight: 600,
  },
} as const;

const listButtonStyle = {
  borderRadius: 0,
  color: 'text.secondary',
  fontFamily: 'Monterrat, sans-serif',
  paddingY: 1,
  paddingX: 0.5,
  borderBottom: 1,
  height: '3.5rem',
  borderColor: 'primary.dark',

  '& .MuiTouchRipple-root span': {
    backgroundColor: 'primary.main',
    opacity: 0.2,
  },
} as const;

interface SecondaryNavigationItem {
  label: string;
  href: string;
  target?: string;
  event: string;
  icon?: string | React.ReactElement;
}

interface NavigationMenuProps {
  setAnchorEl?: Dispatch<SetStateAction<null | HTMLElement>>;
}

const SecondaryNavigationDrawerLinks = (props: NavigationMenuProps) => {
  const { setAnchorEl } = props;
  const t = useTranslations('Navigation');

  const userLoading = useTypedSelector((state) => state.user.loading);
  const userId = useTypedSelector((state) => state.user.id);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const bannerRef = useRef(null);

  const [navigationLinks, setNavigationLinks] = useState<Array<SecondaryNavigationItem>>([]);
  const [bannerIntersecting, setBannerIntersecting] = useState(false);

  // Detect menu intersection to toggle sticky banners, preventing overflow issues.
  const intersectionCb: IntersectionObserverCallback = (entries) => {
    const [entry] = entries;
    setBannerIntersecting(entry.isIntersecting);
  };
  const intersectionOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '0px',
    threshold: 1,
  };

  useEffect(() => {
    const observer = new IntersectionObserver(intersectionCb, intersectionOptions);

    if (bannerRef.current) observer.observe(bannerRef.current);

    return () => {
      if (bannerRef.current) observer.unobserve(bannerRef.current);
    };
  }, [bannerRef]);

  useEffect(() => {
    let links: Array<SecondaryNavigationItem> = [
      {
        label: t('courses'),
        href: '/courses',
        event: DRAWER_COURSES_CLICKED,
        icon: <SecondaryNavIcon src={courseIcon} alt={t('alt.courseIcon')} />,
      },
      {
        label: t('messaging'),
        href: '/messaging',
        event: DRAWER_CHAT_CLICKED,
        icon: <SecondaryNavIcon src={chatIcon} alt={t('alt.chatIcon')} />,
      },
      {
        label: t('activities'),
        href: '/activities',
        event: DRAWER_ACTIVITIES_CLICKED,
        icon: <SecondaryNavIcon src={activitiesIcon} alt={t('alt.activitiesIcon')} />,
      },
      {
        label: t('grounding'),
        href: '/grounding',
        event: DRAWER_GROUNDING_CLICKED,
        icon: <SecondaryNavIcon src={groundingIcon} alt={t('alt.groundingIcon')} />,
      },
      {
        label: t('notes'),
        href: '/subscription/whatsapp',
        event: DRAWER_NOTES_CLICKED,
        icon: <SecondaryNavIcon src={notesFromBloomIcon} alt={t('alt.notesIcon')} />,
      },
    ];

    if (!userLoading && userId) {
      const therapyAccess = partnerAccesses.find(
        (partnerAccess) => partnerAccess.featureTherapy === true,
      );

      if (!!therapyAccess) {
        links.push({
          label: t('therapy'),
          href: '/therapy/book-session',
          event: DRAWER_THERAPY_CLICKED,
          icon: <SecondaryNavIcon src={therapyIcon} alt={t('alt.therapyIcon')} />,
        });
      }
    }

    setNavigationLinks(links);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, userLoading, userId, partnerAccesses, partnerAdmin]);

  return (
    <Box ref={bannerRef}>
      <List sx={listStyle} onClick={() => setAnchorEl && setAnchorEl(null)}>
        {navigationLinks.map((link, index) => (
          <ListItem sx={listItemStyle} key={link.label} disablePadding>
            <ListItemButton
              sx={{
                ...listButtonStyle,
                borderColor: 'primary.dark',
                borderBottom: index !== navigationLinks.length - 1 ? 1 : 0,
              }}
              href={link.href}
              component={i18nLink}
              target={link.target || '_self'}
              onClick={() => {
                logEvent(link.event);
              }}
            >
              <ListItemIcon>{link.icon}</ListItemIcon>
              <ListItemText sx={listItemTextStyle} primary={link.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <Box
          sx={{ position: bannerIntersecting ? 'absolute' : 'fixed', bottom: 0, left: 0, width: 1 }}
          onClick={(event) => event.stopPropagation()}
        >
          <MobilePwaBanner />
        </Box>
      </List>
    </Box>
  );
};

export default SecondaryNavigationDrawerLinks;
