'use client';

import { CardCarousel } from '@/components/common/CardCarousel';
import { LibraryCard } from '@/components/library/LibraryCard';
import { RELATED_CONTENT_CAROUSEL_PAGED } from '@/lib/constants/events';
import { storyToLibraryItem, toLibraryStory } from '@/lib/utils/libraryData';
import { Box, Container, Typography } from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { StoryblokCoursePageProps } from './StoryblokCoursePage';
import { StoryblokResourceActivityPageProps } from './StoryblokResourceActivityPage';
import { StoryblokResourceAudioPageProps } from './StoryblokResourceAudioPage';
import { StoryblokResourceConversationPageProps } from './StoryblokResourceConversationPage';
import { StoryblokResourceShortPageProps } from './StoryblokResourceShortPage';
import { StoryblokResourceSingleVideoPageProps } from './StoryblokResourceSingleVideoPage';
import { StoryblokResourceWrittenPageProps } from './StoryblokResourceWrittenPage';
import { StoryblokSessionPageProps } from './StoryblokSessionPage';

export interface StoryblokRelatedContentStory extends Omit<ISbStoryData, 'content'> {
  content:
    | StoryblokCoursePageProps
    | StoryblokSessionPageProps
    | StoryblokResourceConversationPageProps
    | StoryblokResourceShortPageProps
    | StoryblokResourceSingleVideoPageProps
    | StoryblokResourceAudioPageProps
    | StoryblokResourceWrittenPageProps
    | StoryblokResourceActivityPageProps;
}

export interface StoryblokRelatedContentProps {
  relatedContent: StoryblokRelatedContentStory[];
  userContentPartners: string[];
}

const containerStyle = {
  paddingY: { xs: 6, md: 8 },
  backgroundColor: 'secondary.light',
} as const;

export const StoryblokRelatedContent = ({
  relatedContent = [],
  userContentPartners = [],
}: StoryblokRelatedContentProps) => {
  const locale = useLocale();
  const t = useTranslations('Resources.relatedContent');

  const items = useMemo(() => {
    const localeString = locale === 'en' ? 'default' : locale || 'default';

    return relatedContent
      .filter((story) => {
        const availableForLocale =
          (story.content?.languages?.length ?? 0) > 0
            ? story.content.languages.includes(localeString)
            : true;

        const includedForPartners = story.content.included_for_partners;
        if (includedForPartners?.length) {
          const partners = includedForPartners.map((p) => p.toLowerCase());
          return availableForLocale && userContentPartners.some((p) => partners.includes(p));
        }
        return availableForLocale;
      })
      .map((story) => storyToLibraryItem(toLibraryStory(story as unknown as ISbStoryData), locale));
  }, [relatedContent, locale, userContentPartners]);

  if (items.length === 0) return null;

  return (
    <Container sx={containerStyle}>
      {/* Wrapper carries the gap to the cards: the global `p:last-of-type` rule zeroes the
          subtitle's own margin. */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h2" sx={{ mb: 0.5 }}>
          {t('title')}
        </Typography>
        <Typography sx={{ color: 'grey.800' }}>{t('subtitle')}</Typography>
      </Box>
      <CardCarousel label={t('title')} controls eventName={RELATED_CONTENT_CAROUSEL_PAGED}>
        {items.map((item) => (
          <LibraryCard key={item.id} item={item} />
        ))}
      </CardCarousel>
    </Container>
  );
};
