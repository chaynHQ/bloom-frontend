'use client';

import Header from '@/components/layout/Header';
import { Link as i18nLink } from '@/i18n/routing';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import illustrationPerson4Peach from '@/public/illustration_person4_peach.svg';
import theme from '@/styles/theme';
import CircleIcon from '@mui/icons-material/Circle';
import { Button, Typography } from '@mui/material';
import { ISbRichtext, ISbStoryData } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const buttonStyle = {
  background: theme.palette.background.default,
  boxShadow: 'none !important',
  ':hover': {
    background: 'white',
  },
} as const;

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
      <Button variant="contained" href="/courses" sx={buttonStyle} size="small">
        Courses
      </Button>

      <CircleIcon color="error" sx={{ ...dotStyle, marginX: 1 }} />

      <Button
        variant="contained"
        sx={buttonStyle}
        href={`/${course.full_slug}`}
        component={i18nLink}
        size="small"
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
