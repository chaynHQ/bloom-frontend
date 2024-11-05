import CircleIcon from '@mui/icons-material/Circle';
import { Button, Typography } from '@mui/material';
import { ISbRichtext, ISbStoryData } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { PROGRESS_STATUS } from '../../constants/enums';
import illustrationPerson4Peach from '../../public/illustration_person4_peach.svg';
import theme from '../../styles/theme';
import Link from '../common/Link';
import Header from '../layout/Header';

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
  subtitle?: string;
  storyUuid: string;
  storyPosition?: number;
}

export const SessionHeader = (props: SessionHeaderProps) => {
  const { description, name, sessionProgress, course, subtitle, storyUuid, storyPosition } = props;
  const [weekString, setWeekString] = useState<string>('');

  const t = useTranslations('Courses');

  const headerProps = {
    title: name,
    introduction: description,
    imageSrc: illustrationPerson4Peach,
    imageAlt: 'alt.personTea',
  };

  useEffect(() => {
    course.content.weeks.map((week: any) => {
      week.sessions.map((session: any) => {
        if (session === storyUuid) {
          setWeekString(week.name);
        }
      });
    });
  }, [storyUuid, course.content.weeks]);

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
