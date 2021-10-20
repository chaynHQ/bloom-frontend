import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Image from 'next/image';
import bloomLogo from '../public/bloom_logo.png';
import LanguageMenu from './LanguageMenu';

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
      <LanguageMenu />
    </AppBar>
  );
};

export default TopNavigation;
