'use client';

import { getImageSizes } from '@/lib/utils/imageSizes';
import { rowStyle } from '@/styles/common';
import { Box, Container, Typography } from '@mui/material';
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
  width: { xs: 160, sm: 180, md: 200, lg: 220 },
} as const;

const welcomeTextStyle = {
  fontSize: { xs: '1.25rem !important', sm: '1.5rem !important', lg: '1.75rem !important' },
} as const;

const logoStyle = {
  objectFit: 'contain',
  width: '100%',
  height: 'auto',
  paddingBottom: 60,
} as const;

interface HeaderProps {
  partnerLogoSrc: StaticImageData;
  partnerLogoAlt: string;
  imageSrc: StaticImageData;
  imageAlt: string;
  showWelcomeSubtext?: boolean;
}

const PartnerHeader = (props: HeaderProps) => {
  const { partnerLogoSrc, partnerLogoAlt, imageAlt, imageSrc } = props;
  const t = useTranslations('Welcome');
  const tS = useTranslations('Shared');

  return (
    <Container sx={headerContainerStyles}>
      <Box>
        {props.showWelcomeSubtext && (
          <Typography variant="subtitle1" sx={welcomeTextStyle}>
            {t('WelcomeTo')}
          </Typography>
        )}
        <Box sx={logoContainerStyle}>
          <Image
            alt={tS(partnerLogoAlt)}
            src={partnerLogoSrc}
            sizes={getImageSizes(logoContainerStyle.width)}
            style={logoStyle}
          />
        </Box>
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
