import { Box, Container, Typography } from '@mui/material';
import { ISbStoryData, useStoryblokState } from '@storyblok/react';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import SessionCard from '../../../components/cards/SessionCard';
import { ContentUnavailable } from '../../../components/common/ContentUnavailable';
import Link from '../../../components/common/Link';
import NoDataAvailable from '../../../components/common/NoDataAvailable';
import CourseHeader from '../../../components/course/CourseHeader';
import CourseIntroduction from '../../../components/course/CourseIntroduction';
import { PROGRESS_STATUS } from '../../../constants/enums';
import { COURSE_OVERVIEW_VIEWED } from '../../../constants/events';
import { useTypedSelector } from '../../../hooks/store';
import { rowStyle } from '../../../styles/common';
import { determineCourseProgress } from '../../../utils/courseProgress';
import { getStoryblokPageProps } from '../../../utils/getStoryblokPageProps';
import hasAccessToPage from '../../../utils/hasAccessToPage';
import { getEventUserData, logEvent } from '../../../utils/logEvent';

const containerStyle = {
  backgroundColor: 'secondary.light',
} as const;

const sessionsContainerStyle = {
  marginTop: 6,
} as const;

const cardsContainerStyle = {
  ...rowStyle,
  flexDirection: { xs: 'column', md: 'row' },
  gap: 4,
} as const;

interface Props {
  story: ISbStoryData | null;
}

const CourseOverview: NextPage<Props> = ({ story }) => {
  story = useStoryblokState(story);

  const t = useTranslations('Courses');
  const tS = useTranslations('Shared');

  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const courses = useTypedSelector((state) => state.courses);

  const [incorrectAccess, setIncorrectAccess] = useState<boolean>(true);
  const [courseProgress, setCourseProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );

  useEffect(() => {
    const storyPartners = story?.content.included_for_partners;

    setIncorrectAccess(!hasAccessToPage(storyPartners, partnerAccesses, partnerAdmin));
  }, [partnerAccesses, story?.content.included_for_partners, partnerAdmin]);

  useEffect(() => {
    if (!story?.id) return;
    setCourseProgress(determineCourseProgress(courses, story.id));
  }, [courses, story?.id]);

  useEffect(() => {
    logEvent(COURSE_OVERVIEW_VIEWED, eventData);
  });

  if (!story) {
    return <NoDataAvailable />;
  }

  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  const eventData = {
    ...eventUserData,
    course_name: story.content.name,
    course_storyblok_id: story.id,
    course_progress: courseProgress,
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
      <CourseHeader story={story} eventData={eventData} courseProgress={courseProgress} />
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
                          storyblokCourseId={(story as ISbStoryData).id}
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

export async function getStaticProps({ locale, preview = false }: GetStaticPropsContext) {
  const storyblokProps = await getStoryblokPageProps(
    'courses/image-based-abuse-and-rebuilding-ourselves/',
    locale,
    preview,
    {
      resolve_relations: 'week.sessions',
    },
  );

  return {
    props: {
      ...storyblokProps,
      messages: {
        ...require(`../../../messages/shared/${locale}.json`),
        ...require(`../../../messages/navigation/${locale}.json`),
        ...require(`../../../messages/courses/${locale}.json`),
      },
    },
    revalidate: 3600, // revalidate every hour
  };
}

export default CourseOverview;
