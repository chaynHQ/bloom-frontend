'use client';

import { type CardProgress } from '@/components/cards/CardStatusBadge';
import SessionContentCard from '@/components/cards/SessionContentCard';
import { BackLink } from '@/components/common/BackLink';
import { ContentUnavailable } from '@/components/common/ContentUnavailable';
import LoadingContainer from '@/components/common/LoadingContainer';
import { SignUpCard } from '@/components/course/SignUpCard';
import SessionFeedbackForm from '@/components/forms/SessionFeedbackForm';
import MultipleBonusContent, { BonusContent } from '@/components/session/MultipleBonusContent';
import { SessionActions } from '@/components/session/SessionActions';
import { SessionChat } from '@/components/session/SessionChat';
import { SessionCourseNav } from '@/components/session/SessionCourseNav';
import { SessionHero } from '@/components/session/SessionHero';
import { SessionMediaCard } from '@/components/session/SessionMediaCard';
import { sessionContainerStyle, sessionMainStyle } from '@/components/session/sessionPageLayout';
import { useGetUserCoursesQuery } from '@/lib/api';
import {
  SESSION_PLAYLIST_OPENED,
  SESSION_PLAYLIST_SESSION_CLICKED,
  SESSION_VIEWED,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { useUserAuthStatus } from '@/lib/hooks/useUserAuthStatus';
import {
  getCourseSessions,
  isFirstCourseSession,
  type CourseSession,
} from '@/lib/utils/courseSessions';
import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import { getSessionCompletion } from '@/lib/utils/getSessionCompletion';
import hasAccessToPage from '@/lib/utils/hasAccessToPage';
import logEvent from '@/lib/utils/logEvent';
import { RichTextOptions } from '@/lib/utils/richText';
import { Box, CircularProgress, Container } from '@mui/material';
import { useStoryblokState } from '@storyblok/react';
import { ISbStoryData, storyblokEditable } from '@storyblok/react/rsc';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef } from 'react';
import { render, StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

const cardsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  position: 'relative',
  // A faint rule runs down the centre; the opaque cards cover all but the gaps, leaving a short
  // connector between each card that ties the session's content into one sequence, as designed.
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    insetInlineStart: '50%',
    width: '1px',
    backgroundColor: 'cardBorder',
  },
  '& > *': { position: 'relative' },
} as const;

const sessionBodyLoadingStyle = { display: 'flex', justifyContent: 'center', py: 8 } as const;

export interface StoryblokSessionPageProps {
  _uid: string;
  _editable: string;
  course: ISbStoryData;
  name: string;
  subtitle: string;
  description: string;
  video: { url: string };
  video_transcript: StoryblokRichtext;
  video_outro: StoryblokRichtext;
  activity: StoryblokRichtext;
  bonus: StoryblokRichtext | BonusContent[];
  languages: string[];
  component: 'Session' | 'session_iba';
  included_for_partners: string[];
}

const StoryblokSessionPage = ({
  story: initialStory,
  courseStory,
}: {
  story: ISbStoryData;
  courseStory?: ISbStoryData;
}) => {
  const story = useStoryblokState(initialStory) ?? initialStory;
  const {
    _uid,
    _editable,
    course,
    name,
    subtitle,
    description,
    video,
    video_transcript,
    video_outro,
    activity,
    bonus,
  } = story.content as StoryblokSessionPageProps;
  const storyUuid = story.uuid;

  const t = useTranslations('Courses');
  const locale = useLocale();

  // Auth drives this page directly rather than through `useContentAccessStatus`: a public course's
  // first session is a full preview for signed-out visitors while later sessions show a gate — a
  // split the four-state content-access model can't express. See `useContentAccessStatus`.
  const userAuthStatus = useUserAuthStatus();
  const isSignedIn = userAuthStatus === 'signedIn';
  useGetUserCoursesQuery(undefined, {
    skip: !isSignedIn,
  });

  const courses = useTypedSelector((state) => state.courses);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  const userAccess = useMemo(
    () =>
      hasAccessToPage(
        isSignedIn,
        course.content.included_for_partners,
        partnerAccesses,
        partnerAdmin,
      ),
    [partnerAccesses, course.content.included_for_partners, isSignedIn, partnerAdmin],
  );

  // Derive session progress and ID from courses state
  const { sessionProgress, sessionId } = useMemo(
    () => getSessionCompletion(course, courses || [], storyUuid),
    [courses, course, storyUuid],
  );

  // The playlist needs the course's sessions resolved, which only the route-level fetch provides.
  const sessions = useMemo(() => getCourseSessions(courseStory, locale), [courseStory, locale]);
  const courseHref = getDefaultFullSlug(course.full_slug, locale);

  // A public course opens its first session to signed-out visitors as a full preview; later
  // sessions show a sign-up gate. A failed course fetch leaves `sessions` empty, so `isFirstSession`
  // is false and the visitor fails closed to the gate.
  const isPublicCourse = (course.content.included_for_partners ?? []).includes('Public');
  const previewSessionUuid = isPublicCourse ? sessions[0]?.uuid : undefined;
  const isFirstSession = isFirstCourseSession(sessions, storyUuid);
  const isSignedOut = userAuthStatus === 'signedOut';
  const isSignedOutPreview = isSignedOut && isPublicCourse && isFirstSession;
  const isSignedOutGate = isSignedOut && isPublicCourse && !isFirstSession;

  const progressByUuid = useMemo(() => {
    const userCourse = courses?.find((c) => c.storyblokUuid === course.uuid);
    return (userCourse?.sessions ?? []).reduce<Record<string, CardProgress>>((map, session) => {
      map[session.storyblokUuid] = session.completed ? 'completed' : 'started';
      return map;
    }, {});
  }, [courses, course.uuid]);

  const nextSession = useMemo(() => {
    const currentIndex = sessions.findIndex((session) => session.uuid === storyUuid);
    return currentIndex === -1 ? undefined : sessions[currentIndex + 1];
  }, [sessions, storyUuid]);

  // This component handles both "session" and alternative "session_iba" page blocks
  // "session_iba" page blocks have a multi-block bonus field, and omit the coming soon fields
  const isAlternateSessionPage = Array.isArray(bonus);
  const richtextBonusContent = !isAlternateSessionPage ? (bonus as StoryblokRichtext) : null;
  const multipleBonusContent = isAlternateSessionPage ? (bonus as BonusContent[]) : null;
  const showRichtextBonusContent =
    richtextBonusContent && richtextBonusContent.content && richtextBonusContent.content[0].content;
  const showMultipleBonusContent = multipleBonusContent && multipleBonusContent.length > 0;
  const showActivity =
    activity?.content && (activity.content.length > 1 || activity.content[0].content);

  const eventData = useMemo(
    () => ({
      session_name: name,
      session_storyblok_uuid: storyUuid,
      session_progress: sessionProgress,
      course_name: course.name,
      course_storyblok_uuid: course.uuid,
    }),
    [name, storyUuid, sessionProgress, course.name, course.uuid],
  );

  const hasLoggedView = useRef(false);
  useEffect(() => {
    if (hasLoggedView.current || userAuthStatus === 'resolving') return;
    hasLoggedView.current = true;
    logEvent(SESSION_VIEWED, eventData);
  }, [eventData, userAuthStatus]);

  const handlePlaylistSessionSelect = (session: CourseSession) => {
    logEvent(SESSION_PLAYLIST_SESSION_CLICKED, {
      ...eventData,
      selected_session_name: session.name,
      selected_session_storyblok_uuid: session.uuid,
      selected_session_position: session.position,
    });
  };

  // Not entitled — this course is partner-only. Signed in ⇒ genuinely no access; signed out ⇒ the
  // sign-up preview, whose "log in" link may still let a partner member through.
  if (!userAccess) {
    if (userAuthStatus === 'resolving') return <LoadingContainer />;
    if (isSignedIn) return <ContentUnavailable />;
    return (
      <Container sx={sessionContainerStyle}>
        <Box component="main" sx={sessionMainStyle}>
          <SessionHero name={name} sessionProgress={sessionProgress} />
          <SessionMediaCard
            name={name}
            description={description}
            video={video}
            video_transcript={video_transcript}
            storyUuid={storyUuid}
            sessionProgress={sessionProgress}
            trackProgress={false}
            eventData={eventData}
            signUpCard={<SignUpCard source="session" embedded />}
          />
        </Box>
      </Container>
    );
  }

  return (
    <Box
      {...storyblokEditable({
        _uid,
        _editable,
        course,
        name,
        subtitle,
        description,
        video,
        video_transcript,
        video_outro,
        activity,
        bonus,
      })}
    >
      <Container sx={sessionContainerStyle}>
        <Box component="main" sx={sessionMainStyle}>
          {/* The playlist sidebar carries the back link from `lg`; below that it sits inline here. */}
          <BackLink
            href={courseHref}
            label={t('backToCourseOverview')}
            sx={{ display: { lg: 'none' } }}
          />
          <SessionHero name={name} sessionProgress={sessionProgress} />
          {userAuthStatus === 'resolving' ? (
            <Box sx={sessionBodyLoadingStyle}>
              <CircularProgress color="error" />
            </Box>
          ) : isSignedOutGate ? (
            <SessionMediaCard
              name={name}
              description={description}
              video={video}
              video_transcript={video_transcript}
              storyUuid={storyUuid}
              sessionProgress={sessionProgress}
              trackProgress={false}
              eventData={eventData}
              signUpCard={<SignUpCard source="session" embedded />}
            />
          ) : (
            <>
              <Box sx={cardsStyle}>
                <SessionMediaCard
                  name={name}
                  description={description}
                  video={video}
                  video_transcript={video_transcript}
                  storyUuid={storyUuid}
                  sessionProgress={sessionProgress}
                  trackProgress={!isSignedOutPreview}
                  eventData={eventData}
                />
                {showActivity && (
                  <SessionContentCard
                    qaId="session-activity"
                    title={t('sessionDetail.activityTitle')}
                    eventPrefix="SESSION_ACTIVITY"
                    eventData={eventData}
                    initialExpanded
                  >
                    <>{render(activity, RichTextOptions)}</>
                  </SessionContentCard>
                )}
                {showRichtextBonusContent && (
                  <SessionContentCard
                    qaId="session-bonus"
                    title={t('sessionDetail.bonusTitle')}
                    eventPrefix="SESSION_BONUS_CONTENT"
                    eventData={eventData}
                  >
                    <>{render(richtextBonusContent, RichTextOptions)}</>
                  </SessionContentCard>
                )}
                {showMultipleBonusContent && (
                  <MultipleBonusContent bonus={multipleBonusContent} eventData={eventData} />
                )}
                {/* Account-only, so hidden in the signed-out first-session preview — the sign-up
                    card below stands in for them. */}
                {!isSignedOutPreview && <SessionChat eventData={eventData} />}
                {sessionId && (
                  <SessionContentCard
                    qaId="session-feedback"
                    title={t('sessionFeedback.title')}
                    eventPrefix="SESSION_FEEDBACK"
                    eventData={eventData}
                    initialExpanded
                  >
                    <SessionFeedbackForm sessionId={sessionId} />
                  </SessionContentCard>
                )}
                {!isSignedOutPreview && (
                  <SessionActions
                    storyUuid={storyUuid}
                    sessionProgress={sessionProgress}
                    nextSession={nextSession}
                    eventData={eventData}
                  />
                )}
              </Box>
              {isSignedOutPreview && <SignUpCard source="session" />}
            </>
          )}
        </Box>

        {/* After main in the DOM so the mobile bar closes the page; ordered first on desktop. */}
        {sessions.length > 0 && (
          <SessionCourseNav
            courseName={course.content.name}
            courseHref={courseHref}
            sessions={sessions}
            currentSessionUuid={storyUuid}
            progressByUuid={progressByUuid}
            accountNeeded={isSignedOut}
            previewSessionUuid={previewSessionUuid}
            backHref="/library"
            backLabel={t('backToSessions')}
            onSessionSelect={handlePlaylistSessionSelect}
            onPlaylistOpen={() => logEvent(SESSION_PLAYLIST_OPENED, eventData)}
          />
        )}
      </Container>
    </Box>
  );
};

export default StoryblokSessionPage;
