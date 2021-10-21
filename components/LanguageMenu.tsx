import LanguageIcon from '@mui/icons-material/Language';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import * as React from 'react';
import Link from './Link';

const linkStyle = { textTransform: 'uppercase', fontSize: 14 } as const;

export default function LanguageMenu() {
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

  return (
    <Box>
      <Button
        aria-controls="language-menu"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        aria-label={t('languageMenu')}
        variant={'outlined'}
        onClick={handleClick}
        endIcon={<LanguageIcon />}
        size="medium"
      >
        {locale}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          id: 'language-menu',
        }}
      >
        {locales
          ?.filter((language) => language !== locale)
          .map((language) => {
            return (
              <MenuItem key={language}>
                <Link sx={linkStyle} href="/" locale={language} unstyled>
                  {language}
                </Link>
              </MenuItem>
            );
          })}
      </Menu>
    </Box>
  );
}
