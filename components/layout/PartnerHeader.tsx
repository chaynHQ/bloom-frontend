'use client';

import UserResearchBanner from '@/components/banner/UserResearchBanner';
import { getImageSizes } from '@/lib/utils/imageSizes';
import { rowStyle } from '@/styles/common';
import { Box, Container } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image, { StaticImageData } from 'next/image';

const headerContainerStyles = {
  ...rowStyle,
  alignItems: 'end',
  backgroundColor: 'common.white',
  paddingTop: { xs: 0, sm: 0, md: 0, lg: 0 },
  paddingBottom: { xs: 0, md: 0 },
  minHeight: { xs: 200, sm: 250, md: 300, lg: 300 },
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 120, sm: 180, md: 200, lg: 220 },
  height: { xs: 120, sm: 180, md: 200, lg: 220 },
  marginRight: { sm: 2, md: 3, lg: 2 },
} as const;

const logoContainerStyle = {
  position: 'relative',
  width: { xs: 160, sm: 180, md: 200, lg: 220 },
  height: { xs: 160, sm: 180, md: 200, lg: 220 },
  marginTop: { xs: 4, lg: 2 },
} as const;

interface HeaderProps {
  partnerLogoSrc: StaticImageData;
  partnerLogoAlt: string;
  imageSrc: StaticImageData;
  imageAlt: string;
}

const PartnerHeader = (props: HeaderProps) => {
  const { partnerLogoSrc, partnerLogoAlt, imageAlt, imageSrc } = props;
  const tS = useTranslations('Shared');

  return (
    <Container sx={headerContainerStyles}>
      <UserResearchBanner />
      <Box sx={logoContainerStyle}>
        <Image
          alt={tS(partnerLogoAlt)}
          src={partnerLogoSrc}
          fill
          sizes={getImageSizes(logoContainerStyle.width)}
          style={{
            objectFit: 'contain',
          }}
        />
      </Box>
      <Box sx={imageContainerStyle}>
        <Image
          alt={tS(imageAlt)}
          src={imageSrc}
          fill
          sizes={getImageSizes(imageContainerStyle.width)}
          style={{
            objectFit: 'contain',
          }}
        />
      </Box>
    </Container>
  );
};

export default PartnerHeader;
