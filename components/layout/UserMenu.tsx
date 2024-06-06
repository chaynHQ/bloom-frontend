import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import Logout from '@mui/icons-material/Logout';
import Settings from '@mui/icons-material/Settings';
import Person from '@mui/icons-material/Person';
import { Box, Button, Menu, MenuItem } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import * as React from 'react';
import { HEADER_ACCOUNT_ICON_CLICKED, HEADER_APPLY_A_CODE_CLICKED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import Link from '../common/Link';
import useAuth from '../../hooks/useAuth';

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
  const { onLogout } = useAuth()

  const router = useRouter();
  const t = useTranslations('Navigation');
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    logEvent(HEADER_ACCOUNT_ICON_CLICKED, eventUserData);
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const logout = async () => {
    // clear all state
    await onLogout()

    router.push('/auth/login');
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
              component={Link}
              href={'/account/apply-a-code'}
              startIcon={<AddCircleOutline />}
              onClick={() => {
                logEvent(HEADER_APPLY_A_CODE_CLICKED, eventUserData);
                handleClose();
              }}
            >
              {t('applyCode')}
            </Button>
          </MenuItem>
        )}
        <MenuItem sx={menuItemStyle}>
          <Button
            component={Link}
            href='/account/settings'
            onClick={handleClose}
            startIcon={<Settings />}
          >
            {t('accSettings')}
          </Button>
        </MenuItem>
        <MenuItem sx={menuItemStyle}>
          <Button id="logout-button" onClick={logout} startIcon={<Logout />}>
            {t('logout')}
          </Button>
        </MenuItem>
      </Menu>
    </Box>
  );
}
