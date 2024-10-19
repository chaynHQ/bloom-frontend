import Header from '../layout/Header';
import { Button, Typography } from '@mui/material';
import theme from '../../styles/theme';
import Link from '../common/Link';
import CircleIcon from '@mui/icons-material/Circle';
import illustrationPerson4Peach from '../../public/illustration_person4_peach.svg';
import { ISbRichtext, ISbStoryData } from '@storyblok/react';
import { PROGRESS_STATUS } from '../../constants/enums';
import { useTranslations } from 'next-intl';

const sessionSubtitleStyle = {
  marginTop: '0.75rem !important',
} as const;
const dotStyle = {
  width: { xs: 8, md: 10 },
  height: { xs: 8, md: 10 },
} as const;

interface SessionHeaderProps {
  description: string | ISbRichtext;
  name: string;
  sessionProgress: PROGRESS_STATUS;
  course: ISbStoryData;
  weekString: string;
  subtitle?: string;
  storyPosition?: number;
}
export const SessionHeader = (props: SessionHeaderProps) => {
  const t = useTranslations('Courses');
  const { description, name, sessionProgress, course, weekString, subtitle, storyPosition } = props;
  const headerProps = {
    title: name,
    introduction: description,
    imageSrc: illustrationPerson4Peach,
    imageAlt: 'alt.personTea',
  };

  return (
    <Header
      title={headerProps.title}
      introduction={headerProps.introduction}
      imageSrc={headerProps.imageSrc}
      imageAlt={headerProps.imageAlt}
      progressStatus={sessionProgress}
    >
      <Button
        variant="outlined"
        href="/courses"
        sx={{ background: theme.palette.background.default }}
        size="small"
        component={Link}
      >
        Courses
      </Button>

      <CircleIcon color="error" sx={{ ...dotStyle, marginX: 1 }} />

      <Button
        variant="outlined"
        sx={{ background: theme.palette.background.default }}
        href={`/${course.full_slug}`}
        size="small"
        component={Link}
      >
        {course.name}
      </Button>
      <Typography sx={sessionSubtitleStyle} variant="body2">
        {weekString} -{' '}
        {storyPosition !== undefined ? `${t('session')} ${storyPosition / 10 - 1}` : subtitle}
      </Typography>
    </Header>
  );
};
