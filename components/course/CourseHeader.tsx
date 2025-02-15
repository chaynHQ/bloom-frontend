'use client';

import Header from '@/components/layout/Header';
import { Link as i18nLink } from '@/i18n/routing';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { breadcrumbButtonStyle } from '@/styles/common';
import { Button } from '@mui/material';
import { ISbRichtext } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';

interface CourseHeaderProps {
  name: string;
  description: ISbRichtext;
  image_with_background: { filename: string; alt: string };
  courseProgress: PROGRESS_STATUS;
  eventData: { [key: string]: any };
}

const CourseHeader = (props: CourseHeaderProps) => {
  const { name, description, image_with_background, courseProgress } = props;

  const headerProps = {
    title: name,
    introduction: description,
    imageSrc: image_with_background?.filename,
    translatedImageAlt: image_with_background?.alt,
    progressStatus: courseProgress,
  };

  const t = useTranslations('Courses');

  return (
    <Header {...headerProps}>
      <Button
        variant="contained"
        sx={breadcrumbButtonStyle}
        href="/courses"
        component={i18nLink}
        size="small"
      >
        {t('backToCourses')}
      </Button>
    </Header>
  );
};

export default CourseHeader;
