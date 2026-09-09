'use client';

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
  COURSE_START_CLICKED,
  SESSION_CARD_CLICKED,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { useCookieReferralPartner } from '@/lib/hooks/useCookieReferralPartner';
import { useLibraryItems } from '@/lib/hooks/useLibraryItems';
import { useLibraryReturnHref } from '@/lib/hooks/useLibraryReturnHref';
import { useLogEventOnce } from '@/lib/hooks/useLogEventOnce';
import { useUserAuthStatus } from '@/lib/hooks/useUserAuthStatus';
import { determineCourseProgress } from '@/lib/utils/courseProgress';
import {
  getCourseSessions,
  getCourseTotalMinutes,
  sessionProgressByUuid,
  type CourseSession,
} from '@/lib/utils/courseSessions';
import hasAccessToPage from '@/lib/utils/hasAccessToPage';
import { type LibraryItem, type LibraryStory } from '@/lib/utils/libraryData';
import logEvent from '@/lib/utils/logEvent';
import { Box, Container } from '@mui/material';
import { useStoryblokState } from '@storyblok/react';
import { ISbStoryData, storyblokEditable } from '@storyblok/react/rsc';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

const OTHER_COURSES_SHOWN = 2;

// The redesign has no slot for the course intro video, but courses that have one still need to
// surface it. Full-width rules on the top edge of this section and the session list separate the
// three bands; the padding around the intro/sessions rule is symmetric (video ↔ rule ↔ heading).
const introSectionStyle = {
  backgroundColor: 'secondary.light',
  borderTop: '1px solid',
  borderColor: 'sectionBorder',
  paddingTop: { xs: '1.75rem !important', md: '2rem !important' },
  paddingBottom: { xs: '2rem !important', md: '2.5rem !important' },
} as const;

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
  themes?: string[];
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
    themes,
  } = story.content as StoryblokCoursePageProps;
  const storyUuid = story.uuid;

  const t = useTranslations('Courses');
  const libraryHref = useLibraryReturnHref();
  const locale = useLocale();
  const referralPartner = useCookieReferralPartner();
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  // Course & session pages drive the whole overview off `useUserAuthStatus`, not
  // `useContentAccessStatus`: the overview always renders in full (hero, session list) with its
  // sub-components adapting to auth, and a public course's first session plays for everyone — a
  // rule the four-state content-access model can't express. See `useContentAccessStatus`.
  const userAuthStatus = useUserAuthStatus();
  const isSignedIn = userAuthStatus === 'signedIn';
  const courses = useTypedSelector((state) => state.courses);

  useGetUserCoursesQuery(undefined, {
    skip: !isSignedIn,
  });

  // A public course opens its first session to logged-out visitors (see StoryblokSessionPage).
  const isPublicCourse = (included_for_partners ?? []).includes('Public');

  const userAccess = useMemo(
    () =>
      hasAccessToPage(
        isSignedIn,
        included_for_partners,
        partnerAccesses,
        partnerAdmin,
        referralPartner,
      ),
    [partnerAccesses, partnerAdmin, included_for_partners, referralPartner, isSignedIn],
  );

  // Derive course progress from courses state
  const courseProgress = useMemo(
    () => determineCourseProgress(courses || [], storyUuid),
    [courses, storyUuid],
  );

  const sessions = useMemo(() => getCourseSessions(story, locale), [story, locale]);
  const courseMinutes = useMemo(() => getCourseTotalMinutes(sessions), [sessions]);

  const progressByUuid = useMemo(
    () => sessionProgressByUuid(courses ?? [], storyUuid),
    [courses, storyUuid],
  );

  // The next unfinished session, so a returning user picks up where they left off.
  const nextSession = useMemo(
    () => sessions.find((session) => progressByUuid[session.uuid] !== 'completed') ?? sessions[0],
    [sessions, progressByUuid],
  );

  const libraryStories = useMemo(
    () => ({ courses: courseStories, courseSessions: [], resources: [] }),
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
      course_themes: Array.isArray(themes) && themes.length ? themes.join(',') : 'none',
    }),
    [name, storyUuid, courseProgress, themes],
  );

  useLogEventOnce(COURSE_OVERVIEW_VIEWED, eventData, userAuthStatus !== 'resolving');

  // Signed out, the hero CTA is the "Access the full course" sign-up card, which logs its own
  // event; this fires only for the signed-in "Begin/Continue course" button.
  const handleCtaClick = () => {
    logEvent(COURSE_START_CLICKED, {
      ...eventData,
      course_cta_target: nextSession?.href ?? null,
    });
  };

  const handleSessionSelect = (session: CourseSession) => {
    logEvent(SESSION_CARD_CLICKED, {
      ...eventData,
      card_surface: 'course',
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
    if (userAuthStatus === 'resolving') {
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
        courseUuid={storyUuid}
        description={description}
        imageSrc={image_with_background?.filename}
        imageAlt={image_with_background?.alt}
        sessionCount={sessions.length}
        courseMinutes={courseMinutes}
        courseProgress={courseProgress}
        userAuthStatus={userAuthStatus}
        ctaHref={isSignedIn ? nextSession?.href : undefined}
        ctaLabel={
          courseProgress === PROGRESS_STATUS.NOT_STARTED
            ? t('courseDetail.beginCourse')
            : t('courseDetail.continueCourse')
        }
        onCtaClick={handleCtaClick}
        backHref={libraryHref}
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
        accountNeeded={userAuthStatus === 'signedOut'}
        firstSessionFree={userAuthStatus === 'signedOut' && isPublicCourse}
        onSessionSelect={handleSessionSelect}
      />
      <OtherCourses courses={otherCourses} onCourseSelect={handleOtherCourseSelect} />
      {userAuthStatus === 'signedOut' && <SignUpSection source="course" sectionAbove={false} />}
    </Box>
  );
};

export default StoryblokCoursePage;
