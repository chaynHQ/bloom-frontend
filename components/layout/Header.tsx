'use client';

import DirectionalIcon from '@/components/common/DirectionalIcon';
import ProgressStatus from '@/components/common/ProgressStatus';
import { useRouter } from '@/i18n/routing';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { TextNode } from '@/lib/types/types';
import { getImageSizes } from '@/lib/utils/imageSizes';
import { RichTextOptions } from '@/lib/utils/richText';
import { breadcrumbButtonStyle, columnStyle, rowStyle } from '@/styles/common';
import theme from '@/styles/theme';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { Box, Container, IconButton, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image, { StaticImageData } from 'next/image';
import { render, StoryblokRichtext } from 'storyblok-rich-text-react-renderer';
import UserResearchBanner from '../banner/UserResearchBanner';

export interface HeaderProps {
  title: string;
  introduction?: TextNode | StoryblokRichtext;
  imageSrc: string | StaticImageData;
  imageAlt?: string;
  translatedImageAlt?: string;
  progressStatus?: PROGRESS_STATUS;
  children?: any;
  cta?: any;
}

const headerContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: { xs: 300, md: 360, lg: 400 },
  paddingTop: '2.5rem !important',
  paddingBottom: { xs: '2rem !important', md: '2.5rem !important' },
  background: theme.palette.bloomGradientSoft,
};

// Fills the remaining band height, centring the heading block under anything above it.
const centerWrapStyle = {
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
} as const;

const headerStyle = {
  ...rowStyle,
  flexDirection: { xs: 'column', md: 'row' },
  alignItems: { xs: 'flex-start', md: 'center' },
  gap: { xs: 3, md: 5 },
} as const;

// The illustration sits above the text on mobile, and on the trailing edge on desktop.
const rightHeaderStyle = {
  position: 'relative',
  flexShrink: 0,
  order: { xs: -1, md: 0 },
  width: { xs: 140, md: 220 },
  height: { xs: 140, md: 220 },
} as const;

const leftHeaderStyle = {
  ...columnStyle,
  alignItems: 'flex-start',
  gap: 2,
  width: { xs: '100%', md: 'auto' },
  maxWidth: { xs: '100%', md: '60%' },
} as const;

const leftMetaStyle = {
  ...columnStyle,
  gap: 2,
} as const;

export const backButtonStyle = {
  ...breadcrumbButtonStyle,
  display: { md: 'none' },
  px: 'auto',
} as const;

export const backIconStyle = {
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

  const getIntroduction = () => {
    if (!introduction) return undefined;
    if (typeof introduction === 'string') {
      return (
        <Typography
          sx={{
            fontSize: '1rem !important',
          }}
        >
          {introduction}
        </Typography>
      );
    } else if (typeof introduction === 'object' && 'content' in introduction) {
      return render(introduction, RichTextOptions);
    } else {
      return introduction;
    }
  };

  return (
    <Container sx={headerContainerStyle}>
      <UserResearchBanner />
      {!children && (
        <IconButton
          sx={backButtonStyle}
          onClick={() => router.back()}
          aria-label={tS('navigateBack')}
          size="small"
        >
          <DirectionalIcon>
            <KeyboardArrowLeftIcon sx={backIconStyle} />
          </DirectionalIcon>
        </IconButton>
      )}
      {children && <>{children}</>}
      <Box sx={centerWrapStyle}>
        <Box sx={headerStyle}>
          <Box sx={leftHeaderStyle}>
            <Typography variant="h1" component="h1" sx={{ fontWeight: 500, mb: 0 }}>
              {title}
            </Typography>
            <Box sx={leftMetaStyle}>
              <Box>{getIntroduction()}</Box>
              {progressStatus && <ProgressStatus status={progressStatus} />}
              {cta && <Box>{cta}</Box>}
            </Box>
          </Box>
          {imageSrc && (
            <Box sx={rightHeaderStyle}>
              <Image
                alt={imageAltText}
                src={imageSrc}
                fill
                sizes={getImageSizes(rightHeaderStyle.width)}
                style={{
                  objectFit: 'contain',
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Header;
