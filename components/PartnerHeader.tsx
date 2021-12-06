import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useTranslations } from 'next-intl';
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
  alignItems: 'end',
  justifyContent: 'space-between',
  backgroundColor: 'common.white',
  paddingBottom: { xs: 0, md: 0 },
  paddingTop: { xs: 6, md: 8 },
  minHeight: { xs: 260, md: 410 },
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 150, md: 230 },
  height: { xs: 150, md: 265 },
} as const;

const logoContainerStyle = {
  position: 'relative',
  width: { xs: 160, md: 300 },
  height: { xs: 160, md: 280 },
  marginTop: { xs: 4, md: 0 },
} as const;

const PartnerHeader = (props: HeaderProps) => {
  const { partnerLogoSrc, partnerLogoAlt, imageAlt, imageSrc } = props;
  const tS = useTranslations('Shared');

  return (
    <Container sx={headerContainerStyles}>
      <Box sx={logoContainerStyle}>
        <Image alt={tS(partnerLogoAlt)} src={partnerLogoSrc} layout="fill" objectFit="contain" />
      </Box>
      <Box sx={imageContainerStyle}>
        <Image alt={tS(imageAlt)} src={imageSrc} layout="fill" objectFit="contain" />
      </Box>
    </Container>
  );
};

export default PartnerHeader;
