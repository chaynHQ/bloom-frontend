'use client';

import { getImageSizes } from '@/lib/utils/imageSizes';
import { pageHeaderPaddingTop, rowStyle } from '@/styles/common';
import { Box, Container, Typography } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import Image, { StaticImageData } from 'next/image';

// The partnership lockup, vertically centred on a white band, beside an illustration standing on
// the section's bottom edge. Shared by the welcome page and the partner-aware auth pages.
const imageWidth = { xs: 150, sm: 200, md: 240, lg: 280 } as const;

const containerStyle = {
  ...rowStyle,
  alignItems: 'center',
  paddingTop: '0 !important',
  paddingBottom: '0 !important',
  minHeight: { xs: 220, sm: 260, md: 300, lg: 320 },
  backgroundColor: 'common.white',
} as const;

// The band's padding lives on the lockup rather than the container, so the lockup stays centred in
// the band while the illustration keeps standing on its bottom edge. The top gap also clears the
// fixed "leave this site" button.
const lockupStyle = {
  paddingTop: pageHeaderPaddingTop,
  paddingBottom: pageHeaderPaddingTop,
} as const;

const imageContainerStyle = {
  position: 'relative',
  alignSelf: 'flex-end',
  width: imageWidth,
  height: imageWidth,
  marginInlineEnd: { sm: 2, md: 3, lg: 2 },
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
} as const;

interface HeaderProps {
  partnerLogoSrc: StaticImageData;
  partnerLogoAlt: string;
  imageSrc: string | StaticImageData;
  imageAlt?: string;
  translatedImageAlt?: string;
  showWelcomeSubtext?: boolean;
  // Set on pages where the illustration is the largest above-the-fold image.
  priority?: boolean;
}

const PartnerHeader = (props: HeaderProps) => {
  const {
    partnerLogoSrc,
    partnerLogoAlt,
    imageAlt,
    translatedImageAlt,
    imageSrc,
    priority = false,
  } = props;
  const t = useTranslations('Welcome');
  const tS = useTranslations('Shared');
  const locale = useLocale();

  const imageAltText = translatedImageAlt ? translatedImageAlt : imageAlt ? tS(imageAlt) : '';

  const welcomeText = (
    <Typography variant="subtitle1" sx={welcomeTextStyle}>
      {t('WelcomeTo')}
    </Typography>
  );

  return (
    <Container sx={containerStyle}>
      <Box sx={lockupStyle}>
        {/*Hindi: welcomeText starts lowercase due to Hindi following a "Bloom + {welcomeText}" sentence structure */}
        {props.showWelcomeSubtext && locale !== 'hi' && welcomeText}
        <Box sx={logoContainerStyle}>
          <Image
            alt={tS(partnerLogoAlt)}
            src={partnerLogoSrc}
            sizes={getImageSizes(logoContainerStyle.width)}
            style={logoStyle}
          />
        </Box>
        {props.showWelcomeSubtext && locale === 'hi' && welcomeText}
      </Box>
      <Box sx={imageContainerStyle}>
        <Image
          alt={imageAltText}
          src={imageSrc}
          fill
          priority={priority}
          sizes={getImageSizes(imageWidth)}
          style={{ objectFit: 'contain', objectPosition: 'bottom' }}
        />
      </Box>
    </Container>
  );
};

export default PartnerHeader;
