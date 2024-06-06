import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import Image, { StaticImageData } from 'next/image';
import * as React from 'react';
import { render } from 'storyblok-rich-text-react-renderer';
import { columnStyle, rowStyle } from '../../styles/common';
import theme from '../../styles/theme';
import { RichTextOptions } from '../../utils/richText';
import UserResearchBanner from '../banner/UserResearchBanner';

export interface HeaderProps {
  title:
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  introduction:
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  imageSrc: StaticImageData;
  imageAlt?: string;
  translatedImageAlt?: string;
  children?: any;
  cta?: any;
}

const headerContainerStyles = {
  ...rowStyle,
  alignItems: 'center',
  minHeight: { xs: 220, lg: 360 },
  paddingBottom: { xs: '3rem !important', sm: '4rem !important' },
  gap: 1,
  background: theme.palette.bloomGradient,
};

const ctaContainerStyle = {
  width: 'auto',
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 220, sm: 250, md: 300, lg: 350 },
  height: { xs: 220, sm: 250, md: 300, lg: 350 },
  marginLeft: { xs: 'auto', md: 0 },
  marginRight: { xs: 0, md: 0 },
} as const;

const textContainerStyle = {
  ...columnStyle,
  pl: { xs: 3, sm: 0 },
  pr: { xs: 6, sm: 0 },
  justifyContent: 'space-between',
  width: { xs: '100%', sm: 'auto' },
  maxWidth: { xs: '100%', sm: '50%', md: '60%' },
} as const;

const textContentStyle = {
  mt: 'auto',
} as const;

const Header = (props: HeaderProps) => {
  const { title, introduction, imageAlt, translatedImageAlt, imageSrc, children, cta } = props;

  const tS = useTranslations('Shared');
  const imageAltText = translatedImageAlt
    ? translatedImageAlt
    : imageAlt
      ? tS(`alt.${imageAlt}`)
      : '';

  return (
    <Container sx={headerContainerStyles}>
      <UserResearchBanner />
      <Box sx={textContainerStyle}>
        <Box sx={textContentStyle}>
          <Typography variant="h1" component="h1" mb={3}>
            {title}
          </Typography>
          <>{render(introduction, RichTextOptions)}</>
        </Box>
        {cta && <Box sx={ctaContainerStyle}>{cta}</Box>}
      </Box>
      <Box sx={imageContainerStyle}>
        <Image
          alt={imageAltText}
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

export default Header;
