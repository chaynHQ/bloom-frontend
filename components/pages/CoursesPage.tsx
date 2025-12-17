'use client';

import { EmailRemindersSettingsBanner } from '@/components/banner/EmailRemindersSettingsBanner';
import { SignUpBanner } from '@/components/banner/SignUpBanner';
import CourseCard from '@/components/cards/CourseCard';
import LoadingContainer from '@/components/common/LoadingContainer';
import ScrollToSignUpButton from '@/components/common/ScrollToSignUpButton';
import Header from '@/components/layout/Header';
import { useGetUserCoursesQuery } from '@/lib/api';
import { EMAIL_REMINDERS_FREQUENCY, PROGRESS_STATUS } from '@/lib/constants/enums';
import { COURSE_LIST_VIEWED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent from '@/lib/utils/logEvent';
import userHasAccessToPartnerContent from '@/lib/utils/userHasAccessToPartnerContent';
import illustrationCourses from '@/public/illustration_courses.svg';
import { rowStyle } from '@/styles/common';
import theme from '@/styles/theme';
import { Box, Container, Typography, useMediaQuery } from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import NotesFromBloomPromo from '../banner/NotesFromBloomPromo';
import ResourceCarousel from '../common/ResourceCarousel';

const containerStyle = {
  backgroundColor: 'secondary.light',
  paddingTop: { xs: 2, sm: 2, md: 2 },
} as const;

const courseCardsContainer = {
  ...rowStyle,
  mb: 0,
  flexDirection: { xs: 'column', md: 'row' },
  gap: 2,
} as const;

const courseCardContainer = {
  width: { xs: '100%', md: 'calc(50% - 8px)' },
} as const;

const sectionDescription = {
  pb: 4,
  maxWidth: 650,
} as const;
interface Props {
  courseStories: ISbStoryData[];
  conversations: ISbStoryData[];
  shorts: ISbStoryData[];
  somatics: ISbStoryData[];
}
export default function CoursesPage({ courseStories, conversations, shorts, somatics }: Props) {
  const [loadedCourses, setLoadedCourses] = useState<ISbStoryData[] | null>(null);
  const [loadedShorts, setLoadedShorts] = useState<ISbStoryData[] | null>(null);
  const [loadedSomatics, setLoadedSomatics] = useState<ISbStoryData[] | null>(null);
  const [coursesStarted, setCoursesStarted] = useState<Array<string>>([]);
  const [coursesCompleted, setCoursesCompleted] = useState<Array<string>>([]);
  const [showEmailRemindersBanner, setShowEmailRemindersBanner] = useState<boolean>(false);

  const userId = useTypedSelector((state) => state.user.id);
  const isLoggedIn = Boolean(userId);

  const userEmailRemindersFrequency = useTypedSelector(
    (state) => state.user.emailRemindersFrequency,
  );
  const entryPartnerReferral = useTypedSelector((state) => state.user.entryPartnerReferral);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const courses = useTypedSelector((state) => state.courses);
  const searchParams = useSearchParams();
  const sectionQueryParam = searchParams.get('section');
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const headerOffset = isSmallScreen ? 48 : 136;

  const t = useTranslations('Courses');

  const headerProps = {
    title: t('title'),
    introduction: t('introduction'),
    imageSrc: illustrationCourses,
    imageAlt: 'alt.personSitting',
  };

  useGetUserCoursesQuery(undefined, {
    skip: !isLoggedIn,
  });

  useEffect(() => {
    logEvent(COURSE_LIST_VIEWED);
  }, []);

  const setShortsSectionRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      if (sectionQueryParam === 'shorts' && node && loadedCourses) {
        const scrollToY = node.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: scrollToY, behavior: 'smooth' });
      }
    },
    [sectionQueryParam, headerOffset, loadedCourses],
  );

  const setConversationsSectionRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (sectionQueryParam === 'conversations' && node) {
        const scrollToY = node.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: scrollToY, behavior: 'smooth' });
      }
    },
    [sectionQueryParam, headerOffset],
  );

  const setSomaticsSectionRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (sectionQueryParam === 'somatics' && node) {
        const scrollToY = node.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: scrollToY, behavior: 'smooth' });
      }
    },
    [sectionQueryParam, headerOffset],
  );

  useEffect(() => {
    if (
      userEmailRemindersFrequency &&
      userEmailRemindersFrequency === EMAIL_REMINDERS_FREQUENCY.NEVER
    ) {
      setShowEmailRemindersBanner(true);
    }
  }, [userEmailRemindersFrequency]);

  useEffect(() => {
    const referralPartner = Cookies.get('referralPartner') || entryPartnerReferral;
    const userPartners = userHasAccessToPartnerContent(
      partnerAdmin?.partner,
      partnerAccesses,
      referralPartner,
      userId,
    );

    const coursesWithAccess = courseStories.filter((story) =>
      userPartners.some((partner) => {
        return story.content.included_for_partners
          .map((p: string) => p.toLowerCase())
          .includes(partner);
      }),
    );
    const shortsWithAccess = shorts.filter((short) =>
      userPartners.some((partner) => {
        return short.content.included_for_partners
          .map((p: string) => p.toLowerCase())
          .includes(partner);
      }),
    );

    const somaticsWithAccess =
      userPartners.filter((up) => up !== 'public').length > 0 ? null : somatics; // no partners have access to somatics

    setLoadedCourses(coursesWithAccess);
    setLoadedShorts(shortsWithAccess);
    setLoadedSomatics(somaticsWithAccess);

    if (courses) {
      let courseCoursesStarted: Array<string> = [];
      let courseCoursesCompleted: Array<string> = [];
      courses.map((course) => {
        if (course.completed) {
          courseCoursesCompleted.push(course.storyblokUuid);
        } else {
          courseCoursesStarted.push(course.storyblokUuid);
        }
      });
      setCoursesStarted(courseCoursesStarted);
      setCoursesCompleted(courseCoursesCompleted);
    }
  }, [
    partnerAccesses,
    partnerAdmin,
    courseStories,
    courses,
    shorts,
    somatics,
    entryPartnerReferral,
    userId,
  ]);

  const getCourseProgress = (courseId: string) => {
    return coursesStarted.includes(courseId)
      ? PROGRESS_STATUS.STARTED
      : coursesCompleted.includes(courseId)
        ? PROGRESS_STATUS.COMPLETED
        : null;
  };

  return (
    <Box>
      <Header
        title={headerProps.title}
        introduction={headerProps.introduction}
        imageSrc={headerProps.imageSrc}
        imageAlt={headerProps.imageAlt}
        cta={!userId ? <ScrollToSignUpButton /> : undefined}
      />
      <Container sx={containerStyle}>
        {loadedCourses === null ? (
          <LoadingContainer />
        ) : loadedCourses.length === 0 ? (
          <Box>
            <Typography>{t('noCourses')}</Typography>
          </Box>
        ) : (
          <Box sx={courseCardsContainer}>
            {loadedCourses?.map((course, index) => {
              const courseProgress = userId ? getCourseProgress(course.uuid) : null;
              return (
                <Box key={`course_${index}`} sx={courseCardContainer}>
                  <CourseCard key={course.id} course={course} courseProgress={courseProgress} />
                </Box>
              );
            })}
          </Box>
        )}
      </Container>

      {loadedSomatics && loadedSomatics.length > 0 && (
        <Container
          sx={{ backgroundColor: 'secondary.light', pt: '2rem !important' }}
          ref={setSomaticsSectionRef}
        >
          <Typography variant="h2">{t('somaticsHeading')}</Typography>
          <Typography sx={sectionDescription}>{t('somaticsDescription')}</Typography>
          <ResourceCarousel title="somatics-carousel" resources={loadedSomatics} />
        </Container>
      )}

      {conversations.length > 0 && (
        <Container sx={{ backgroundColor: 'secondary.main' }} ref={setConversationsSectionRef}>
          <Typography variant="h2">{t('conversationsHeading')}</Typography>
          <Typography sx={sectionDescription}>{t('conversationsDescription')}</Typography>
          <ResourceCarousel title="conversations-carousel" resources={conversations} />
        </Container>
      )}
      {loadedShorts && loadedShorts?.length > 0 && (
        <Container sx={{ backgroundColor: 'secondary.light' }} ref={setShortsSectionRef}>
          <Typography variant="h2">{t('shortsHeading')}</Typography>
          <Typography sx={sectionDescription}>{t('shortsDescription')}</Typography>
          <ResourceCarousel title="shorts-carousel" resources={loadedShorts} />
        </Container>
      )}
      {!userId && <SignUpBanner />}
      {!!userId && !!showEmailRemindersBanner && <EmailRemindersSettingsBanner />}
      <NotesFromBloomPromo />
    </Box>
  );
}
