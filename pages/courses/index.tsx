import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { StoryData } from 'storyblok-js-client';
import { RootState } from '../../app/store';
import CourseCard from '../../components/cards/CourseCard';
import LoadingContainer from '../../components/common/LoadingContainer';
import Header from '../../components/layout/Header';
import Storyblok from '../../config/storyblok';
import { LANGUAGES, PROGRESS_STATUS } from '../../constants/enums';
import { COURSE_LIST_VIEWED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import illustrationPerson3Pink from '../../public/illustration_person3_pink.svg';
import { columnStyle, rowStyle } from '../../styles/common';
import logEvent, { getEventUserData } from '../../utils/logEvent';

const containerStyle = {
  backgroundColor: 'secondary.light',
  paddingTop: { xs: 2, sm: 6 },
} as const;

const cardColumnStyle = {
  ...columnStyle,
  justifyContent: 'flex-start',
  width: { xs: '100%', md: 'calc(50% - 1rem)' },
  maxWidth: 520,
  gap: { xs: 0, sm: 2, md: 4 },
} as const;

interface Props {
  stories: StoryData[];
  preview: boolean;
  messages: any;
  locale: LANGUAGES;
}

const CourseList: NextPage<Props> = ({ stories, preview, messages, locale }) => {
  const [loadedCourses, setLoadedCourses] = useState<StoryData[] | null>(null);
  const [coursesStarted, setCoursesStarted] = useState<Array<number>>([]);
  const [coursesCompleted, setCoursesCompleted] = useState<Array<number>>([]);
  const { user, partnerAccesses, courses } = useTypedSelector((state: RootState) => state);
  const eventUserData = getEventUserData({ user, partnerAccesses });
  const t = useTranslations('Courses');

  const headerProps = {
    title: t('title'),
    introduction: t('introduction'),
    imageSrc: illustrationPerson3Pink,
    imageAlt: 'alt.personSitting',
  };

  useEffect(() => {
    logEvent(COURSE_LIST_VIEWED, {
      ...eventUserData,
    });
  }, []);

  useEffect(() => {
    if (partnerAccesses.length === 0) {
      const coursesWithAccess = stories.filter((course) =>
        course.content.included_for_partners.includes('Public'),
      );
      setLoadedCourses(coursesWithAccess);
    } else {
      let userPartners: Array<string> = [];

      partnerAccesses.map((partnerAccess) => {
        if (partnerAccess.partner.name) {
          userPartners.push(partnerAccess.partner.name);
        }
      });

      const coursesWithAccess = stories.filter((course) =>
        userPartners.some((partner) => course.content.included_for_partners.includes(partner)),
      );
      setLoadedCourses(coursesWithAccess);
    }

    if (courses) {
      let courseCoursesStarted: Array<number> = [];
      let courseCoursesCompleted: Array<number> = [];
      courses.map((course) => {
        if (course.completed) {
          courseCoursesCompleted.push(course.storyblokId);
        } else {
          courseCoursesStarted.push(course.storyblokId);
        }
      });
      setCoursesStarted(courseCoursesStarted);
      setCoursesCompleted(courseCoursesCompleted);
    }
  }, [partnerAccesses, stories, courses]);

  const getCourseProgress = (courseId: number) => {
    return coursesStarted.includes(courseId)
      ? PROGRESS_STATUS.STARTED
      : coursesCompleted.includes(courseId)
      ? PROGRESS_STATUS.COMPLETED
      : null;
  };

  return (
    <Box>
      <Head>
        <title>{t('title')}</title>
      </Head>
      <Header
        title={headerProps.title}
        introduction={headerProps.introduction}
        imageSrc={headerProps.imageSrc}
        imageAlt={headerProps.imageAlt}
      />
      <Container sx={containerStyle}>
        {loadedCourses === null ? (
          <LoadingContainer />
        ) : loadedCourses.length === 0 ? (
          <Box>
            <Typography>{t('noCourses')}</Typography>
          </Box>
        ) : (
          <Box sx={rowStyle}>
            <Box sx={cardColumnStyle}>
              {loadedCourses.map((course, index) => {
                if (index % 2 === 1) return;
                const courseProgress = getCourseProgress(course.id);
                return (
                  <CourseCard key={course.id} course={course} courseProgress={courseProgress} />
                );
              })}
            </Box>
            <Box sx={cardColumnStyle}>
              {loadedCourses.map((course, index) => {
                if (index % 2 === 0) return;
                const courseProgress = getCourseProgress(course.id);
                return (
                  <CourseCard key={course.id} course={course} courseProgress={courseProgress} />
                );
              })}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export async function getStaticProps({ locale, preview = false }: GetStaticPropsContext) {
  let sbParams = {
    version: preview ? 'draft' : 'published',
    cv: preview ? Date.now() : 0,
    starts_with: 'courses/',
    sort_by: 'position:desc',
    filter_query: {
      component: {
        in: 'Course',
      },
    },
  };

  let { data } = await Storyblok.get('cdn/stories/', sbParams);

  return {
    props: {
      stories: data ? data.stories : null,
      preview,
      messages: {
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/navigation/${locale}.json`),
        ...require(`../../messages/courses/${locale}.json`),
      },
      locale,
    },
    revalidate: 3600, // revalidate every hour
  };
}

export default CourseList;
