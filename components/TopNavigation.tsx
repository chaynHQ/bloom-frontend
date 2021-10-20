import AppBar from '@mui/material/AppBar';
import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import bloomLogo from '../public/bloom_logo.png';
import LanguageMenu from './LanguageMenu';
import Link from './Link';

const appBarStyle = {
  bgcolor: 'primary.light',
  flexDirection: 'row',
  justifyContent: 'space-between',
  px: 3,
  py: 1,
  height: 48,
  color: 'text.primary',
} as const;
const logoContainerStyle = { width: 200, position: 'relative' } as const;
const navigationLinkStyle = { ':hover': { color: 'primary.dark' } } as const;

const TopNavigation = () => {
  const t = useTranslations('TopNavigation');

  const navigationLinks = [
    { title: t('about'), href: '/about' },
    { title: t('immediateHelp'), href: '/immediate-help' },
    { title: t('therapy'), href: '/therapy' },
    { title: t('courses'), href: '/courses' },
    { title: t('account'), href: '/account' },
  ];

  return (
    <AppBar sx={appBarStyle}>
      <Link href="/" aria-label={t('home')} sx={logoContainerStyle}>
        <Image
          alt="Bloom logo"
          src={bloomLogo}
          layout="fill"
          objectFit="contain"
          objectPosition="left"
        />
      </Link>
      <Stack direction="row" spacing={3} alignItems="center">
        {navigationLinks.map((link) => (
          <Link key={link.title} href={link.href} unstyled sx={navigationLinkStyle}>
            {link.title}
          </Link>
        ))}
        <LanguageMenu />
      </Stack>
    </AppBar>
  );
};

export default TopNavigation;
