import LanguageIcon from '@mui/icons-material/Language';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Image from 'next/image';
import { useRouter } from 'next/router';
import bloomLogo from '../../public/bloom_logo.png';
import Link from '../Link';

const appBarStyle = {
  bgcolor: 'primary.light',
  flexDirection: 'row',
  justifyContent: 'space-between',
  px: 3,
  py: 1,
  height: 48,
} as const;

const logoContainerStyle = { width: 200, position: 'relative' } as const;

const TopNavigation = () => {
  const router = useRouter();
  const locale = router.locale;
  const locales = router.locales;

  return (
    <AppBar sx={appBarStyle}>
      <Box sx={logoContainerStyle}>
        <Image
          alt="Bloom logo"
          src={bloomLogo}
          layout="fill"
          objectFit="contain"
          objectPosition="left"
        />
      </Box>
      <Box sx={{}}>
        {locales?.map((language) => {
          const currentLocale = language === locale;
          return (
            <Button
              key={language}
              component={Link}
              noLinkStyle
              variant={currentLocale ? 'outlined' : 'contained'}
              disabled={currentLocale}
              startIcon={currentLocale && <LanguageIcon />}
              href="/"
              locale={language}
            >
              {language}
            </Button>
          );
        })}
      </Box>
    </AppBar>
  );
};

export default TopNavigation;
