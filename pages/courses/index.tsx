import { Box, Container, Typography } from '@mui/material';
import { ISbStoriesParams, ISbStoryData, getStoryblokApi } from '@storyblok/react';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { EmailRemindersSettingsBanner } from '../../components/banner/EmailRemindersSettingsBanner';
import { SignUpBanner } from '../../components/banner/SignUpBanner';
import CourseCard from '../../components/cards/CourseCard';
import LoadingContainer from '../../components/common/LoadingContainer';
import Header from '../../components/layout/Header';
import { FeatureFlag } from '../../config/featureFlag';
import { EMAIL_REMINDERS_FREQUENCY, PROGRESS_STATUS } from '../../constants/enums';
import { COURSE_LIST_VIEWED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import illustrationCourses from '../../public/illustration_courses.svg';
import { columnStyle, rowStyle } from '../../styles/common';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import { capitaliseFirstLetter } from '../../utils/strings';

const containerStyle = {
  backgroundColor: 'secondary.light',
  paddingY: { xs: 4, sm: 6, md: 8 },
} as const;

const cardColumnStyle = {
  ...columnStyle,
  justifyContent: 'flex-start',
  margin: { xs: 'auto', md: '0' },
  width: { xs: '100%', md: 'calc(50% - 1rem)' },
  maxWidth: 520,
  gap: { xs: 0, md: 4 },
} as const;

interface Props {
  stories: ISbStoryData[];
}

const CourseList: NextPage<Props> = ({ stories }) => {
  const [loadedCourses, setLoadedCourses] = useState<ISbStoryData[] | null>(null);
  const [coursesStarted, setCoursesStarted] = useState<Array<number>>([]);
  const [coursesCompleted, setCoursesCompleted] = useState<Array<number>>([]);
  const [showEmailRemindersBanner, setShowEmailRemindersBanner] = useState<boolean>(false);

  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const userId = useTypedSelector((state) => state.user.id);
  const userEmailRemindersFrequency = useTypedSelector(
    (state) => state.user.emailRemindersFrequency,
  );
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const courses = useTypedSelector((state) => state.courses);

  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);
  const liveCourseAccess = !!userId; // soon to be retired in issue 1176
  const t = useTranslations('Courses');

  const headerProps = {
    title: t('title'),
    introduction: t('introduction'),
    imageSrc: illustrationCourses,
    imageAlt: 'alt.personSitting',
  };

  useEffect(() => {
    logEvent(COURSE_LIST_VIEWED, eventUserData);
  }, []);

  useEffect(() => {
    if (
      userEmailRemindersFrequency &&
      userEmailRemindersFrequency === EMAIL_REMINDERS_FREQUENCY.NEVER
    ) {
      setShowEmailRemindersBanner(true);
    }
  }, [userEmailRemindersFrequency]);

  useEffect(() => {
    const referralPartner = window.localStorage.getItem('referralPartner');

    if (partnerAdmin && partnerAdmin.partner) {
      const partnerName = partnerAdmin.partner.name;
      const coursesWithAccess = stories.filter((course) =>
        course.content.included_for_partners.includes(partnerName),
      );
      setLoadedCourses(coursesWithAccess);
    } else if (partnerAccesses && partnerAccesses.length > 0) {
      let userPartners: Array<string> = [];

      partnerAccesses.map((partnerAccess) => {
        if (partnerAccess.partner.name) {
          userPartners.push(partnerAccess.partner.name);
        }
      });

      const coursesWithAccess = stories.filter((story) =>
        userPartners.some((partner) => story.content.included_for_partners.includes(partner)),
      );
      setLoadedCourses(coursesWithAccess);
    } else if (referralPartner && !userId) {
      const coursesWithAccess = stories.filter((story) =>
        story.content.included_for_partners.includes(capitaliseFirstLetter(referralPartner)),
      );
      setLoadedCourses(coursesWithAccess);
    } else {
      const coursesWithAccess = stories.filter((story) =>
        story.content.included_for_partners.includes('Public'),
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
  }, [partnerAccesses, partnerAdmin, stories, courses]);

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
        <title>{`${t('title')} • Bloom`}</title>
        <meta property="og:title" content={t('courses')} key="og-title" />
        <meta property="og:description" content={t('introduction')} key="og-description" />
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
              {loadedCourses?.map((course, index) => {
                if (index % 2 === 1) return;
                const courseProgress = userId ? getCourseProgress(course.id) : null;
                return (
                  <CourseCard
                    key={course.id}
                    course={course}
                    courseProgress={courseProgress}
                    liveCourseAccess={liveCourseAccess}
                  />
                );
              })}
            </Box>
            <Box sx={cardColumnStyle}>
              {loadedCourses?.map((course, index) => {
                if (index % 2 === 0) return;
                const courseProgress = userId ? getCourseProgress(course.id) : null;
                return (
                  <CourseCard
                    key={course.id}
                    course={course}
                    courseProgress={courseProgress}
                    liveCourseAccess={liveCourseAccess}
                  />
                );
              })}
            </Box>
          </Box>
        )}
      </Container>
      {!userId && <SignUpBanner />}
      {!!userId && !!showEmailRemindersBanner && <EmailRemindersSettingsBanner />}
    </Box>
  );
};

export async function getStaticProps({ locale, preview = false }: GetStaticPropsContext) {
  let sbParams: ISbStoriesParams = {
    language: locale || 'en',
    version: preview ? 'draft' : 'published',
    starts_with: 'courses/',
    sort_by: 'position:description',
    filter_query: {
      component: {
        in: 'Course',
      },
    },
  };

  const storyblokApi = getStoryblokApi();

  let { data } = await storyblokApi.get('cdn/stories/', sbParams);

  return {
    props: {
      stories: data ? getEnabledCourses(data.stories) : null,
      messages: {
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/navigation/${locale}.json`),
        ...require(`../../messages/courses/${locale}.json`),
        ...require(`../../messages/account/${locale}.json`),
      },
    },
    revalidate: 3600, // revalidate every hour
  };
}

// TODO remove this when hindi and french courses are fixed
const getEnabledCourses = (courseStories: ISbStoryData[]): ISbStoryData[] => {
  // Note that this filter only removes the course from the courses page for the user.
  // If the user navigates to the URL, they may still be able to access the course.
  return courseStories.filter((course) => !FeatureFlag.getDisabledCourses().has(course.full_slug));
};

export default CourseList;
