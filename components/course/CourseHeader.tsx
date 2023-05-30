import Button from '@mui/material/Button';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { StoryData } from 'storyblok-js-client';
import { PROGRESS_STATUS } from '../../constants/enums';
import { COURSE_OVERVIEW_VIEWED } from '../../constants/events';
import logEvent from '../../utils/logEvent';
import Link from '../common/Link';
import Header from '../layout/Header';

export interface CourseHeaderProps {
  story: StoryData;
  courseProgress: PROGRESS_STATUS;
  eventData: {};
}
const CourseHeader = (props: CourseHeaderProps) => {
  const { story, courseProgress, eventData } = props;

  useEffect(() => {
    logEvent(COURSE_OVERVIEW_VIEWED, eventData);
  }, []);

  const headerProps = {
    title: story.content.name,
    introduction: story.content.description,
    imageSrc: story.content.image_with_background?.filename,
    translatedImageAlt: story.content.image_with_background?.alt,
    progressStatus: courseProgress,
  };

  const t = useTranslations('Courses');

  return (
    <Header {...headerProps}>
      <Button variant="outlined" href="/courses" size="small" component={Link}>
        {t('backToCourses')}
      </Button>
    </Header>
  );
};

export default CourseHeader;
