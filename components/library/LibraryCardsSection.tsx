'use client';

import { CardCarousel } from '@/components/common/CardCarousel';
import { Link as i18nLink } from '@/i18n/routing';
import { getImageSizes } from '@/lib/utils/imageSizes';
import { type LibraryItem } from '@/lib/utils/libraryData';
import { sectionDivider } from '@/styles/common';
import { Box, Button, Container, Typography } from '@mui/material';
import Image, { type StaticImageData } from 'next/image';
import { LibraryCard } from './LibraryCard';

interface LibraryCardsSectionProps {
  qaId: string;
  heading: string;
  introduction?: string;
  illustrationSrc?: StaticImageData;
  items: LibraryItem[];
  showAccountNeeded?: boolean;
  // Theme palette token for the section behind the cards.
  background?: string;
  // A "browse all" button is only shown when both a label and a destination are given.
  browseLabel?: string;
  browseHref?: string;
  // Draws a hairline above the section, for the second of two sections sharing one background.
  divided?: boolean;
  // The analytics event fired when the reader moves the row.
  carouselEventName: string;
  onCardSelect: (item: LibraryItem, index: number) => void;
  onBrowseAll?: () => void;
}

const containerStyle = (divided: boolean, background: string) =>
  ({
    backgroundColor: background,
    pt: { xs: 5, md: 6 },
    pb: { xs: 5, md: 8 },
    ...(divided && sectionDivider('top')),
  }) as const;

const headerRowStyle = {
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: 2,
  mb: 4,
} as const;

const illustrationStyle = {
  position: 'relative',
  display: { xs: 'none', sm: 'block' },
  flexShrink: 0,
  width: { sm: 120, md: 150 },
  height: { sm: 120, md: 150 },
} as const;

// A section of library cards under a heading, optionally with a standfirst, an illustration and a
// "browse all" link. Used for the home page's session, course and continue-learning rows.
export function LibraryCardsSection({
  qaId,
  heading,
  introduction,
  illustrationSrc,
  items,
  showAccountNeeded = false,
  background = 'sectionSurface',
  browseLabel,
  browseHref,
  divided = false,
  carouselEventName,
  onCardSelect,
  onBrowseAll,
}: LibraryCardsSectionProps) {
  if (items.length === 0) return null;

  return (
    <Container qa-id={qaId} sx={containerStyle(divided, background)}>
      <Box sx={headerRowStyle}>
        <Box>
          <Typography variant="h2" sx={{ mb: introduction ? 1 : 0 }}>
            {heading}
          </Typography>
          {introduction && <Typography sx={{ color: 'grey.800' }}>{introduction}</Typography>}
        </Box>
        {illustrationSrc && (
          <Box sx={illustrationStyle}>
            {/* Decorative — the heading names the section. */}
            <Image
              alt=""
              src={illustrationSrc}
              fill
              sizes={getImageSizes(illustrationStyle.width)}
              style={{ objectFit: 'contain' }}
            />
          </Box>
        )}
      </Box>

      <CardCarousel
        label={heading}
        controls
        qaId={`${qaId}-cards`}
        eventName={carouselEventName}
        eventData={{ carousel_name: qaId }}
      >
        {items.map((item, index) => (
          <LibraryCard
            key={item.id}
            item={item}
            // A course leads with its illustration; a single session has none, so it stays compact.
            layout={item.kind === 'course' ? 'illustrated' : 'compact'}
            showAccountNeeded={showAccountNeeded}
            onSelect={() => onCardSelect(item, index)}
          />
        ))}
      </CardCarousel>

      {browseLabel && browseHref && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            qa-id={`${qaId}-browse-all`}
            variant="contained"
            color="error"
            component={i18nLink}
            href={browseHref}
            onClick={onBrowseAll}
          >
            {browseLabel}
          </Button>
        </Box>
      )}
    </Container>
  );
}
