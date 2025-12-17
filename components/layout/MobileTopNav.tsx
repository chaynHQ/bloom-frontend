'use client';

import { Link as i18nLink } from '@/i18n/routing';
import {
  HEADER_NAVIGATION_MENU_CLOSED,
  HEADER_NAVIGATION_MENU_OPENED,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { getTopNavItems, TopNavItem } from '@/lib/navigation/navigationConfig';
import logEvent from '@/lib/utils/logEvent';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Button, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useEffect, useState } from 'react';

export const navDrawerButtonStyle = {
  color: 'common.white',
  ':hover': { backgroundColor: 'background.default', color: 'primary.dark' },
  '& .MuiButton-startIcon': {
    mx: 0,
    '& svg': { fontSize: { xs: '1.25rem', sm: '1.5rem' } },
  },
  '& .MuiTouchRipple-root span': {
    backgroundColor: 'primary.main',
    opacity: 0.2,
  },
  px: { xs: 0.75, sm: 1 },
  minWidth: 'unset',
  width: { xs: 32, sm: 38 },
  height: { xs: 32, sm: 38 },
} as const;

const listStyle = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  height: '100%',
  marginY: 0,
  paddingY: 3,
  paddingX: { xs: 0, sm: '5%' },
} as const;

const listItemStyle = {
  width: 'auto',
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

const MobileTopNav = () => {
  const t = useTranslations('Navigation');

  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [navigationLinks, setNavigationLinks] = useState<Array<TopNavItem>>([]);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    logEvent(HEADER_NAVIGATION_MENU_OPENED);
  };
  const handleClose = () => {
    setAnchorEl(null);
    logEvent(HEADER_NAVIGATION_MENU_CLOSED);
  };

  useEffect(() => {
    const links = getTopNavItems(partnerAdmin, true);
    setNavigationLinks(links);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerAdmin]);

  return (
    <Box>
      {open ? (
        <Button
          aria-label={t('menuClose')}
          onClick={handleClose}
          startIcon={<CloseIcon />}
          sx={navDrawerButtonStyle}
        ></Button>
      ) : (
        <Button
          aria-controls="navigation-menu"
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          aria-label={t('menuOpen')}
          onClick={handleClick}
          startIcon={<MenuIcon />}
          sx={navDrawerButtonStyle}
        ></Button>
      )}
      <Drawer
        hideBackdrop={false}
        PaperProps={{
          sx: { backgroundColor: 'primary.dark', top: { xs: 48, sm: 64 } },
        }}
        sx={{ width: '100%', top: { xs: 48, sm: 64 } }}
        anchor="top"
        open={open}
        onClose={handleClose}
      >
        <List sx={listStyle} onClick={() => setAnchorEl && setAnchorEl(null)}>
          {navigationLinks.map((link) => (
            <ListItem sx={listItemStyle} key={link.key} disablePadding>
              <ListItemButton
                sx={listButtonStyle}
                component={link.href.startsWith('/') ? i18nLink : 'a'}
                href={link.href}
                target={link.target || '_self'}
                onClick={() => {
                  logEvent(link.event);
                }}
              >
                <ListItemText sx={listItemTextStyle} primary={t(link.translationKey)} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
};
export default MobileTopNav;
