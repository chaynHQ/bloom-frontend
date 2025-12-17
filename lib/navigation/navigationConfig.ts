import {
  DRAWER_ACTIVITIES_CLICKED,
  DRAWER_ADMIN_CLICKED,
  DRAWER_CHAT_CLICKED,
  DRAWER_COURSES_CLICKED,
  DRAWER_GROUNDING_CLICKED,
  DRAWER_IMMEDIATE_HELP_CLICKED,
  DRAWER_NOTES_CLICKED,
  DRAWER_OUR_BLOOM_TEAM_CLICKED,
  DRAWER_THERAPY_CLICKED,
  HEADER_ADMIN_CLICKED,
  HEADER_IMMEDIATE_HELP_CLICKED,
  HEADER_OUR_BLOOM_TEAM_CLICKED,
  SECONDARY_HEADER_ACTIVITIES_CLICKED,
  SECONDARY_HEADER_CHAT_CLICKED,
  SECONDARY_HEADER_COURSES_CLICKED,
  SECONDARY_HEADER_GROUNDING_CLICKED,
  SECONDARY_HEADER_NOTES_CLICKED,
  SECONDARY_HEADER_THERAPY_CLICKED,
} from '@/lib/constants/events';
import activitiesIcon from '@/public/activities_icon.svg';
import chatIcon from '@/public/chat_icon.svg';
import courseIcon from '@/public/course_icon.svg';
import groundingIcon from '@/public/grounding_icon.svg';
import notesFromBloomIcon from '@/public/notes_from_bloom_icon.svg';
import therapyIcon from '@/public/therapy_icon.svg';

export interface MainNavItem {
  key: string;
  href: string;
  icon: string;
  event: string;
  translationKey: string;
  altTranslationKey: string;
  qaIdPrefix: string;
}

export interface TopNavItem {
  key: string;
  translationKey: string;
  href: string;
  target?: string;
  event: string;
  qaId?: string;
}

interface NavigationConfigOptions {
  includeTherapy: boolean;
  qaIdSuffix: string;
  isMobile?: boolean;
}

const getMainNavItemsBase = (isMobile = false): MainNavItem[] => [
  {
    key: 'courses',
    href: '/courses',
    icon: courseIcon,
    event: isMobile ? DRAWER_COURSES_CLICKED : SECONDARY_HEADER_COURSES_CLICKED,
    translationKey: 'courses',
    altTranslationKey: 'alt.courseIcon',
    qaIdPrefix: 'courses',
  },
  {
    key: 'messaging',
    href: '/messaging',
    icon: chatIcon,
    event: isMobile ? DRAWER_CHAT_CLICKED : SECONDARY_HEADER_CHAT_CLICKED,
    translationKey: 'messaging',
    altTranslationKey: 'alt.chatIcon',
    qaIdPrefix: 'messaging',
  },
  {
    key: 'activities',
    href: '/activities',
    icon: activitiesIcon,
    event: isMobile ? DRAWER_ACTIVITIES_CLICKED : SECONDARY_HEADER_ACTIVITIES_CLICKED,
    translationKey: 'activities',
    altTranslationKey: 'alt.activitiesIcon',
    qaIdPrefix: 'activities',
  },
  {
    key: 'grounding',
    href: '/grounding',
    icon: groundingIcon,
    event: isMobile ? DRAWER_GROUNDING_CLICKED : SECONDARY_HEADER_GROUNDING_CLICKED,
    translationKey: 'grounding',
    altTranslationKey: 'alt.groundingIcon',
    qaIdPrefix: 'grounding',
  },
  {
    key: 'notes',
    href: '/subscription/whatsapp',
    icon: notesFromBloomIcon,
    event: isMobile ? DRAWER_NOTES_CLICKED : SECONDARY_HEADER_NOTES_CLICKED,
    translationKey: 'notes',
    altTranslationKey: 'alt.notesIcon',
    qaIdPrefix: 'notes',
  },
];

const getTherapyNavItem = (isMobile = false): MainNavItem => ({
  key: 'therapy',
  href: '/therapy/book-session',
  icon: therapyIcon,
  event: isMobile ? DRAWER_THERAPY_CLICKED : SECONDARY_HEADER_THERAPY_CLICKED,
  translationKey: 'therapy',
  altTranslationKey: 'alt.therapyIcon',
  qaIdPrefix: 'therapy',
});

export const getMainNavItems = (options: NavigationConfigOptions): MainNavItem[] => {
  const isMobile = options.isMobile || false;
  const items = getMainNavItemsBase(isMobile);

  if (options.includeTherapy) {
    items.push(getTherapyNavItem(isMobile));
  }

  return items;
};

export const getTopNavItems = (
  partnerAdmin?: { partner?: any },
  isMobile = false,
): TopNavItem[] => {
  // Create items with appropriate events based on platform
  const baseItems: TopNavItem[] = [
    {
      key: 'meetTheTeam',
      translationKey: 'meetTheTeam',
      href: '/meet-the-team',
      event: isMobile ? DRAWER_OUR_BLOOM_TEAM_CLICKED : HEADER_OUR_BLOOM_TEAM_CLICKED,
      qaId: 'meet-team-menu-button',
    },
    {
      key: 'immediateHelp',
      translationKey: 'immediateHelp',
      href: 'https://www.chayn.co/help',
      target: '_blank',
      event: isMobile ? DRAWER_IMMEDIATE_HELP_CLICKED : HEADER_IMMEDIATE_HELP_CLICKED,
      qaId: 'immediate-help-menu-button',
    },
  ];

  const adminItem: TopNavItem = {
    key: 'admin',
    translationKey: 'admin',
    href: '/partner-admin/create-access-code',
    event: isMobile ? DRAWER_ADMIN_CLICKED : HEADER_ADMIN_CLICKED,
    qaId: 'partner-admin-menu-button',
  };

  const items = [...baseItems];

  // Add admin link if user is partner admin
  if (partnerAdmin && partnerAdmin.partner) {
    items.unshift(adminItem);
    return items.filter((item) => item.key !== 'immediateHelp');
  }

  return items;
};
