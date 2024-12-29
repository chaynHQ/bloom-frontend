import { Box } from '@mui/material';
import { ISbStoryData } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { EXERCISE_CATEGORIES, RELATED_CONTENT_CATEGORIES } from '../../constants/enums';
import { RelatedContentCard } from '../cards/RelatedContentCard';
import Carousel, { getSlideWidth } from '../common/Carousel';
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
    return relatedContent.filter((story) => {
      const locale = router.locale === 'en' ? 'default' : router.locale || 'default';

      return (
        (story.content?.languages ? story.content.languages.includes(locale) : true) &&
        (story.content && 'included_for_partners' in story.content
          ? 'included_for_partners' in story.content &&
            userContentPartners.some(
              (partner) =>
                'included_for_partners' in story.content &&
                story.content?.included_for_partners?.map((p) => p.toLowerCase()).includes(partner),
            )
          : true) &&
        !disabledCoursesString?.includes(`${router.locale}/${story.full_slug}`)
      );
    });
  }, [relatedContent, disabledCoursesString, router.locale]);
  let items = filteredRelatedContent
    .map((relatedContentItem) => (
      <RelatedContentCard
        key={`related_content_${relatedContentItem.id}`}
        title={relatedContentItem.content.name}
        href={`/${relatedContentItem.full_slug}`}
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
