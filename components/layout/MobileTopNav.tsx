'use client';

import { Link as i18nLink } from '@/i18n/routing';
import {
  DRAWER_LOGIN_CLICKED,
  HEADER_NAVIGATION_MENU_CLOSED,
  HEADER_NAVIGATION_MENU_OPENED,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { getTopNavItems } from '@/lib/navigation/navigationConfig';
import logEvent from '@/lib/utils/logEvent';
import { navMenuLinkStyle, onDarkNavItemFocusStyle } from '@/styles/common';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Button, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useMemo } from 'react';

export const navDrawerButtonStyle = {
  color: 'common.white',
  flexShrink: 0,
  padding: 0,
  minWidth: 34,
  width: 34,
  height: 34,
  borderRadius: '50%',
  ':hover': { backgroundColor: 'background.default', color: 'primary.dark' },
  '&[aria-expanded="true"]': { backgroundColor: 'background.default', color: 'primary.dark' },
  '& .MuiButton-startIcon': { mx: 0 },
  '& .MuiSvgIcon-root': { fontSize: '1.5rem' },
  ...onDarkNavItemFocusStyle,
} as const;

const listStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 0.5,
  marginY: 0,
  paddingY: 2,
  paddingInline: 2,
} as const;

const listItemStyle = {
  width: 'auto',
} as const;

const listItemTextStyle = {
  // `start` keeps labels aligned to the reading edge in both directions — left in LTR,
  // right in RTL (Arabic). Without it the labels inherit a left alignment in the drawer.
  textAlign: 'start',
  span: {
    fontSize: 16,
    lineHeight: '24px',
  },
} as const;

const MobileTopNav = () => {
  const t = useTranslations('Navigation');

  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const userId = useTypedSelector((state) => state.user.id);
  const userLoading = useTypedSelector(
    (state) => state.user.authStateLoading || state.user.loading,
  );

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const navigationLinks = useMemo(() => getTopNavItems(partnerAdmin, true), [partnerAdmin]);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    logEvent(HEADER_NAVIGATION_MENU_OPENED);
  };
  const handleClose = () => {
    setAnchorEl(null);
    logEvent(HEADER_NAVIGATION_MENU_CLOSED);
  };

  return (
    <Box>
      {open ? (
        <Button
          aria-label={t('menuClose')}
          size="small"
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
          size="small"
          onClick={handleClick}
          startIcon={<MenuIcon />}
          sx={navDrawerButtonStyle}
        ></Button>
      )}
      <Drawer
        hideBackdrop={false}
        sx={{ width: '100%', top: 64 }}
        anchor="top"
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: 'primary.dark',
              '--focus-ring-color': '#fff',
              top: 64,
            },
          },
        }}
      >
        <List sx={listStyle} onClick={() => setAnchorEl && setAnchorEl(null)}>
          {!userLoading && !userId && (
            <ListItem sx={listItemStyle} disablePadding>
              <ListItemButton
                sx={navMenuLinkStyle}
                component={i18nLink}
                href="/auth/login"
                qa-id="login-menu-button"
                onClick={() => {
                  logEvent(DRAWER_LOGIN_CLICKED);
                }}
              >
                <ListItemText sx={listItemTextStyle} primary={t('login')} />
              </ListItemButton>
            </ListItem>
          )}
          {navigationLinks.map((link) => (
            <ListItem sx={listItemStyle} key={link.key} disablePadding>
              <ListItemButton
                sx={navMenuLinkStyle}
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
