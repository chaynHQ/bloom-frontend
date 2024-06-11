import { Icon, Tab, Tabs } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import notesFromBloomIcon from '../../public/notes_from_bloom_icon.svg';
import therapyIcon from '../../public/therapy_icon.svg';

import { useTranslations } from 'next-intl';
import {
  SECONDARY_HEADER_ACTIVITIES_CLICKED,
  SECONDARY_HEADER_CHAT_CLICKED,
  SECONDARY_HEADER_COURSES_CLICKED,
  SECONDARY_HEADER_GROUNDING_CLICKED,
  SECONDARY_HEADER_NOTES_CLICKED,
  SECONDARY_HEADER_THERAPY_CLICKED,
} from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import activitiesIcon from '../../public/activities_icon.svg';
import chatIcon from '../../public/chat_icon.svg';
import courseIcon from '../../public/course_icon.svg';
import groundingIcon from '../../public/grounding_icon.svg';

import { HTMLAttributes } from 'react';
import theme from '../../styles/theme';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import { NextLinkComposed } from '../common/Link';

interface LinkTabProps {
  label?: string;
  href: string;
  icon?: string | React.ReactElement;
  ariaLabel?: string;
  event: string;
  qaId?: string;
}

interface SecondaryNavIconType {
  alt: string;
  src: string;
}
export const SecondaryNavIcon = ({ alt, src }: SecondaryNavIconType) => (
  <Icon
    sx={{
      position: 'relative',
      fontSize: 35,
      marginBottom: 0,
    }}
  >
    <Image
      alt={alt}
      src={src}
      fill
      sizes="100vw"
      style={{
        objectFit: 'contain',
      }}
    />
  </Icon>
);

const SecondaryNav = ({ currentPage }: { currentPage: string }) => {
  const router = useRouter();
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);
  const t = useTranslations('Navigation');

  const therapyAccess = partnerAccesses.find(
    (partnerAccess) => partnerAccess.featureTherapy === true,
  );

  const publicLinks: LinkTabProps[] = [
    {
      label: t('courses'),
      icon: <SecondaryNavIcon src={courseIcon} alt={t('alt.courseIcon')} />,
      ariaLabel: t('courses'),
      href: '/courses',
      event: SECONDARY_HEADER_COURSES_CLICKED,
      qaId: 'secondary-nav-courses-button',
    },
    {
      label: t('chat'),
      icon: <SecondaryNavIcon src={chatIcon} alt={t('alt.chatIcon')} />,
      ariaLabel: t('chat'),
      href: '/chat',
      event: SECONDARY_HEADER_CHAT_CLICKED,
      qaId: 'secondary-nav-chat-button',
    },

    {
      label: t('activities'),
      icon: <SecondaryNavIcon src={activitiesIcon} alt={t('alt.activitiesIcon')} />,
      ariaLabel: t('activities'),
      href: '/activities',
      event: SECONDARY_HEADER_ACTIVITIES_CLICKED,
      qaId: 'secondary-nav-activities-button',
    },
    {
      label: t('grounding'),
      icon: <SecondaryNavIcon src={groundingIcon} alt={t('alt.groundingIcon')} />,
      ariaLabel: t('grounding'),
      href: '/grounding',
      event: SECONDARY_HEADER_GROUNDING_CLICKED,
      qaId: 'secondary-nav-grounding-button',
    },
    {
      label: t('notes'),
      icon: <SecondaryNavIcon src={notesFromBloomIcon} alt={t('alt.notesIcon')} />,
      ariaLabel: t('notes'),
      href: '/subscription/whatsapp',
      event: SECONDARY_HEADER_NOTES_CLICKED,
      qaId: 'secondary-nav-notes-button',
    },
  ];

  const allLinks = !!therapyAccess
    ? publicLinks.concat({
        label: t('therapy'),
        icon: <SecondaryNavIcon src={therapyIcon} alt={t('alt.therapyIcon')} />,
        ariaLabel: t('therapy'),
        href: '/therapy/book-session',
        event: SECONDARY_HEADER_THERAPY_CLICKED,
        qaId: 'secondary-nav-therapy-button',
      })
    : publicLinks;

  const tabIndex = allLinks.findIndex((link) => link.href === router.asPath);
  const tabValue = tabIndex === -1 ? false : tabIndex;

  return (
    <Tabs
      value={tabValue}
      aria-label={t('secondaryNavigationMenu')}
      sx={{
        backgroundColor: theme.palette.palePrimaryLight,
        '& a.Mui-selected': {
          color: 'text.secondary',
        },
        '& a:hover': {
          borderBottom: '2px solid',
          borderColor: 'primary.dark',
        },
      }}
      variant="fullWidth"
      qa-id="secondary-nav"
      // Weird type errors for this prop
      TabIndicatorProps={
        {
          sx: {
            backgroundColor: 'primary.dark',
          },
        } as Partial<HTMLAttributes<HTMLDivElement>>
      }
    >
      {allLinks.map((linkData) => {
        return (
          <Tab
            qa-id={linkData.qaId}
            key={linkData.label}
            component={NextLinkComposed}
            icon={linkData.icon}
            sx={{
              textTransform: 'none',
              fontSize: theme.typography.body1.fontSize,
              fontWeight: 600,
              '& .material-icons ': { mb: 0, mr: 1.5 },
              padding: 0.25,
              flexDirection: 'row',
            }}
            aria-label={linkData.ariaLabel}
            label={linkData.label}
            to={linkData.href}
            onClick={() => {
              logEvent(linkData.event, eventUserData);
            }}
          />
        );
      })}
    </Tabs>
  );
};

export default SecondaryNav;
