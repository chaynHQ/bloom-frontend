'use client';

import { CardCarousel } from '@/components/common/CardCarousel';
import { LibraryCard } from '@/components/library/LibraryCard';
import { RELATED_GROUNDING_CAROUSEL_PAGED } from '@/lib/constants/events';
import { parseMinutes, toPlainText, type LibraryItem } from '@/lib/utils/libraryData';
import { Box, Divider, Typography } from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useLocale, useTranslations } from 'next-intl';

interface ResourceGroundingSectionProps {
  groundingStories: ISbStoryData[];
  onExerciseSelect?: (story: ISbStoryData, index: number) => void;
}

export const ResourceGroundingSection = ({
  groundingStories,
  onExerciseSelect,
}: ResourceGroundingSectionProps) => {
  const t = useTranslations('Resources.moment');
  const locale = useLocale();

  // Exercises are not available in German, so that locale gets no "moment" section.
  if (locale === 'de' || groundingStories.length === 0) return null;

  const items: LibraryItem[] = groundingStories.map((story) => ({
    id: story.uuid,
    kind: 'session',
    themes: [],
    title: story.content.name as string,
    description: toPlainText(story.content.description),
    href: `/grounding?id=${story.slug}`,
    format: 'grounding',
    minutes: parseMinutes(story.content.duration),
    requiresAccount: false,
  }));

  return (
    <Box qa-id="resource-moment">
      <Divider sx={{ borderColor: 'sectionBorder', mb: 4 }} />
      {/* Wrapper carries the gap to the cards: the global `p:last-of-type` rule zeroes the
          subtitle's own margin. */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" component="h2" sx={{ mb: 0.5 }}>
          {t('title')}
        </Typography>
        <Typography sx={{ maxWidth: 683, color: 'grey.800' }}>{t('subtitle')}</Typography>
      </Box>
      <CardCarousel label={t('title')} controls eventName={RELATED_GROUNDING_CAROUSEL_PAGED}>
        {items.map((item, index) => (
          <LibraryCard
            key={item.id}
            item={item}
            onSelect={
              onExerciseSelect ? () => onExerciseSelect(groundingStories[index], index) : undefined
            }
          />
        ))}
      </CardCarousel>
    </Box>
  );
};
