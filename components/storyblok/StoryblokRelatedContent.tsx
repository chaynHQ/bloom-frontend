import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { ISbStoryData } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import { rowStyle } from '../../styles/common';
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
}

const cardStyles = { width: '32%', mb: 2 } as const;

export const StoryblokRelatedContent = (props: StoryblokRelatedContentProps) => {
  const { relatedContent, relatedExercises } = props;
  const tExerciseNames = useTranslations('Shared.exerciseNames');

  const relatedExercisesItems = relatedExercises.map((relatedExerciseId) => {
    const pageUrl = relatedExerciseId.includes('grounding-') ? 'grounding' : 'activities';
    return {
      id: relatedExerciseId,
      name: tExerciseNames(relatedExerciseId),
      href: `/${pageUrl}#${relatedExerciseId}`,
    };
  });

  return (
    <Box sx={rowStyle}>
      {relatedContent.map((relatedContentItem) => (
        <Card sx={cardStyles} key={`related_content_${relatedContentItem.id}`}>
          <CardContent>
            <Typography variant="h3">{relatedContentItem.content.name}</Typography>
            <Button href={relatedContentItem.full_slug} variant="contained">
              Open
            </Button>
          </CardContent>
        </Card>
      ))}
      {relatedExercisesItems.map((relatedExerciseItem) => (
        <Card sx={cardStyles} key={`related_exercise_${relatedExerciseItem.id}`}>
          <CardContent>
            <Typography variant="h3">{relatedExerciseItem.name}</Typography>
            <Button href={relatedExerciseItem.href} variant="contained">
              Open
            </Button>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};
