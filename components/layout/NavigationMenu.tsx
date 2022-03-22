import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { RootState } from '../../app/store';
import { useTypedSelector } from '../../hooks/store';
import Link from '../common/Link';

const listStyle = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  height: '100%',
  marginLeft: { xs: 0, md: 'auto' },
  marginRight: { xs: 0, md: 2 },
  gap: { xs: 2, md: 1 },
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
}

interface NavigationMenuProps {
  setAnchorEl?: Dispatch<SetStateAction<null | HTMLElement>>;
}

const NavigationMenu = (props: NavigationMenuProps) => {
  const { setAnchorEl } = props;
  const t = useTranslations('Navigation');
  const { user, partnerAccesses, partnerAdmin } = useTypedSelector((state: RootState) => state);
  const [navigationLinks, setNavigationLinks] = useState<Array<NavigationItem>>([]);

  useEffect(() => {
    let links: Array<NavigationItem> = [];

    if (!user.loading) {
      if (partnerAdmin && partnerAdmin.partner) {
        links.push({ title: t('admin'), href: '/partner-admin/create-access-code' });
      }

      if (!partnerAdmin.partner) {
        links.push({
          title: t('immediateHelp'),
          href: 'https://www.chayn.co/help',
          target: '_blank',
        });
      }

      if (user.token) {
        links.push({ title: t('courses'), href: '/courses' });
        const therapyAccess = partnerAccesses.find(
          (partnerAccess) => partnerAccess.featureTherapy === true,
        );

        if (!!therapyAccess) {
          links.push({ title: t('therapy'), href: '/therapy/book-session' });
        }
      } else {
        links.push({ title: t('login'), href: '/auth/login' });
      }
    }

    setNavigationLinks(links);
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
          >
            <ListItemText sx={listItemTextStyle} primary={link.title} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default NavigationMenu;
