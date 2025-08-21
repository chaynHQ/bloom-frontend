'use client';

import { RelatedContentCard } from '@/components/cards/RelatedContentCard';
import Carousel, { CarouselItemContainer } from '@/components/common/Carousel';
import { EXERCISE_CATEGORIES, RELATED_CONTENT_CATEGORIES } from '@/lib/constants/enums';
import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import { Container, Typography } from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { StoryblokCoursePageProps } from './StoryblokCoursePage';
import { StoryblokResourceConversationPageProps } from './StoryblokResourceConversationPage';
import { StoryblokResourceShortPageProps } from './StoryblokResourceShortPage';
import { StoryblokResourceSingleVideoPageProps } from './StoryblokResourceSingleVideoPage';
import { StoryblokSessionPageProps } from './StoryblokSessionPage';

export interface StoryblokRelatedContentStory extends Omit<ISbStoryData, 'content'> {
  content:
    | StoryblokCoursePageProps
    | StoryblokSessionPageProps
    | StoryblokResourceConversationPageProps
    | StoryblokResourceShortPageProps
    | StoryblokResourceSingleVideoPageProps;
}

export interface StoryblokRelatedContentProps {
  relatedContent: StoryblokRelatedContentStory[];
  relatedExercises: string[];
  userContentPartners: string[];
}

const containerStyle = {
  paddingY: { xs: 7.5, md: 10, lg: 12.5 },
  backgroundColor: 'secondary.main',
} as const;

export const StoryblokRelatedContent = (props: StoryblokRelatedContentProps) => {
  const { relatedContent, relatedExercises, userContentPartners = [] } = props;
  const locale = useLocale();
  const t = useTranslations('Resources.relatedContent');
  const tExerciseNames = useTranslations('Shared.exerciseNames');

  const relatedExercisesItems =
    locale === 'de'
      ? [] // exercises are not currently available in german so we'll return an empty list for 'de'
      : relatedExercises.map((relatedExerciseId) => {
          const exerciseCategory: EXERCISE_CATEGORIES = relatedExerciseId.includes('grounding-')
            ? EXERCISE_CATEGORIES.GROUNDING
            : EXERCISE_CATEGORIES.ACTIVITIES;

          return {
            id: relatedExerciseId,
            name: tExerciseNames(relatedExerciseId),
            href: `/${exerciseCategory}?openacc=${relatedExerciseId}`,
            category: exerciseCategory,
          };
        });

  const filteredRelatedContent = useMemo(() => {
    return relatedContent.filter((story) => {
      const localeString = locale === 'en' ? 'default' : locale || 'default';
      const storyAvailableForLocale =
        story.content?.languages?.length > 0
          ? story.content.languages.includes(localeString)
          : true;

      if (
        story.content.component === 'resource_short_video' &&
        story.content.included_for_partners?.length > 0
      ) {
        const partners = story.content.included_for_partners;
        const storyIncludedForUserPartners = userContentPartners.some((partner) =>
          partners.map((p: string) => p.toLowerCase()).includes(partner),
        );
        return storyAvailableForLocale && storyIncludedForUserPartners;
      }

      return storyAvailableForLocale;
    });
  }, [relatedContent, locale, userContentPartners]);

  const items = filteredRelatedContent
    .map((relatedContentItem) => (
      <RelatedContentCard
        key={`related_content_${relatedContentItem.id}`}
        title={relatedContentItem.content.name}
        href={getDefaultFullSlug(relatedContentItem.full_slug, locale)}
        category={relatedContentItem.content?.component.toLowerCase() as RELATED_CONTENT_CATEGORIES}
        duration={
          relatedContentItem.content && 'duration' in relatedContentItem.content
            ? relatedContentItem.content.duration
            : undefined
        }
      />
    ))
    .concat(
      relatedExercisesItems.map((relatedExerciseItem) => (
        <RelatedContentCard
          key={`related_exercise_${relatedExerciseItem.id}`}
          title={relatedExerciseItem.name}
          href={relatedExerciseItem.href}
          category={relatedExerciseItem.category}
        />
      )),
    );

  return (
    <Container sx={containerStyle}>
      <Typography variant="h2" mb={3.5}>
        {t('title')}
      </Typography>

      <Carousel
        theme="primary"
        items={items.map((item, index) => (
          <CarouselItemContainer key={index} slidesPerScreen={[1, 2, 3]}>
            {item}
          </CarouselItemContainer>
        ))}
      />
    </Container>
  );
};
