import LinkIcon from '@mui/icons-material/Link';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Box, Container } from '@mui/material';
import { ISbRichtext, ISbStoryData, storyblokEditable } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';
import SessionContentCard from '../../components/cards/SessionContentCard';
import { PROGRESS_STATUS } from '../../constants/enums';
import { useTypedSelector } from '../../hooks/store';
import { columnStyle } from '../../styles/common';
import { courseIsLiveNow, courseIsLiveSoon } from '../../utils/courseLiveStatus';
import { getChatAccess } from '../../utils/getChatAccess';
import { getSessionCompletion } from '../../utils/getSessionCompletion';
import hasAccessToPage from '../../utils/hasAccessToPage';
import { getEventUserData } from '../../utils/logEvent';
import { RichTextOptions } from '../../utils/richText';
import { Dots } from '../common/Dots';
import SessionFeedbackForm from '../forms/SessionFeedbackForm';
import MultipleBonusContent, { BonusContent } from '../session/MultipleBonusContent';
import { SessionChat } from '../session/SessionChat';
import { SessionCompleteButton } from '../session/SessionCompleteButton';
import { SessionHeader } from '../session/SessionHeader';
import { SessionVideo } from '../session/SessionVideo';

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
  seo_description: string;
  description: string;
  video: { url: string };
  video_transcript: ISbRichtext;
  video_outro: ISbRichtext;
  activity: ISbRichtext;
  bonus: ISbRichtext | BonusContent[];
  coming_soon: boolean;
  coming_soon_content: ISbRichtext;
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
    seo_description,
    description,
    video,
    video_transcript,
    video_outro,
    activity,
    bonus,
    coming_soon,
    coming_soon_content,
  } = props;

  const t = useTranslations('Courses');

  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const isLoggedIn = useTypedSelector((state) => Boolean(state.user.id));
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const courses = useTypedSelector((state) => state.courses);

  const [incorrectAccess, setIncorrectAccess] = useState<boolean>(true);
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

  const courseComingSoon: boolean = !isAlternateSessionPage && course.content.coming_soon;
  const courseLiveSoon: boolean = !isAlternateSessionPage && courseIsLiveSoon(course);
  const courseLiveNow: boolean = !isAlternateSessionPage && courseIsLiveNow(course);

  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);
  const eventData = {
    ...eventUserData,
    session_name: name,
    session_storyblok_id: storyId,
    session_progress: sessionProgress,
    course_name: course.name,
    course_storyblok_id: course.id,
    course_coming_soon: courseComingSoon,
    course_live_soon: courseLiveSoon,
    course_live_now: courseLiveNow,
  };

  useEffect(() => {
    getChatAccess(partnerAccesses, setLiveChatAccess, partnerAdmin);
  }, [partnerAccesses, partnerAdmin]);

  useEffect(() => {
    const coursePartners = course.content.included_for_partners;
    setIncorrectAccess(
      !hasAccessToPage(isLoggedIn, false, coursePartners, partnerAccesses, partnerAdmin),
    );
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
        coming_soon,
        coming_soon_content,
      })}
    >
      <Head>
        <title>{`${t('session')} • ${name} • Bloom`}</title>
        <meta property="og:title" content={name} key="og-title" />
        {(seo_description || description) && (
          <>
            <meta name="description" content={seo_description || description} key="description" />
            <meta
              property="og:description"
              content={seo_description || description}
              key="og-description"
            />
          </>
        )}
      </Head>

      {incorrectAccess ? (
        <Container sx={containerStyle}></Container>
      ) : (
        <Box>
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
            {coming_soon && (
              <Box maxWidth={700}>{render(coming_soon_content, RichTextOptions)}</Box>
            )}
            {!coming_soon && (
              <Box sx={cardColumnStyle}>
                <SessionVideo
                  eventData={eventData}
                  name={name}
                  video={video}
                  storyId={storyId}
                  sessionProgress={sessionProgress}
                  video_transcript={video_transcript}
                />
                {activity.content &&
                  (activity.content?.length > 1 || activity.content[0].content) && (
                    <>
                      <Dots />
                      <SessionContentCard
                        title={t('sessionDetail.activityTitle')}
                        titleIcon={StarBorderIcon}
                        richtextContent
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
                      richtextContent
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
            )}
          </Container>

          {sessionId && (
            <Container sx={{ bgcolor: 'background.paper' }}>
              <SessionFeedbackForm sessionId={sessionId} />
            </Container>
          )}
        </Box>
      )}
    </Box>
  );
};

export default StoryblokSessionPage;
