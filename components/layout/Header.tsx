import { Box, Container, Typography } from '@mui/material';
import { ISbRichtext } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import Image, { StaticImageData } from 'next/legacy/image';
import { render } from 'storyblok-rich-text-react-renderer';
import { PROGRESS_STATUS } from '../../constants/enums';
import { columnStyle, rowStyle } from '../../styles/common';
import { RichTextOptions } from '../../utils/richText';
import UserResearchBanner from '../banner/UserResearchBanner';
import ProgressStatus from '../common/ProgressStatus';

export interface HeaderProps {
  title: string;
  introduction: string | ISbRichtext;
  imageSrc: StaticImageData;
  imageAlt?: string;
  translatedImageAlt?: string;
  progressStatus?: PROGRESS_STATUS;
  children?: any;
  cta?: any;
}

const headerContainerStyles = {
  ...rowStyle,
  alignItems: 'center',
  minHeight: { xs: 220, lg: 360 },
  paddingBottom: { xs: '3rem !important', sm: '4rem !important' },
  gap: '30px',
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
} as const;

const childrenContentStyle = {
  marginBottom: 4,
} as const;

const textContentStyle = {
  marginTop: 'auto',
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

  const tS = useTranslations('Shared');
  const imageAltText = translatedImageAlt ? translatedImageAlt : imageAlt ? tS(imageAlt) : '';

  return (
    <Container sx={headerContainerStyles}>
      <UserResearchBanner />
      <Box sx={textContainerStyle}>
        {children && <Box sx={childrenContentStyle}>{children}</Box>}
        <Box sx={textContentStyle}>
          <Typography variant="h1" component="h1">
            {title}
          </Typography>
          {typeof introduction === 'string' ? (
            <Typography>{introduction}</Typography>
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
