import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import Link from './Link';

const listStyle = {
  display: 'flex',
  marginLeft: { xs: 0, md: 'auto' },
  marginRight: { xs: 0, md: 2 },
  flexDirection: { xs: 'column', md: 'row' },
} as const;
const listItemStyle = {
  width: 'auto',
  color: 'text.primary',
} as const;

interface NavigationItem {
  title: string;
  href: string;
}

const NavigationMenu = () => {
  const t = useTranslations('Navigation');

  const navigationLinks: Array<NavigationItem> = [
    { title: t('about'), href: '/' },
    { title: t('immediateHelp'), href: '/' },
    { title: t('therapy'), href: '/' },
    { title: t('courses'), href: '/' },
    { title: t('account'), href: '/' },
  ];
  return (
    <List sx={listStyle}>
      {navigationLinks.map((link) => (
        <ListItem sx={listItemStyle} key={link.title} disablePadding>
          <ListItemButton component={Link} href={link.href}>
            <ListItemText primary={link.title} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default NavigationMenu;
