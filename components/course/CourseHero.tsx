'use client';

import { BackLink } from '@/components/common/BackLink';
import ProgressStatus from '@/components/common/ProgressStatus';
import { CourseCtaPanel } from '@/components/course/CourseCtaPanel';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { splitDuration } from '@/lib/utils/courseSessions';
import { getImageSizes } from '@/lib/utils/imageSizes';
import { RichTextOptions } from '@/lib/utils/richText';
import { columnStyle, pageHeaderPaddingTop } from '@/styles/common';
import theme from '@/styles/theme';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import PlaylistPlayRounded from '@mui/icons-material/PlaylistPlayRounded';
import { Box, Container, Divider, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { render, StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

const containerStyle = {
  ...columnStyle,
  // Compact on mobile so the inline back link sits level with the fixed "Leave this site" button.
  paddingTop: { xs: '0.75rem !important', md: pageHeaderPaddingTop },
  // Tight bottom: the next section's top rule should sit one 16px step below the meta row, matching
  // the gap between the meta row and the divider above it.
  paddingBottom: '1rem !important',
  gap: 3,
  background: theme.palette.bloomGradientSoft,
} as const;

const bodyStyle = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  alignItems: { xs: 'stretch', md: 'flex-start' },
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

const metaRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 2,
} as const;

const metaStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  color: 'grey.800',
  fontFamily: 'headingFontFamily',
  fontSize: '0.875rem',
  fontWeight: 500,
} as const;

interface CourseHeroProps {
  name: string;
  description: StoryblokRichtext;
  imageSrc?: string;
  imageAlt?: string;
  sessionCount: number;
  courseMinutes?: number;
  courseProgress: PROGRESS_STATUS;
  loggedIn: boolean;
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
  courseMinutes,
  courseProgress,
  loggedIn,
  ctaHref,
  ctaLabel,
  onCtaClick,
  backHref,
  backLabel,
}: CourseHeroProps) {
  const tL = useTranslations('Library');

  const durationText = (() => {
    if (courseMinutes == null) return null;
    const { hours, minutes } = splitDuration(courseMinutes);
    if (hours === 0) return tL('duration', { minutes });
    if (minutes === 0) return tL('courseDurationHoursOnly', { hours });
    return tL('courseDuration', { hours, minutes });
  })();

  return (
    <Container qa-id="course-hero" sx={containerStyle}>
      <BackLink qaId="course-back-link" href={backHref} label={backLabel} />

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
          <Box component="p" sx={metaRowStyle}>
            <Box component="span" sx={metaStyle}>
              <PlaylistPlayRounded sx={{ fontSize: 16 }} />
              {tL('sessionCount', { count: sessionCount })}
            </Box>
            {durationText && (
              <Box component="span" sx={metaStyle}>
                <AccessTimeRounded sx={{ fontSize: 16 }} />
                {durationText}
              </Box>
            )}
          </Box>
        </Box>

        <CourseCtaPanel
          loggedIn={loggedIn}
          ctaHref={ctaHref}
          ctaLabel={ctaLabel}
          onCtaClick={onCtaClick}
          offsetForIllustration={Boolean(imageSrc)}
        />
      </Box>
    </Container>
  );
}
