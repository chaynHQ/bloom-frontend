import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { ISbStoryData } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { rowStyle } from '../../styles/common';
import Link from '../common/Link';
import { StoryblokCoursePageProps } from './StoryblokCoursePage';
import { StoryblokResourceConversationPageProps } from './StoryblokResourceConversationPage';
import { StoryblokResourceShortPageProps } from './StoryblokResourceShortPage';
import { StoryblokSessionPageProps } from './StoryblokSessionPage';

const containerStyle = {
  ...rowStyle,
} as const;

const cardStyle = {
  mt: 0,
  width: { xs: '100%', sm: 'calc(50% - 0.75rem)', md: 'calc(33% - 0.75rem)' },
  mb: { xs: '1rem', sm: '1.5rem' },
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
    const pageUrl = relatedExerciseId.includes('grounding-') ? 'grounding' : 'activities';
    return {
      id: relatedExerciseId,
      name: tExerciseNames(relatedExerciseId),
      href: `/${pageUrl}?openacc=${relatedExerciseId}`,
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
  }, [relatedContent]);

  return (
    <Box sx={containerStyle}>
      {filteredRelatedContent.map((relatedContentItem) => (
        <Card sx={cardStyle} key={`related_content_${relatedContentItem.id}`}>
          <CardContent>
            <Typography variant="h3">{relatedContentItem.content.name}</Typography>
            <Button component={Link} href={`/${relatedContentItem.full_slug}`} variant="contained">
              Open
            </Button>
          </CardContent>
        </Card>
      ))}
      {relatedExercisesItems.map((relatedExerciseItem) => (
        <Card sx={cardStyle} key={`related_exercise_${relatedExerciseItem.id}`}>
          <CardContent>
            <Typography variant="h3">{relatedExerciseItem.name}</Typography>
            <Button component={Link} href={relatedExerciseItem.href} variant="contained">
              Open
            </Button>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};
