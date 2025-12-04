'use client';

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
  minHeight: { xs: 220, lg: 360 },
  paddingBottom: { xs: '1.5rem !important', md: '5rem !important' },
  background: {
    xs: 'linear-gradient(180deg, #F3D6D8 53.12%, #FFEAE1 100%)',
    md: 'linear-gradient(180deg, #F3D6D8 36.79%, #FFEAE1 73.59%)',
  },
};

const headerStyle = { ...rowStyle, alignItems: 'flex-start', gap: { xs: 3, md: 4 } } as const;

const rightHeaderStyle = {
  position: 'relative',
  width: { xs: 150, md: 210 },
  height: { xs: 150, md: 210 },
  marginLeft: { xs: 'auto', md: 0 },
  marginRight: { xs: '1rem', md: '8%' },
  marginTop: 0,
} as const;

const leftHeaderStyle = {
  ...columnStyle,
  justifyContent: 'space-between',
  width: { xs: '100%', sm: 'auto' },
  maxWidth: { xs: '100%', sm: '80%', md: '55%' },
  mt: { md: -2.5 },
} as const;

export const backButtonStyle = {
  display: { md: 'none' },
  width: '2.5rem',
  height: '2.5rem',
  ...breadcrumbButtonStyle,
} as const;

export const backIconStyle = {
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

  const getIntroduction = () => {
    if (!introduction) return undefined;
    if (typeof introduction === 'string') {
      return <Typography fontSize="1rem !important">{introduction}</Typography>;
    } else if (typeof introduction === 'object' && 'content' in introduction) {
      return render(introduction, RichTextOptions);
    } else {
      return introduction;
    }
  };

  return (
    <Container sx={headerContainerStyle}>
      {!children && (
        <IconButton
          sx={backButtonStyle}
          onClick={() => router.back()}
          aria-label={tS('navigateBack')}
        >
          <KeyboardArrowLeftIcon sx={backIconStyle} />
        </IconButton>
      )}
      {children && <>{children}</>}
      <Box sx={headerStyle}>
        <Box sx={leftHeaderStyle}>
          <Typography variant="h1" component="h1">
            {title}
          </Typography>
          <Box mb={2}>{getIntroduction()}</Box>
          {progressStatus && <ProgressStatus status={progressStatus} />}
          {cta && <Box mt={4}>{cta}</Box>}
        </Box>
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
      </Box>
    </Container>
  );
};

export default Header;
