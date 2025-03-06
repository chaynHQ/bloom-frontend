'use client';

import SessionContentCard from '@/components/cards/SessionContentCard';
import { Dots } from '@/components/common/Dots';
import SessionFeedbackForm from '@/components/forms/SessionFeedbackForm';
import MultipleBonusContent, { BonusContent } from '@/components/session/MultipleBonusContent';
import { SessionChat } from '@/components/session/SessionChat';
import { SessionCompleteButton } from '@/components/session/SessionCompleteButton';
import { SessionHeader } from '@/components/session/SessionHeader';
import { SessionVideo } from '@/components/session/SessionVideo';
import { Link as i18nLink } from '@/i18n/routing';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { useTypedSelector } from '@/lib/hooks/store';
import { getChatAccess } from '@/lib/utils/getChatAccess';
import { getSessionCompletion } from '@/lib/utils/getSessionCompletion';
import hasAccessToPage from '@/lib/utils/hasAccessToPage';
import { RichTextOptions } from '@/lib/utils/richText';
import { columnStyle } from '@/styles/common';
import LinkIcon from '@mui/icons-material/Link';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Box, Container, Link } from '@mui/material';
import { ISbRichtext, ISbStoryData, storyblokEditable } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';
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

export interface StoryblokSessionPageProps {
  storyId: number;
  storyUuid: string;
  storyPosition: number;
  _uid: string;
  _editable: string;
  course: ISbStoryData;
  name: string;
  subtitle: string;
  description: string;
  video: { url: string };
  video_transcript: ISbRichtext;
  video_outro: ISbRichtext;
  activity: ISbRichtext;
  bonus: ISbRichtext | BonusContent[];
  languages: string[];
  component: 'Session' | 'session_iba';
  included_for_partners: string[];
}

const StoryblokSessionPage = (props: StoryblokSessionPageProps) => {
  const {
    storyId,
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

  const isLoggedIn = useTypedSelector((state) => Boolean(state.user.id));
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const courses = useTypedSelector((state) => state.courses);

  const [userAccess, setUserAccess] = useState<boolean>();
  const [sessionId, setSessionId] = useState<string>(); // database Session id
  const [sessionProgress, setSessionProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );
  const [liveChatAccess, setLiveChatAccess] = useState<boolean>(false);

  // This component handles both "session" and alternative "session_iba" page blocks
  // "session_iba" page blocks have a multi-block bonus field, and omit the coming soon fields
  const isAlternateSessionPage = Array.isArray(bonus);
  const richtextBonusContent = !isAlternateSessionPage ? (bonus as ISbRichtext) : null;
  const multipleBonusContent = isAlternateSessionPage ? (bonus as BonusContent[]) : null;
  const showRichtextBonusContent =
    richtextBonusContent && richtextBonusContent.content && richtextBonusContent.content[0].content;
  const showMultipleBonusContent = multipleBonusContent && multipleBonusContent.length > 0;

  const eventData = {
    session_name: name,
    session_storyblok_id: storyId,
    session_progress: sessionProgress,
    course_name: course.name,
    course_storyblok_id: course.id,
  };

  useEffect(() => {
    getChatAccess(partnerAccesses, setLiveChatAccess);
  }, [partnerAccesses, partnerAdmin]);

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
  }, [
    isAlternateSessionPage,
    partnerAccesses,
    course.content.included_for_partners,
    isLoggedIn,
    partnerAdmin,
  ]);

  useEffect(() => {
    getSessionCompletion(course, courses, storyId, setSessionProgress, setSessionId);
  }, [courses, course, storyId, storyUuid]);

  if (userAccess === undefined) return <LoadingContainer />;
  if (!userAccess)
    return (
      <ContentUnavailable
        title={t('accessGuard.title')}
        message={t.rich('accessGuard.introduction', {
          contactLink: (children) => (
            <Link component={i18nLink} href="/courses">
              {children}
            </Link>
          ),
        })}
      />
    );

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
            storyId={storyId}
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
          {liveChatAccess && <SessionChat eventData={eventData} />}
          {sessionProgress !== PROGRESS_STATUS.COMPLETED && (
            <SessionCompleteButton storyId={storyId} eventData={eventData} />
          )}
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
