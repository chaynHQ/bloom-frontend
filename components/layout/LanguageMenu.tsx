'use client';

import { routing, usePathname, useRouter } from '@/i18n/routing';
import { HEADER_LANGUAGE_MENU_CLICKED, generateLanguageMenuEvent } from '@/lib/constants/events';
import logEvent from '@/lib/utils/logEvent';
import LanguageIcon from '@mui/icons-material/Language';
import { Box, Button, Menu, MenuItem } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { MouseEvent, startTransition, useState } from 'react';

const menuItemStyle = {
  ':hover': { backgroundColor: 'transparent' },
  '& .MuiTouchRipple-root span': {
    backgroundColor: 'transparent',
  },
} as const;

const languageMap: { [key: string]: string } = {
  en: 'English',
  hi: 'Hindi',
  pt: 'Português',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
};

const buttonStyle = {
  height: 40,
  minWidth: { xs: 40, md: 64 },
  paddingX: 1,
  gap: 0.75,
  fontWeight: 400,
  color: 'common.white',
  ':hover': { backgroundColor: 'primary.light', color: 'primary.dark' },

  '& .MuiTouchRipple-root span': {
    backgroundColor: 'primary.main',
    opacity: 0.2,
  },
  '& .MuiButton-startIcon': { display: 'inline-flex', mx: 0 },
} as const;

export default function LanguageMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations('Navigation');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  function onChangeLanguage(locale: string) {
    startTransition(() => {
      logEvent(generateLanguageMenuEvent(locale));
      handleClose();
      router.replace(
        {
          pathname,
          // @ts-ignore
          params,
        },
        locale,
      );
    });
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    logEvent(HEADER_LANGUAGE_MENU_CLICKED);
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <Button
        qa-id="language-menu-button"
        aria-controls="language-menu"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        aria-label={t('languageMenu')}
        color="inherit"
        onClick={handleClick}
        startIcon={<LanguageIcon />}
        size="medium"
        sx={buttonStyle}
      >
        {languageMap[locale ? locale : 'en']}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        elevation={1}
        MenuListProps={{
          id: 'language-menu',
        }}
      >
        {routing.locales
          ?.filter((language) => language !== locale)
          .map((language) => {
            const languageLabel = languageMap[language];
            return (
              <MenuItem key={language} sx={menuItemStyle}>
                <Button onClick={() => onChangeLanguage(language)}>{languageLabel}</Button>
              </MenuItem>
            );
          })}
      </Menu>
    </Box>
  );
}
