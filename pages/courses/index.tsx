import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { StoryData } from 'storyblok-js-client';
import { RootState } from '../../app/store';
import CourseCard from '../../components/CourseCard';
import Header from '../../components/Header';
import Storyblok from '../../config/storyblok';
import { PROGRESS_STATUS } from '../../constants/enums';
import { COURSE_LIST_VIEWED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import illustrationPerson3Pink from '../../public/illustration_person3_pink.svg';
import logEvent, { getEventUserData } from '../../utils/logEvent';

interface Props {
  stories: StoryData[];
  preview: boolean;
  messages: any;
}

const containerStyle = {
  backgroundColor: 'secondary.light',
  paddingTop: { xs: 2, sm: 6 },
} as const;

const cardsContainerStyle = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
} as const;

const cardColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: { xs: '100%', sm: 'calc(50% - 1rem)' },
  gap: { xs: 0, sm: 2, md: 4 },
} as const;

const CourseList: NextPage<Props> = ({ stories, preview, messages }) => {
  const [loadedCourses, setLoadedCourses] = useState<StoryData[]>([]);
  const t = useTranslations('Courses');
  const [coursesStarted, setCoursesStarted] = useState<Array<number>>([]);
  const [coursesCompleted, setCoursesCompleted] = useState<Array<number>>([]);
  const { user, partnerAccesses, courses } = useTypedSelector((state: RootState) => state);
  const eventUserData = getEventUserData({ user, partnerAccesses });

  const headerProps = {
    title: t.rich('title'),
    introduction: t.rich('introduction'),
    imageSrc: illustrationPerson3Pink,
    imageAlt: 'alt.personSitting',
  };

  useEffect(() => {
    logEvent(COURSE_LIST_VIEWED, {
      ...eventUserData,
    });
  }, []);

  useEffect(() => {
    if (!partnerAccesses) {
      const coursesWithAccess = stories.filter((course) =>
        course.content.included_for_partners.includes('Public'),
      );
      setLoadedCourses(coursesWithAccess);
    }

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

    if (courses) {
      let courseCoursesStarted: Array<number> = [];
      let courseCoursesCompleted: Array<number> = [];
      courses.map((course) => {
        if (course.completed) {
          courseCoursesCompleted.push(Number(course.storyblokId));
        } else {
          courseCoursesStarted.push(Number(course.storyblokId));
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
        {loadedCourses.length === 0 ? (
          <Box>
            <Typography component="p" variant="body1">
              {t('noCourses')}
            </Typography>
          </Box>
        ) : (
          <Box sx={cardsContainerStyle}>
            <Box sx={cardColumnStyle}>
              {loadedCourses.map((course, index) => {
                if (index % 2 === 0) return;
                const courseProgress = getCourseProgress(course.id);
                return (
                  <CourseCard key={course.id} course={course} courseProgress={courseProgress} />
                );
              })}
            </Box>
            <Box sx={cardColumnStyle}>
              {loadedCourses.map((course, index) => {
                if (index % 2 === 1) return;
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
    },
    revalidate: 3600, // revalidate every hour
  };
}

export default CourseList;
