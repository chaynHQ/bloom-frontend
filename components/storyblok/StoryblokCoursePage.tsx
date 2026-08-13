'use client';

import { type CardProgress } from '@/components/cards/CardStatusBadge';
import { ContentUnavailable } from '@/components/common/ContentUnavailable';
import LoadingContainer from '@/components/common/LoadingContainer';
import { SignUpSection } from '@/components/common/SignUpSection';
import { CourseHero } from '@/components/course/CourseHero';
import CourseIntroduction from '@/components/course/CourseIntroduction';
import { CourseSessionList } from '@/components/course/CourseSessionList';
import { OtherCourses } from '@/components/course/OtherCourses';
import { useGetUserCoursesQuery } from '@/lib/api';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import {
  COURSE_OTHER_COURSE_CLICKED,
  COURSE_OVERVIEW_VIEWED,
  COURSE_SESSION_CLICKED,
  COURSE_START_CLICKED,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { useCookieReferralPartner } from '@/lib/hooks/useCookieReferralPartner';
import { useIsUserLoading } from '@/lib/hooks/useIsUserLoading';
import { useLibraryItems } from '@/lib/hooks/useLibraryItems';
import { useScrollToSignUp } from '@/lib/hooks/useScrollToSignUp';
import { determineCourseProgress } from '@/lib/utils/courseProgress';
import { getCourseSessions, type CourseSession } from '@/lib/utils/courseSessions';
import hasAccessToPage from '@/lib/utils/hasAccessToPage';
import { type LibraryItem, type LibraryStory } from '@/lib/utils/libraryData';
import logEvent from '@/lib/utils/logEvent';
import { Box, Container } from '@mui/material';
import { useStoryblokState } from '@storyblok/react';
import { ISbStoryData, storyblokEditable } from '@storyblok/react/rsc';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef } from 'react';
import { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

const OTHER_COURSES_SHOWN = 2;

// The redesign has no slot for the course intro video, but courses that have one still need to
// surface it — so it sits as its own band between the hero and the session list.
const introSectionStyle = { backgroundColor: 'secondary.light' } as const;

export interface StoryblokCoursePageProps {
  _uid: string;
  _editable: string;
  name: string;
  description: StoryblokRichtext;
  image: { filename: string; alt: string };
  image_with_background: { filename: string; alt: string };
  video: { url: string };
  video_transcript: StoryblokRichtext;
  weeks: { name: string; sessions: any }[]; // TODO: replace type with StoryblokSessionPageProps
  included_for_partners: string[];
  languages: string[]; // TODO: implement this field - currently uses FF_DISABLED_COURSES env var
  component: 'Course';
}

const StoryblokCoursePage = ({
  story: initialStory,
  courseStories = [],
}: {
  story: ISbStoryData;
  courseStories?: LibraryStory[];
}) => {
  const story = useStoryblokState(initialStory) ?? initialStory;
  const {
    _uid,
    _editable,
    name,
    description,
    image,
    image_with_background,
    video,
    video_transcript,
    weeks,
    included_for_partners,
  } = story.content as StoryblokCoursePageProps;
  const storyUuid = story.uuid;

  const t = useTranslations('Courses');
  const locale = useLocale();
  const referralPartner = useCookieReferralPartner();
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const userId = useTypedSelector((state) => state.user.id);
  const authStateLoading = useTypedSelector((state) => state.user.authStateLoading);
  const isLoggedIn = !authStateLoading && Boolean(userId);
  const isUserLoading = useIsUserLoading();
  const courses = useTypedSelector((state) => state.courses);
  const scrollToSignUp = useScrollToSignUp();

  useGetUserCoursesQuery(undefined, {
    skip: !isLoggedIn,
  });

  // Derive user access from partner settings
  const userAccess = useMemo(() => {
    const storyPartners = included_for_partners;
    return hasAccessToPage(
      isLoggedIn,
      true,
      storyPartners,
      partnerAccesses,
      partnerAdmin,
      referralPartner,
    );
  }, [partnerAccesses, partnerAdmin, included_for_partners, referralPartner, isLoggedIn]);

  // Derive course progress from courses state
  const courseProgress = useMemo(
    () => determineCourseProgress(courses || [], storyUuid),
    [courses, storyUuid],
  );

  const sessions = useMemo(() => getCourseSessions(story, locale), [story, locale]);

  const progressByUuid = useMemo(() => {
    const userCourse = courses?.find((course) => course.storyblokUuid === storyUuid);
    return (userCourse?.sessions ?? []).reduce<Record<string, CardProgress>>((map, session) => {
      map[session.storyblokUuid] = session.completed ? 'completed' : 'started';
      return map;
    }, {});
  }, [courses, storyUuid]);

  // The next unfinished session, so a returning user picks up where they left off.
  const nextSession = useMemo(
    () => sessions.find((session) => progressByUuid[session.uuid] !== 'completed') ?? sessions[0],
    [sessions, progressByUuid],
  );

  const libraryStories = useMemo(
    () => ({
      courses: courseStories,
      courseSessions: [],
      shorts: [],
      somatics: [],
      conversations: [],
    }),
    [courseStories],
  );
  const otherCourses = useLibraryItems(libraryStories)
    .filter((item) => item.id !== storyUuid)
    .slice(0, OTHER_COURSES_SHOWN);

  const eventData = useMemo(
    () => ({
      course_name: name,
      course_storyblok_uuid: storyUuid,
      course_progress: courseProgress,
    }),
    [name, storyUuid, courseProgress],
  );

  const hasLoggedView = useRef(false);
  useEffect(() => {
    if (hasLoggedView.current || isUserLoading) return;
    hasLoggedView.current = true;
    logEvent(COURSE_OVERVIEW_VIEWED, eventData);
  }, [eventData, isUserLoading]);

  const handleCtaClick = () => {
    logEvent(COURSE_START_CLICKED, {
      ...eventData,
      course_cta_target: isLoggedIn ? (nextSession?.href ?? null) : 'signup',
    });
    if (!isLoggedIn) scrollToSignUp();
  };

  const handleSessionSelect = (session: CourseSession) => {
    logEvent(COURSE_SESSION_CLICKED, {
      ...eventData,
      session_name: session.name,
      session_storyblok_uuid: session.uuid,
      session_position: session.position,
    });
  };

  const handleOtherCourseSelect = (course: LibraryItem, index: number) => {
    logEvent(COURSE_OTHER_COURSE_CLICKED, {
      ...eventData,
      other_course_name: course.title,
      other_course_storyblok_uuid: course.id,
      other_course_position: index + 1,
    });
  };

  if (!userAccess) {
    // The signed-in user's partner accesses may not have loaded yet; wait rather than wrongly
    // showing "no access" before we can make the access decision (e.g. on a partner deep-link).
    if (isUserLoading) {
      return <LoadingContainer />;
    }
    return <ContentUnavailable />;
  }

  return (
    <Box
      {...storyblokEditable({
        _uid,
        _editable,
        name,
        description,
        image,
        image_with_background,
        video,
        video_transcript,
        weeks,
        included_for_partners,
      })}
    >
      <CourseHero
        name={name}
        description={description}
        imageSrc={image_with_background?.filename}
        imageAlt={image_with_background?.alt}
        sessionCount={sessions.length}
        courseProgress={courseProgress}
        ctaHref={isLoggedIn ? nextSession?.href : undefined}
        ctaLabel={
          courseProgress === PROGRESS_STATUS.NOT_STARTED
            ? t('courseDetail.beginCourse')
            : t('courseDetail.continueCourse')
        }
        onCtaClick={handleCtaClick}
        backHref="/library"
        backLabel={t('backToLibrary')}
      />
      {video && (
        <Container sx={introSectionStyle}>
          <CourseIntroduction
            video={video}
            name={name}
            video_transcript={video_transcript}
            eventData={eventData}
          />
        </Container>
      )}
      <CourseSessionList
        sessions={sessions}
        progressByUuid={progressByUuid}
        accountNeeded={!isLoggedIn}
        onSessionSelect={handleSessionSelect}
      />
      <OtherCourses courses={otherCourses} onCourseSelect={handleOtherCourseSelect} />
      {!isLoggedIn && <SignUpSection source="course" />}
    </Box>
  );
};

export default StoryblokCoursePage;
