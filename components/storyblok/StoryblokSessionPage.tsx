'use client';

import SessionContentCard from '@/components/cards/SessionContentCard';
import { Dots } from '@/components/common/Dots';
import SessionFeedbackForm from '@/components/forms/SessionFeedbackForm';
import MultipleBonusContent, { BonusContent } from '@/components/session/MultipleBonusContent';
import { SessionChat } from '@/components/session/SessionChat';
import { SessionCompleteButton } from '@/components/session/SessionCompleteButton';
import { SessionHeader } from '@/components/session/SessionHeader';
import { SessionVideo } from '@/components/session/SessionVideo';
import { useGetUserCoursesQuery } from '@/lib/api';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { useTypedSelector } from '@/lib/hooks/store';
import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import { getSessionCompletion } from '@/lib/utils/getSessionCompletion';
import hasAccessToPage from '@/lib/utils/hasAccessToPage';
import { RichTextOptions } from '@/lib/utils/richText';
import { columnStyle, rowStyle } from '@/styles/common';
import { ArrowBack } from '@mui/icons-material';
import LinkIcon from '@mui/icons-material/Link';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Box, Container, Link } from '@mui/material';
import { ISbStoryData, storyblokEditable } from '@storyblok/react/rsc';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { render, StoryblokRichtext } from 'storyblok-rich-text-react-renderer';
import { ContentUnavailable } from '../common/ContentUnavailable';
import LoadingContainer from '../common/LoadingContainer';

const containerStyle = {
  backgroundColor: 'secondary.light',
} as const;

const cardColumnStyle = {
  ...columnStyle,
  alignItems: 'center',
  gap: { xs: 2, md: 3 },
} as const;

const backToCourseLinkStyle = {
  ...rowStyle,
  mt: 2,
  mr: 'auto',
  textDecoration: 'none',
  alignItems: 'center',

  svg: { fontSize: 20, mr: 0.5, color: 'primary.dark' },
} as const;

export interface StoryblokSessionPageProps {
  storyUuid: string;
  storyPosition: number;
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

const StoryblokSessionPage = (props: StoryblokSessionPageProps) => {
  const {
    storyUuid,
    storyPosition,
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
  } = props;

  const t = useTranslations('Courses');
  const locale = useLocale();

  const isLoggedIn = useTypedSelector((state) => Boolean(state.user.id));
  useGetUserCoursesQuery(undefined, {
    skip: !isLoggedIn,
  });

  const courses = useTypedSelector((state) => state.courses);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  const [userAccess, setUserAccess] = useState<boolean>();
  const [sessionId, setSessionId] = useState<string>(); // database Session id
  const [sessionProgress, setSessionProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );

  // This component handles both "session" and alternative "session_iba" page blocks
  // "session_iba" page blocks have a multi-block bonus field, and omit the coming soon fields
  const isAlternateSessionPage = Array.isArray(bonus);
  const richtextBonusContent = !isAlternateSessionPage ? (bonus as StoryblokRichtext) : null;
  const multipleBonusContent = isAlternateSessionPage ? (bonus as BonusContent[]) : null;
  const showRichtextBonusContent =
    richtextBonusContent && richtextBonusContent.content && richtextBonusContent.content[0].content;
  const showMultipleBonusContent = multipleBonusContent && multipleBonusContent.length > 0;

  const eventData = {
    session_name: name,
    session_storyblok_uuid: storyUuid,
    session_progress: sessionProgress,
    course_name: course.name,
    course_storyblok_uuid: course.uuid,
  };

  useEffect(() => {
    const coursePartners = course.content.included_for_partners;
    const userHasAccess = hasAccessToPage(
      isLoggedIn,
      true, // setting true here to allow preview. The login overlay will block interaction
      coursePartners,
      partnerAccesses,
      partnerAdmin,
    );
    setUserAccess(userHasAccess);
  }, [partnerAccesses, course.content.included_for_partners, isLoggedIn, partnerAdmin]);

  useEffect(() => {
    getSessionCompletion(course, courses || [], storyUuid, setSessionProgress, setSessionId);
  }, [courses, course, storyUuid]);

  if (userAccess === undefined) return <LoadingContainer />;
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
      <SessionHeader
        description={description}
        name={name}
        sessionProgress={sessionProgress}
        course={course}
        subtitle={subtitle}
        storyUuid={storyUuid}
        storyPosition={storyPosition}
      />
      <Container sx={containerStyle}>
        <Box sx={cardColumnStyle}>
          <SessionVideo
            eventData={eventData}
            name={name}
            video={video}
            storyUuid={storyUuid}
            sessionProgress={sessionProgress}
            video_transcript={video_transcript}
          />
          {activity.content && (activity.content?.length > 1 || activity.content[0].content) && (
            <>
              <Dots />
              <SessionContentCard
                title={t('sessionDetail.activityTitle')}
                titleIcon={StarBorderIcon}
                eventPrefix="SESSION_ACTIVITY"
                eventData={eventData}
              >
                <>{render(activity, RichTextOptions)}</>
              </SessionContentCard>
            </>
          )}
          {showRichtextBonusContent && (
            <>
              <Dots />
              <SessionContentCard
                title={t('sessionDetail.bonusTitle')}
                titleIcon={LinkIcon}
                eventPrefix="SESSION_BONUS_CONTENT"
                eventData={eventData}
              >
                <>{render(richtextBonusContent, RichTextOptions)}</>
              </SessionContentCard>
            </>
          )}
          {showMultipleBonusContent && (
            <MultipleBonusContent bonus={multipleBonusContent} eventData={eventData} />
          )}
          <SessionChat eventData={eventData} />
          {sessionProgress !== PROGRESS_STATUS.COMPLETED && (
            <SessionCompleteButton storyUuid={storyUuid} eventData={eventData} />
          )}
          <Link href={getDefaultFullSlug(course.full_slug, locale)} sx={backToCourseLinkStyle}>
            <ArrowBack />
            <span>{t('backToCourse')}</span>
          </Link>
        </Box>
      </Container>

      {sessionId && (
        <Container sx={{ bgcolor: 'background.paper' }}>
          <SessionFeedbackForm sessionId={sessionId} />
        </Container>
      )}
    </Box>
  );
};

export default StoryblokSessionPage;
