import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import LinkIcon from '@mui/icons-material/Link';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Box, Container, Typography } from '@mui/material';
import { ISbRichtext, ISbStoryData, storyblokEditable } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';
import SessionContentCard from '../../components/cards/SessionContentCard';
import CrispButton from '../../components/crisp/CrispButton';
import { SessionCompleteButton } from '../session/SessionCompleteButton';
import Video from '../../components/video/Video';
import { PROGRESS_STATUS } from '../../constants/enums';
import { useTypedSelector } from '../../hooks/store';
import { columnStyle } from '../../styles/common';
import { courseIsLiveNow, courseIsLiveSoon } from '../../utils/courseLiveStatus';
import hasAccessToPage from '../../utils/hasAccessToPage';
import { getEventUserData } from '../../utils/logEvent';
import { RichTextOptions } from '../../utils/richText';
import { getSessionCompletion } from '../../utils/getSessionCompletion';
import { SessionHeader } from '../session/SessionHeader';
import { Dots } from '../common/Dots';
import { SessionVideo } from '../session/SessionVideo';

const containerStyle = {
  backgroundColor: 'secondary.light',
} as const;

const cardColumnStyle = {
  ...columnStyle,
  alignItems: 'center',
  gap: { xs: 2, md: 3 },
} as const;

const crispButtonContainerStyle = {
  paddingTop: 4,
  paddingBottom: 1,
  display: 'flex',
} as const;

const chatDetailIntroStyle = { marginTop: 3, marginBottom: 1.5 } as const;

export interface StoryblokSessionPageProps {
  storyId: number;
  storyUuid: string;
  storyPosition: number;
  _uid: string;
  _editable: string;
  course: ISbStoryData;
  name: string;
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
  const userEmail = useTypedSelector((state) => state.user.email);
  const isLoggedIn = useTypedSelector((state) => Boolean(state.user.id));
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const courses = useTypedSelector((state) => state.courses);

  const [incorrectAccess, setIncorrectAccess] = useState<boolean>(true);
  const [liveChatAccess, setLiveChatAccess] = useState<boolean>(false);
  const [sessionProgress, setSessionProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );
  const [weekString, setWeekString] = useState<string>('');

  const courseComingSoon: boolean = course.content.coming_soon;
  const courseLiveSoon: boolean = courseIsLiveSoon(course);
  const courseLiveNow: boolean = courseIsLiveNow(course);
  // only show live content to public users
  const liveCourseAccess = partnerAccesses.length === 0 && !partnerAdmin.id;

  useEffect(() => {
    const coursePartners = course.content.included_for_partners;
    setIncorrectAccess(
      !hasAccessToPage(isLoggedIn, false, coursePartners, partnerAccesses, partnerAdmin),
    );

    const liveAccess = partnerAccesses.find(
      (partnerAccess) => partnerAccess.featureLiveChat === true,
    );

    if (liveAccess || liveCourseAccess) setLiveChatAccess(true);
  }, [partnerAccesses, course.content.included_for_partners, liveCourseAccess, partnerAdmin]);

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
        <title>{name}</title>
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
                {video && (
                  <>
                    <SessionVideo
                      eventData={eventData}
                      name={name}
                      video={video}
                      storyId={storyId}
                      sessionProgress={sessionProgress}
                      video_transcript={video_transcript}
                    />
                  </>
                )}
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
                {liveChatAccess && (
                  <>
                    <Dots />
                    <SessionContentCard
                      title={t('sessionDetail.chat.title')}
                      titleIcon={ChatBubbleOutlineIcon}
                      titleIconSize={24}
                      eventPrefix="SESSION_CHAT"
                      eventData={eventData}
                    >
                      <Typography paragraph>{t('sessionDetail.chat.description')}</Typography>
                      <Typography paragraph>{t('sessionDetail.chat.videoIntro')}</Typography>
                      <Video
                        eventPrefix="SESSION_CHAT_VIDEO"
                        eventData={eventData}
                        url={t('sessionDetail.chat.videoLink')}
                        containerStyles={{ mx: 'auto', my: 2 }}
                      ></Video>
                      <Box sx={chatDetailIntroStyle}>
                        <Typography>{t('sessionDetail.chat.detailIntro')}</Typography>
                      </Box>
                      <Box>
                        <ul>
                          <li>{t('sessionDetail.chat.detailPrivacy')}</li>
                          <li>{t('sessionDetail.chat.detailTimezone')}</li>
                          <li>{t('sessionDetail.chat.detailLanguage')}</li>
                          <li>{t('sessionDetail.chat.detailLegal')}</li>
                          <li>{t('sessionDetail.chat.detailImmediateHelp')}</li>
                        </ul>
                      </Box>
                      <Box sx={crispButtonContainerStyle}>
                        <CrispButton
                          email={userEmail}
                          eventData={eventData}
                          buttonText={t('sessionDetail.chat.startButton')}
                        />
                      </Box>
                    </SessionContentCard>
                  </>
                )}
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
