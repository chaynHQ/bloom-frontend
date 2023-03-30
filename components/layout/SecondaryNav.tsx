import { Icon, Tab, Tabs } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import chatIcon from '../../public/chat_icon.svg';
import notesFromBloomIcon from '../../public/notes_from_bloom_icon.svg';
import therapyIcon from '../../public/therapy_icon.svg';

import { useTranslations } from 'next-intl';
import { RootState } from '../../app/store';
import {
  SECONDARY_HEADER_CHAT_CLICKED,
  SECONDARY_HEADER_COURSES_CLICKED,
  SECONDARY_HEADER_NOTES_CLICKED,
  SECONDARY_HEADER_THERAPY_CLICKED,
} from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import courseIcon from '../../public/course_icon.svg';
import theme from '../../styles/theme';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import { NextLinkComposed } from '../common/Link';

interface LinkTabProps {
  label?: string;
  href: string;
  icon?: string | React.ReactElement;
  ariaLabel?: string;
  event: string;
}

interface SecondaryNavIconType {
  alt: string;
  src: string;
}
const SecondaryNavIcon = ({ alt, src }: SecondaryNavIconType) => (
  <Icon
    sx={{
      position: 'relative',
      fontSize: 35,
      marginBottom: 0,
    }}
  >
    <Image alt={alt} src={src} layout="fill" objectFit="contain" />
  </Icon>
);

const SecondaryNav = ({ currentPage }: { currentPage: string }) => {
  const router = useRouter();
  const { user, partnerAccesses, partnerAdmin } = useTypedSelector((state: RootState) => state);
  const eventUserData = getEventUserData({ user, partnerAccesses, partnerAdmin });
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
    },
    {
      label: t('chat'),
      icon: <SecondaryNavIcon src={chatIcon} alt={t('alt.courseIcon')} />,
      ariaLabel: t('chat'),
      href: '/chat',
      event: SECONDARY_HEADER_CHAT_CLICKED,
    },
    {
      label: t('notes'),
      icon: <SecondaryNavIcon src={notesFromBloomIcon} alt={t('alt.notesIcon')} />,
      ariaLabel: t('notes'),
      href: '/subscription/whatsapp',
      event: SECONDARY_HEADER_NOTES_CLICKED,
    },
  ];

  const allLinks = !!therapyAccess
    ? publicLinks.concat({
        label: t('therapy'),
        icon: <SecondaryNavIcon src={therapyIcon} alt={t('alt.therapyIcon')} />,
        ariaLabel: t('therapy'),
        href: '/therapy/book-session',
        event: SECONDARY_HEADER_THERAPY_CLICKED,
      })
    : publicLinks;
  const tabIndex = allLinks.map<string>((link) => link.href).indexOf(router.pathname);

  return (
    <Tabs
      value={tabIndex}
      aria-label={t('secondaryNavigationMenu')}
      sx={{
        backgroundColor: theme.palette.palePrimaryLight,
        boxShadow: 'inset 1px 1px 1px 1px rgba(0, 0, 0, 0.1)', // Note custom inset shadow used once
        '& a.Mui-selected': { backgroundColor: 'primary.light', color: 'text.primary' },
      }} // the colour is a custom colour
      variant="fullWidth"
    >
      {allLinks.map((linkData) => {
        return (
          <Tab
            key={linkData.label}
            component={NextLinkComposed}
            icon={linkData.icon}
            sx={{
              textTransform: 'none',
              fontSize: theme.typography.body1.fontSize,
              '& .material-icons ': { marginBottom: 0 },
              padding: 0.25,
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
