import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { Box, Container, IconButton, Typography } from '@mui/material';
import { ISbRichtext } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import Image, { StaticImageData } from 'next/legacy/image';
import { useRouter } from 'next/router';
import { JSXElementConstructor, ReactElement, ReactNodeArray } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';
import { PROGRESS_STATUS } from '../../constants/enums';
import { columnStyle, rowStyle } from '../../styles/common';
import { RichTextOptions } from '../../utils/richText';
import UserResearchBanner from '../banner/UserResearchBanner';
import ProgressStatus from '../common/ProgressStatus';

export interface HeaderProps {
  title: string;
  introduction:
    | string
    | ISbRichtext
    | ReactElement<any, string | JSXElementConstructor<any>>
    | ReactNodeArray; // can be a string, storyblok rich text, or intl rich text
  imageSrc: string | StaticImageData;
  imageAlt?: string;
  translatedImageAlt?: string;
  progressStatus?: PROGRESS_STATUS;
  children?: any;
  cta?: any;
}

const headerContainerStyle = {
  ...rowStyle,
  alignItems: 'center',
  minHeight: { xs: 220, lg: 360 },
  paddingBottom: { xs: '3rem !important', sm: '4rem !important' },
  paddingTop: { xs: '0', md: '5rem ' },
  gap: '30px',
  background: {
    xs: 'linear-gradient(180deg, #F3D6D8 53.12%, #FFEAE1 100%)',
    md: 'linear-gradient(180deg, #F3D6D8 36.79%, #FFEAE1 73.59%)',
  },
};

const ctaContainerStyle = {
  ...columnStyle,
  width: { xs: '100%', sm: 'auto' },
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 180, sm: 200, lg: 220 },
  height: { xs: 180, sm: 200, lg: 220 },
  marginLeft: { xs: 'auto', md: 0 },
  marginRight: { xs: 'auto', md: 0 },
} as const;

const textContainerStyle = {
  ...columnStyle,
  justifyContent: 'space-between',
  width: { xs: '100%', sm: 'auto' },
  maxWidth: { xs: '100%', sm: '55%', md: '65%' },
  pl: { xs: 3, sm: 0 },
  pr: { xs: 6, sm: 0 },
} as const;

const childrenContentStyle = {
  marginBottom: 4,
} as const;

const textContentStyle = {
  marginTop: 'auto',
} as const;

const backButtonStyle = {
  display: { md: 'none' },
  width: '2.5rem',
  marginLeft: '-0.675rem',
  marginY: { xs: 1.5, sm: 2 },
  paddingRight: '1rem',
} as const;

const backIconStyle = {
  height: '1.75rem',
  width: '1.75rem',
  color: 'primary.dark',
} as const;

const Header = (props: HeaderProps) => {
  const {
    title,
    introduction,
    imageAlt,
    translatedImageAlt,
    imageSrc,
    progressStatus,
    children,
    cta,
  } = props;

  const router = useRouter();
  const tS = useTranslations('Shared');
  const imageAltText = translatedImageAlt ? translatedImageAlt : imageAlt ? tS(imageAlt) : '';

  return (
    <Container sx={headerContainerStyle}>
      <UserResearchBanner />
      <Box sx={textContainerStyle}>
        <IconButton
          sx={backButtonStyle}
          onClick={() => router.back()}
          aria-label={tS('navigateBack')}
        >
          <KeyboardArrowLeftIcon sx={backIconStyle} />
        </IconButton>
        {children && <Box sx={childrenContentStyle}>{children}</Box>}
        <Box sx={textContentStyle}>
          <Typography variant="h1" component="h1">
            {title}
          </Typography>
          {typeof introduction === 'string' || !introduction.hasOwnProperty('content') ? (
            <Typography>
              {
                introduction as
                  | string
                  | ReactElement<any, string | JSXElementConstructor<any>>
                  | ReactNodeArray
              }
            </Typography>
          ) : (
            render(introduction, RichTextOptions)
          )}
        </Box>
        {progressStatus && <ProgressStatus status={progressStatus} />}
      </Box>
      <Box sx={imageContainerStyle}>
        <Image alt={imageAltText} src={imageSrc} layout="fill" objectFit="contain" />
      </Box>
      {cta && <Box sx={ctaContainerStyle}>{cta}</Box>}
    </Container>
  );
};

export default Header;
