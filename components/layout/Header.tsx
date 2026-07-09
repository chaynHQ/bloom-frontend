'use client';

import DirectionalIcon from '@/components/common/DirectionalIcon';
import ProgressStatus from '@/components/common/ProgressStatus';
import { useRouter } from '@/i18n/routing';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { TextNode } from '@/lib/types/types';
import { getImageSizes } from '@/lib/utils/imageSizes';
import { RichTextOptions } from '@/lib/utils/richText';
import { breadcrumbButtonStyle, columnStyle, rowStyle } from '@/styles/common';
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

// Refreshed header to match the 2026 design: a single soft peach gradient band (its colours
// sampled from Figma — a subtle top-to-bottom wash, not a strong pink), with the heading block
// vertically centred against a translucent-white circle holding the page illustration. On
// mobile the layout stacks with the illustration on top, matching the mobile design.
const headerContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: { xs: 300, md: 360, lg: 400 },
  paddingTop: { xs: '2rem !important', md: '2.5rem !important' },
  paddingBottom: { xs: '2rem !important', md: '2.5rem !important' },
  background: 'linear-gradient(180deg, #FCE7E1 0%, #FEE9E1 100%)',
};

// Fills the remaining band height and vertically centres the heading block within it.
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

// The illustration sits inside a translucent-white circle (design token); the image itself is
// inset to ~72% of the circle, matching the Figma proportions. It orders above the text on
// mobile (order: -1) and to the trailing edge on desktop.
const rightHeaderStyle = {
  flexShrink: 0,
  order: { xs: -1, md: 0 },
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: { xs: 140, md: 220 },
  height: { xs: 140, md: 220 },
  borderRadius: '50%',
  backgroundColor: 'rgba(255, 255, 255, 0.5)',
} as const;

const rightImageStyle = {
  position: 'relative',
  width: { xs: 100, md: 158 },
  height: { xs: 100, md: 158 },
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
      {/* The heading block grows to fill the band and centres itself vertically, so it stays
          centred whether or not a research banner / breadcrumb sits above it. */}
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
              <Box sx={rightImageStyle}>
                <Image
                  alt={imageAltText}
                  src={imageSrc}
                  fill
                  sizes={getImageSizes(rightImageStyle.width)}
                  style={{
                    objectFit: 'contain',
                  }}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Header;
