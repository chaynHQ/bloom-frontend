'use client';

import ProgressStatus from '@/components/common/ProgressStatus';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { getImageSizes } from '@/lib/utils/imageSizes';
import { RichTextOptions } from '@/lib/utils/richText';
// Calm fallback, shared with the session hero, for resource types whose CMS entry has no hero image.
import illustrationDefault from '@/public/illustration_person4_peach.svg';
import { Box, Divider, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { type ReactNode } from 'react';
import { render, type StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

// Centred against the image by default; top-aligned when `badges` add height below the description.
const rowStyle = (hasBadges: boolean) =>
  ({
    display: 'flex',
    alignItems: hasBadges ? 'flex-start' : 'center',
    gap: 2,
  }) as const;

const imageStyle = {
  position: 'relative',
  flexShrink: 0,
  width: { xs: 100, md: 134 },
  height: { xs: 100, md: 134 },
  borderRadius: '50%',
  overflow: 'hidden',
  backgroundColor: 'secondary.light',
} as const;

interface ResourceHeroProps {
  title: string;
  progress: PROGRESS_STATUS;
  description: string | StoryblokRichtext;
  subtitle?: string;
  imageSrc?: string;
  imageAlt?: string;
  // Format / "account needed" badges, shown below the description on the signed-out preview only.
  badges?: ReactNode;
}

export const ResourceHero = ({
  title,
  progress,
  description,
  subtitle,
  imageSrc,
  imageAlt,
  badges,
}: ResourceHeroProps) => {
  const tS = useTranslations('Shared');

  return (
    <Box qa-id="resource-hero">
      <Box sx={rowStyle(Boolean(badges))}>
        <Box sx={imageStyle}>
          <Image
            alt={imageSrc ? (imageAlt ?? '') : tS('alt.personTea')}
            src={imageSrc ?? illustrationDefault}
            fill
            priority
            sizes={getImageSizes(imageStyle.width)}
            style={{ objectFit: 'contain', padding: '14%' }}
          />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h1" component="h1" sx={{ mb: 0 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography component="p" sx={{ mt: 1, mb: 0, color: 'grey.800' }}>
              {subtitle}
            </Typography>
          )}
          {progress !== PROGRESS_STATUS.NOT_STARTED && (
            <Box sx={{ mt: 2 }}>
              <ProgressStatus status={progress} />
            </Box>
          )}
          {description &&
            (typeof description === 'string' ? (
              <Typography sx={{ mt: 2 }}>{description}</Typography>
            ) : (
              <Box sx={{ mt: 2 }}>{render(description, RichTextOptions)}</Box>
            ))}
          {badges && <Box sx={{ mt: 2 }}>{badges}</Box>}
        </Box>
      </Box>

      <Divider sx={{ mt: 3, borderColor: 'sectionBorder' }} />
    </Box>
  );
};
