import LinkIcon from '@mui/icons-material/Link';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Box, Container } from '@mui/material';
import { ISbRichtext, ISbStoryData, storyblokEditable } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';
import SessionContentCard from '../../components/cards/SessionContentCard';
import { SessionCompleteButton } from '../session/SessionCompleteButton';
import { PROGRESS_STATUS } from '../../constants/enums';
import { useTypedSelector } from '../../hooks/store';
import { columnStyle } from '../../styles/common';
import { courseIsLiveNow, courseIsLiveSoon } from '../../utils/courseLiveStatus';
import { getEventUserData } from '../../utils/logEvent';
import { RichTextOptions } from '../../utils/richText';
import { getSessionCompletion } from '../../utils/getSessionCompletion';
import { SessionHeader } from '../session/SessionHeader';
import { Dots } from '../common/Dots';
import { SessionVideo } from '../session/SessionVideo';
import { SessionChat } from '../session/SessionChat';
import hasAccessToPage from '../../utils/hasAccessToPage';

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
  seo_description: string;
  description: ISbRichtext;
  video: { url: string };
  video_transcript: ISbRichtext;
  video_outro: ISbRichtext;
  activity: ISbRichtext;
  bonus: ISbRichtext;
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
  const [sessionProgress, setSessionProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );
  const [weekString, setWeekString] = useState<string>('');
  const courseComingSoon: boolean = course.content.coming_soon;
  const courseLiveSoon: boolean = courseIsLiveSoon(course);
  const courseLiveNow: boolean = courseIsLiveNow(course);

  useEffect(() => {
    const coursePartners = course.content.included_for_partners;
    setIncorrectAccess(
      !hasAccessToPage(isLoggedIn, false, coursePartners, partnerAccesses, partnerAdmin),
    );
  }, [partnerAccesses, course.content.included_for_partners, partnerAdmin]);

  useEffect(() => {
    getSessionCompletion(course, courses, storyUuid, storyId, setWeekString, setSessionProgress);
  }, [courses, course.content.weeks, storyId, course.id, storyUuid]);

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

  return (
    <Box
      {...storyblokEditable({
        _uid,
        _editable,
        course,
        name,
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
        {seo_description && (
          <meta property="og:description" content={seo_description} key="og-description" />
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
            weekString={weekString}
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
                {bonus.content && (bonus.content?.length > 1 || bonus.content[0].content) && (
                  <>
                    <Dots />
                    <SessionContentCard
                      title={t('sessionDetail.bonusTitle')}
                      titleIcon={LinkIcon}
                      richtextContent
                      eventPrefix="SESSION_BONUS_CONTENT"
                      eventData={eventData}
                    >
                      <>{render(bonus, RichTextOptions)}</>
                    </SessionContentCard>
                  </>
                )}
                <SessionChat
                  eventData={eventData}
                  partnerAccesses={partnerAccesses}
                  partnerAdmin={partnerAdmin}
                />
                {sessionProgress !== PROGRESS_STATUS.COMPLETED && (
                  <SessionCompleteButton storyId={storyId} eventData={eventData} />
                )}
              </Box>
            )}
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default StoryblokSessionPage;
