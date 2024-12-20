import { Box } from '@mui/material';
import { ISbStoryData } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { EXERCISE_CATEGORIES, RELATED_CONTENT_CATEGORIES } from '../../constants/enums';
import { rowStyle } from '../../styles/common';
import { RelatedContentCard } from '../cards/RelatedContentCard';
import { StoryblokCoursePageProps } from './StoryblokCoursePage';
import { StoryblokResourceConversationPageProps } from './StoryblokResourceConversationPage';
import { StoryblokResourceShortPageProps } from './StoryblokResourceShortPage';
import { StoryblokSessionPageProps } from './StoryblokSessionPage';

const containerStyle = {
  ...rowStyle,
} as const;

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
}

export const StoryblokRelatedContent = (props: StoryblokRelatedContentProps) => {
  const { relatedContent, relatedExercises } = props;
  const tExerciseNames = useTranslations('Shared.exerciseNames');
  const router = useRouter();

  const relatedExercisesItems = relatedExercises.map((relatedExerciseId) => {
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

  const disabledCoursesString = process.env.FF_DISABLED_COURSES;

  const filteredRelatedContent = useMemo(() => {
    return relatedContent.filter(
      (story) =>
        (story.content.languages
          ? story.content.languages.includes(router.locale || 'en')
          : true) && !disabledCoursesString?.includes(`${router.locale}/${story.full_slug}`),
    );
  }, [relatedContent, disabledCoursesString, router.locale]);

  return (
    <Box sx={containerStyle}>
      {filteredRelatedContent.map((relatedContentItem) => (
        <RelatedContentCard
          key={`related_content_${relatedContentItem.id}`}
          title={relatedContentItem.name}
          href={`/${relatedContentItem.full_slug}`}
          category={
            relatedContentItem.content.component.toLowerCase() as RELATED_CONTENT_CATEGORIES
          }
        />
      ))}
      {relatedExercisesItems.map((relatedExerciseItem) => (
        <RelatedContentCard
          key={`related_exercise_${relatedExerciseItem.id}`}
          title={relatedExerciseItem.name}
          href={relatedExerciseItem.href}
          category={relatedExerciseItem.category}
        />
      ))}
    </Box>
  );
};
