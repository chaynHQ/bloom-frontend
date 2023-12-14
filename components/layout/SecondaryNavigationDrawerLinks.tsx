import { ListItemIcon } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { RootState } from '../../app/store';
import {
  DRAWER_ACTIVITIES_CLICKED,
  DRAWER_CHAT_CLICKED,
  DRAWER_COURSES_CLICKED,
  DRAWER_GROUNDING_CLICKED,
  DRAWER_THERAPY_CLICKED,
} from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import activitiesIcon from '../../public/activities_icon.svg';
import chatIcon from '../../public/chat_icon.svg';
import courseIcon from '../../public/course_icon.svg';
import groundingIcon from '../../public/grounding_icon.svg';
import notesFromBloomIcon from '../../public/notes_from_bloom_icon.svg';
import therapyIcon from '../../public/therapy_icon.svg';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import Link from '../common/Link';
import { SecondaryNavIcon } from './SecondaryNav';

const listStyle = {
  display: 'flex',
  backgroundColor: 'primary.light',
  flexDirection: { xs: 'column', md: 'row' },
  height: '100%',
  marginY: 0,
  paddingX: { xs: 0, sm: '5%' },
  pb: 30,
} as const;

const listItemStyle = {
  width: 'auto',
  mb: 0,
  marginX: 3,
  paddingX: 0,
} as const;

const listItemTextStyle = {
  span: {
    fontSize: 16,
    fontWeight: 600,
  },
} as const;

const listButtonStyle = {
  borderRadius: 0,
  color: 'text.secondary',
  fontFamily: 'Monterrat, sans-serif',
  paddingY: 1,
  paddingX: 0.5,
  borderBottom: 1,
  height: '3.5rem',
  borderColor: 'primary.dark',

  '& .MuiTouchRipple-root span': {
    backgroundColor: 'primary.main',
    opacity: 0.2,
  },
} as const;

interface SecondaryNavigationItem {
  label: string;
  href: string;
  target?: string;
  event: string;
  icon?: string | React.ReactElement;
}

interface NavigationMenuProps {
  setAnchorEl?: Dispatch<SetStateAction<null | HTMLElement>>;
}

const SecondaryNavigationDrawerLinks = (props: NavigationMenuProps) => {
  const { setAnchorEl } = props;
  const t = useTranslations('Navigation');
  const { user, partnerAccesses, partnerAdmin } = useTypedSelector((state: RootState) => state);
  const eventUserData = getEventUserData({ user, partnerAccesses, partnerAdmin });
  const [navigationLinks, setNavigationLinks] = useState<Array<SecondaryNavigationItem>>([]);

  useEffect(() => {
    let links: Array<SecondaryNavigationItem> = [
      {
        label: t('courses'),
        href: '/courses',
        event: DRAWER_COURSES_CLICKED,
        icon: <SecondaryNavIcon src={courseIcon} alt={t('alt.courseIcon')} />,
      },
      {
        label: t('chat'),
        href: '/chat',
        event: DRAWER_CHAT_CLICKED,
        icon: <SecondaryNavIcon src={chatIcon} alt={t('alt.chatIcon')} />,
      },
      {
        label: t('activities'),
        href: '/activities',
        event: DRAWER_ACTIVITIES_CLICKED,
        icon: <SecondaryNavIcon src={activitiesIcon} alt={t('alt.activitiesIcon')} />,
      },
      {
        label: t('grounding'),
        href: '/grounding',
        event: DRAWER_GROUNDING_CLICKED,
        icon: <SecondaryNavIcon src={groundingIcon} alt={t('alt.groundingIcon')} />,
      },
      {
        label: t('notes'),
        href: '/subscription/whatsapp',
        event: DRAWER_GROUNDING_CLICKED,
        icon: <SecondaryNavIcon src={notesFromBloomIcon} alt={t('alt.notesIcon')} />,
      },
    ];

    if (!user.loading) {
      if (user.token) {
        const therapyAccess = partnerAccesses.find(
          (partnerAccess) => partnerAccess.featureTherapy === true,
        );

        if (!!therapyAccess) {
          links.push({
            label: t('therapy'),
            href: '/therapy/book-session',
            event: DRAWER_THERAPY_CLICKED,
            icon: <SecondaryNavIcon src={therapyIcon} alt={t('alt.therapyIcon')} />,
          });
        }
      }
    }

    setNavigationLinks(links);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerAccesses, t, user, partnerAdmin]);

  return (
    <List sx={listStyle} onClick={() => setAnchorEl && setAnchorEl(null)}>
      {navigationLinks.map((link, index) => (
        <ListItem sx={listItemStyle} key={link.label} disablePadding>
          <ListItemButton
            sx={{
              ...listButtonStyle,
              borderColor: 'primary.dark',
              borderBottom: index !== navigationLinks.length - 1 ? 1 : 0,
            }}
            component={Link}
            href={link.href}
            target={link.target || '_self'}
            onClick={() => {
              logEvent(link.event, eventUserData);
            }}
          >
            <ListItemIcon>{link.icon}</ListItemIcon>
            <ListItemText sx={listItemTextStyle} primary={link.label} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default SecondaryNavigationDrawerLinks;
