import { Logout, Person } from '@mui/icons-material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import * as React from 'react';
import { auth } from '../config/firebase';
import { clearStore } from '../hooks/store';

const linkStyle = { fontSize: 14 } as const;

export default function UserMenu() {
  const router = useRouter();
  const locale = router.locale;
  const locales = router.locales;
  const t = useTranslations('Navigation');

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const logout = async () => {
    localStorage.removeItem('accessToken');
    await clearStore();
    auth.signOut();
    router.push('/login');
  };

  const menuItemStyle = {
    color: 'text.primary',
  } as const;

  return (
    <Box>
      <Button
        aria-controls="user-menu"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        aria-label={t('userMenu')}
        color="inherit"
        onClick={handleClick}
        startIcon={<Person />}
        size="medium"
        sx={{ '& .MuiButton-startIcon': { mx: 0 } }}
      ></Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        elevation={1}
        MenuListProps={{
          id: 'language-menu',
        }}
      >
        <MenuItem>
          <Button sx={menuItemStyle} onClick={logout} startIcon={<Logout />}>
            {t.raw('logout')}
          </Button>
        </MenuItem>
      </Menu>
    </Box>
  );
}
