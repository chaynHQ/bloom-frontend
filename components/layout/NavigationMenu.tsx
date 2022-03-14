import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { RootState } from '../../app/store';
import { useTypedSelector } from '../../hooks/store';
import Link from '../common/Link';

const listStyle = {
  display: 'flex',
  marginLeft: { xs: 0, md: 'auto' },
  marginRight: { xs: 0, md: 2 },
  flexDirection: { xs: 'column', md: 'row' },
} as const;

const listItemStyle = {
  width: 'auto',
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

const NavigationMenu = () => {
  const t = useTranslations('Navigation');
  const { partnerAccesses } = useTypedSelector((state: RootState) => state);
  const [navigationLinks, setNavigationLinks] = useState<Array<NavigationItem>>([]);

  useEffect(() => {
    let links: Array<NavigationItem> = [
      { title: t('about'), href: '/' },
      { title: t('courses'), href: '/courses' },
    ];

    const therapyAccess = partnerAccesses.find(
      (partnerAccess) => partnerAccess.featureTherapy === true,
    );

    if (!!therapyAccess) {
      links.push({ title: t('therapy'), href: '/therapy/book-session' });
    }
    setNavigationLinks(links);
  }, [partnerAccesses, t]);

  return (
    <List sx={listStyle}>
      {navigationLinks.map((link) => (
        <ListItem sx={listItemStyle} key={link.title} disablePadding>
          <ListItemButton sx={listButtonStyle} component={Link} href={link.href}>
            <ListItemText primary={link.title} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default NavigationMenu;
