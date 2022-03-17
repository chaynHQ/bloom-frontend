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
  marginLeft: { xs: 0, md: 'auto' },
  marginRight: { xs: 0, md: 2 },
  flexDirection: { xs: 'column', md: 'row' },
  gap: { xs: 2, md: 1 },
} as const;

const listItemTextStyle = {
  span: {
    fontSize: 18,
  },
} as const;

const listButtonStyle = {
  borderRadius: 20,
  color: 'text.primary',
  fontFamily: 'Monterrat, sans-serif',
  '& .MuiTouchRipple-root span': {
    backgroundColor: 'primary.main',
    opacity: 0.2,
  },
} as const;

interface NavigationItem {
  title: string;
  href: string;
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

    if (partnerAdmin && partnerAdmin.partner) {
      const partnerName = partnerAdmin.partner.name.toLocaleLowerCase();
      links.push({ title: t('admin'), href: '/partner-admin/create-access-code' });
      links.push({
        title: t('about'),
        href: `/welcome/${partnerName}`,
      });
    } else {
      links.push({
        title: t('about'),
        href: '/',
      });
    }

    if (user.token) {
      links.push({ title: t('courses'), href: '/courses' });
    } else {
      links.push({ title: t('login'), href: '/auth/login' });
    }

    const therapyAccess = partnerAccesses.find(
      (partnerAccess) => partnerAccess.featureTherapy === true,
    );

    if (!!therapyAccess) {
      links.push({ title: t('therapy'), href: '/therapy/book-session' });
    }
    setNavigationLinks(links);
  }, [partnerAccesses, t, user.token, partnerAdmin]);

  return (
    <List sx={listStyle} onClick={() => setAnchorEl && setAnchorEl(null)}>
      {navigationLinks.map((link) => (
        <ListItem key={link.title} disablePadding>
          <ListItemButton sx={listButtonStyle} component={Link} href={link.href}>
            <ListItemText sx={listItemTextStyle} primary={link.title} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default NavigationMenu;
