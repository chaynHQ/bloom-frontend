'use client';

import { getImageSizes } from '@/lib/utils/imageSizes';
import { pageHeaderPaddingTop, rowStyle } from '@/styles/common';
import theme from '@/styles/theme';
import { Box, Container, Typography } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import Image, { StaticImageData } from 'next/image';

// The partnership lockup beside an illustration standing on the section's bottom edge. `hero` is
// the welcome page's version, opening the page with its gradient and a larger illustration.
const VARIANTS = {
  default: {
    background: { backgroundColor: 'common.white' },
    paddingTop: pageHeaderPaddingTop,
    paddingBottom: '0 !important',
    imageWidth: { xs: 120, sm: 180, md: 200, lg: 220 },
    minHeight: { xs: 200, sm: 250, md: 300, lg: 300 },
    lockupAlign: 'end',
    lockupOffset: 6,
    objectPosition: 'center',
  },
  hero: {
    background: { background: theme.palette.bloomGradientSoft },
    paddingTop: pageHeaderPaddingTop,
    paddingBottom: '0 !important',
    imageWidth: { xs: 150, sm: 220, md: 280, lg: 340 },
    minHeight: { xs: 240, sm: 280, md: 340, lg: 340 },
    lockupAlign: 'center',
    lockupOffset: 0,
    objectPosition: 'bottom',
  },
} as const;

type Variant = (typeof VARIANTS)[keyof typeof VARIANTS];

const containerStyle = ({
  background,
  paddingTop,
  paddingBottom,
  minHeight,
  lockupAlign,
}: Variant) =>
  ({
    ...rowStyle,
    alignItems: lockupAlign,
    paddingTop,
    paddingBottom,
    minHeight,
    ...background,
  }) as const;

const imageContainerStyle = ({ imageWidth }: Variant) =>
  ({
    position: 'relative',
    alignSelf: 'flex-end',
    width: imageWidth,
    height: imageWidth,
    marginInlineEnd: { sm: 2, md: 3, lg: 2 },
  }) as const;

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
  variant?: 'default' | 'hero';
}

const PartnerHeader = (props: HeaderProps) => {
  const {
    partnerLogoSrc,
    partnerLogoAlt,
    imageAlt,
    translatedImageAlt,
    imageSrc,
    variant = 'default',
  } = props;
  const t = useTranslations('Welcome');
  const tS = useTranslations('Shared');
  const locale = useLocale();

  const styles = VARIANTS[variant];
  const imageAltText = translatedImageAlt ? translatedImageAlt : imageAlt ? tS(imageAlt) : '';

  const welcomeText = (
    <Typography variant="subtitle1" sx={welcomeTextStyle}>
      {t('WelcomeTo')}
    </Typography>
  );

  return (
    <Container sx={containerStyle(styles)}>
      <Box sx={{ paddingBottom: styles.lockupOffset }}>
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
      <Box sx={imageContainerStyle(styles)}>
        <Image
          alt={imageAltText}
          src={imageSrc}
          fill
          priority={variant === 'hero'}
          sizes={getImageSizes(styles.imageWidth)}
          style={{ objectFit: 'contain', objectPosition: styles.objectPosition }}
        />
      </Box>
    </Container>
  );
};

export default PartnerHeader;
