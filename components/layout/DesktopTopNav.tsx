'use client';

import { Link as i18nLink } from '@/i18n/routing';
import { useTypedSelector } from '@/lib/hooks/store';
import { getTopNavItems } from '@/lib/navigation/navigationConfig';
import logEvent from '@/lib/utils/logEvent';
import { getIsMaintenanceMode } from '@/lib/utils/maintenanceMode';
import { navMenuLinkStyle } from '@/styles/common';
import { List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction, useMemo } from 'react';

const listStyle = {
  display: { xs: 'none', md: 'flex' },
  flexDirection: 'row',
  alignItems: 'center',
  marginInline: 0,
  color: 'common.white',
} as const;

const listItemStyle = {
  width: 'auto',
  mb: 0,
} as const;

const listItemTextStyle = {
  span: {
    fontSize: 16,
    lineHeight: '24px',
  },
} as const;

interface DesktopTopNavProps {
  setAnchorEl?: Dispatch<SetStateAction<null | HTMLElement>>;
}

const DesktopTopNav = (props: DesktopTopNavProps) => {
  const { setAnchorEl } = props;
  const t = useTranslations('Navigation');

  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const isMaintenanceMode = getIsMaintenanceMode();

  const navigationLinks = useMemo(() => {
    if (isMaintenanceMode) return [];
    return getTopNavItems(partnerAdmin, false);
  }, [partnerAdmin, isMaintenanceMode]);

  return (
    <List sx={listStyle} onClick={() => setAnchorEl && setAnchorEl(null)}>
      {navigationLinks.map((link) => (
        <ListItem sx={listItemStyle} key={link.key} disablePadding>
          <ListItemButton
            sx={navMenuLinkStyle}
            component={i18nLink}
            href={link.href}
            qa-id={link.qaId}
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
  );
};

export default DesktopTopNav;
