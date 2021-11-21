import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Image from 'next/image';
import * as React from 'react';
import { rowStyle } from '../styles/common';

interface HeaderProps {
  partnerLogoSrc: StaticImageData;
  partnerLogoAlt: string;
  imageSrc: StaticImageData;
  imageAlt: string;
}

const headerContainerStyles = {
  ...rowStyle,
  justifyContent: 'space-between',
  backgroundColor: 'common.white',
  paddingBottom: { xs: 0, md: 0 },
  paddingTop: { xs: 2, md: 12 },
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 150, md: 250 },
  height: { xs: 150, md: 290 },
  marginTop: { xs: 4, md: 0 },
  alignSelf: { xs: 'center', md: 'auto' },
} as const;

const logoContainerStyle = {
  position: 'relative',
  width: { xs: 160, md: 300 },
  height: { xs: 150, md: 250 },
  marginTop: { xs: 4, md: 0 },
  alignSelf: { xs: 'center', md: 'auto' },
} as const;

const textContainerStyle = {
  maxWidth: 600,
} as const;

const PartnerHeader = (props: HeaderProps) => {
  const { partnerLogoSrc, partnerLogoAlt, imageAlt, imageSrc } = props;

  return (
    <Container sx={headerContainerStyles}>
      <Box sx={logoContainerStyle}>
        <Image alt={partnerLogoAlt} src={partnerLogoSrc} layout="fill" objectFit="contain" />
      </Box>
      <Box sx={imageContainerStyle}>
        <Image alt={imageAlt} src={imageSrc} layout="fill" objectFit="contain" />
      </Box>
    </Container>
  );
};

export default PartnerHeader;
