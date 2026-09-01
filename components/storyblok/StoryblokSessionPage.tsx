'use client';

import { type CardProgress } from '@/components/cards/CardStatusBadge';
import SessionContentCard from '@/components/cards/SessionContentCard';
import { BackLink } from '@/components/common/BackLink';
import { ContentUnavailable } from '@/components/common/ContentUnavailable';
import SessionFeedbackForm from '@/components/forms/SessionFeedbackForm';
import MultipleBonusContent, { BonusContent } from '@/components/session/MultipleBonusContent';
import { SessionActions } from '@/components/session/SessionActions';
import { SessionChat } from '@/components/session/SessionChat';
import { SessionCourseNav } from '@/components/session/SessionCourseNav';
import { SessionHero } from '@/components/session/SessionHero';
import { SessionMediaCard } from '@/components/session/SessionMediaCard';
import { useGetUserCoursesQuery } from '@/lib/api';
import {
  SESSION_PLAYLIST_OPENED,
  SESSION_PLAYLIST_SESSION_CLICKED,
  SESSION_VIEWED,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { useIsUserLoading } from '@/lib/hooks/useIsUserLoading';
import { getCourseSessions, type CourseSession } from '@/lib/utils/courseSessions';
import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import { getSessionCompletion } from '@/lib/utils/getSessionCompletion';
import hasAccessToPage from '@/lib/utils/hasAccessToPage';
import logEvent from '@/lib/utils/logEvent';
import { RichTextOptions } from '@/lib/utils/richText';
import { contentRailGutter, pageHeaderPaddingTop } from '@/styles/common';
import { Box, Container } from '@mui/material';
import { useStoryblokState } from '@storyblok/react';
import { ISbStoryData, storyblokEditable } from '@storyblok/react/rsc';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef } from 'react';
import { render, StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

// Full-bleed two-column from `lg`: the playlist pins to the inline start, the session content
// aligns its inline end to the standard content rail rather than drifting out to the viewport edge.
const containerStyle = {
  display: 'flex',
  flexDirection: { xs: 'column', lg: 'row' },
  alignItems: 'flex-start',
  gap: { lg: 3 },
  backgroundColor: 'pageBackground',
  // Compact on mobile so the inline back link sits level with the fixed "Leave this site" button;
  // from `lg` the header offset moves to `mainStyle` so the playlist can sit near the top.
  paddingTop: { xs: '0.75rem !important', lg: '1rem !important' },
  // No bottom padding below `lg`: the sticky course bar should meet the footer with no dead gap.
  paddingBottom: { xs: '0 !important', lg: '5rem !important' },
  paddingInlineStart: { lg: '1.5rem !important' },
  paddingInlineEnd: { lg: `max(1.5rem, ${contentRailGutter()}) !important` },
} as const;

const mainStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  flex: 1,
  minWidth: 0,
  width: '100%',
  maxWidth: { lg: 620 },
  paddingTop: { lg: pageHeaderPaddingTop },
  // Pushes the column to the inline end so its right edge lands on the content rail.
  marginInlineStart: { lg: 'auto' },
} as const;

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

  const userId = useTypedSelector((state) => state.user.id);
  const authStateLoading = useTypedSelector((state) => state.user.authStateLoading);
  const isLoggedIn = !authStateLoading && Boolean(userId);
  const isUserLoading = useIsUserLoading();
  useGetUserCoursesQuery(undefined, {
    skip: !isLoggedIn,
  });

  const courses = useTypedSelector((state) => state.courses);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  // Derive user access from partner settings
  const userAccess = useMemo(() => {
    const coursePartners = course.content.included_for_partners;
    return hasAccessToPage(
      isLoggedIn,
      true, // setting true here to allow preview. The login overlay will block interaction
      coursePartners,
      partnerAccesses,
      partnerAdmin,
    );
  }, [partnerAccesses, course.content.included_for_partners, isLoggedIn, partnerAdmin]);

  // Derive session progress and ID from courses state
  const { sessionProgress, sessionId } = useMemo(
    () => getSessionCompletion(course, courses || [], storyUuid),
    [courses, course, storyUuid],
  );

  // The playlist needs the course's sessions resolved, which only the route-level fetch provides.
  const sessions = useMemo(() => getCourseSessions(courseStory, locale), [courseStory, locale]);
  const courseHref = getDefaultFullSlug(course.full_slug, locale);

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
    if (hasLoggedView.current || isUserLoading) return;
    hasLoggedView.current = true;
    logEvent(SESSION_VIEWED, eventData);
  }, [eventData, isUserLoading]);

  const handlePlaylistSessionSelect = (session: CourseSession) => {
    logEvent(SESSION_PLAYLIST_SESSION_CLICKED, {
      ...eventData,
      selected_session_name: session.name,
      selected_session_storyblok_uuid: session.uuid,
      selected_session_position: session.position,
    });
  };

  if (!userAccess) return <ContentUnavailable />;

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
      <Container sx={containerStyle}>
        <Box component="main" sx={mainStyle}>
          {/* The playlist sidebar carries the back link from `lg`; below that it sits inline here. */}
          <BackLink
            href={courseHref}
            label={t('backToCourseOverview')}
            sx={{ display: { lg: 'none' } }}
          />
          <SessionHero name={name} sessionProgress={sessionProgress} />
          <Box sx={cardsStyle}>
            <SessionMediaCard
              name={name}
              description={description}
              video={video}
              video_transcript={video_transcript}
              storyUuid={storyUuid}
              sessionProgress={sessionProgress}
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
            <SessionChat eventData={eventData} />
            {sessionId && (
              <SessionContentCard
                qaId="session-feedback"
                title={t('sessionFeedback.title')}
                eventPrefix="SESSION_FEEDBACK"
                eventData={eventData}
              >
                <SessionFeedbackForm sessionId={sessionId} />
              </SessionContentCard>
            )}
            <SessionActions
              storyUuid={storyUuid}
              sessionProgress={sessionProgress}
              nextSession={nextSession}
              eventData={eventData}
            />
          </Box>
        </Box>

        {/* After main in the DOM so the mobile bar closes the page; ordered first on desktop. */}
        {sessions.length > 0 && (
          <SessionCourseNav
            courseName={course.content.name}
            courseHref={courseHref}
            sessions={sessions}
            currentSessionUuid={storyUuid}
            progressByUuid={progressByUuid}
            accountNeeded={!isLoggedIn}
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
