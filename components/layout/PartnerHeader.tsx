import { Box, Container } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image, { StaticImageData } from 'next/image';
import { rowStyle } from '../../styles/common';
import UserResearchBanner from '../banner/UserResearchBanner';

const headerContainerStyles = {
  ...rowStyle,
  alignItems: 'end',
  backgroundColor: 'common.white',
  paddingBottom: { xs: 0, md: 0 },
  minHeight: { xs: 270, sm: 300, md: 320, lg: 340 },
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 160, sm: 180, md: 200, lg: 220 },
  height: { xs: 160, sm: 180, md: 200, lg: 220 },
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
          sizes="100vw"
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
          sizes="100vw"
          style={{
            objectFit: 'contain',
          }}
        />
      </Box>
    </Container>
  );
};

export default PartnerHeader;
