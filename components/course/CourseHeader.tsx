'use client';

import { Button } from '@mui/material';
import { ISbRichtext } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { PROGRESS_STATUS } from '../../constants/enums';
import { Link as i18nLink } from '../../i18n/routing';
import theme from '../../styles/theme';
import Header from '../layout/Header';

const buttonStyle = {
  background: theme.palette.background.default,
  boxShadow: 'none !important',
  ':hover': {
    background: 'white',
  },
} as const;

export interface CourseHeaderProps {
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
      <Button variant="outlined" sx={buttonStyle} href="/courses" component={i18nLink} size="small">
        {t('backToCourses')}
      </Button>
    </Header>
  );
};

export default CourseHeader;
