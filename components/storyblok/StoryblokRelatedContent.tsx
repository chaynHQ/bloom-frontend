'use client';

import { RelatedContentCard } from '@/components/cards/RelatedContentCard';
import Carousel, { getSlideWidth } from '@/components/common/Carousel';
import { EXERCISE_CATEGORIES, RELATED_CONTENT_CATEGORIES } from '@/lib/constants/enums';
import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import { Box } from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { StoryblokCoursePageProps } from './StoryblokCoursePage';
import { StoryblokResourceConversationPageProps } from './StoryblokResourceConversationPage';
import { StoryblokResourceShortPageProps } from './StoryblokResourceShortPage';
import { StoryblokSessionPageProps } from './StoryblokSessionPage';

export interface StoryblokRelatedContentStory extends Omit<ISbStoryData, 'content'> {
  content:
    | StoryblokCoursePageProps
    | StoryblokSessionPageProps
    | StoryblokResourceConversationPageProps
    | StoryblokResourceShortPageProps;
}

export interface StoryblokRelatedContentProps {
  relatedContent: StoryblokRelatedContentStory[];
  relatedExercises: string[];
  userContentPartners: string[];
}

export const StoryblokRelatedContent = (props: StoryblokRelatedContentProps) => {
  const { relatedContent, relatedExercises, userContentPartners = [] } = props;
  const tExerciseNames = useTranslations('Shared.exerciseNames');
  const locale = useLocale();

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
      const storyIncludedForUserPartners =
        story.content?.included_for_partners?.length > 0
          ? userContentPartners.some((partner) =>
              story.content?.included_for_partners?.map((p) => p.toLowerCase()).includes(partner),
            )
          : true;
      return storyAvailableForLocale && storyIncludedForUserPartners;
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
    <Box width="100%">
      <Carousel
        showArrows={true}
        arrowPosition="bottom"
        slidesPerView={{
          xs: 1,
          sm: 2,
          md: 3,
          lg: 3,
          xl: 3,
        }}
        items={items.map((item, index) => (
          <Box
            sx={{
              ...(getSlideWidth(1, 2, 3) as any),
            }}
            padding={[0.25, 0.5]}
            key={index}
          >
            {item}
          </Box>
        ))}
        theme="primary"
      />
    </Box>
  );
};
