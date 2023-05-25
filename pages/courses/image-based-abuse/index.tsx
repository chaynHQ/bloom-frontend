import { Box, Button, Container, Typography } from '@mui/material';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { StoriesParams, StoryData } from 'storyblok-js-client';
import { Course } from '../../../app/coursesSlice';
import { RootState } from '../../../app/store';
import SessionCard from '../../../components/cards/SessionCard';
import { ContentUnavailable } from '../../../components/common/ContentUnavailable';
import Link from '../../../components/common/Link';
import CourseIntroduction from '../../../components/course/CourseIntroduction';
import Header from '../../../components/layout/Header';
import Storyblok, { useStoryblok } from '../../../config/storyblok';
import { LANGUAGES, PROGRESS_STATUS } from '../../../constants/enums';
import { COURSE_OVERVIEW_VIEWED } from '../../../constants/events';
import { useTypedSelector } from '../../../hooks/store';
import { columnStyle, rowStyle } from '../../../styles/common';
import hasAccessToPage from '../../../utils/hasAccessToPage';
import { getEventUserData, logEvent } from '../../../utils/logEvent';

const containerStyle = {
  backgroundColor: 'secondary.light',
} as const;

const accessContainerStyle = {
  ...columnStyle,
  height: '100vh',
} as const;

const sessionsContainerStyle = {
  marginTop: 6,
} as const;

const cardsContainerStyle = {
  ...rowStyle,
  flexDirection: { xs: 'column', md: 'row' },
  gap: 4,
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 150, md: 210 },
  height: { xs: 150, md: 210 },
  marginBottom: 4,
} as const;

interface Props {
  story: StoryData;
  preview: boolean;
  sbParams: StoriesParams;
  locale: LANGUAGES;
}

const CourseOverview: NextPage<Props> = ({ story, preview, sbParams, locale }) => {
  const t = useTranslations('Courses');
  const tS = useTranslations('Shared');

  story = useStoryblok(story, preview, sbParams, locale);

  const { user, partnerAccesses, partnerAdmin, courses } = useTypedSelector(
    (state: RootState) => state,
  );
  const [incorrectAccess, setIncorrectAccess] = useState<boolean>(true);
  const [courseProgress, setCourseProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );

  const eventUserData = getEventUserData({ user, partnerAccesses, partnerAdmin });

  const eventData = {
    ...eventUserData,
    course_name: story.content.name,
    course_storyblok_id: story.id,
    course_progress: courseProgress,
  };

  useEffect(() => {
    const storyPartners = story.content.included_for_partners;
    setIncorrectAccess(!hasAccessToPage(storyPartners, partnerAccesses, partnerAdmin));

    const userCourse = courses.find((course: Course) => course.storyblokId === story.id);

    if (userCourse) {
      setCourseProgress(userCourse.completed ? PROGRESS_STATUS.COMPLETED : PROGRESS_STATUS.STARTED);
    }
  }, [partnerAccesses, story, courses, courseProgress]);

  useEffect(() => {
    logEvent(COURSE_OVERVIEW_VIEWED, eventData);
  }, []);

  const headerProps = {
    title: story.content.name,
    introduction: story.content.description,
    imageSrc: story.content.image_with_background?.filename,
    translatedImageAlt: story.content.image_with_background?.alt,
  };

  if (incorrectAccess) {
    return (
      <ContentUnavailable
        title={t('accessGuard.title')}
        message={t.rich('accessGuard.introduction', {
          contactLink: (children) => <Link href="/courses">{children}</Link>,
        })}
      />
    );
  }

  return (
    <Box>
      <Head>
        <title>{story.content.name}</title>
      </Head>
      <Header
        title={headerProps.title}
        introduction={headerProps.introduction}
        imageSrc={headerProps.imageSrc}
        translatedImageAlt={headerProps.translatedImageAlt}
        progressStatus={courseProgress!}
      >
        <Button variant="outlined" href="/courses" size="small" component={Link}>
          {t('backToCourses')}
        </Button>
      </Header>
      <Container sx={containerStyle}>
        <>
          {story.content.video && <CourseIntroduction course={story} eventData={eventData} />}
          <Box sx={sessionsContainerStyle}>
            {story.content.weeks.map((week: any) => {
              return (
                <Box mb={6} key={week.name.split(':')[0]}>
                  <Typography mb={{ xs: 0, md: 3.5 }} key={week.name} component="h2" variant="h2">
                    {week.name}
                  </Typography>
                  <Box sx={cardsContainerStyle}>
                    {week.sessions.map((session: any) => {
                      return (
                        <SessionCard
                          key={session.id}
                          session={session}
                          sessionSubtitle={session.content.subtitle}
                          storyblokCourseId={story.id}
                        />
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </>
      </Container>
    </Box>
  );
};

export async function getStaticProps({ locale, preview = false, params }: GetStaticPropsContext) {
  const sbParams = {
    resolve_relations: 'week.sessions',
    version: preview ? 'draft' : 'published',
    language: locale,
    ...(preview && { cv: Date.now() }),
  };

  let { data } = await Storyblok.get(`cdn/stories/courses/image-based-abuse/`, sbParams);
  return {
    props: {
      story: data ? data.story : null,
      preview,
      sbParams: JSON.stringify(sbParams),
      messages: {
        ...require(`../../../messages/shared/${locale}.json`),
        ...require(`../../../messages/navigation/${locale}.json`),
        ...require(`../../../messages/courses/${locale}.json`),
      },
      locale,
    },
    revalidate: 3600, // revalidate every hour
  };
}

export default CourseOverview;
