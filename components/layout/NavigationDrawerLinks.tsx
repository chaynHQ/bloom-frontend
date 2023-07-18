import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { RootState } from '../../app/store';
import {
  DRAWER_ADMIN_CLICKED,
  DRAWER_CHAT_CLICKED,
  DRAWER_COURSES_CLICKED,
  DRAWER_IMMEDIATE_HELP_CLICKED,
  DRAWER_LOGIN_CLICKED,
  DRAWER_NOTES_CLICKED,
  DRAWER_OUR_BLOOM_TEAM_CLICKED,
  DRAWER_THERAPY_CLICKED,
} from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import Link from '../common/Link';

const listStyle = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  height: '100%',
  marginLeft: { xs: 0, md: 'auto' },
  marginRight: { xs: 0, md: 0.5 },
  gap: { xs: 2, md: 0 },
} as const;

const listItemStyle = {
  width: 'auto',
  mb: 0,
} as const;

const listItemTextStyle = {
  span: {
    fontSize: 16,
  },
} as const;

const listButtonStyle = {
  borderRadius: 20,
  color: 'text.primary',
  fontFamily: 'Monterrat, sans-serif',
  paddingY: 0.5,

  '& .MuiTouchRipple-root span': {
    backgroundColor: 'primary.main',
    opacity: 0.2,
  },
} as const;

interface NavigationItem {
  title: string;
  href: string;
  target?: string;
  event: string;
  qaid?: string;
}

interface NavigationMenuProps {
  setAnchorEl?: Dispatch<SetStateAction<null | HTMLElement>>;
}

const NavigationMenu = (props: NavigationMenuProps) => {
  const { setAnchorEl } = props;
  const t = useTranslations('Navigation');
  const { user, partnerAccesses, partnerAdmin } = useTypedSelector((state: RootState) => state);
  const eventUserData = getEventUserData({ user, partnerAccesses, partnerAdmin });
  const [navigationLinks, setNavigationLinks] = useState<Array<NavigationItem>>([]);
  const router = useRouter();

  useEffect(() => {
    let links: Array<NavigationItem> = [];

    if (!user.loading) {
      if (user.token && router.pathname === '/auth/login') {
        router.push('/courses');
      }

      if (partnerAdmin && partnerAdmin.partner) {
        links.push({
          title: t('admin'),
          href: '/partner-admin/create-access-code',
          event: DRAWER_ADMIN_CLICKED,
        });
      }

      links.push({
        title: t('meetTheTeam'),
        href: '/meet-the-team',
        event: DRAWER_OUR_BLOOM_TEAM_CLICKED,
        qaid: 'team-link',
      });

      if (!partnerAdmin.partner) {
        links.push({
          title: t('immediateHelp'),
          href: 'https://www.chayn.co/help',
          target: '_blank',
          event: DRAWER_IMMEDIATE_HELP_CLICKED,
        });
      }

      if (user.token) {
        links.push({ title: t('courses'), href: '/courses', event: DRAWER_COURSES_CLICKED });
        links.push({
          title: t('chat'),
          href: '/chat',
          event: DRAWER_CHAT_CLICKED,
        });
        links.push({
          title: t('notes'),
          href: '/subscription/whatsapp',
          event: DRAWER_NOTES_CLICKED,
        });

        const therapyAccess = partnerAccesses.find(
          (partnerAccess) => partnerAccess.featureTherapy === true,
        );

        if (!!therapyAccess) {
          links.push({
            title: t('therapy'),
            href: '/therapy/book-session',
            event: DRAWER_THERAPY_CLICKED,
          });
        }
      } else {
        links.push({ title: t('login'), href: '/auth/login', event: DRAWER_LOGIN_CLICKED });
      }
    }

    setNavigationLinks(links);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerAccesses, t, user, partnerAdmin]);

  return (
    <List sx={listStyle} onClick={() => setAnchorEl && setAnchorEl(null)}>
      {navigationLinks.map((link) => (
        <ListItem sx={listItemStyle} key={link.title} disablePadding>
          <ListItemButton
            sx={listButtonStyle}
            component={Link}
            href={link.href}
            target={link.target || '_self'}
            onClick={() => {
              logEvent(link.event, eventUserData);
            }}
          >
            <ListItemText sx={listItemTextStyle} primary={link.title} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default NavigationMenu;
