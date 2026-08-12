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
  background?: string;
  browseLabel?: string;
  browseHref?: string;
  divided?: boolean;
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
