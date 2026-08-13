'use client';

import { BackLink } from '@/components/common/BackLink';
import ProgressStatus from '@/components/common/ProgressStatus';
import { Link as i18nLink } from '@/i18n/routing';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { getImageSizes } from '@/lib/utils/imageSizes';
import { RichTextOptions } from '@/lib/utils/richText';
import { columnStyle, pageHeaderPaddingBottom, pageHeaderPaddingTop } from '@/styles/common';
import theme from '@/styles/theme';
import PlaylistPlayRounded from '@mui/icons-material/PlaylistPlayRounded';
import { Box, Button, Container, Divider, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { render, StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

const containerStyle = {
  ...columnStyle,
  paddingTop: pageHeaderPaddingTop,
  paddingBottom: pageHeaderPaddingBottom,
  gap: 3,
  background: theme.palette.bloomGradientSoft,
} as const;

const bodyStyle = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  alignItems: { xs: 'stretch', md: 'center' },
  gap: { xs: 3, md: 6 },
} as const;

const introStyle = {
  ...columnStyle,
  alignItems: 'flex-start',
  gap: 2,
  flex: 1,
  minWidth: 0,
} as const;

const imageStyle = {
  position: 'relative',
  width: { xs: 120, md: 135 },
  height: { xs: 120, md: 135 },
} as const;

// The title and description sit closer together than the surrounding blocks, as designed.
const copyStyle = { display: 'flex', flexDirection: 'column', gap: 1, width: '100%' } as const;

const metaStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  color: 'grey.800',
  fontFamily: 'headingFontFamily',
  fontSize: '0.875rem',
  fontWeight: 500,
} as const;

// The CTA sits in its own panel so it reads as an action rather than part of the course copy.
const ctaPanelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  flexShrink: 0,
  width: { xs: '100%', md: 360 },
  p: 2,
  borderRadius: '8px',
  border: '1px solid',
  borderColor: 'cardBorder',
  backgroundColor: 'pageBackground',
} as const;

const ctaButtonStyle = { width: '100%', maxWidth: 'none' } as const;

interface CourseHeroProps {
  name: string;
  description: StoryblokRichtext;
  imageSrc?: string;
  imageAlt?: string;
  sessionCount: number;
  courseProgress: PROGRESS_STATUS;
  ctaHref?: string;
  ctaLabel: string;
  onCtaClick: () => void;
  backHref: string;
  backLabel: string;
}

export function CourseHero({
  name,
  description,
  imageSrc,
  imageAlt,
  sessionCount,
  courseProgress,
  ctaHref,
  ctaLabel,
  onCtaClick,
  backHref,
  backLabel,
}: CourseHeroProps) {
  const tL = useTranslations('Library');

  return (
    <Container qa-id="course-hero" sx={containerStyle}>
      <BackLink qaId="course-back-link" href={backHref} label={backLabel} />
      <Divider sx={{ borderColor: 'sectionBorder' }} />

      <Box sx={bodyStyle}>
        <Box sx={introStyle}>
          {imageSrc && (
            <Box sx={imageStyle}>
              <Image
                alt={imageAlt ?? ''}
                src={imageSrc}
                fill
                priority
                sizes={getImageSizes(imageStyle.width)}
                style={{ objectFit: 'contain' }}
              />
            </Box>
          )}
          <Box sx={copyStyle}>
            <Typography variant="h1" component="h1" sx={{ mb: 0 }}>
              {name}
            </Typography>
            <Box>{render(description, RichTextOptions)}</Box>
          </Box>
          {courseProgress !== PROGRESS_STATUS.NOT_STARTED && (
            <ProgressStatus status={courseProgress} />
          )}
          <Divider sx={{ width: '100%', borderColor: 'sectionBorder' }} />
          <Typography component="p" sx={metaStyle}>
            <PlaylistPlayRounded sx={{ fontSize: 16 }} />
            {tL('sessionCount', { count: sessionCount })}
          </Typography>
        </Box>

        <Box sx={ctaPanelStyle}>
          <Button
            qa-id="course-cta"
            variant="contained"
            color="error"
            sx={ctaButtonStyle}
            onClick={onCtaClick}
            {...(ctaHref ? { component: i18nLink, href: ctaHref } : {})}
          >
            {ctaLabel}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
