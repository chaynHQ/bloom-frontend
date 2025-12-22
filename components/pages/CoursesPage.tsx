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
import { useCookieReferralPartner } from '@/lib/hooks/useCookieReferralPartner';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent from '@/lib/utils/logEvent';
import userHasAccessToPartnerContent from '@/lib/utils/userHasAccessToPartnerContent';
import illustrationCourses from '@/public/illustration_courses.svg';
import { rowStyle } from '@/styles/common';
import theme from '@/styles/theme';
import { Box, Container, Typography, useMediaQuery } from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
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
  const userId = useTypedSelector((state) => state.user.id);
  const authStateLoading = useTypedSelector((state) => state.user.authStateLoading);
  const isLoggedIn = !authStateLoading && Boolean(userId);

  const userEmailRemindersFrequency = useTypedSelector(
    (state) => state.user.emailRemindersFrequency,
  );
  const referralPartner = useCookieReferralPartner();
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

  // Derive loaded content based on user access
  const { loadedCourses, loadedShorts, loadedSomatics } = useMemo(() => {
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

    return {
      loadedCourses: coursesWithAccess,
      loadedShorts: shortsWithAccess,
      loadedSomatics: somaticsWithAccess,
    };
  }, [partnerAccesses, partnerAdmin, courseStories, shorts, somatics, referralPartner, userId]);

  // Derive course progress from courses state
  const { coursesStarted, coursesCompleted } = useMemo(() => {
    if (!courses) return { coursesStarted: [], coursesCompleted: [] };

    const started: Array<string> = [];
    const completed: Array<string> = [];
    courses.forEach((course) => {
      if (course.completed) {
        completed.push(course.storyblokUuid);
      } else {
        started.push(course.storyblokUuid);
      }
    });
    return { coursesStarted: started, coursesCompleted: completed };
  }, [courses]);

  // Derive email reminders banner visibility
  const showEmailRemindersBanner = useMemo(
    () => userEmailRemindersFrequency === EMAIL_REMINDERS_FREQUENCY.NEVER,
    [userEmailRemindersFrequency],
  );

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
        cta={!isLoggedIn ? <ScrollToSignUpButton /> : undefined}
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
              const courseProgress = isLoggedIn ? getCourseProgress(course.uuid) : null;
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
      {!isLoggedIn && <SignUpBanner />}
      {isLoggedIn && !!showEmailRemindersBanner && <EmailRemindersSettingsBanner />}
      <NotesFromBloomPromo />
    </Box>
  );
}
