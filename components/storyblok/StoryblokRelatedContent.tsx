'use client';

import { CardCarousel } from '@/components/common/CardCarousel';
import { LibraryCard } from '@/components/library/LibraryCard';
import {
  RELATED_RESOURCES_CARD_CLICKED,
  RELATED_RESOURCES_CAROUSEL_PAGED,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { useUserAuthStatus } from '@/lib/hooks/useUserAuthStatus';
import { storyToLibraryItem, toLibraryStory, type LibraryItem } from '@/lib/utils/libraryData';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import { filterStoriesForLocaleAndPartnerAccess } from '@/lib/utils/partnerContentAccess';
import { Box, Container, Typography } from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { StoryblokCoursePageProps } from './StoryblokCoursePage';
import { StoryblokResourceActivityPageProps } from './StoryblokResourceActivityPage';
import { StoryblokResourceAudioPageProps } from './StoryblokResourceAudioPage';
import { StoryblokResourceVideoPageProps } from './StoryblokResourceVideoPage';
import { StoryblokResourceWrittenPageProps } from './StoryblokResourceWrittenPage';
import { StoryblokSessionPageProps } from './StoryblokSessionPage';

export interface StoryblokRelatedContentStory extends Omit<ISbStoryData, 'content'> {
  content:
    | StoryblokCoursePageProps
    | StoryblokSessionPageProps
    | StoryblokResourceVideoPageProps
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
  const isSignedIn = useUserAuthStatus() === 'signedIn';
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  const items = useMemo(
    () =>
      filterStoriesForLocaleAndPartnerAccess(relatedContent, locale, userContentPartners).map(
        (story) => storyToLibraryItem(toLibraryStory(story as unknown as ISbStoryData), locale),
      ),
    [relatedContent, locale, userContentPartners],
  );

  if (items.length === 0) return null;

  const logCardClick = (item: LibraryItem, index: number) =>
    logEvent(RELATED_RESOURCES_CARD_CLICKED, {
      related_resource_name: item.title,
      related_resource_storyblok_uuid: item.id,
      related_resource_category: item.format ?? item.kind,
      related_resource_position: index + 1,
      ...getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin),
    });

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
      <CardCarousel label={t('title')} controls eventName={RELATED_RESOURCES_CAROUSEL_PAGED}>
        {items.map((item, index) => (
          <LibraryCard
            key={item.id}
            item={item}
            showAccountNeeded={!isSignedIn}
            onSelect={() => logCardClick(item, index)}
          />
        ))}
      </CardCarousel>
    </Container>
  );
};
