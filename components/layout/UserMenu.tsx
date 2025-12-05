'use client';

import { Link as i18nLink } from '@/i18n/routing';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import Logout from '@mui/icons-material/Logout';
import Person from '@mui/icons-material/Person';
import Settings from '@mui/icons-material/SettingsOutlined';
import { Box, Button, Menu, MenuItem } from '@mui/material';
import { useTranslations } from 'next-intl';
import * as React from 'react';

import { logout } from '@/lib/auth';
import {
  HEADER_ACCOUNT_ICON_CLICKED,
  HEADER_APPLY_A_CODE_CLICKED,
  LOGOUT_REQUEST,
  SECONDARY_HEADER_THERAPY_CLICKED,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent from '@/lib/utils/logEvent';
import { Event } from '@mui/icons-material';
import { navDrawerButtonStyle } from './TopBar';

const menuItemStyle = {
  ':hover': { backgroundColor: 'transparent' },
  '& .MuiTouchRipple-root span': {
    backgroundColor: 'transparent',
  },
} as const;

export default function UserMenu() {
  const t = useTranslations('Navigation');
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  const therapyAccess = partnerAccesses.find(
    (partnerAccess) => partnerAccess.featureTherapy === true,
  );

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    logEvent(HEADER_ACCOUNT_ICON_CLICKED);
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    logEvent(LOGOUT_REQUEST);
    await logout();
    // logout flow is completed in useLoadUser - triggered by firebase token listener
  };

  return (
    <Box>
      <Button
        qa-id="user-menu-button"
        aria-controls="user-menu"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        aria-label={t('userMenu')}
        id="user-menu-button"
        color="inherit"
        onClick={handleClick}
        startIcon={<Person />}
        sx={navDrawerButtonStyle}
      />
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        elevation={1}
        sx={{ mt: 0.5 }}
        MenuListProps={{
          id: 'user-menu',
        }}
      >
        {!(partnerAdmin && partnerAdmin.partner) && (
          <MenuItem sx={menuItemStyle}>
            <Button
              href={'/account/apply-a-code'}
              component={i18nLink}
              startIcon={<AddCircleOutline />}
              onClick={() => {
                logEvent(HEADER_APPLY_A_CODE_CLICKED);
                handleClose();
              }}
            >
              {t('applyCode')}
            </Button>
          </MenuItem>
        )}
        {!!therapyAccess && (
          <MenuItem sx={{ ...menuItemStyle, display: { xs: 'block', md: 'none' } }}>
            <Button
              href="/therapy/book-session"
              component={i18nLink}
              startIcon={<Event />}
              onClick={() => {
                logEvent(SECONDARY_HEADER_THERAPY_CLICKED);
                handleClose();
              }}
            >
              {t('therapy')}
            </Button>
          </MenuItem>
        )}
        <MenuItem sx={menuItemStyle}>
          <Button
            href="/account/settings"
            component={i18nLink}
            onClick={handleClose}
            startIcon={<Settings />}
          >
            {t('accountSettings')}
          </Button>
        </MenuItem>
        <MenuItem sx={menuItemStyle}>
          <Button id="logout-button" onClick={handleLogout} startIcon={<Logout />}>
            {t('logout')}
          </Button>
        </MenuItem>
      </Menu>
    </Box>
  );
}
