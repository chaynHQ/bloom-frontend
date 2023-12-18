import { List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  HEADER_ADMIN_CLICKED,
  HEADER_IMMEDIATE_HELP_CLICKED,
  HEADER_OUR_BLOOM_TEAM_CLICKED,
} from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import Link from '../common/Link';

const listStyle = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  height: '100%',
  marginLeft: { xs: 0, md: 0.5 },
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
  color: 'common.white',
  fontFamily: 'Monterrat, sans-serif',
  paddingY: 0.5,

  '& .MuiTouchRipple-root span': {
    backgroundColor: 'primary.main',
    opacity: 0.2,
  },
  ':hover': {
    color: 'primary.dark',
  },
} as const;

interface NavigationItem {
  title: string;
  href: string;
  target?: string;
  event: string;
  qaId?: string;
}

interface NavigationMenuProps {
  setAnchorEl?: Dispatch<SetStateAction<null | HTMLElement>>;
}

const NavigationMenu = (props: NavigationMenuProps) => {
  const { setAnchorEl } = props;
  const t = useTranslations('Navigation');

  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const userLoading = useTypedSelector((state) => state.user.loading);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  const [navigationLinks, setNavigationLinks] = useState<Array<NavigationItem>>([]);
  const router = useRouter();

  useEffect(() => {
    let links: Array<NavigationItem> = [];

    if (!userLoading) {
      if (partnerAdmin && partnerAdmin.partner) {
        links.push({
          title: t('admin'),
          href: '/partner-admin/create-access-code',
          event: HEADER_ADMIN_CLICKED,
          qaId: 'partner-admin-menu-button',
        });
      }

      links.push({
        title: t('meetTheTeam'),
        href: '/meet-the-team',
        event: HEADER_OUR_BLOOM_TEAM_CLICKED,
        qaId: 'meet-team-menu-button',
      });

      if (!partnerAdmin.partner) {
        links.push({
          title: t('immediateHelp'),
          qaId: 'immediate-help-menu-button',
          href: 'https://www.chayn.co/help',
          target: '_blank',
          event: HEADER_IMMEDIATE_HELP_CLICKED,
        });
      }
    }

    setNavigationLinks(links);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, userLoading, partnerAccesses, partnerAdmin]);

  return (
    <List sx={listStyle} onClick={() => setAnchorEl && setAnchorEl(null)}>
      {navigationLinks.map((link) => (
        <ListItem sx={listItemStyle} key={link.title} disablePadding>
          <ListItemButton
            sx={listButtonStyle}
            component={Link}
            href={link.href}
            qa-id={link.qaId}
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
