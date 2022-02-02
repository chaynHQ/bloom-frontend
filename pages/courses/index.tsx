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
import { PROGRESS_STATUS } from '../../constants/enums';
import { COURSE_LIST_VIEWED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import illustrationTeaPeach from '../../public/illustration_tea_peach.png';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import Storyblok from '../../utils/storyblok';

interface Props {
  stories: StoryData[];
  preview: boolean;
  messages: any;
}

const containerStyle = {
  backgroundColor: 'secondary.light',
} as const;

const cardsContainerStyle = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  justifyContent: 'space-between',
  marginTop: { xs: 2, md: 3 },
} as const;

const CourseList: NextPage<Props> = ({ stories, preview, messages }) => {
  const [loadedCourses, setLoadedCourses] = useState<StoryData[]>([]);
  const t = useTranslations('Courses');
  const tS = useTranslations('Shared');
  const [coursesStarted, setCoursesStarted] = useState<Array<number>>([]);
  const [coursesCompleted, setCoursesCompleted] = useState<Array<number>>([]);
  const { user, partnerAccesses, courses } = useTypedSelector((state: RootState) => state);
  const eventUserData = getEventUserData({ user, partnerAccesses });

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

    let partners: Array<string> = [];

    partnerAccesses.map((partnerAccess) => {
      if (partnerAccess.partner.name) {
        partners.push(partnerAccess.partner.name);
      }
    });

    const coursesWithAccess = stories.filter((course) =>
      partners.some((partner) => course.content.included_for_partners.includes(partner)),
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
  }, [partnerAccesses, stories]);

  const headerProps = {
    title: t.rich('title'),
    introduction: t.rich('introduction'),
    imageSrc: illustrationTeaPeach,
    imageAlt: 'alt.personTea',
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
        <Box sx={cardsContainerStyle}>
          {loadedCourses.map((course) => {
            const courseProgress = coursesStarted.includes(course.id)
              ? PROGRESS_STATUS.STARTED
              : coursesCompleted.includes(course.id)
              ? PROGRESS_STATUS.COMPLETED
              : null;
            return <CourseCard key={course.id} course={course} courseProgress={courseProgress} />;
          })}
        </Box>
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
