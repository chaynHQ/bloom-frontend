import LanguageIcon from '@mui/icons-material/Language';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import { useRouter } from 'next/router';
import * as React from 'react';
import Link from './Link';

export default function LanguageMenu() {
  const router = useRouter();
  const locale = router.locale;
  const locales = router.locales;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <Button
        id="basic-button"
        aria-controls="basic-menu"
        aria-haspopup="true"
        variant={'outlined'}
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        startIcon={<LanguageIcon />}
        size="medium"
        sx={{ width: 80 }}
      >
        {locale}
      </Button>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {locales
          ?.filter((language) => language !== locale)
          .map((language) => {
            return (
              <Button
                key={language}
                component={Link}
                href="/"
                size="small"
                variant="contained"
                locale={language}
              >
                {language}
              </Button>
            );
          })}
      </Menu>
    </Box>
  );
}
