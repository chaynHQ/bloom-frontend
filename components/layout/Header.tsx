'use client';

import { BackLink } from '@/components/common/BackLink';
import ProgressStatus from '@/components/common/ProgressStatus';
import { ScrollReveal } from '@/components/common/ScrollReveal';
import { useRouter } from '@/i18n/routing';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { TextNode } from '@/lib/types/types';
import { getImageSizes } from '@/lib/utils/imageSizes';
import { RichTextOptions } from '@/lib/utils/richText';
import {
  columnStyle,
  pageHeaderPaddingBottom,
  pageHeaderPaddingTop,
  pageHeaderPaddingTopMobile,
  rowStyle,
} from '@/styles/common';
import theme from '@/styles/theme';
import { Box, Container, SxProps, Theme, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image, { StaticImageData } from 'next/image';
import { render, StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

export interface HeaderProps {
  title: string;
  introduction?: TextNode | StoryblokRichtext;
  imageSrc?: string | StaticImageData;
  imageAlt?: string;
  translatedImageAlt?: string;
  progressStatus?: PROGRESS_STATUS;
  children?: any;
  cta?: any;
  variant?: 'default' | 'hero';
}

const headerContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: { xs: 300, md: 340 },
  paddingTop: { xs: pageHeaderPaddingTopMobile, md: pageHeaderPaddingTop },
  paddingBottom: pageHeaderPaddingBottom,
  background: theme.palette.bloomGradientSoft,
};

const centerWrapStyle = {
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
} as const;

const VARIANTS = {
  default: { stackAt: 'md', imageWidth: { xs: 140, md: 220 }, stackedImageAlign: 'flex-start' },
  hero: {
    stackAt: 'sm',
    imageWidth: { xs: 200, sm: 220, md: 280, lg: 340 },
    stackedImageAlign: 'center',
  },
} as const;

type Variant = (typeof VARIANTS)[keyof typeof VARIANTS];

const headerStyle = ({ stackAt }: Variant): SxProps<Theme> => ({
  ...rowStyle,
  flexWrap: 'nowrap',
  flexDirection: { xs: 'column', [stackAt]: 'row' },
  alignItems: { xs: 'flex-start', [stackAt]: 'center' },
  gap: { xs: 3, md: 5 },
});

const HEADER_IMAGE_MAX = 250;

const rightHeaderStyle = ({ stackAt, imageWidth, stackedImageAlign }: Variant): SxProps<Theme> => ({
  position: 'relative',
  flexShrink: 0,
  order: { xs: -1, [stackAt]: 0 },
  alignSelf: { xs: stackedImageAlign, [stackAt]: 'auto' },
  width: imageWidth,
  height: imageWidth,
  maxWidth: HEADER_IMAGE_MAX,
  maxHeight: HEADER_IMAGE_MAX,
});

const leftHeaderStyle = ({ stackAt }: Variant): SxProps<Theme> => ({
  ...columnStyle,
  alignItems: 'flex-start',
  gap: 2,
  width: { xs: '100%', [stackAt]: 'auto' },
  maxWidth: { xs: '100%', [stackAt]: '60%' },
});

const leftMetaStyle = {
  ...columnStyle,
  gap: 2,
} as const;

const ctaStyle = { display: 'flex', flexWrap: 'wrap', gap: 2 } as const;

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
    variant = 'default',
  } = props;

  const styles = VARIANTS[variant];
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
      {!children && (
        <BackLink label={tS('back')} onSelect={() => router.back()} inlineOnDesktop={false} />
      )}
      {children && <>{children}</>}
      <Box sx={centerWrapStyle}>
        <ScrollReveal sx={{ width: '100%' }}>
          <Box sx={headerStyle(styles)}>
            <Box sx={leftHeaderStyle(styles)}>
              <Typography variant="h1" component="h1" sx={{ mb: 0 }}>
                {title}
              </Typography>
              <Box sx={leftMetaStyle}>
                <Box>{getIntroduction()}</Box>
                {progressStatus && <ProgressStatus status={progressStatus} />}
                {cta && <Box sx={ctaStyle}>{cta}</Box>}
              </Box>
            </Box>
            {imageSrc && (
              <Box sx={rightHeaderStyle(styles)}>
                <Image
                  alt={imageAltText}
                  src={imageSrc}
                  fill
                  priority={variant === 'hero'}
                  sizes={getImageSizes(styles.imageWidth)}
                  style={{
                    objectFit: 'contain',
                  }}
                />
              </Box>
            )}
          </Box>
        </ScrollReveal>
      </Box>
    </Container>
  );
};

export default Header;
