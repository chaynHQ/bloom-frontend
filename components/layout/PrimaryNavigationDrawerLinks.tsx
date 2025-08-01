'use client';

import { Link as i18nLink } from '@/i18n/routing';
import {
  DRAWER_ADMIN_CLICKED,
  DRAWER_IMMEDIATE_HELP_CLICKED,
  DRAWER_LOGIN_CLICKED,
  DRAWER_OUR_BLOOM_TEAM_CLICKED,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent from '@/lib/utils/logEvent';
import { Button, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

const listStyle = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  height: '100%',
  marginY: 0,
  paddingY: 4,
  paddingX: { xs: 0, sm: '5%' },
  gap: { xs: 1, md: 0 },
} as const;

const listItemStyle = {
  width: 'auto',
  mb: 0,
  ml: 1,
  mr: 1,
  color: 'common.white',
} as const;

const listItemTextStyle = {
  span: {
    fontSize: 16,
    fontweight: 500,
  },
} as const;

const listButtonStyle = {
  borderRadius: 20,
  fontFamily: 'Monterrat, sans-serif',
  paddingY: 0.25,

  '& .MuiTouchRipple-root span': {
    backgroundColor: 'primary.main',
    opacity: 0.2,
  },
} as const;

const loginButtonStyle = {
  width: 'auto',
  ml: 2,
  mt: 1,
  color: 'text.primary !important',
} as const;

interface NavigationItem {
  title: string;
  href: string;
  target?: string;
  event: string;
}

interface NavigationMenuProps {
  setAnchorEl?: Dispatch<SetStateAction<null | HTMLElement>>;
}

const PrimaryNavigationDrawerLinks = (props: NavigationMenuProps) => {
  const { setAnchorEl } = props;
  const t = useTranslations('Navigation');

  const userLoading = useTypedSelector((state) => state.user.loading);
  const userId = useTypedSelector((state) => state.user.id);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  const [navigationLinks, setNavigationLinks] = useState<Array<NavigationItem>>([]);

  useEffect(() => {
    let links: Array<NavigationItem> = [];

    if (!userLoading && userId) {
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
      });

      if (!partnerAdmin.partner) {
        links.push({
          title: t('immediateHelp'),
          href: 'https://www.chayn.co/help',
          target: '_blank',
          event: DRAWER_IMMEDIATE_HELP_CLICKED,
        });
      }
    }

    setNavigationLinks(links);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, userId, userLoading, partnerAccesses, partnerAdmin]);

  return (
    <List sx={listStyle} onClick={() => setAnchorEl && setAnchorEl(null)}>
      {navigationLinks.map((link) => (
        <ListItem sx={listItemStyle} key={link.title} disablePadding>
          <ListItemButton
            sx={listButtonStyle}
            component={link.href.startsWith('/') ? i18nLink : 'a'}
            href={link.href}
            target={link.target || '_self'}
            onClick={() => {}}
          >
            <ListItemText sx={listItemTextStyle} primary={link.title} />
          </ListItemButton>
        </ListItem>
      ))}
      {!userLoading && !userId && (
        <li>
          <Button
            variant="contained"
            size="large"
            sx={loginButtonStyle}
            href="/auth/login"
            component={i18nLink}
            onClick={() => {
              logEvent(DRAWER_LOGIN_CLICKED);
            }}
          >
            {t('login')}
          </Button>
        </li>
      )}
    </List>
  );
};

export default PrimaryNavigationDrawerLinks;
