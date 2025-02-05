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
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent from '@/lib/utils/logEvent';

const menuItemStyle = {
  ':hover': { backgroundColor: 'transparent' },
  '& .MuiTouchRipple-root span': {
    backgroundColor: 'transparent',
  },
} as const;

const buttonStyle = {
  paddingX: 1,
  minWidth: { xs: 40, md: 64 },
  height: 40,
  fontWeight: 400,
  color: 'common.white',
  ':hover': { backgroundColor: 'background.default', color: 'primary.dark' },
  '& .MuiTouchRipple-root span': {
    backgroundColor: 'primary.main',
    opacity: 0.2,
  },
  '& .MuiButton-startIcon': { mx: 0 },
} as const;

export default function UserMenu() {
  const t = useTranslations('Navigation');
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

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
        size="medium"
        sx={buttonStyle}
      />
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        elevation={1}
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
