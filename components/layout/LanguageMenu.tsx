'use client';

import { routing, usePathname, useRouter } from '@/i18n/routing';
import { HEADER_LANGUAGE_MENU_CLICKED, generateLanguageMenuEvent } from '@/lib/constants/events';
import logEvent from '@/lib/utils/logEvent';
import { navBarControlStyle, navDropdownPaperStyle } from '@/styles/common';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LanguageIcon from '@mui/icons-material/Language';
import { Box, Button, Menu, MenuItem } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { MouseEvent, startTransition, useState } from 'react';

const menuItemStyle = {
  ':hover': { backgroundColor: 'transparent' },
} as const;

const languageMap: { [key: string]: string } = {
  en: 'English',
  hi: 'Hindi',
  pt: 'Português',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
  ar: 'العربية',
  tr: 'Türkçe',
};

const buttonStyle = {
  ...navBarControlStyle,
  gap: 0.5,
  color: 'common.white',
  borderColor: 'common.white',
  ':hover': {
    backgroundColor: 'primary.light',
    borderColor: 'primary.light',
    color: 'primary.dark',
  },
  '& .MuiButton-startIcon, & .MuiButton-endIcon': { mx: 0 },
  '& .MuiButton-endIcon svg': { transition: 'transform 0.2s ease' },
  '&[aria-expanded="true"] .MuiButton-endIcon svg': { transform: 'rotate(180deg)' },
} as const;

export default function LanguageMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations('Navigation');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  function onChangeLanguage(newLocale: string) {
    startTransition(() => {
      logEvent(generateLanguageMenuEvent(newLocale));
      handleClose();
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        { pathname, params },
        { locale: newLocale.toUpperCase() },
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
        variant="outlined"
        size="small"
        onClick={handleClick}
        startIcon={<LanguageIcon />}
        endIcon={<KeyboardArrowDownIcon />}
        sx={buttonStyle}
      >
        {languageMap[locale ? locale : 'en']}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        elevation={0}
        slotProps={{
          list: {
            id: 'language-menu',
          },
          paper: {
            sx: navDropdownPaperStyle,
          },
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
