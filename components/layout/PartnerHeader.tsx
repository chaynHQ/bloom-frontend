'use client';

import { getImageSizes } from '@/lib/utils/imageSizes';
import { rowStyle } from '@/styles/common';
import theme from '@/styles/theme';
import { Box, Container, Typography } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import Image, { StaticImageData } from 'next/image';

// The partner banner: the partnership lockup beside an illustration standing on the section's
// bottom edge. The `hero` variant is the welcome page's version of it — the same banner opening
// the page, so it takes the page-opening gradient and a larger illustration.

const VARIANTS = {
  default: {
    background: { backgroundColor: 'common.white' },
    paddingTop: { xs: 0, sm: 0, md: 0, lg: 0 },
    paddingBottom: { xs: 0, md: 0 },
    imageWidth: { xs: 120, sm: 180, md: 200, lg: 220 },
    minHeight: { xs: 200, sm: 250, md: 300, lg: 300 },
    // The lockup sits with the illustration on the bottom edge, lifted clear of it.
    lockupAlign: 'end',
    lockupOffset: 6,
    objectPosition: 'center',
  },
  hero: {
    background: { background: theme.palette.bloomGradientSoft },
    // Leaves room for the fixed "Leave this site" button, which floats over the top of the banner.
    paddingTop: '3.5rem !important',
    paddingBottom: '0 !important',
    imageWidth: { xs: 150, sm: 220, md: 280, lg: 340 },
    minHeight: { xs: 240, sm: 280, md: 340, lg: 340 },
    // Only the illustration stands on the bottom edge; the lockup centres in the band beside it.
    lockupAlign: 'center',
    lockupOffset: 0,
    // Stands the artwork on that edge rather than centring it in a box it does not fill.
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
    // The illustration keeps the bottom edge whatever the lockup beside it does.
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
  // Set when the alt text arrives already translated, as a Storyblok asset's own alt does.
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
